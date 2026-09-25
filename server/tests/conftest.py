"""Shared pytest fixtures for the WhereToGo API test suite."""

from __future__ import annotations

import base64
import time
from collections.abc import Iterator
from typing import Any

import jwt
import pytest
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives.asymmetric import rsa
from fastapi import FastAPI

from wheretogo_api.auth import AuthenticatedUser, get_verifier
from wheretogo_api.config import get_settings
from wheretogo_api.main import create_app

SUPABASE_URL = "https://test-project.supabase.co"
ISSUER = f"{SUPABASE_URL}/auth/v1"
AUDIENCE = "authenticated"
KID = "test-key-1"
DEFAULT_USER_ID = "11111111-1111-1111-1111-111111111111"
ALLOWED_ORIGIN = "https://allowed.example.com"


def _b64url_uint(value: int) -> str:
    """Base64url-encode an integer without padding, as required by the JWK spec."""
    length = (value.bit_length() + 7) // 8 or 1
    return base64.urlsafe_b64encode(value.to_bytes(length, "big")).rstrip(b"=").decode("ascii")


@pytest.fixture(scope="session")
def rsa_private_key() -> rsa.RSAPrivateKey:
    """A throwaway RSA keypair used to sign fake Supabase JWTs in tests."""
    return rsa.generate_private_key(public_exponent=65537, key_size=2048)


@pytest.fixture(scope="session")
def jwks_data(rsa_private_key: rsa.RSAPrivateKey) -> dict[str, Any]:
    """A JWKS document exposing the public half of `rsa_private_key`."""
    public_numbers = rsa_private_key.public_key().public_numbers()
    return {
        "keys": [
            {
                "kty": "RSA",
                "use": "sig",
                "alg": "RS256",
                "kid": KID,
                "n": _b64url_uint(public_numbers.n),
                "e": _b64url_uint(public_numbers.e),
            }
        ]
    }


@pytest.fixture(autouse=True)
def _patch_jwks_fetch(monkeypatch: pytest.MonkeyPatch, jwks_data: dict[str, Any]) -> None:
    """Make every `PyJWKClient` return the fake JWKS instead of hitting the network.

    `PyJWKClient` fetches JWKS over plain `urllib`, so respx (which only mocks httpx)
    cannot intercept it; patching `fetch_data` is the documented way around that.
    """
    monkeypatch.setattr(jwt.PyJWKClient, "fetch_data", lambda self: jwks_data)


@pytest.fixture
def make_token(rsa_private_key: rsa.RSAPrivateKey):
    """Factory fixture: `make_token(**overrides)` mints a Supabase-shaped access token.

    Returns:
        A callable accepting the same keyword overrides as the default claims below,
        signed with the session's fake RSA key (whose public half `jwks_data` exposes).
    """

    def _make_token(
        *,
        sub: str = DEFAULT_USER_ID,
        email: str | None = "user@example.com",
        role: str = "authenticated",
        audience: str = AUDIENCE,
        issuer: str = ISSUER,
        expires_in: int = 3600,
        issued_at_offset: int = 0,
    ) -> str:
        now = int(time.time()) + issued_at_offset
        claims = {
            "sub": sub,
            "email": email,
            "role": role,
            "aud": audience,
            "iss": issuer,
            "iat": now,
            "exp": now + expires_in,
        }
        return jwt.encode(claims, rsa_private_key, algorithm="RS256", headers={"kid": KID})

    return _make_token


@pytest.fixture
def fernet_key() -> str:
    """A freshly generated Fernet key for `TokenCipher` tests."""
    return Fernet.generate_key().decode("utf-8")


@pytest.fixture
def authenticated_user() -> AuthenticatedUser:
    """A default authenticated user for route tests that override `get_current_user`."""
    return AuthenticatedUser(id=DEFAULT_USER_ID, email="user@example.com")


@pytest.fixture
def app(monkeypatch: pytest.MonkeyPatch, fernet_key: str) -> Iterator[FastAPI]:
    """A FastAPI app built with fixed, test-only settings (via environment variables)."""
    monkeypatch.setenv("SUPABASE_URL", SUPABASE_URL)
    monkeypatch.setenv("SUPABASE_SECRET_KEY", "test-supabase-secret")
    monkeypatch.setenv("GOOGLE_CLIENT_ID", "test-client-id.apps.googleusercontent.com")
    monkeypatch.setenv("GOOGLE_CLIENT_SECRET", "test-client-secret")
    monkeypatch.setenv("TOKEN_ENCRYPTION_KEY", fernet_key)
    monkeypatch.setenv("ALLOWED_ORIGINS", ALLOWED_ORIGIN)
    monkeypatch.setenv("LOG_LEVEL", "INFO")
    get_settings.cache_clear()
    get_verifier.cache_clear()

    application = create_app()
    yield application

    get_settings.cache_clear()
    get_verifier.cache_clear()
