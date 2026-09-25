"""Tests for `wheretogo_api.drive.DriveService`."""

from __future__ import annotations

import asyncio
from collections.abc import Coroutine
from typing import TypeVar

import httpx
import pytest
import respx

from wheretogo_api.drive import PHOTO_FOLDER_NAME, DriveService
from wheretogo_api.errors import NotFoundError

_FILES_URL = "https://www.googleapis.com/drive/v3/files"
_ACCESS_TOKEN = "fake-access-token"

_T = TypeVar("_T")


def _run(coro: Coroutine[None, None, _T]) -> _T:
    return asyncio.run(coro)


@respx.mock
def test_get_thumbnail_rewrites_size_suffix() -> None:
    respx.get(f"{_FILES_URL}/file-abc-123456").mock(
        return_value=httpx.Response(
            200,
            json={
                "thumbnailLink": "https://lh3.googleusercontent.com/abc=s220",
                "mimeType": "image/jpeg",
            },
        )
    )
    image_route = respx.get("https://lh3.googleusercontent.com/abc=s400").mock(
        return_value=httpx.Response(
            200, content=b"pretend-image-bytes", headers={"Content-Type": "image/jpeg"}
        )
    )

    async def run() -> tuple[bytes, str]:
        async with httpx.AsyncClient() as http:
            service = DriveService(http)
            return await service.get_thumbnail(_ACCESS_TOKEN, "file-abc-123456", 400)

    content, content_type = _run(run())

    assert image_route.called
    assert content == b"pretend-image-bytes"
    assert content_type == "image/jpeg"


@respx.mock
def test_get_thumbnail_missing_link_is_not_ready() -> None:
    respx.get(f"{_FILES_URL}/file-no-thumb-1").mock(
        return_value=httpx.Response(200, json={"mimeType": "image/jpeg"})
    )

    async def run() -> None:
        async with httpx.AsyncClient() as http:
            service = DriveService(http)
            await service.get_thumbnail(_ACCESS_TOKEN, "file-no-thumb-1", 400)

    with pytest.raises(NotFoundError) as exc_info:
        _run(run())
    assert exc_info.value.code == "thumbnail_not_ready"


@respx.mock
def test_delete_file_treats_404_as_success() -> None:
    respx.delete(f"{_FILES_URL}/already-gone-1").mock(return_value=httpx.Response(404))

    async def run() -> None:
        async with httpx.AsyncClient() as http:
            service = DriveService(http)
            await service.delete_file(_ACCESS_TOKEN, "already-gone-1")

    _run(run())  # must not raise


@respx.mock
def test_ensure_folder_returns_existing_folder_id() -> None:
    list_route = respx.get(_FILES_URL).mock(
        return_value=httpx.Response(200, json={"files": [{"id": "existing-folder-id"}]})
    )

    async def run() -> str:
        async with httpx.AsyncClient() as http:
            service = DriveService(http)
            return await service.ensure_folder(_ACCESS_TOKEN, PHOTO_FOLDER_NAME)

    folder_id = _run(run())

    assert folder_id == "existing-folder-id"
    assert list_route.call_count == 1


@respx.mock
def test_ensure_folder_creates_when_missing() -> None:
    respx.get(_FILES_URL).mock(return_value=httpx.Response(200, json={"files": []}))
    create_route = respx.post(_FILES_URL).mock(
        return_value=httpx.Response(200, json={"id": "new-folder-id"})
    )

    async def run() -> str:
        async with httpx.AsyncClient() as http:
            service = DriveService(http)
            return await service.ensure_folder(_ACCESS_TOKEN, PHOTO_FOLDER_NAME)

    folder_id = _run(run())

    assert folder_id == "new-folder-id"
    assert create_route.called
