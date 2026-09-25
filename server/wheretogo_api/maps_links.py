"""Resolution and host validation of Google Maps short links."""

from __future__ import annotations

import re
from urllib.parse import urljoin, urlparse

import httpx

from .errors import UnsupportedLinkError, UpstreamError

SHORT_LINK_HOSTS = {"maps.app.goo.gl", "goo.gl"}
GOOGLE_MAPS_HOST_PATTERN = re.compile(r"^(www\.|maps\.)?google\.[a-z]{2,3}(\.[a-z]{2,3})?$")

_MAX_REDIRECTS = 5
_USER_AGENT = "Mozilla/5.0 (compatible; WhereToGo/1.0)"


def is_allowed_short_link(url: str) -> bool:
    """Return True if `url` is an https link on a short-link host we are willing to resolve."""
    parsed = urlparse(url)
    if parsed.scheme != "https":
        return False
    host = parsed.hostname or ""
    if host not in SHORT_LINK_HOSTS:
        return False
    if host == "goo.gl" and not parsed.path.startswith("/maps"):
        return False
    return True


def _is_google_maps_host(host: str) -> bool:
    """Return True if `host` is a Google Maps web host (`google.<tld>` family)."""
    return bool(GOOGLE_MAPS_HOST_PATTERN.match(host))


def _is_allowed_destination(url: str) -> bool:
    """Return True if a redirect hop may still be followed (https + known host)."""
    parsed = urlparse(url)
    if parsed.scheme != "https":
        return False
    host = parsed.hostname or ""
    return host in SHORT_LINK_HOSTS or _is_google_maps_host(host)


async def resolve_short_link(http: httpx.AsyncClient, url: str) -> str:
    """Follow up to 5 redirects from a Google Maps short link to its full URL.

    Raises:
        UnsupportedLinkError: a redirect leaves the allow-listed set of hosts.
        UpstreamError: the chain does not end on a Google Maps host within 5 hops,
            or a hop does not respond with a redirect at all.
    """
    current = url
    for _ in range(_MAX_REDIRECTS):
        try:
            response = await http.get(
                current, headers={"User-Agent": _USER_AGENT}, follow_redirects=False
            )
        except httpx.HTTPError as exc:
            raise UpstreamError("Failed to follow Google Maps short link") from exc

        if not (300 <= response.status_code < 400):
            raise UpstreamError("Google Maps short link did not redirect")

        location = response.headers.get("Location")
        if not location:
            raise UpstreamError("Google Maps short link redirect missing Location header")
        current = urljoin(current, location)

        if not _is_allowed_destination(current):
            raise UnsupportedLinkError()

        if _is_google_maps_host(urlparse(current).hostname or ""):
            return current

    raise UpstreamError("Too many redirects while resolving Google Maps short link")
