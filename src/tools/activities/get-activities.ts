import { z } from 'zod';
import { defineTool } from '../types.ts';
import { listActivities } from '../../api/activities.ts';

export const getActivities = defineTool({
  name: 'get_activities',
  description:
    'List recent Strava activities with pagination and date filtering.',
  inputSchema: {
    page: z.number().optional().describe('Page number (default 1)'),
    perPage: z.number().optional().describe('Results per page (default 30, max 200)'),
    before: z.number().optional().describe('Unix timestamp — only activities before this time'),
    after: z.number().optional().describe('Unix timestamp — only activities after this time'),
  },
  async handler({ page, perPage, before, after }) {
    const result = await listActivities({ page, perPage, before, after });
    if (!result.ok) {
      return {
        content: [{ type: 'text' as const, text: `Failed to list activities: ${result.error}` }],
        isError: true,
      };
    }

    return {
      content: [{ type: 'text' as const, text: JSON.stringify(result.value, null, 2) }],
    };
  },
});
