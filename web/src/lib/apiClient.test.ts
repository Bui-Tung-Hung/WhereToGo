import { describe, expect, it, vi } from 'vitest';
import { createApiClient } from './apiClient';
import { ApiError, AuthRequiredError, GoogleReauthRequiredError, NetworkError } from './errors';

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function makeClient(fetchImpl: typeof fetch) {
  return createApiClient({
    baseUrl: 'https://api.test',
    getAccessToken: () => Promise.resolve('fake-access-token'),
    fetchImpl,
  });
}

describe('createApiClient', () => {
  it('ánh xạ 401 sang AuthRequiredError', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse(401, { code: 'unauthorized' }));
    const client = makeClient(fetchImpl);

    await expect(client.getJson('/api/health')).rejects.toBeInstanceOf(AuthRequiredError);
  });

  it('ánh xạ 409 kèm code google_reauth_required sang GoogleReauthRequiredError', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(jsonResponse(409, { code: 'google_reauth_required', message: 'x' }));
    const client = makeClient(fetchImpl);

    await expect(client.postJson('/api/google/access-token')).rejects.toBeInstanceOf(
      GoogleReauthRequiredError,
    );
  });

  it('ánh xạ 409 với code khác sang ApiError thường', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse(409, { code: 'some_conflict' }));
    const client = makeClient(fetchImpl);

    const error = await client.postJson('/api/drive/photo-folder').catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(409);
    expect((error as ApiError).code).toBe('some_conflict');
  });

  it('ánh xạ 500 sang ApiError', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(jsonResponse(500, { code: 'internal_error', message: 'boom' }));
    const client = makeClient(fetchImpl);

    const error = await client.getJson('/api/health').catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(500);
    expect((error as ApiError).code).toBe('internal_error');
  });

  it('ánh xạ lỗi fetch (mất mạng) sang NetworkError', async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
    const client = makeClient(fetchImpl);

    await expect(client.getJson('/api/health')).rejects.toBeInstanceOf(NetworkError);
  });

  it('gắn header Authorization Bearer vào mỗi request', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse(200, { status: 'ok' }));
    const client = makeClient(fetchImpl);

    await client.getJson('/api/health');

    const [, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
    const headers = new Headers(init.headers);
    expect(headers.get('Authorization')).toBe('Bearer fake-access-token');
  });
});
