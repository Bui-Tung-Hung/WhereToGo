"""Tests for `wheretogo_api.maps_links`."""

from __future__ import annotations

import asyncio
from collections.abc import Coroutine
from typing import TypeVar

import httpx
import pytest
import respx

from wheretogo_api.errors import UnsupportedLinkError, UpstreamError
from wheretogo_api.maps_links import is_allowed_short_link, resolve_short_link

_T = TypeVar("_T")


def _run(coro: Coroutine[None, None, _T]) -> _T:
    return asyncio.run(coro)


@respx.mock
def test_resolves_a_valid_two_hop_redirect_chain() -> None:
    respx.get("https://maps.app.goo.gl/AbCd123").mock(
        return_value=httpx.Response(302, headers={"Location": "https://goo.gl/maps/XyZ"})
    )
    respx.get("https://goo.gl/maps/XyZ").mock(
        return_value=httpx.Response(
            302, headers={"Location": "https://www.google.com/maps/place/Test"}
        )
    )

    async def run() -> str:
        async with httpx.AsyncClient() as http:
            return await resolve_short_link(http, "https://maps.app.goo.gl/AbCd123")

    resolved = _run(run())

    assert resolved == "https://www.google.com/maps/place/Test"


@respx.mock
def test_redirect_to_unknown_host_is_unsupported() -> None:
    respx.get("https://maps.app.goo.gl/Evil1").mock(
        return_value=httpx.Response(302, headers={"Location": "https://evil.example.com/phish"})
    )

    async def run() -> str:
        async with httpx.AsyncClient() as http:
            return await resolve_short_link(http, "https://maps.app.goo.gl/Evil1")

    with pytest.raises(UnsupportedLinkError):
        _run(run())


@respx.mock
def test_more_than_five_redirects_is_upstream_error() -> None:
    respx.get("https://goo.gl/maps/loop").mock(
        return_value=httpx.Response(302, headers={"Location": "https://goo.gl/maps/loop"})
    )

    async def run() -> str:
        async with httpx.AsyncClient() as http:
            return await resolve_short_link(http, "https://goo.gl/maps/loop")

    with pytest.raises(UpstreamError):
        _run(run())


def test_non_https_url_is_not_an_allowed_short_link() -> None:
    assert is_allowed_short_link("http://maps.app.goo.gl/AbCd123") is False


def test_goo_gl_without_maps_path_is_not_allowed() -> None:
    assert is_allowed_short_link("https://goo.gl/xyz") is False
    assert is_allowed_short_link("https://goo.gl/maps/xyz") is True
