"""Supabase JWT verification for authenticating API requests."""

from __future__ import annotations

from dataclasses import dataclass
from functools import lru_cache

import jwt
from fastapi import Header
from jwt import PyJWKClient

from .config import get_settings
from .errors import UnauthorizedError

_ALGORITHMS = ["RS256", "ES256"]
_AUDIENCE = "authenticated"
_LEEWAY_SECONDS = 30
_JWKS_CACHE_LIFESPAN_SECONDS = 600


@dataclass(frozen=True)
class AuthenticatedUser:
    """The Supabase user identified by a verified JWT."""

    id: str
    email: str | None


class SupabaseJwtVerifier:
    """Verifies Supabase Auth JWTs against the project's JWKS endpoint."""

    def __init__(self, jwks_url: str, issuer: str) -> None:
        """Create a verifier for tokens issued by `issuer`, keyed by `jwks_url`."""
        self._jwks_client = PyJWKClient(
            jwks_url, cache_keys=True, lifespan=_JWKS_CACHE_LIFESPAN_SECONDS
        )
        self._issuer = issuer

    def verify(self, token: str) -> AuthenticatedUser:
        """Decode and validate `token`, returning the authenticated user.

        Raises:
            UnauthorizedError: the token is missing, malformed, expired, has the
                wrong audience/issuer, or does not carry the `authenticated` role.
        """
        try:
            signing_key = self._jwks_client.get_signing_key_from_jwt(token)
            claims = jwt.decode(
                token,
                signing_key.key,
                algorithms=_ALGORITHMS,
                audience=_AUDIENCE,
                issuer=self._issuer,
                leeway=_LEEWAY_SECONDS,
            )
            if claims.get("role") != "authenticated":
                raise UnauthorizedError()
        except UnauthorizedError:
            raise
        except Exception as exc:  # noqa: BLE001 - any decode/verification failure is 401
            raise UnauthorizedError() from exc
        return AuthenticatedUser(id=claims["sub"], email=claims.get("email"))


@lru_cache
def get_verifier() -> SupabaseJwtVerifier:
    """Return the process-wide singleton Supabase JWT verifier."""
    settings = get_settings()
    base_url = settings.supabase_url.rstrip("/")
    return SupabaseJwtVerifier(
        jwks_url=f"{base_url}/auth/v1/.well-known/jwks.json",
        issuer=f"{base_url}/auth/v1",
    )


def get_current_user(authorization: str | None = Header(default=None)) -> AuthenticatedUser:
    """FastAPI dependency: extract and verify the bearer token from `Authorization`.

    Defined as a synchronous `def` so FastAPI runs it in a threadpool, since
    `PyJWKClient` performs blocking network calls to fetch the JWKS.

    Raises:
        UnauthorizedError: the header is missing or not a `Bearer` token, or the
            token itself fails verification.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise UnauthorizedError()
    token = authorization.removeprefix("Bearer ")
    return get_verifier().verify(token)
