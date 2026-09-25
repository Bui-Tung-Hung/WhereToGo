"""Vercel entrypoint: exposes `app`, which the Python runtime auto-detects."""

from __future__ import annotations

from wheretogo_api.main import create_app

app = create_app()
