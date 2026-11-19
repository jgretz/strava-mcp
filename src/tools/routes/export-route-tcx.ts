import { z } from 'zod';
import { defineTool } from '../types.ts';
import { stravaIdSchema } from '../strava-id.ts';
import { exportRouteTcx as fetchRouteTcx } from '../../api/routes.ts';

export const exportRouteTcx = defineTool({
  name: 'export_route_tcx',
  description: 'Export a Strava route as TCX XML.',
  inputSchema: {
    routeId: stravaIdSchema('route'),
  },
  async handler({ routeId }) {
    const result = await fetchRouteTcx(routeId);
    if (!result.ok) {
      return {
        content: [{ type: 'text' as const, text: `Failed to export TCX: ${result.error}` }],
        isError: true,
      };
    }

    return { content: [{ type: 'text' as const, text: result.value }] };
  },
});
