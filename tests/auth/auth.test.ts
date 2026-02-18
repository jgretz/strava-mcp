import { describe, it, expect, beforeEach, afterEach, mock } from 'bun:test';
import { existsSync, readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { getToken, clearToken, setToken } from '../../src/auth/auth.ts';
import type { AuthToken } from '../../src/types.ts';

const TOKEN_PATH = join(homedir(), '.config', 'strava-mcp', 'auth.json');

function makeToken(overrides: Partial<AuthToken> = {}): AuthToken {
  return {
    accessToken: 'test-access',
    refreshToken: 'test-refresh',
    expiresAt: Math.floor(Date.now() / 1000) + 3600,
    athleteId: 123,
    ...overrides,
  };
}

// save/restore the real token file so tests don't destroy user state
let savedTokenContents: string | null = null;

function backupTokenFile(): void {
  if (existsSync(TOKEN_PATH)) {
    savedTokenContents = readFileSync(TOKEN_PATH, 'utf-8');
    unlinkSync(TOKEN_PATH);
  }
}

function restoreTokenFile(): void {
  if (savedTokenContents) {
    writeFileSync(TOKEN_PATH, savedTokenContents, 'utf-8');
    savedTokenContents = null;
  }
}

describe('getToken', () => {
  const originalFetch = globalThis.fetch;
  const savedId = process.env.STRAVA_CLIENT_ID;
  const savedSecret = process.env.STRAVA_CLIENT_SECRET;

  beforeEach(() => {
    clearToken();
    backupTokenFile();
    delete process.env.STRAVA_CLIENT_ID;
    delete process.env.STRAVA_CLIENT_SECRET;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    restoreTokenFile();
    if (savedId) process.env.STRAVA_CLIENT_ID = savedId;
    else delete process.env.STRAVA_CLIENT_ID;
    if (savedSecret) process.env.STRAVA_CLIENT_SECRET = savedSecret;
    else delete process.env.STRAVA_CLIENT_SECRET;
  });

  it('should return cached token when set and not expired', async () => {
    setToken(makeToken());

    const result = await getToken();

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.accessToken).toBe('test-access');
    }
  });

  it('should return error when no token available and no credentials', async () => {
    const result = await getToken();

    expect(result.ok).toBe(false);
  });

  it('should attempt refresh when cached token is expired', async () => {
    const expired = makeToken({ expiresAt: Math.floor(Date.now() / 1000) - 100 });
    setToken(expired);

    const result = await getToken();

    expect(result.ok).toBe(false);
  });

  it('should refresh expired token when credentials are available', async () => {
    const expired = makeToken({ expiresAt: Math.floor(Date.now() / 1000) - 100 });
    setToken(expired);

    process.env.STRAVA_CLIENT_ID = 'test-id';
    process.env.STRAVA_CLIENT_SECRET = 'test-secret';

    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify({
        access_token: 'refreshed-token',
        refresh_token: 'new-refresh',
        expires_at: Math.floor(Date.now() / 1000) + 7200,
      }), { status: 200 });
    }) as unknown as typeof fetch;

    const result = await getToken();

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.accessToken).toBe('refreshed-token');
    }
  });

  it('should treat token within 60s of expiry as expired', async () => {
    const almostExpired = makeToken({ expiresAt: Math.floor(Date.now() / 1000) + 30 });
    setToken(almostExpired);

    const result = await getToken();

    expect(result.ok).toBe(false);
  });
});
