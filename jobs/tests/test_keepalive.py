"""Tests for `wheretogo_jobs.keepalive`."""

from __future__ import annotations

import httpx
import pytest
import respx
from wheretogo_jobs import keepalive

_SUPABASE_URL = "https://test-project.supabase.co"


@pytest.fixture(autouse=True)
def _job_env(monkeypatch: pytest.MonkeyPatch, fernet_key: str) -> None:
    monkeypatch.setenv("SUPABASE_URL", _SUPABASE_URL)
    monkeypatch.setenv("SUPABASE_SECRET_KEY", "test-secret")
    monkeypatch.setenv("GOOGLE_CLIENT_ID", "test-client-id")
    monkeypatch.setenv("GOOGLE_CLIENT_SECRET", "test-client-secret")
    monkeypatch.setenv("TOKEN_ENCRYPTION_KEY", fernet_key)


@respx.mock
def test_main_pings_supabase_and_logs_ok(caplog: pytest.LogCaptureFixture) -> None:
    respx.get(f"{_SUPABASE_URL}/rest/v1/places").mock(
        return_value=httpx.Response(200, json=[{"id": "11111111-1111-1111-1111-111111111111"}])
    )

    with caplog.at_level("INFO"):
        keepalive.main()  # must not raise SystemExit

    assert "keepalive_ok" in caplog.text
    assert "keepalive_failed" not in caplog.text


@respx.mock
def test_main_exits_with_code_1_on_http_failure(caplog: pytest.LogCaptureFixture) -> None:
    respx.get(f"{_SUPABASE_URL}/rest/v1/places").mock(return_value=httpx.Response(500))

    with caplog.at_level("INFO"), pytest.raises(SystemExit) as exc_info:
        keepalive.main()

    assert exc_info.value.code == 1
    assert "keepalive_failed" in caplog.text
