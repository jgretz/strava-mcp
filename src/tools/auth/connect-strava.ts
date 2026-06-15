import { defineTool } from '../types.ts';
import { buildAuthorizeUrl } from '../../auth/oauth.ts';
import { readClientCredentials, createOauthState } from '../../auth/store.ts';

function errorResult(message: string) {
  return {
    content: [{ type: 'text' as const, text: message }],
    isError: true,
  };
}

export const connectStrava = defineTool({
  name: 'connect_strava',
  description:
    'Authenticate with Strava via OAuth. Returns a URL to open in your browser; after you authorize, the hosted server stores the token. Required before using other Strava tools.',
  inputSchema: {},
  async handler() {
    const creds = readClientCredentials();
    if (!creds.ok) return errorResult(creds.error);

    const redirectUri = process.env.STRAVA_REDIRECT_URI;
    if (!redirectUri) {
      return errorResult('STRAVA_REDIRECT_URI env var is not set on the server.');
    }

    const state = crypto.randomUUID();
    const saved = await createOauthState(state);
    if (!saved.ok) return errorResult(saved.error);

    const url = buildAuthorizeUrl(creds.value.clientId, redirectUri, state);
    return {
      content: [
        {
          type: 'text' as const,
          text: `Open this URL in your browser to authorize Strava, then return here:\n\n${url}`,
        },
      ],
    };
  },
});
