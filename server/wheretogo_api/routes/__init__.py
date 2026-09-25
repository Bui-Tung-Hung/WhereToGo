"""Route aggregation for the WhereToGo API."""

from __future__ import annotations

from fastapi import APIRouter

from . import drive, google, health, maps, photos

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(google.router)
api_router.include_router(drive.router)
api_router.include_router(photos.router)
api_router.include_router(maps.router)

__all__ = ["api_router"]
