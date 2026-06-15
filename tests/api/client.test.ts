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
const savedDbUrl = process.env.DATABASE_URL;

// The "not authenticated" state requires no cached token, no client creds, and
// no DB to read a stored token from. (bun test auto-loads .env, which may carry
// real creds — clear them here for deterministic, offline tests.)
function setUnauthedEnv() {
  clearToken();
  delete process.env.STRAVA_CLIENT_ID;
  delete process.env.STRAVA_CLIENT_SECRET;
  delete process.env.DATABASE_URL;
}

function restoreEnv() {
  globalThis.fetch = originalFetch;
  if (savedId) process.env.STRAVA_CLIENT_ID = savedId;
  else delete process.env.STRAVA_CLIENT_ID;
  if (savedSecret) process.env.STRAVA_CLIENT_SECRET = savedSecret;
  else delete process.env.STRAVA_CLIENT_SECRET;
  if (savedDbUrl) process.env.DATABASE_URL = savedDbUrl;
  else delete process.env.DATABASE_URL;
}

describe('stravaGet', () => {
  beforeEach(setUnauthedEnv);
  afterEach(restoreEnv);

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
    }) as unknown as typeof fetch;

    await stravaGet('/athlete');

    expect(capturedHeaders.Authorization).toBe('Bearer test-token');
  });

  it('should return error on HTTP failure', async () => {
    setToken(validToken);

    globalThis.fetch = mock(async () => {
      return new Response('Not Found', { status: 404 });
    }) as unknown as typeof fetch;

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
    }) as unknown as typeof fetch;

    const result = await stravaGet<{ id: number; name: string }>('/test');

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.id).toBe(42);
      expect(result.value.name).toBe('Test');
    }
  });
});

describe('stravaGetText', () => {
  beforeEach(setUnauthedEnv);
  afterEach(restoreEnv);

  it('should return error when not authenticated', async () => {
    const result = await stravaGetText('/routes/1/export_gpx');

    expect(result.ok).toBe(false);
  });

  it('should return raw text response', async () => {
    setToken(validToken);

    globalThis.fetch = mock(async () => {
      return new Response('<gpx>data</gpx>', { status: 200 });
    }) as unknown as typeof fetch;

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
    }) as unknown as typeof fetch;

    const result = await stravaGetText('/routes/1/export_gpx');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('403');
    }
  });
});
