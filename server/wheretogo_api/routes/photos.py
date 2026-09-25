"""Endpoints for Google Drive-backed photo thumbnails and deletion."""

from __future__ import annotations

from fastapi import APIRouter, Depends, Query, Response

from ..auth import AuthenticatedUser, get_current_user
from ..deps import get_drive_service, get_google_token_service
from ..drive import ALLOWED_THUMB_SIZES, DRIVE_FILE_ID_PATTERN, DriveService
from ..errors import InvalidRequestError
from ..google_oauth import GoogleTokenService

router = APIRouter(prefix="/photos", tags=["photos"])


def _validate_file_id(file_id: str) -> None:
    """Ensure `file_id` looks like a Google Drive file id before it reaches Drive."""
    if not DRIVE_FILE_ID_PATTERN.match(file_id):
        raise InvalidRequestError("Invalid Drive file id")


@router.get("/{file_id}/thumbnail")
async def get_thumbnail(
    file_id: str,
    size: int = Query(default=400),
    user: AuthenticatedUser = Depends(get_current_user),
    token_service: GoogleTokenService = Depends(get_google_token_service),
    drive: DriveService = Depends(get_drive_service),
) -> Response:
    """Return a resized Drive thumbnail (400px or 1600px) for the current user's photo."""
    _validate_file_id(file_id)
    if size not in ALLOWED_THUMB_SIZES:
        raise InvalidRequestError("size must be 400 or 1600")

    access_token = await token_service.get_access_token(user.id)
    content, content_type = await drive.get_thumbnail(access_token.value, file_id, size)
    return Response(
        content=content,
        media_type=content_type,
        headers={"Cache-Control": "private, max-age=86400"},
    )


@router.delete("/{file_id}", status_code=204)
async def delete_photo(
    file_id: str,
    user: AuthenticatedUser = Depends(get_current_user),
    token_service: GoogleTokenService = Depends(get_google_token_service),
    drive: DriveService = Depends(get_drive_service),
) -> Response:
    """Delete a photo file from the current user's Google Drive."""
    _validate_file_id(file_id)
    access_token = await token_service.get_access_token(user.id)
    await drive.delete_file(access_token.value, file_id)
    return Response(status_code=204)
