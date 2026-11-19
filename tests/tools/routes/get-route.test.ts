import { describe, it, expect, beforeEach, afterAll, mock } from 'bun:test';
import { setToken, clearToken } from '../../../src/auth/auth.ts';
import { getRoute } from '../../../src/tools/routes/get-route.ts';

const ROUTE_ID = '3546500041732922368';
const RAW_ROUTE = `{"id":${ROUTE_ID},"id_str":"${ROUTE_ID}","name":"Loop","distance":10000,"elevation_gain":200,"estimated_moving_time":1800,"segments":[]}`;

const originalFetch = globalThis.fetch;
let requestedUrl = '';

beforeEach(() => {
  setToken({ accessToken: 't', refreshToken: 'r', expiresAt: Math.floor(Date.now() / 1000) + 3600, athleteId: '1' });
  globalThis.fetch = mock(async (url: string | URL | Request) => {
    requestedUrl = String(url);
    return new Response(RAW_ROUTE, { status: 200 });
  }) as unknown as typeof fetch;
});

afterAll(() => {
  globalThis.fetch = originalFetch;
  clearToken();
});

function callGetRoute(detail: 'summary' | 'full') {
  return getRoute.handler({ routeId: ROUTE_ID, detail }, {} as never);
}

function textOf(result: Awaited<ReturnType<typeof callGetRoute>>): string {
  const first = result.content[0];
  return first && first.type === 'text' ? first.text : '';
}

describe('get_route', () => {
  it('should request the exact 19-digit route id', async () => {
    await callGetRoute('summary');

    expect(requestedUrl).toEndWith(`/routes/${ROUTE_ID}`);
  });

  it('should show the exact id in the summary line', async () => {
    const result = await callGetRoute('summary');

    expect(textOf(result)).toStartWith(`${ROUTE_ID} | Loop`);
  });

  it('should emit the exact id as a string in full JSON', async () => {
    const result = await callGetRoute('full');

    expect(JSON.parse(textOf(result)).id).toBe(ROUTE_ID);
  });
});
