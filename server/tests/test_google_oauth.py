"""Tests for `wheretogo_api.google_oauth.GoogleTokenService`."""

from __future__ import annotations

import asyncio
from collections.abc import Iterator

import httpx
import pytest
import respx
from cryptography.fernet import Fernet

from wheretogo_api.crypto import TokenCipher
from wheretogo_api.errors import GoogleReauthRequiredError
from wheretogo_api.google_oauth import GoogleTokenService, _access_token_cache

_TOKEN_URL = "https://oauth2.googleapis.com/token"
_USER_ID = "user-1"


class FakeCredentialRepository:
    """In-memory stand-in for the `CredentialRepository` protocol."""

    def __init__(self, encrypted: str | None) -> None:
        self.encrypted = encrypted
        self.deleted = False

    async def get(self, user_id: str) -> str | None:
        return self.encrypted

    async def upsert(self, user_id: str, encrypted: str) -> None:
        self.encrypted = encrypted

    async def delete(self, user_id: str) -> None:
        self.deleted = True
        self.encrypted = None


@pytest.fixture(autouse=True)
def _clear_access_token_cache() -> Iterator[None]:
    """Give every test a clean module-level access-token cache."""
    _access_token_cache.clear()
    yield
    _access_token_cache.clear()


@pytest.fixture
def cipher() -> TokenCipher:
    return TokenCipher(Fernet.generate_key().decode("utf-8"))


@respx.mock
def test_uses_cached_token_while_still_valid(cipher: TokenCipher) -> None:
    repo = FakeCredentialRepository(cipher.encrypt("refresh-token"))
    route = respx.post(_TOKEN_URL).mock(
        return_value=httpx.Response(200, json={"access_token": "token-1", "expires_in": 3600})
    )

    async def run() -> None:
        async with httpx.AsyncClient() as http:
            service = GoogleTokenService(http, "client-id", "client-secret", repo, cipher)
            first = await service.get_access_token(_USER_ID)
            second = await service.get_access_token(_USER_ID)
            assert first.value == "token-1"
            assert second.value == "token-1"

    asyncio.run(run())
    assert route.call_count == 1, "second call should be served from the in-memory cache"


@respx.mock
def test_invalid_grant_deletes_credential_and_requires_reauth(cipher: TokenCipher) -> None:
    repo = FakeCredentialRepository(cipher.encrypt("stale-refresh-token"))
    respx.post(_TOKEN_URL).mock(return_value=httpx.Response(400, json={"error": "invalid_grant"}))

    async def run() -> None:
        async with httpx.AsyncClient() as http:
            service = GoogleTokenService(http, "client-id", "client-secret", repo, cipher)
            with pytest.raises(GoogleReauthRequiredError) as exc_info:
                await service.get_access_token(_USER_ID)
            assert exc_info.value.status_code == 409

    asyncio.run(run())
    assert repo.deleted is True


def test_no_stored_credential_requires_reauth(cipher: TokenCipher) -> None:
    repo = FakeCredentialRepository(None)

    async def run() -> None:
        async with httpx.AsyncClient() as http:
            service = GoogleTokenService(http, "client-id", "client-secret", repo, cipher)
            with pytest.raises(GoogleReauthRequiredError) as exc_info:
                await service.get_access_token(_USER_ID)
            assert exc_info.value.status_code == 409

    asyncio.run(run())
