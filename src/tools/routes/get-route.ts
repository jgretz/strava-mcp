import { z } from 'zod';
import { defineTool } from '../types.ts';
import { getRoute as fetchRoute } from '../../api/routes.ts';

export const getRoute = defineTool({
  name: 'get_route',
  description: 'Get details about a Strava route.',
  inputSchema: {
    routeId: z.number().describe('Strava route ID'),
  },
  async handler({ routeId }) {
    const result = await fetchRoute(routeId);
    if (!result.ok) {
      return {
        content: [{ type: 'text' as const, text: `Failed to get route: ${result.error}` }],
        isError: true,
      };
    }

    return {
      content: [{ type: 'text' as const, text: JSON.stringify(result.value, null, 2) }],
    };
  },
});
