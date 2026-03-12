import { z } from 'zod';
import { defineTool } from '../types.ts';
import { listAthleteRoutes as fetchAthleteRoutes } from '../../api/routes.ts';
import { getToken } from '../../auth/auth.ts';
import { formatRouteLine, capOutput, compactJson } from '../../format.ts';

export const listAthleteRoutes = defineTool({
  name: 'list_athlete_routes',
  description: 'List routes created by the authenticated athlete.',
  inputSchema: {
    page: z.number().optional().describe('Page number (default 1)'),
    perPage: z.number().optional().describe('Results per page (default 30)'),
    detail: z.enum(['summary', 'full']).default('summary').describe('summary: one-liner per route (default). full: complete route data as compact JSON.'),
  },
  async handler({ page, perPage, detail }) {
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

    if (detail === 'summary') {
      const lines = result.value.map((r) => formatRouteLine(r));
      const text = `## Routes (${result.value.length})\n${lines.join('\n')}`;
      return {
        content: [{ type: 'text' as const, text: capOutput(text) }],
      };
    }

    return {
      content: [{ type: 'text' as const, text: capOutput(compactJson(result.value)) }],
    };
  },
});
