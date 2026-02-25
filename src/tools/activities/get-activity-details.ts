import { z } from 'zod';
import { defineTool } from '../types.ts';
import { getActivity } from '../../api/activities.ts';
import { mapActivity } from './map-activity.ts';

export const getActivityDetails = defineTool({
  name: 'get_activity_details',
  description:
    'Get details of a Strava activity including gear, description, and all metrics.',
  inputSchema: {
    activityId: z.number().describe('Strava activity ID'),
    detail: z.enum(['basic', 'splits', 'full']).optional().describe('Level of detail: "basic" returns key fields, "splits" returns key fields + splits/laps, "full" (default) returns all fields'),
  },
  async handler({ activityId, detail }) {
    const result = await getActivity(activityId);
    if (!result.ok) {
      return {
        content: [{ type: 'text' as const, text: `Failed to get activity: ${result.error}` }],
        isError: true,
      };
    }

    const level = detail ?? 'full';
    const activity = mapActivity(result.value, level);

    return {
      content: [{ type: 'text' as const, text: JSON.stringify(activity, null, 2) }],
    };
  },
});
