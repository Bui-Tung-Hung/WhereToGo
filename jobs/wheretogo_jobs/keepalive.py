"""Daily job: pings Supabase so the free-tier project is never auto-paused for inactivity."""

from __future__ import annotations

import asyncio
import logging
import sys

import httpx

from .config import JobSettings
from .supabase_admin import SupabaseAdmin

logger = logging.getLogger(__name__)


async def _run() -> None:
    """Ping Supabase once, using settings read from the environment."""
    settings = JobSettings()
    async with httpx.AsyncClient(timeout=10.0) as http:
        admin = SupabaseAdmin(
            http, settings.supabase_url, settings.supabase_secret_key.get_secret_value()
        )
        await admin.ping()


def main() -> None:
    """Entry point for `python -m wheretogo_jobs.keepalive`."""
    logging.basicConfig(level="INFO")
    try:
        asyncio.run(_run())
    except httpx.HTTPError:
        logger.error("keepalive_failed")
        sys.exit(1)
    logger.info("keepalive_ok")


if __name__ == "__main__":
    main()
