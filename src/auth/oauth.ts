import { STRAVA_AUTH_URL, STRAVA_TOKEN_URL } from '../config.ts';
import { ok, err, formatError } from '../utils.ts';
import type { Result, AuthToken } from '../types.ts';
import { writeStoredToken } from './store.ts';
import { setToken } from './auth.ts';

const SCOPE = 'read,profile:read_all,activity:read_all,activity:write';

type TokenResponse = {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  athlete: { id: number; firstname: string; lastname: string };
};

export function buildAuthorizeUrl(clientId: string, redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: redirectUri,
    scope: SCOPE,
    approval_prompt: 'auto',
    state,
  });
  return `${STRAVA_AUTH_URL}?${params.toString()}`;
}

// Exchange the OAuth authorization code for tokens and persist them. Called by
// the hosted /oauth/callback route after the user authorizes in the browser.
export async function exchangeCode(
  code: string,
  clientId: string,
  clientSecret: string,
): Promise<Result<{ token: AuthToken; athleteName: string }, string>> {
  try {
    const response = await fetch(STRAVA_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
      }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      return err(`Token exchange failed: HTTP ${response.status} ${text}`);
    }

    const data = (await response.json()) as TokenResponse;
    const token: AuthToken = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: data.expires_at,
      athleteId: data.athlete.id,
    };

    setToken(token);
    const storeResult = await writeStoredToken(token);
    if (!storeResult.ok) {
      console.warn(`Warning: ${storeResult.error}`);
    }

    return ok({ token, athleteName: `${data.athlete.firstname} ${data.athlete.lastname}` });
  } catch (e) {
    return err(formatError('Token exchange failed', e));
  }
}
