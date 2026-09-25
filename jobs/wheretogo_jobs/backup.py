"""Weekly job: exports Supabase tables as JSON into each linked user's Google Drive."""

from __future__ import annotations

import asyncio
import json
import logging
import sys
from datetime import date, datetime, timezone

import httpx
from wheretogo_api.credentials_repository import SupabaseCredentialRepository
from wheretogo_api.crypto import TokenCipher
from wheretogo_api.drive import BACKUP_FOLDER_NAME, DriveService
from wheretogo_api.google_oauth import GoogleTokenService

from .config import JobSettings
from .supabase_admin import SupabaseAdmin

logger = logging.getLogger(__name__)

_TABLES = ("places", "tags", "place_tags", "photos", "visits")
_BACKUPS_TO_KEEP = 8


async def _export_tables(admin: SupabaseAdmin) -> dict[str, list[dict]]:
    """Read every row of each backed-up table, logging only row counts."""
    tables: dict[str, list[dict]] = {}
    for table in _TABLES:
        rows = await admin.select_all(table)
        tables[table] = rows
        logger.info("backup_table_read", extra={"table": table, "row_count": len(rows)})
    return tables


def _rows_for_user(rows: list[dict], user_id: str) -> list[dict]:
    """Keep only the rows belonging to `user_id`."""
    return [row for row in rows if row.get("user_id") == user_id]


def _backup_filename(today: date) -> str:
    """Return the backup file name for `today`, e.g. `wheretogo-backup-2026-09-24.json`."""
    return f"wheretogo-backup-{today.isoformat()}.json"


async def _backup_for_user(
    user_id: str,
    tables: dict[str, list[dict]],
    exported_at: str,
    today: date,
    token_service: GoogleTokenService,
    drive: DriveService,
) -> int:
    """Upload one user's backup JSON to Drive and delete backups older than the newest 8.

    Returns:
        The number of stale backup files deleted.
    """
    payload = {
        "format": "wheretogo-backup",
        "version": 1,
        "exported_at": exported_at,
        "tables": {name: _rows_for_user(rows, user_id) for name, rows in tables.items()},
    }
    data = json.dumps(payload, ensure_ascii=False).encode("utf-8")

    access_token = await token_service.get_access_token(user_id)
    folder_id = await drive.ensure_folder(access_token.value, BACKUP_FOLDER_NAME)
    await drive.upload_json(access_token.value, folder_id, _backup_filename(today), data)

    files = await drive.list_files(access_token.value, folder_id)
    stale_files = files[_BACKUPS_TO_KEEP:]
    for stale_file in stale_files:
        await drive.delete_file(access_token.value, stale_file["id"])
    return len(stale_files)


async def _run() -> None:
    """Export all tables, then back them up to Drive for every user with linked credentials."""
    settings = JobSettings()
    async with httpx.AsyncClient(timeout=15.0) as http:
        secret_key = settings.supabase_secret_key.get_secret_value()
        admin = SupabaseAdmin(http, settings.supabase_url, secret_key)
        repo = SupabaseCredentialRepository(http, settings.supabase_url, secret_key)
        cipher = TokenCipher(settings.token_encryption_key.get_secret_value())
        token_service = GoogleTokenService(
            http,
            settings.google_client_id,
            settings.google_client_secret.get_secret_value(),
            repo,
            cipher,
        )
        drive = DriveService(http)

        tables = await _export_tables(admin)

        exported_at = datetime.now(timezone.utc).isoformat()
        today = datetime.now(timezone.utc).date()
        user_ids = await repo.list_user_ids()
        for user_id in user_ids:
            deleted_count = await _backup_for_user(
                user_id, tables, exported_at, today, token_service, drive
            )
            logger.info("backup_pruned_old_files", extra={"deleted_count": deleted_count})


def main() -> None:
    """Entry point for `python -m wheretogo_jobs.backup`."""
    logging.basicConfig(level="INFO")
    try:
        asyncio.run(_run())
    except Exception:
        # Intentional broad catch: this is the job's top-level error boundary. Any
        # failure (Supabase, Google OAuth, or Drive) must abort before any upload and
        # exit non-zero for GitHub Actions to flag the run as failed.
        logger.error("backup_failed")
        sys.exit(1)
    logger.info("backup_ok")


if __name__ == "__main__":
    main()
