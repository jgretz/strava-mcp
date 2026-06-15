import { Hono } from 'hono';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { createServer } from './server.ts';
import { bearerAuth } from './http/auth.ts';
import { exchangeCode } from './auth/oauth.ts';
import { readClientCredentials, consumeOauthState } from './auth/store.ts';

export const app = new Hono();

function resultPage(message: string): string {
  return `<!doctype html>
<html><head><meta charset="utf-8"><title>Strava MCP</title></head>
<body style="font-family: system-ui; max-width: 40rem; margin: 4rem auto; padding: 0 1rem;">
<h1>Strava MCP</h1>
<p>${message}</p>
</body></html>`;
}

app.get('/ping', (c) => c.json({ alive: true }));

// OAuth callback — Strava redirects the browser here after the user authorizes.
// Intentionally NOT behind the bearer gate (the bearer middleware only covers
// /mcp); it is protected by the single-use, DB-backed `state` parameter.
app.get('/oauth/callback', async (c) => {
  const error = c.req.query('error');
  if (error) return c.html(resultPage(`Strava authorization was denied (${error}).`), 400);

  const code = c.req.query('code');
  const state = c.req.query('state');
  if (!code || !state) return c.html(resultPage('Missing authorization code or state.'), 400);

  const valid = await consumeOauthState(state);
  if (!valid.ok) {
    return c.html(resultPage('Invalid or expired authorization state. Run connect_strava again.'), 400);
  }

  const creds = readClientCredentials();
  if (!creds.ok) return c.html(resultPage(creds.error), 500);

  const result = await exchangeCode(code, creds.value.clientId, creds.value.clientSecret);
  if (!result.ok) return c.html(resultPage(`Token exchange failed: ${result.error}`), 500);

  return c.html(resultPage(`Authenticated with Strava as ${result.value.athleteName}. You can close this window.`));
});

app.use('/mcp', bearerAuth);

// Stateless Streamable HTTP: a fresh server + transport per request.
app.all('/mcp', async (c) => {
  const server = createServer();
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });
  await server.connect(transport);
  return transport.handleRequest(c.req.raw);
});

export default {
  port: Number(process.env.PORT ?? 3000),
  hostname: '0.0.0.0',
  fetch: app.fetch,
};
