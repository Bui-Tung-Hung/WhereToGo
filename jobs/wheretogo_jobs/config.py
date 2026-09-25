"""Configuration for the WhereToGo scheduled jobs, loaded from the environment."""

from __future__ import annotations

from pydantic import SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class JobSettings(BaseSettings):
    """Settings shared by the keepalive and backup jobs.

    Attributes:
        supabase_url: Base URL of the Supabase project.
        supabase_secret_key: Supabase service-role secret key (the `github-actions` key).
        google_client_id: OAuth client id registered in Google Cloud.
        google_client_secret: OAuth client secret registered in Google Cloud.
        token_encryption_key: Fernet key used to decrypt stored Google refresh tokens.
    """

    model_config = SettingsConfigDict(extra="ignore")

    supabase_url: str
    supabase_secret_key: SecretStr
    google_client_id: str
    google_client_secret: SecretStr
    token_encryption_key: SecretStr
