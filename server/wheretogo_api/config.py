"""Application settings for the WhereToGo API."""

from __future__ import annotations

from functools import lru_cache
from typing import Annotated

from pydantic import SecretStr, field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict


class Settings(BaseSettings):
    """Runtime configuration loaded from environment variables (and `server/.env` locally).

    Attributes:
        supabase_url: Base URL of the Supabase project (e.g. https://xyz.supabase.co).
        supabase_secret_key: Supabase service-role secret key used for PostgREST calls.
        google_client_id: OAuth client id registered in Google Cloud.
        google_client_secret: OAuth client secret registered in Google Cloud.
        token_encryption_key: Fernet key used to encrypt/decrypt Google refresh tokens.
        allowed_origins: Origins allowed by CORS, parsed from a comma-separated env value.
        allowed_origin_regex: Regex of additional allowed origins (e.g. Cloudflare tunnels).
        log_level: Root logger level.
    """

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    supabase_url: str
    supabase_secret_key: SecretStr
    google_client_id: str
    google_client_secret: SecretStr
    token_encryption_key: SecretStr
    allowed_origins: Annotated[list[str], NoDecode]
    allowed_origin_regex: str = r"^https://[a-z0-9-]+\.trycloudflare\.com$"
    log_level: str = "INFO"

    @field_validator("allowed_origins", mode="before")
    @classmethod
    def _split_allowed_origins(cls, value: object) -> object:
        """Allow ALLOWED_ORIGINS to be given as a comma-separated string in the env."""
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value


@lru_cache
def get_settings() -> Settings:
    """Return the process-wide cached Settings instance."""
    return Settings()
