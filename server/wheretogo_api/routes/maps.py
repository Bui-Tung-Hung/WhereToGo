"""Endpoint for resolving Google Maps short links to their full URL."""

from __future__ import annotations

import httpx
from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from ..auth import AuthenticatedUser, get_current_user
from ..deps import get_http
from ..errors import UnsupportedLinkError
from ..maps_links import is_allowed_short_link, resolve_short_link

router = APIRouter(prefix="/maps", tags=["maps"])


class ResolveLinkRequest(BaseModel):
    """Body of `POST /api/maps/resolve`."""

    url: str = Field(min_length=1, max_length=2048)


class ResolveLinkResponse(BaseModel):
    """Body of the `POST /api/maps/resolve` response."""

    resolved_url: str


@router.post("/resolve", response_model=ResolveLinkResponse)
async def resolve(
    body: ResolveLinkRequest,
    user: AuthenticatedUser = Depends(get_current_user),
    http: httpx.AsyncClient = Depends(get_http),
) -> ResolveLinkResponse:
    """Resolve a Google Maps short link (maps.app.goo.gl / goo.gl) to its full URL."""
    if not is_allowed_short_link(body.url):
        raise UnsupportedLinkError()
    resolved = await resolve_short_link(http, body.url)
    return ResolveLinkResponse(resolved_url=resolved)
