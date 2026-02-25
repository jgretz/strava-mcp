import { z } from 'zod';
import { defineTool } from '../types.ts';
import { listActivities } from '../../api/activities.ts';
import { mapActivity } from './map-activity.ts';

export const getActivities = defineTool({
  name: 'get_activities',
  description:
    'List recent Strava activities with pagination and date filtering.',
  inputSchema: {
    page: z.number().optional().describe('Page number (default 1)'),
    perPage: z.number().optional().describe('Results per page (default 30, max 200)'),
    before: z.number().optional().describe('Unix timestamp — only activities before this time'),
    after: z.number().optional().describe('Unix timestamp — only activities after this time'),
    detail: z.enum(['basic', 'splits', 'full']).optional().describe('Level of detail: "basic" (default) returns key fields, "splits" returns key fields + splits/laps, "full" returns all fields'),
  },
  async handler({ page, perPage, before, after, detail }) {
    const result = await listActivities({ page, perPage, before, after });
    if (!result.ok) {
      return {
        content: [{ type: 'text' as const, text: `Failed to list activities: ${result.error}` }],
        isError: true,
      };
    }

    const level = detail ?? 'basic';
    const activities = result.value.map((a) => mapActivity(a, level));

    return {
      content: [{ type: 'text' as const, text: JSON.stringify(activities, null, 2) }],
    };
  },
});
