import { z } from 'zod';
import { defineTool } from '../types.ts';
import { getActivity } from '../../api/activities.ts';

export const getActivityDetails = defineTool({
  name: 'get_activity_details',
  description:
    'Get full details of a Strava activity including gear, description, and all metrics.',
  inputSchema: {
    activityId: z.number().describe('Strava activity ID'),
  },
  async handler({ activityId }) {
    const result = await getActivity(activityId);
    if (!result.ok) {
      return {
        content: [{ type: 'text' as const, text: `Failed to get activity: ${result.error}` }],
        isError: true,
      };
    }

    return {
      content: [{ type: 'text' as const, text: JSON.stringify(result.value, null, 2) }],
    };
  },
});
