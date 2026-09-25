"""Google OAuth credential endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends, Response
from pydantic import BaseModel, Field

from ..auth import AuthenticatedUser, get_current_user
from ..deps import get_google_token_service
from ..google_oauth import GoogleTokenService

router = APIRouter(prefix="/google", tags=["google"])


class StoreCredentialsRequest(BaseModel):
    """Body of `POST /api/google/credentials`."""

    refresh_token: str = Field(min_length=1, max_length=2048)


class AccessTokenResponse(BaseModel):
    """Body of `POST /api/google/access-token`."""

    access_token: str
    expires_at: int


@router.post("/credentials", status_code=204)
async def store_credentials(
    body: StoreCredentialsRequest,
    user: AuthenticatedUser = Depends(get_current_user),
    token_service: GoogleTokenService = Depends(get_google_token_service),
) -> Response:
    """Store the current user's Google refresh token, encrypted at rest."""
    await token_service.store_refresh_token(user.id, body.refresh_token)
    return Response(status_code=204)


@router.post("/access-token", response_model=AccessTokenResponse)
async def get_access_token(
    user: AuthenticatedUser = Depends(get_current_user),
    token_service: GoogleTokenService = Depends(get_google_token_service),
) -> AccessTokenResponse:
    """Return a fresh Google Drive access token for the current user."""
    token = await token_service.get_access_token(user.id)
    return AccessTokenResponse(access_token=token.value, expires_at=token.expires_at)
