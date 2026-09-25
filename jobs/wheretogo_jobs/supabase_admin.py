"""Read-only Supabase PostgREST access used by the scheduled jobs."""

from __future__ import annotations

import httpx

_PAGE_SIZE = 1000


class SupabaseAdmin:
    """Reads Supabase tables as `service_role`, via the secret key, for the jobs to back up."""

    def __init__(self, http: httpx.AsyncClient, url: str, secret_key: str) -> None:
        """Create an admin client bound to `url`, authenticating with `secret_key`."""
        self._http = http
        self._base_url = url.rstrip("/")
        self._headers = {"apikey": secret_key}

    async def select_all(self, table: str, columns: str = "*") -> list[dict]:
        """Return every row of `table`, paginating 1000 rows at a time via the Range header."""
        rows: list[dict] = []
        offset = 0
        while True:
            response = await self._http.get(
                f"{self._base_url}/rest/v1/{table}",
                params={"select": columns},
                headers={**self._headers, "Range": f"{offset}-{offset + _PAGE_SIZE - 1}"},
            )
            response.raise_for_status()
            page = response.json()
            rows.extend(page)
            if len(page) < _PAGE_SIZE:
                break
            offset += _PAGE_SIZE
        return rows

    async def ping(self) -> None:
        """Make a minimal request, keeping the free-tier Supabase project from auto-pausing."""
        response = await self._http.get(
            f"{self._base_url}/rest/v1/places",
            params={"select": "id", "limit": 1},
            headers=self._headers,
        )
        response.raise_for_status()
