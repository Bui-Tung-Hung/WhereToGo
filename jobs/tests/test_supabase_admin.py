"""Tests for `wheretogo_jobs.supabase_admin`."""

from __future__ import annotations

import asyncio

import httpx
import respx
from wheretogo_jobs.supabase_admin import SupabaseAdmin

_SUPABASE_URL = "https://test-project.supabase.co"
_TABLE_URL = f"{_SUPABASE_URL}/rest/v1/places"


async def _select_all(order: str | None = None) -> list[dict]:
    async with httpx.AsyncClient() as http:
        admin = SupabaseAdmin(http, _SUPABASE_URL, "test-secret")
        return await admin.select_all("places", order=order)


@respx.mock
def test_select_all_sends_order_when_given() -> None:
    route = respx.get(_TABLE_URL).mock(return_value=httpx.Response(200, json=[]))

    asyncio.run(_select_all(order="place_id,tag_id"))

    params = route.calls.last.request.url.params
    assert params["select"] == "*"
    assert params["order"] == "place_id,tag_id"


@respx.mock
def test_select_all_omits_order_when_not_given() -> None:
    route = respx.get(_TABLE_URL).mock(return_value=httpx.Response(200, json=[]))

    asyncio.run(_select_all())

    assert "order" not in route.calls.last.request.url.params


@respx.mock
def test_select_all_paginates_with_range_header() -> None:
    first_page = [{"id": f"row-{index}"} for index in range(1000)]
    second_page = [{"id": "row-1000"}]
    route = respx.get(_TABLE_URL).mock(
        side_effect=[httpx.Response(200, json=first_page), httpx.Response(200, json=second_page)]
    )

    rows = asyncio.run(_select_all(order="id"))

    assert len(rows) == 1001
    assert [call.request.headers["Range"] for call in route.calls] == ["0-999", "1000-1999"]
