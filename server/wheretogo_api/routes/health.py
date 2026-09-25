"""Health check endpoint (no authentication required)."""

from __future__ import annotations

from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/health")
async def health() -> dict[str, str]:
    """Return a simple liveness payload."""
    return {"status": "ok"}
