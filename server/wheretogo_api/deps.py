"""FastAPI dependency wiring for the WhereToGo API."""

from __future__ import annotations

import httpx
from fastapi import Depends, Request

from .auth import get_verifier
from .config import Settings, get_settings
from .credentials_repository import SupabaseCredentialRepository
from .crypto import TokenCipher
from .drive import DriveService
from .google_oauth import GoogleTokenService

__all__ = [
    "get_settings",
    "get_http",
    "get_verifier",
    "get_cipher",
    "get_credential_repo",
    "get_google_token_service",
    "get_drive_service",
    "folder_cache",
]

# Cache of (user_id, folder_name) -> Drive folder id. This is only a best-effort
# optimization within a single warm Vercel instance (see plan 5.7); it is never
# shared across instances or relied upon for correctness.
folder_cache: dict[tuple[str, str], str] = {}


def get_http(request: Request) -> httpx.AsyncClient:
    """Return the shared `httpx.AsyncClient` created in the app lifespan."""
    return request.app.state.http


def get_cipher(settings: Settings = Depends(get_settings)) -> TokenCipher:
    """Build a `TokenCipher` from the configured encryption key."""
    return TokenCipher(settings.token_encryption_key.get_secret_value())


def get_credential_repo(
    http: httpx.AsyncClient = Depends(get_http),
    settings: Settings = Depends(get_settings),
) -> SupabaseCredentialRepository:
    """Build the Supabase-backed Google credential repository."""
    return SupabaseCredentialRepository(
        http=http,
        supabase_url=settings.supabase_url,
        secret_key=settings.supabase_secret_key.get_secret_value(),
    )


def get_google_token_service(
    http: httpx.AsyncClient = Depends(get_http),
    settings: Settings = Depends(get_settings),
    repo: SupabaseCredentialRepository = Depends(get_credential_repo),
    cipher: TokenCipher = Depends(get_cipher),
) -> GoogleTokenService:
    """Build the Google OAuth token exchange service."""
    return GoogleTokenService(
        http=http,
        client_id=settings.google_client_id,
        client_secret=settings.google_client_secret.get_secret_value(),
        repo=repo,
        cipher=cipher,
    )


def get_drive_service(http: httpx.AsyncClient = Depends(get_http)) -> DriveService:
    """Build the Google Drive API client."""
    return DriveService(http)
