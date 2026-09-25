"""Test infrastructure: make `wheretogo_jobs` importable regardless of pytest's cwd.

In production the jobs run as `python -m wheretogo_jobs.<module>` with the working
directory set to `jobs/` (equivalent to `PYTHONPATH=.`). Running `pytest -q jobs/tests`
from the repository root does not get that for free, so this conftest puts `jobs/`
on `sys.path` for the duration of the test session. This file is test infrastructure
only; it contains no test logic of its own.
"""

from __future__ import annotations

import sys
from pathlib import Path

import pytest
from cryptography.fernet import Fernet

_JOBS_DIR = Path(__file__).resolve().parent.parent
if str(_JOBS_DIR) not in sys.path:
    sys.path.insert(0, str(_JOBS_DIR))


@pytest.fixture
def fernet_key() -> str:
    """A freshly generated Fernet key for tests that need a valid encryption key."""
    return Fernet.generate_key().decode("utf-8")
