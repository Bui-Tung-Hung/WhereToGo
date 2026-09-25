"""Tests for the API routes: request/response wiring, auth, and CORS via TestClient."""

from __future__ import annotations

from collections.abc import Iterator

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from wheretogo_api.auth import AuthenticatedUser, get_current_user
from wheretogo_api.deps import get_drive_service, get_google_token_service
from wheretogo_api.errors import GoogleReauthRequiredError, NotFoundError
from wheretogo_api.google_oauth import AccessToken

_ALLOWED_ORIGIN = "https://allowed.example.com"
_VALID_FILE_ID = "AbCdEfGhIj1234567890"


class _FakeTokenService:
    """Stub `GoogleTokenService` for route tests; never touches the network."""

    def __init__(self, *, raise_reauth: bool = False) -> None:
        self.raise_reauth = raise_reauth
        self.stored: tuple[str, str] | None = None

    async def store_refresh_token(self, user_id: str, refresh_token: str) -> None:
        self.stored = (user_id, refresh_token)

    async def get_access_token(self, user_id: str) -> AccessToken:
        if self.raise_reauth:
            raise GoogleReauthRequiredError()
        return AccessToken(value="fake-access-token", expires_at=9999999999)


class _FakeDriveService:
    """Stub `DriveService` for route tests; never touches the network."""

    def __init__(self, *, raise_not_ready: bool = False) -> None:
        self.raise_not_ready = raise_not_ready
        self.deleted_file_id: str | None = None

    async def ensure_folder(self, access_token: str, name: str) -> str:
        return "folder-123"

    async def get_thumbnail(self, access_token: str, file_id: str, size: int) -> tuple[bytes, str]:
        if self.raise_not_ready:
            raise NotFoundError(code="thumbnail_not_ready")
        return (b"thumb-bytes", "image/jpeg")

    async def delete_file(self, access_token: str, file_id: str) -> None:
        self.deleted_file_id = file_id


@pytest.fixture
def token_service() -> _FakeTokenService:
    return _FakeTokenService()


@pytest.fixture
def drive_service() -> _FakeDriveService:
    return _FakeDriveService()


@pytest.fixture
def client(
    app: FastAPI,
    authenticated_user: AuthenticatedUser,
    token_service: _FakeTokenService,
    drive_service: _FakeDriveService,
) -> Iterator[TestClient]:
    """A TestClient with auth and upstream services stubbed out (no network calls)."""
    app.dependency_overrides[get_current_user] = lambda: authenticated_user
    app.dependency_overrides[get_google_token_service] = lambda: token_service
    app.dependency_overrides[get_drive_service] = lambda: drive_service
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


def test_health_ok(client: TestClient) -> None:
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_store_google_credentials_ok(
    client: TestClient, token_service: _FakeTokenService, authenticated_user: AuthenticatedUser
) -> None:
    response = client.post("/api/google/credentials", json={"refresh_token": "a-refresh-token"})

    assert response.status_code == 204
    assert token_service.stored == (authenticated_user.id, "a-refresh-token")


def test_store_google_credentials_invalid_body_is_400(client: TestClient) -> None:
    response = client.post("/api/google/credentials", json={"refresh_token": ""})

    assert response.status_code == 400
    assert response.json()["code"] == "invalid_request"


def test_get_access_token_ok(client: TestClient) -> None:
    response = client.post("/api/google/access-token")

    assert response.status_code == 200
    body = response.json()
    assert body == {"access_token": "fake-access-token", "expires_at": 9999999999}


def test_get_access_token_reauth_required_is_409(
    app: FastAPI, authenticated_user: AuthenticatedUser
) -> None:
    app.dependency_overrides[get_current_user] = lambda: authenticated_user
    app.dependency_overrides[get_google_token_service] = lambda: _FakeTokenService(
        raise_reauth=True
    )
    with TestClient(app) as client:
        response = client.post("/api/google/access-token")

    assert response.status_code == 409
    assert response.json()["code"] == "google_reauth_required"


def test_get_photo_folder_ok(client: TestClient) -> None:
    response = client.post("/api/drive/photo-folder")

    assert response.status_code == 200
    assert response.json() == {"folder_id": "folder-123"}


def test_get_thumbnail_ok(client: TestClient) -> None:
    response = client.get(f"/api/photos/{_VALID_FILE_ID}/thumbnail", params={"size": 400})

    assert response.status_code == 200
    assert response.content == b"thumb-bytes"
    assert response.headers["cache-control"] == "private, max-age=86400"


def test_get_thumbnail_invalid_file_id_is_400(client: TestClient) -> None:
    response = client.get("/api/photos/short/thumbnail")

    assert response.status_code == 400


def test_get_thumbnail_not_ready_is_404(
    app: FastAPI, authenticated_user: AuthenticatedUser
) -> None:
    app.dependency_overrides[get_current_user] = lambda: authenticated_user
    app.dependency_overrides[get_google_token_service] = lambda: _FakeTokenService()
    app.dependency_overrides[get_drive_service] = lambda: _FakeDriveService(raise_not_ready=True)
    with TestClient(app) as client:
        response = client.get(f"/api/photos/{_VALID_FILE_ID}/thumbnail")

    assert response.status_code == 404
    assert response.json()["code"] == "thumbnail_not_ready"


def test_delete_photo_ok(client: TestClient, drive_service: _FakeDriveService) -> None:
    response = client.delete(f"/api/photos/{_VALID_FILE_ID}")

    assert response.status_code == 204
    assert drive_service.deleted_file_id == _VALID_FILE_ID


def test_delete_photo_invalid_file_id_is_400(client: TestClient) -> None:
    response = client.delete("/api/photos/short")

    assert response.status_code == 400


def test_resolve_maps_link_ok(client: TestClient, monkeypatch: pytest.MonkeyPatch) -> None:
    async def fake_resolve_short_link(http: object, url: str) -> str:
        return "https://www.google.com/maps/place/Resolved"

    monkeypatch.setattr("wheretogo_api.routes.maps.resolve_short_link", fake_resolve_short_link)

    response = client.post("/api/maps/resolve", json={"url": "https://maps.app.goo.gl/AbCd123"})

    assert response.status_code == 200
    assert response.json() == {"resolved_url": "https://www.google.com/maps/place/Resolved"}


def test_resolve_maps_link_unsupported_is_422(client: TestClient) -> None:
    response = client.post("/api/maps/resolve", json={"url": "https://example.com/not-maps"})

    assert response.status_code == 422
    assert response.json()["code"] == "unsupported_link"


def test_protected_endpoint_without_auth_is_401(app: FastAPI) -> None:
    # No override for get_current_user here: exercises the real auth dependency.
    with TestClient(app) as client:
        response = client.post("/api/drive/photo-folder")

    assert response.status_code == 401
    assert response.json()["code"] == "unauthorized"


def test_cors_preflight_from_allowed_origin_returns_200(app: FastAPI) -> None:
    with TestClient(app) as client:
        response = client.options(
            "/api/health",
            headers={
                "Origin": _ALLOWED_ORIGIN,
                "Access-Control-Request-Method": "GET",
            },
        )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == _ALLOWED_ORIGIN


def test_cors_does_not_expose_headers_for_unknown_origin(app: FastAPI) -> None:
    with TestClient(app) as client:
        response = client.get("/api/health", headers={"Origin": "https://not-allowed.example.com"})

    assert response.status_code == 200
    assert "access-control-allow-origin" not in response.headers
