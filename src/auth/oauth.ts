import { STRAVA_AUTH_URL, STRAVA_TOKEN_URL } from '../config.ts';
import { ok, err, formatError } from '../utils.ts';
import type { Result, AuthToken } from '../types.ts';
import { readClientCredentials, writeStoredToken } from './store.ts';

type TokenResponse = {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  athlete: { id: number; firstname: string; lastname: string };
};

export async function authorize(): Promise<Result<{ token: AuthToken; athleteName: string }, string>> {
  const creds = readClientCredentials();
  if (!creds.ok) return creds;

  const { clientId, clientSecret } = creds.value;

  return new Promise((resolve) => {
    const server = Bun.serve({
      port: 0,
      async fetch(req) {
        const url = new URL(req.url);
        if (url.pathname !== '/callback') {
          return new Response('Not found', { status: 404 });
        }

        const code = url.searchParams.get('code');
        if (!code) {
          resolve(err('No authorization code received'));
          server.stop();
          return new Response('Error: no code received. Close this window.');
        }

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
            resolve(err(`Token exchange failed: HTTP ${response.status} ${text}`));
            server.stop();
            return new Response('Authentication failed. Close this window.');
          }

          const data = (await response.json()) as TokenResponse;
          const token: AuthToken = {
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            expiresAt: data.expires_at,
            athleteId: data.athlete.id,
          };

          const storeResult = writeStoredToken(token);
          if (!storeResult.ok) {
            console.warn(`Warning: ${storeResult.error}`);
          }

          const athleteName = `${data.athlete.firstname} ${data.athlete.lastname}`;
          resolve(ok({ token, athleteName }));
          server.stop();
          return new Response('Authenticated with Strava! You can close this window.');
        } catch (e) {
          resolve(err(formatError('Token exchange failed', e)));
          server.stop();
          return new Response('Authentication failed. Close this window.');
        }
      },
    });

    const redirectUri = `http://localhost:${server.port}/callback`;
    const authUrl = `${STRAVA_AUTH_URL}?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=read,profile:read_all,activity:read_all&approval_prompt=auto`;

    // open browser
    Bun.$`open ${authUrl}`.catch(() => {
      console.error(`Open this URL to authenticate:\n${authUrl}`);
    });
  });
}
