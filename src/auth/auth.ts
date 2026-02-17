import { STRAVA_TOKEN_URL } from '../config.ts';
import { ok, err, formatError } from '../utils.ts';
import type { Result, AuthToken } from '../types.ts';
import { readStoredToken, writeStoredToken, readClientCredentials } from './store.ts';

type RefreshResponse = {
  access_token: string;
  refresh_token: string;
  expires_at: number;
};

let cachedToken: AuthToken | null = null;

function isExpired(token: AuthToken): boolean {
  // expired if within 60s of expiry
  return token.expiresAt <= Math.floor(Date.now() / 1000) + 60;
}

export async function refreshAccessToken(token: AuthToken): Promise<Result<AuthToken, string>> {
  const creds = readClientCredentials();
  if (!creds.ok) return creds;

  const { clientId, clientSecret } = creds.value;

  try {
    const response = await fetch(STRAVA_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: token.refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      return err(`Token refresh failed: HTTP ${response.status} ${text}`);
    }

    const data = (await response.json()) as RefreshResponse;
    const refreshed: AuthToken = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: data.expires_at,
      athleteId: token.athleteId,
    };

    cachedToken = refreshed;
    const storeResult = writeStoredToken(refreshed);
    if (!storeResult.ok) {
      console.warn(`Warning: ${storeResult.error}`);
    }

    return ok(refreshed);
  } catch (e) {
    return err(formatError('Token refresh request failed', e));
  }
}

export async function getToken(): Promise<Result<AuthToken, string>> {
  // 1. cached token
  if (cachedToken) {
    if (!isExpired(cachedToken)) return ok(cachedToken);
    const refreshed = await refreshAccessToken(cachedToken);
    if (refreshed.ok) return refreshed;
  }

  // 2. stored token
  const stored = readStoredToken();
  if (stored.ok) {
    if (!isExpired(stored.value)) {
      cachedToken = stored.value;
      return stored;
    }
    const refreshed = await refreshAccessToken(stored.value);
    if (refreshed.ok) return refreshed;
  }

  // 3. no token — user must run connect_strava
  return err('Not authenticated. Use the connect_strava tool to authenticate with Strava.');
}

export function setToken(token: AuthToken): void {
  cachedToken = token;
}

export function clearToken(): void {
  cachedToken = null;
}
