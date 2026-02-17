import { z } from 'zod';
import { defineTool } from '../types.ts';
import { getActivityLaps as fetchActivityLaps } from '../../api/activities.ts';

export const getActivityLaps = defineTool({
  name: 'get_activity_laps',
  description: 'Get lap data for a Strava activity.',
  inputSchema: {
    activityId: z.number().describe('Strava activity ID'),
  },
  async handler({ activityId }) {
    const result = await fetchActivityLaps(activityId);
    if (!result.ok) {
      return {
        content: [{ type: 'text' as const, text: `Failed to get laps: ${result.error}` }],
        isError: true,
      };
    }

    return {
      content: [{ type: 'text' as const, text: JSON.stringify(result.value, null, 2) }],
    };
  },
});
