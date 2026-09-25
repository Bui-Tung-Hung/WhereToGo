"""Symmetric encryption for Google refresh tokens at rest."""

from __future__ import annotations

from cryptography.fernet import Fernet, InvalidToken

from .errors import GoogleReauthRequiredError


class TokenCipher:
    """Wraps `cryptography.fernet.Fernet` to encrypt/decrypt Google refresh tokens."""

    def __init__(self, key: str) -> None:
        """Create a cipher bound to a base64-encoded Fernet `key`."""
        self._fernet = Fernet(key)

    def encrypt(self, plaintext: str) -> str:
        """Encrypt `plaintext`, returning a URL-safe base64 ciphertext string."""
        return self._fernet.encrypt(plaintext.encode("utf-8")).decode("utf-8")

    def decrypt(self, ciphertext: str) -> str:
        """Decrypt `ciphertext` previously produced by `encrypt`.

        Raises:
            GoogleReauthRequiredError: `ciphertext` is malformed or was encrypted with
                a different key, so the stored refresh token can no longer be trusted.
        """
        try:
            return self._fernet.decrypt(ciphertext.encode("utf-8")).decode("utf-8")
        except InvalidToken as exc:
            raise GoogleReauthRequiredError() from exc
