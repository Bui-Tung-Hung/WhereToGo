"""Google OAuth refresh-token exchange with an in-process access-token cache."""

from __future__ import annotations

import time
from dataclasses import dataclass

import httpx

from .credentials_repository import CredentialRepository
from .crypto import TokenCipher
from .errors import GoogleReauthRequiredError, UpstreamError

_TOKEN_URL = "https://oauth2.googleapis.com/token"
_EXPIRY_SAFETY_MARGIN_SECONDS = 60


@dataclass(frozen=True)
class AccessToken:
    """A Google OAuth access token and its epoch-seconds expiry."""

    value: str
    expires_at: int


# Module-level cache of access tokens by Supabase user id. This is only a best-effort
# optimization within a single warm process/instance, mirroring the folder cache
# discussed in plan 5.7 — never a cross-instance correctness guarantee.
_access_token_cache: dict[str, AccessToken] = {}


class GoogleTokenService:
    """Exchanges a stored Google refresh token for a short-lived access token."""

    def __init__(
        self,
        http: httpx.AsyncClient,
        client_id: str,
        client_secret: str,
        repo: CredentialRepository,
        cipher: TokenCipher,
    ) -> None:
        """Create a token service backed by `repo` for storage and `cipher` for encryption."""
        self._http = http
        self._client_id = client_id
        self._client_secret = client_secret
        self._repo = repo
        self._cipher = cipher

    async def store_refresh_token(self, user_id: str, refresh_token: str) -> None:
        """Encrypt and persist `refresh_token`, invalidating any cached access token."""
        encrypted = self._cipher.encrypt(refresh_token)
        await self._repo.upsert(user_id, encrypted)
        _access_token_cache.pop(user_id, None)

    async def get_access_token(self, user_id: str) -> AccessToken:
        """Return a valid access token for `user_id`, refreshing it if necessary.

        Raises:
            GoogleReauthRequiredError: no refresh token is stored for `user_id`, or
                Google rejected it as invalid (the user must sign in with Google again).
            UpstreamError: Google's token endpoint failed for another reason.
        """
        now = int(time.time())
        cached = _access_token_cache.get(user_id)
        if cached is not None and cached.expires_at - now >= _EXPIRY_SAFETY_MARGIN_SECONDS:
            return cached

        encrypted = await self._repo.get(user_id)
        if encrypted is None:
            raise GoogleReauthRequiredError()
        refresh_token = self._cipher.decrypt(encrypted)

        try:
            response = await self._http.post(
                _TOKEN_URL,
                data={
                    "grant_type": "refresh_token",
                    "client_id": self._client_id,
                    "client_secret": self._client_secret,
                    "refresh_token": refresh_token,
                },
            )
        except httpx.HTTPError as exc:
            raise UpstreamError("Google token endpoint request failed") from exc

        if response.status_code >= 400:
            if _is_invalid_grant(response):
                await self._repo.delete(user_id)
                raise GoogleReauthRequiredError()
            raise UpstreamError("Google token endpoint returned an error")

        payload = response.json()
        access_token = AccessToken(
            value=payload["access_token"],
            expires_at=now + int(payload["expires_in"]),
        )
        _access_token_cache[user_id] = access_token
        return access_token


def _is_invalid_grant(response: httpx.Response) -> bool:
    """Return True if Google's error response body reports `invalid_grant`."""
    try:
        return response.json().get("error") == "invalid_grant"
    except ValueError:
        return False
