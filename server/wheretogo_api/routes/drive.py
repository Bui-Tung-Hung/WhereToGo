"""Endpoint for locating (and lazily creating) the user's Drive photo folder."""

from __future__ import annotations

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from ..auth import AuthenticatedUser, get_current_user
from ..deps import folder_cache, get_drive_service, get_google_token_service
from ..drive import PHOTO_FOLDER_NAME, DriveService
from ..google_oauth import GoogleTokenService

router = APIRouter(prefix="/drive", tags=["drive"])


class PhotoFolderResponse(BaseModel):
    """Body of `POST /api/drive/photo-folder`."""

    folder_id: str


@router.post("/photo-folder", response_model=PhotoFolderResponse)
async def get_photo_folder(
    user: AuthenticatedUser = Depends(get_current_user),
    token_service: GoogleTokenService = Depends(get_google_token_service),
    drive: DriveService = Depends(get_drive_service),
) -> PhotoFolderResponse:
    """Return the id of the user's "WhereToGo Photos" Drive folder, creating it if needed.

    Cached in-process by (user_id, folder name); see plan 5.7 for why this cache is
    only a best-effort optimization, never a correctness guarantee.
    """
    cache_key = (user.id, PHOTO_FOLDER_NAME)
    cached = folder_cache.get(cache_key)
    if cached is not None:
        return PhotoFolderResponse(folder_id=cached)

    access_token = await token_service.get_access_token(user.id)
    folder_id = await drive.ensure_folder(access_token.value, PHOTO_FOLDER_NAME)
    folder_cache[cache_key] = folder_id
    return PhotoFolderResponse(folder_id=folder_id)
