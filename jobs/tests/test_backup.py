"""Tests for `wheretogo_jobs.backup`."""

from __future__ import annotations

from datetime import datetime, timezone

import httpx
import pytest
import respx
from wheretogo_api.crypto import TokenCipher
from wheretogo_jobs import backup

_SUPABASE_URL = "https://test-project.supabase.co"
_TOKEN_URL = "https://oauth2.googleapis.com/token"
_FILES_URL = "https://www.googleapis.com/drive/v3/files"
_UPLOAD_URL = "https://www.googleapis.com/upload/drive/v3/files"
_USER_ID = "22222222-2222-2222-2222-222222222222"
_TABLES = ("places", "tags", "place_tags", "photos", "visits")


def _set_env(monkeypatch: pytest.MonkeyPatch, fernet_key: str) -> None:
    monkeypatch.setenv("SUPABASE_URL", _SUPABASE_URL)
    monkeypatch.setenv("SUPABASE_SECRET_KEY", "test-secret")
    monkeypatch.setenv("GOOGLE_CLIENT_ID", "test-client-id")
    monkeypatch.setenv("GOOGLE_CLIENT_SECRET", "test-client-secret")
    monkeypatch.setenv("TOKEN_ENCRYPTION_KEY", fernet_key)


def test_backup_uploads_json_and_prunes_files_older_than_the_newest_eight(
    monkeypatch: pytest.MonkeyPatch, fernet_key: str, caplog: pytest.LogCaptureFixture
) -> None:
    _set_env(monkeypatch, fernet_key)
    encrypted_refresh_token = TokenCipher(fernet_key).encrypt("a-real-refresh-token")

    # 9 existing backups, newest first: the job should keep the newest 8 and delete "file-8".
    existing_files = [
        {
            "id": f"file-{i}",
            "name": f"wheretogo-backup-old-{i}.json",
            "createdTime": f"2026-01-{i + 1:02d}T00:00:00Z",
        }
        for i in range(9)
    ]

    upload_bodies: list[bytes] = []
    deleted_ids: list[str] = []

    def files_get_side_effect(request: httpx.Request) -> httpx.Response:
        """Branch on the Drive `q` filter: folder lookup vs. listing files in a folder."""
        query = request.url.params.get("q", "")
        if "mimeType=" in query:
            return httpx.Response(200, json={"files": []})
        return httpx.Response(200, json={"files": existing_files})

    def upload_side_effect(request: httpx.Request) -> httpx.Response:
        upload_bodies.append(request.content)
        return httpx.Response(200, json={"id": "uploaded-file-id"})

    def delete_side_effect(request: httpx.Request) -> httpx.Response:
        deleted_ids.append(request.url.path.rsplit("/", maxsplit=1)[-1])
        return httpx.Response(200)

    with respx.mock(assert_all_called=True) as router:
        for table in _TABLES:
            router.get(f"{_SUPABASE_URL}/rest/v1/{table}").mock(
                return_value=httpx.Response(
                    200, json=[{"id": f"{table}-row-1", "user_id": _USER_ID}]
                )
            )
        router.get(
            f"{_SUPABASE_URL}/rest/v1/google_credentials", params={"select": "user_id"}
        ).mock(return_value=httpx.Response(200, json=[{"user_id": _USER_ID}]))
        router.get(
            f"{_SUPABASE_URL}/rest/v1/google_credentials",
            params={"user_id": f"eq.{_USER_ID}", "select": "refresh_token_encrypted"},
        ).mock(
            return_value=httpx.Response(
                200, json=[{"refresh_token_encrypted": encrypted_refresh_token}]
            )
        )
        router.post(_TOKEN_URL).mock(
            return_value=httpx.Response(
                200, json={"access_token": "fake-access-token", "expires_in": 3600}
            )
        )
        router.get(_FILES_URL).mock(side_effect=files_get_side_effect)
        router.post(_FILES_URL).mock(
            return_value=httpx.Response(200, json={"id": "backup-folder-1"})
        )
        router.post(_UPLOAD_URL).mock(side_effect=upload_side_effect)
        router.delete(url__regex=rf"{_FILES_URL}/.+").mock(side_effect=delete_side_effect)

        with caplog.at_level("INFO"):
            backup.main()  # must not raise SystemExit

    expected_filename = f"wheretogo-backup-{datetime.now(timezone.utc).date().isoformat()}.json"
    assert len(upload_bodies) == 1
    assert expected_filename.encode("utf-8") in upload_bodies[0]
    assert deleted_ids == ["file-8"]
    assert "backup_ok" in caplog.text


def test_no_upload_when_a_table_read_fails(
    monkeypatch: pytest.MonkeyPatch, fernet_key: str, caplog: pytest.LogCaptureFixture
) -> None:
    _set_env(monkeypatch, fernet_key)

    with respx.mock(assert_all_called=False) as router:
        # "places" is read first and fails; later tables and every Drive/Google call
        # must never be attempted.
        router.get(f"{_SUPABASE_URL}/rest/v1/places").mock(return_value=httpx.Response(500))
        upload_route = router.post(_UPLOAD_URL).mock(
            return_value=httpx.Response(200, json={"id": "should-not-be-called"})
        )

        with caplog.at_level("INFO"), pytest.raises(SystemExit) as exc_info:
            backup.main()

    assert exc_info.value.code == 1
    assert upload_route.call_count == 0
    assert "backup_failed" in caplog.text
