"""Tests for `wheretogo_api.crypto.TokenCipher`."""

from __future__ import annotations

import pytest
from cryptography.fernet import Fernet

from wheretogo_api.crypto import TokenCipher
from wheretogo_api.errors import GoogleReauthRequiredError


def test_encrypt_then_decrypt_returns_original_value() -> None:
    cipher = TokenCipher(Fernet.generate_key().decode("utf-8"))

    ciphertext = cipher.encrypt("my-refresh-token")

    assert ciphertext != "my-refresh-token"
    assert cipher.decrypt(ciphertext) == "my-refresh-token"


def test_decrypt_broken_ciphertext_raises_google_reauth_required() -> None:
    cipher = TokenCipher(Fernet.generate_key().decode("utf-8"))

    with pytest.raises(GoogleReauthRequiredError):
        cipher.decrypt("not-a-valid-fernet-token")


def test_decrypt_with_wrong_key_raises_google_reauth_required() -> None:
    encrypting_cipher = TokenCipher(Fernet.generate_key().decode("utf-8"))
    decrypting_cipher = TokenCipher(Fernet.generate_key().decode("utf-8"))
    ciphertext = encrypting_cipher.encrypt("my-refresh-token")

    with pytest.raises(GoogleReauthRequiredError):
        decrypting_cipher.decrypt(ciphertext)
