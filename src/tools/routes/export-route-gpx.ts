import { z } from 'zod';
import { defineTool } from '../types.ts';
import { exportRouteGpx as fetchRouteGpx } from '../../api/routes.ts';

export const exportRouteGpx = defineTool({
  name: 'export_route_gpx',
  description: 'Export a Strava route as GPX XML.',
  inputSchema: {
    routeId: z.number().describe('Strava route ID'),
  },
  async handler({ routeId }) {
    const result = await fetchRouteGpx(routeId);
    if (!result.ok) {
      return {
        content: [{ type: 'text' as const, text: `Failed to export GPX: ${result.error}` }],
        isError: true,
      };
    }

    return { content: [{ type: 'text' as const, text: result.value }] };
  },
});
