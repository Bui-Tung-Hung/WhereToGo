"""Structured single-line JSON logging setup for the WhereToGo API."""

from __future__ import annotations

import json
import logging
import re
import sys
from datetime import datetime, timezone
from typing import Any

_REDACTED = "***"
_SENSITIVE_KEY_PATTERN = re.compile(r"token|secret|authorization|key", re.IGNORECASE)

# Attributes every standard `logging.LogRecord` already carries; anything else set via
# `logger.info(..., extra={...})` is user-supplied structured data included verbatim.
_STANDARD_RECORD_ATTRS = frozenset(logging.LogRecord("", 0, "", 0, "", None, None).__dict__) | {
    "message",
    "asctime",
}


class _JsonFormatter(logging.Formatter):
    """Formats each log record as a single-line JSON object."""

    def format(self, record: logging.LogRecord) -> str:
        """Render `record` as one line of JSON with sensitive fields redacted."""
        payload: dict[str, Any] = {
            "ts": datetime.fromtimestamp(record.created, tz=timezone.utc).isoformat(),
            "level": record.levelname,
            "event": record.getMessage(),
            "request_id": getattr(record, "request_id", None),
        }
        for key, value in record.__dict__.items():
            if key not in _STANDARD_RECORD_ATTRS and key != "request_id":
                payload[key] = value
        if record.exc_info:
            payload["exc_info"] = self.formatException(record.exc_info)
        return json.dumps(_redact(payload), ensure_ascii=False, default=str)


def _redact(payload: dict[str, Any]) -> dict[str, Any]:
    """Replace the value of any key that looks sensitive (token/secret/authorization/key)."""
    return {
        key: (_REDACTED if _SENSITIVE_KEY_PATTERN.search(key) else value)
        for key, value in payload.items()
    }


def configure_logging(level: str = "INFO") -> None:
    """Configure the root logger to emit single-line JSON records to stdout.

    Args:
        level: Logging level name, e.g. "INFO" or "DEBUG".
    """
    handler = logging.StreamHandler(stream=sys.stdout)
    handler.setFormatter(_JsonFormatter())
    root = logging.getLogger()
    root.handlers = [handler]
    root.setLevel(level)
