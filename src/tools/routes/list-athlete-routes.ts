import { z } from 'zod';
import { defineTool } from '../types.ts';
import { listAthleteRoutes as fetchAthleteRoutes } from '../../api/routes.ts';
import { getToken } from '../../auth/auth.ts';

export const listAthleteRoutes = defineTool({
  name: 'list_athlete_routes',
  description: 'List routes created by the authenticated athlete.',
  inputSchema: {
    page: z.number().optional().describe('Page number (default 1)'),
    perPage: z.number().optional().describe('Results per page (default 30)'),
  },
  async handler({ page, perPage }) {
    const tokenResult = await getToken();
    if (!tokenResult.ok) {
      return {
        content: [{ type: 'text' as const, text: `Not authenticated: ${tokenResult.error}` }],
        isError: true,
      };
    }

    const result = await fetchAthleteRoutes(tokenResult.value.athleteId, { page, perPage });
    if (!result.ok) {
      return {
        content: [{ type: 'text' as const, text: `Failed to list routes: ${result.error}` }],
        isError: true,
      };
    }

    const routes = result.value;
    if (routes.length === 0) {
      return { content: [{ type: 'text' as const, text: 'No routes found.' }] };
    }

    const text = routes
      .map((r) => {
        const type = r.type === 1 ? 'Ride' : r.type === 2 ? 'Run' : String(r.type);
        return `- ${r.name} (${type}) — ${(r.distance / 1000).toFixed(2)} km, ${r.elevation_gain.toFixed(0)}m elev — ID: ${r.id}`;
      })
      .join('\n');

    return { content: [{ type: 'text' as const, text }] };
  },
});
