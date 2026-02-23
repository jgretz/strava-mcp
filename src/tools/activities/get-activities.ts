import { z } from 'zod';
import { defineTool } from '../types.ts';
import { listActivities } from '../../api/activities.ts';
import type { Activity, ActivitySummary } from '../../types.ts';

const SUMMARY_KEYS: (keyof ActivitySummary)[] = [
  'id', 'name', 'sport_type', 'start_date_local', 'distance',
  'moving_time', 'elapsed_time', 'average_heartrate', 'max_heartrate',
  'average_speed', 'total_elevation_gain', 'description', 'gear_id',
  'suffer_score',
];

function toSummary(activity: Activity): ActivitySummary {
  return Object.fromEntries(
    SUMMARY_KEYS.map((k) => [k, activity[k]]),
  ) as ActivitySummary;
}

export const getActivities = defineTool({
  name: 'get_activities',
  description:
    'List recent Strava activities with pagination and date filtering.',
  inputSchema: {
    page: z.number().optional().describe('Page number (default 1)'),
    perPage: z.number().optional().describe('Results per page (default 30, max 200)'),
    before: z.number().optional().describe('Unix timestamp — only activities before this time'),
    after: z.number().optional().describe('Unix timestamp — only activities after this time'),
    detail: z.enum(['basic', 'full']).optional().describe('Level of detail: "basic" (default) returns key fields, "full" returns all fields'),
  },
  async handler({ page, perPage, before, after, detail }) {
    const result = await listActivities({ page, perPage, before, after });
    if (!result.ok) {
      return {
        content: [{ type: 'text' as const, text: `Failed to list activities: ${result.error}` }],
        isError: true,
      };
    }

    const activities = detail === 'full'
      ? result.value
      : result.value.map(toSummary);

    return {
      content: [{ type: 'text' as const, text: JSON.stringify(activities, null, 2) }],
    };
  },
});
