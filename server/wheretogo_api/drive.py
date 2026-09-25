"""Google Drive API client used for photo thumbnails, deletion, and JSON backups."""

from __future__ import annotations

import json
import re

import httpx

from .errors import NotFoundError, UpstreamError

PHOTO_FOLDER_NAME = "WhereToGo Photos"
BACKUP_FOLDER_NAME = "WhereToGo Backups"
ALLOWED_THUMB_SIZES = {400, 1600}
DRIVE_FILE_ID_PATTERN = re.compile(r"^[A-Za-z0-9_-]{10,200}$")

_FILES_URL = "https://www.googleapis.com/drive/v3/files"
_UPLOAD_URL = "https://www.googleapis.com/upload/drive/v3/files"
_FOLDER_MIME_TYPE = "application/vnd.google-apps.folder"
_THUMBNAIL_SIZE_SUFFIX = re.compile(r"=s\d+$")


class DriveService:
    """Thin wrapper around the Google Drive v3 REST API."""

    def __init__(self, http: httpx.AsyncClient) -> None:
        """Create a Drive client that issues requests through the shared `http` client."""
        self._http = http

    async def ensure_folder(self, access_token: str, name: str) -> str:
        """Return the id of the Drive folder named `name`, creating it if missing.

        Always looks the folder up first so repeated calls are idempotent; if more
        than one folder with that name exists, the earliest created one wins.
        """
        query = f"mimeType='{_FOLDER_MIME_TYPE}' and name='{name}' and trashed=false"
        response = await self._request(
            "GET",
            _FILES_URL,
            access_token,
            params={
                "q": query,
                "fields": "files(id)",
                "orderBy": "createdTime",
                "pageSize": 1,
                "spaces": "drive",
            },
        )
        files = response.json().get("files", [])
        if files:
            return files[0]["id"]

        create_response = await self._request(
            "POST",
            _FILES_URL,
            access_token,
            params={"fields": "id"},
            json={"name": name, "mimeType": _FOLDER_MIME_TYPE},
        )
        return create_response.json()["id"]

    async def get_thumbnail(self, access_token: str, file_id: str, size: int) -> tuple[bytes, str]:
        """Fetch a resized thumbnail for `file_id` at `size` pixels.

        Raises:
            NotFoundError: the file does not exist, or Drive has not generated a
                thumbnail for it yet (`code="thumbnail_not_ready"`).
            UpstreamError: the thumbnail image itself could not be downloaded.
        """
        response = await self._request(
            "GET",
            f"{_FILES_URL}/{file_id}",
            access_token,
            params={"fields": "thumbnailLink,mimeType"},
            not_found_ok=True,
        )
        if response.status_code == 404:
            raise NotFoundError()

        thumbnail_link = response.json().get("thumbnailLink")
        if not thumbnail_link:
            raise NotFoundError(code="thumbnail_not_ready")

        resized_url = _with_thumbnail_size(thumbnail_link, size)
        try:
            image_response = await self._http.get(
                resized_url, headers={"Authorization": f"Bearer {access_token}"}
            )
            image_response.raise_for_status()
        except httpx.HTTPError as exc:
            raise UpstreamError("Failed to download Drive thumbnail") from exc
        return image_response.content, image_response.headers.get("Content-Type", "image/jpeg")

    async def delete_file(self, access_token: str, file_id: str) -> None:
        """Delete `file_id` from Drive; a file that is already gone counts as success."""
        await self._request("DELETE", f"{_FILES_URL}/{file_id}", access_token, not_found_ok=True)

    async def upload_json(
        self, access_token: str, folder_id: str, filename: str, data: bytes
    ) -> str:
        """Upload `data` as a JSON file named `filename` inside `folder_id`.

        Returns:
            The id of the newly created Drive file.
        """
        metadata = {"name": filename, "parents": [folder_id]}
        files = {
            "metadata": (None, json.dumps(metadata), "application/json"),
            "file": (filename, data, "application/json"),
        }
        try:
            response = await self._http.post(
                _UPLOAD_URL,
                params={"uploadType": "multipart", "fields": "id"},
                headers={"Authorization": f"Bearer {access_token}"},
                files=files,
            )
            response.raise_for_status()
        except httpx.HTTPError as exc:
            raise UpstreamError("Failed to upload backup JSON to Drive") from exc
        return response.json()["id"]

    async def list_files(self, access_token: str, folder_id: str) -> list[dict]:
        """List files inside `folder_id`, newest first (used by the backup job)."""
        response = await self._request(
            "GET",
            _FILES_URL,
            access_token,
            params={
                "q": f"'{folder_id}' in parents and trashed=false",
                "fields": "files(id,name,createdTime)",
                "orderBy": "createdTime desc",
                "pageSize": 100,
            },
        )
        return response.json().get("files", [])

    async def _request(
        self,
        method: str,
        url: str,
        access_token: str,
        *,
        params: dict[str, object] | None = None,
        json: dict[str, object] | None = None,
        not_found_ok: bool = False,
    ) -> httpx.Response:
        """Issue a Drive API request, mapping network failures to `UpstreamError`."""
        try:
            response = await self._http.request(
                method,
                url,
                params=params,
                json=json,
                headers={"Authorization": f"Bearer {access_token}"},
            )
        except httpx.HTTPError as exc:
            raise UpstreamError(f"Google Drive request failed: {method} {url}") from exc

        if not_found_ok and response.status_code == 404:
            return response
        try:
            response.raise_for_status()
        except httpx.HTTPStatusError as exc:
            raise UpstreamError(f"Google Drive request failed: {method} {url}") from exc
        return response


def _with_thumbnail_size(thumbnail_link: str, size: int) -> str:
    """Replace (or append) the `=s<number>` size suffix of a Drive thumbnail URL."""
    if _THUMBNAIL_SIZE_SUFFIX.search(thumbnail_link):
        return _THUMBNAIL_SIZE_SUFFIX.sub(f"=s{size}", thumbnail_link)
    return f"{thumbnail_link}=s{size}"
