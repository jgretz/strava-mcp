import { STRAVA_BASE_URL } from '../config.ts';
import { ok, err, formatError } from '../utils.ts';
import type { Result } from '../types.ts';
import { getToken, refreshAccessToken } from '../auth/auth.ts';

type RequestOptions = {
  method: 'GET' | 'POST' | 'PUT';
  path: string;
  params?: Record<string, string>;
  body?: unknown;
};

async function request<T>(opts: RequestOptions, accessToken: string): Promise<Result<T, { message: string; status?: number }>> {
  const url = new URL(`${STRAVA_BASE_URL}${opts.path}`);

  if (opts.params) {
    for (const [key, value] of Object.entries(opts.params)) {
      url.searchParams.set(key, value);
    }
  }

  try {
    const response = await fetch(url.toString(), {
      method: opts.method,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      return err({
        message: `HTTP ${response.status} at ${opts.path}: ${text}`,
        status: response.status,
      });
    }

    const data = (await response.json()) as T;
    return ok(data);
  } catch (e) {
    return err({ message: formatError(`Request failed at ${opts.path}`, e) });
  }
}

function mapResult<T>(result: Result<T, { message: string; status?: number }>): Result<T, string> {
  return result.ok ? result : err(result.error.message);
}

export async function stravaRequest<T>(opts: RequestOptions): Promise<Result<T, string>> {
  const tokenResult = await getToken();
  if (!tokenResult.ok) return tokenResult;

  const result = await request<T>(opts, tokenResult.value.accessToken);

  // retry once on 401
  if (!result.ok && result.error.status === 401) {
    const refreshed = await refreshAccessToken(tokenResult.value);
    if (!refreshed.ok) return refreshed;
    return mapResult(await request<T>(opts, refreshed.value.accessToken));
  }

  return mapResult(result);
}

export async function stravaGet<T>(path: string, params?: Record<string, string>): Promise<Result<T, string>> {
  return stravaRequest<T>({ method: 'GET', path, params });
}

export async function stravaPut<T>(path: string, body: unknown): Promise<Result<T, string>> {
  return stravaRequest<T>({ method: 'PUT', path, body });
}

// raw text response (for GPX/TCX exports) with 401 retry
export async function stravaGetText(path: string): Promise<Result<string, string>> {
  const tokenResult = await getToken();
  if (!tokenResult.ok) return tokenResult;

  async function fetchText(accessToken: string): Promise<Result<string, { message: string; status?: number }>> {
    try {
      const response = await fetch(`${STRAVA_BASE_URL}${path}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        return err({ message: `HTTP ${response.status} at ${path}: ${text}`, status: response.status });
      }

      return ok(await response.text());
    } catch (e) {
      return err({ message: formatError(`Request failed at ${path}`, e) });
    }
  }

  const result = await fetchText(tokenResult.value.accessToken);

  if (!result.ok && result.error.status === 401) {
    const refreshed = await refreshAccessToken(tokenResult.value);
    if (!refreshed.ok) return refreshed;
    const retry = await fetchText(refreshed.value.accessToken);
    return retry.ok ? retry : err(retry.error.message);
  }

  return result.ok ? result : err(result.error.message);
}
