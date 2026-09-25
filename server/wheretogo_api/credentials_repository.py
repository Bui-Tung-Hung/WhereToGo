"""Repository for storing/retrieving encrypted Google refresh tokens in Supabase."""

from __future__ import annotations

from typing import Protocol

import httpx

from .errors import UpstreamError


class CredentialRepository(Protocol):
    """Storage abstraction for encrypted Google refresh tokens, keyed by Supabase user id."""

    async def get(self, user_id: str) -> str | None:
        """Return the encrypted refresh token for `user_id`, or None if not stored."""
        ...

    async def upsert(self, user_id: str, encrypted: str) -> None:
        """Create or replace the encrypted refresh token for `user_id`."""
        ...

    async def delete(self, user_id: str) -> None:
        """Remove the stored refresh token for `user_id`, if any."""
        ...


class SupabaseCredentialRepository:
    """Talks to the Supabase PostgREST `google_credentials` table using the secret key.

    Only the `apikey` header is sent (never `Authorization`), so PostgREST treats
    every request as `service_role`, which is required since this table has no row
    level security policy.
    """

    _TABLE_PATH = "/rest/v1/google_credentials"

    def __init__(self, http: httpx.AsyncClient, supabase_url: str, secret_key: str) -> None:
        """Create a repository bound to `supabase_url`, authenticating with `secret_key`."""
        self._http = http
        self._base_url = supabase_url.rstrip("/")
        self._headers = {"apikey": secret_key}

    async def get(self, user_id: str) -> str | None:
        """Return the encrypted refresh token for `user_id`, or None if not stored."""
        response = await self._request(
            "GET",
            self._TABLE_PATH,
            params={"user_id": f"eq.{user_id}", "select": "refresh_token_encrypted"},
        )
        rows = response.json()
        if not rows:
            return None
        return rows[0]["refresh_token_encrypted"]

    async def upsert(self, user_id: str, encrypted: str) -> None:
        """Create or replace the encrypted refresh token for `user_id`."""
        await self._request(
            "POST",
            self._TABLE_PATH,
            params={"on_conflict": "user_id"},
            headers={"Prefer": "resolution=merge-duplicates"},
            json={"user_id": user_id, "refresh_token_encrypted": encrypted},
        )

    async def delete(self, user_id: str) -> None:
        """Remove the stored refresh token for `user_id`, if any."""
        await self._request("DELETE", self._TABLE_PATH, params={"user_id": f"eq.{user_id}"})

    async def list_user_ids(self) -> list[str]:
        """Return every user id that has a stored Google credential (used by the backup job)."""
        response = await self._request("GET", self._TABLE_PATH, params={"select": "user_id"})
        return [row["user_id"] for row in response.json()]

    async def _request(
        self,
        method: str,
        path: str,
        *,
        params: dict[str, str] | None = None,
        headers: dict[str, str] | None = None,
        json: dict[str, object] | None = None,
    ) -> httpx.Response:
        """Send a PostgREST request, mapping any HTTP failure to `UpstreamError`."""
        try:
            response = await self._http.request(
                method,
                f"{self._base_url}{path}",
                params=params,
                headers={**self._headers, **(headers or {})},
                json=json,
            )
            response.raise_for_status()
        except httpx.HTTPError as exc:
            raise UpstreamError("Supabase request failed") from exc
        return response
