"""Application error types and FastAPI exception handlers."""

from __future__ import annotations

import logging
import traceback

from fastapi import Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

logger = logging.getLogger(__name__)


class AppError(Exception):
    """Base class for application errors mapped to an HTTP response.

    Attributes:
        status_code: HTTP status code to return.
        code: Machine-readable error code returned in the response body.
        message: Human-readable message returned in the response body.
    """

    status_code: int = 500
    code: str = "internal_error"
    default_message: str = "Internal server error"

    def __init__(self, message: str | None = None, *, code: str | None = None) -> None:
        if code is not None:
            self.code = code
        self.message = message or self.default_message
        super().__init__(self.message)


class UnauthorizedError(AppError):
    """401 — missing, malformed, or invalid credentials."""

    status_code = 401
    code = "unauthorized"
    default_message = "Unauthorized"


class GoogleReauthRequiredError(AppError):
    """409 — the user must sign in with Google again to relink Drive access."""

    status_code = 409
    code = "google_reauth_required"
    default_message = "Google Drive access needs to be reconnected"


class InvalidRequestError(AppError):
    """400 — the request is malformed in a way the framework didn't already catch."""

    status_code = 400
    code = "invalid_request"
    default_message = "Invalid request"


class UnsupportedLinkError(AppError):
    """422 — the given Google Maps link is not one we can resolve or parse."""

    status_code = 422
    code = "unsupported_link"
    default_message = "Unsupported link"


class NotFoundError(AppError):
    """404 — the requested resource does not exist (yet)."""

    status_code = 404
    code = "not_found"
    default_message = "Not found"


class UpstreamError(AppError):
    """502 — a call to Supabase, Google, or another upstream service failed."""

    status_code = 502
    code = "upstream_error"
    default_message = "Upstream service error"


async def app_error_handler(request: Request, exc: AppError) -> JSONResponse:
    """Render an `AppError` as a `{"code", "message"}` JSON body."""
    return JSONResponse(
        status_code=exc.status_code,
        content={"code": exc.code, "message": exc.message},
    )


async def validation_error_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """Map FastAPI/pydantic request validation failures to the app's 400 shape."""
    return JSONResponse(
        status_code=400,
        content={"code": "invalid_request", "message": "Invalid request"},
    )


async def unhandled_error_handler(request: Request, exc: Exception) -> JSONResponse:
    """Log an unexpected exception with its stack trace and return a generic 500.

    The request body is intentionally never logged.
    """
    logger.error(
        "unhandled_error",
        extra={"path": request.url.path, "exc_info": traceback.format_exc()},
    )
    return JSONResponse(
        status_code=500,
        content={"code": "internal_error", "message": "Internal server error"},
    )
