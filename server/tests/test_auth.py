"""Tests for `wheretogo_api.auth` (Supabase JWT verification)."""

from __future__ import annotations

from typing import Protocol

import pytest

from wheretogo_api.auth import SupabaseJwtVerifier, get_current_user
from wheretogo_api.errors import UnauthorizedError

_ISSUER = "https://test-project.supabase.co/auth/v1"
_AUDIENCE = "authenticated"


class _TokenFactory(Protocol):
    """Shape of the `make_token` fixture, for type hints only."""

    def __call__(self, **overrides: object) -> str: ...


@pytest.fixture
def verifier() -> SupabaseJwtVerifier:
    """A verifier using the fake JWKS URL; `_patch_jwks_fetch` intercepts the actual fetch."""
    return SupabaseJwtVerifier(jwks_url=f"{_ISSUER}/.well-known/jwks.json", issuer=_ISSUER)


def test_valid_token_is_accepted(verifier: SupabaseJwtVerifier, make_token: _TokenFactory) -> None:
    token = make_token(issuer=_ISSUER, audience=_AUDIENCE)

    user = verifier.verify(token)

    assert user.id == "11111111-1111-1111-1111-111111111111"
    assert user.email == "user@example.com"


def test_wrong_audience_is_rejected(
    verifier: SupabaseJwtVerifier, make_token: _TokenFactory
) -> None:
    token = make_token(issuer=_ISSUER, audience="some-other-audience")

    with pytest.raises(UnauthorizedError):
        verifier.verify(token)


def test_expired_token_is_rejected(
    verifier: SupabaseJwtVerifier, make_token: _TokenFactory
) -> None:
    token = make_token(issuer=_ISSUER, audience=_AUDIENCE, expires_in=-3600, issued_at_offset=-7200)

    with pytest.raises(UnauthorizedError):
        verifier.verify(token)


def test_wrong_issuer_is_rejected(verifier: SupabaseJwtVerifier, make_token: _TokenFactory) -> None:
    token = make_token(issuer="https://someone-else.supabase.co/auth/v1", audience=_AUDIENCE)

    with pytest.raises(UnauthorizedError):
        verifier.verify(token)


def test_non_authenticated_role_is_rejected(
    verifier: SupabaseJwtVerifier, make_token: _TokenFactory
) -> None:
    token = make_token(issuer=_ISSUER, audience=_AUDIENCE, role="anon")

    with pytest.raises(UnauthorizedError):
        verifier.verify(token)


def test_missing_authorization_header_is_rejected() -> None:
    with pytest.raises(UnauthorizedError):
        get_current_user(authorization=None)


def test_non_bearer_authorization_header_is_rejected() -> None:
    with pytest.raises(UnauthorizedError):
        get_current_user(authorization="Basic dXNlcjpwYXNz")
