import { defineTool } from '../types.ts';
import { authorize } from '../../auth/oauth.ts';
import { setToken } from '../../auth/auth.ts';

export const connectStrava = defineTool({
  name: 'connect_strava',
  description:
    'Authenticate with Strava via OAuth. Opens a browser window for authorization. Required before using other Strava tools.',
  inputSchema: {},
  async handler() {
    const result = await authorize();
    if (!result.ok) {
      return {
        content: [{ type: 'text' as const, text: `Authentication failed: ${result.error}` }],
        isError: true,
      };
    }

    setToken(result.value.token);

    return {
      content: [{ type: 'text' as const, text: `Authenticated as ${result.value.athleteName}.` }],
    };
  },
});
