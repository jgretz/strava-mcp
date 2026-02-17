import { describe, it, expect, afterEach } from 'bun:test';
import { readClientCredentials } from '../../src/auth/store.ts';

describe('readClientCredentials', () => {
  const originalId = process.env.STRAVA_CLIENT_ID;
  const originalSecret = process.env.STRAVA_CLIENT_SECRET;

  afterEach(() => {
    if (originalId) process.env.STRAVA_CLIENT_ID = originalId;
    else delete process.env.STRAVA_CLIENT_ID;
    if (originalSecret) process.env.STRAVA_CLIENT_SECRET = originalSecret;
    else delete process.env.STRAVA_CLIENT_SECRET;
  });

  it('should return credentials when both env vars are set', () => {
    process.env.STRAVA_CLIENT_ID = '12345';
    process.env.STRAVA_CLIENT_SECRET = 'secret';

    const result = readClientCredentials();

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.clientId).toBe('12345');
      expect(result.value.clientSecret).toBe('secret');
    }
  });

  it('should return error when STRAVA_CLIENT_ID is missing', () => {
    delete process.env.STRAVA_CLIENT_ID;
    process.env.STRAVA_CLIENT_SECRET = 'secret';

    const result = readClientCredentials();

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('STRAVA_CLIENT_ID');
    }
  });

  it('should return error when STRAVA_CLIENT_SECRET is missing', () => {
    process.env.STRAVA_CLIENT_ID = '12345';
    delete process.env.STRAVA_CLIENT_SECRET;

    const result = readClientCredentials();

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('STRAVA_CLIENT_SECRET');
    }
  });
});
