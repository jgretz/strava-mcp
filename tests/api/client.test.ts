import { describe, it, expect, beforeEach, afterEach, mock } from 'bun:test';
import { setToken, clearToken } from '../../src/auth/auth.ts';
import { stravaGet, stravaGetText } from '../../src/api/client.ts';
import type { AuthToken } from '../../src/types.ts';

const validToken: AuthToken = {
  accessToken: 'test-token',
  refreshToken: 'test-refresh',
  expiresAt: Math.floor(Date.now() / 1000) + 3600,
  athleteId: 123,
};

const originalFetch = globalThis.fetch;
const savedId = process.env.STRAVA_CLIENT_ID;
const savedSecret = process.env.STRAVA_CLIENT_SECRET;

describe('stravaGet', () => {
  beforeEach(() => {
    clearToken();
    delete process.env.STRAVA_CLIENT_ID;
    delete process.env.STRAVA_CLIENT_SECRET;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    if (savedId) process.env.STRAVA_CLIENT_ID = savedId;
    else delete process.env.STRAVA_CLIENT_ID;
    if (savedSecret) process.env.STRAVA_CLIENT_SECRET = savedSecret;
    else delete process.env.STRAVA_CLIENT_SECRET;
  });

  it('should return error when not authenticated', async () => {
    const result = await stravaGet('/athlete');

    expect(result.ok).toBe(false);
  });

  it('should include Bearer token in request', async () => {
    setToken(validToken);
    let capturedHeaders: Record<string, string> = {};

    globalThis.fetch = mock(async (_url: string | URL | Request, init?: RequestInit) => {
      capturedHeaders = init?.headers as Record<string, string>;
      return new Response(JSON.stringify({ id: 1 }), { status: 200 });
    }) as typeof fetch;

    await stravaGet('/athlete');

    expect(capturedHeaders.Authorization).toBe('Bearer test-token');
  });

  it('should return error on HTTP failure', async () => {
    setToken(validToken);

    globalThis.fetch = mock(async () => {
      return new Response('Not Found', { status: 404 });
    }) as typeof fetch;

    const result = await stravaGet('/nonexistent');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('404');
    }
  });

  it('should parse successful JSON response', async () => {
    setToken(validToken);

    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify({ id: 42, name: 'Test' }), { status: 200 });
    }) as typeof fetch;

    const result = await stravaGet<{ id: number; name: string }>('/test');

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.id).toBe(42);
      expect(result.value.name).toBe('Test');
    }
  });
});

describe('stravaGetText', () => {
  beforeEach(() => {
    clearToken();
    delete process.env.STRAVA_CLIENT_ID;
    delete process.env.STRAVA_CLIENT_SECRET;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    if (savedId) process.env.STRAVA_CLIENT_ID = savedId;
    else delete process.env.STRAVA_CLIENT_ID;
    if (savedSecret) process.env.STRAVA_CLIENT_SECRET = savedSecret;
    else delete process.env.STRAVA_CLIENT_SECRET;
  });

  it('should return error when not authenticated', async () => {
    const result = await stravaGetText('/routes/1/export_gpx');

    expect(result.ok).toBe(false);
  });

  it('should return raw text response', async () => {
    setToken(validToken);

    globalThis.fetch = mock(async () => {
      return new Response('<gpx>data</gpx>', { status: 200 });
    }) as typeof fetch;

    const result = await stravaGetText('/routes/1/export_gpx');

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe('<gpx>data</gpx>');
    }
  });

  it('should return error on HTTP failure', async () => {
    setToken(validToken);

    globalThis.fetch = mock(async () => {
      return new Response('Forbidden', { status: 403 });
    }) as typeof fetch;

    const result = await stravaGetText('/routes/1/export_gpx');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('403');
    }
  });
});
