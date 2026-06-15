import { eq } from 'drizzle-orm';
import { ok, err, formatError } from '../utils.ts';
import type { Result, AuthToken } from '../types.ts';
import { getDb } from '../db/index.ts';
import { stravaTokens, stravaOauthStates } from '../db/schema.ts';

const TOKEN_ID = 'default';

export async function readStoredToken(): Promise<Result<AuthToken, string>> {
  try {
    const rows = await getDb()
      .select()
      .from(stravaTokens)
      .where(eq(stravaTokens.id, TOKEN_ID))
      .limit(1);

    const row = rows[0];
    if (!row) return err('No stored token found');
    if (!row.token.accessToken || !row.token.refreshToken) {
      return err('Stored token is malformed');
    }
    return ok(row.token);
  } catch (e) {
    return err(formatError('Failed to read stored token', e));
  }
}

export async function writeStoredToken(token: AuthToken): Promise<Result<void, string>> {
  try {
    await getDb()
      .insert(stravaTokens)
      .values({ id: TOKEN_ID, token })
      .onConflictDoUpdate({
        target: stravaTokens.id,
        set: { token, updatedAt: new Date() },
      });
    return ok(undefined);
  } catch (e) {
    return err(formatError('Failed to write token', e));
  }
}

export async function clearStoredToken(): Promise<void> {
  try {
    await getDb().delete(stravaTokens).where(eq(stravaTokens.id, TOKEN_ID));
  } catch (e) {
    console.warn('Failed to clear stored token:', e);
  }
}

export function readClientCredentials(): Result<{ clientId: string; clientSecret: string }, string> {
  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return err('STRAVA_CLIENT_ID and STRAVA_CLIENT_SECRET env vars are required');
  }

  return ok({ clientId, clientSecret });
}

// OAuth CSRF state — persisted so the authorize request and the callback may
// be served by different machines.
export async function createOauthState(state: string): Promise<Result<void, string>> {
  try {
    await getDb().insert(stravaOauthStates).values({ state });
    return ok(undefined);
  } catch (e) {
    return err(formatError('Failed to store OAuth state', e));
  }
}

export async function consumeOauthState(state: string): Promise<Result<void, string>> {
  try {
    const deleted = await getDb()
      .delete(stravaOauthStates)
      .where(eq(stravaOauthStates.state, state))
      .returning();
    if (deleted.length === 0) return err('Invalid or expired OAuth state');
    return ok(undefined);
  } catch (e) {
    return err(formatError('Failed to validate OAuth state', e));
  }
}
