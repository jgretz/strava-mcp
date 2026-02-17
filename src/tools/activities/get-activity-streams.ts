import { z } from 'zod';
import { defineTool } from '../types.ts';
import { getActivityStreams as fetchActivityStreams } from '../../api/activities.ts';
import { STREAM_KEYS } from '../../config.ts';

export const getActivityStreams = defineTool({
  name: 'get_activity_streams',
  description:
    'Get time-series stream data for a Strava activity (heart rate, power, cadence, altitude, etc).',
  inputSchema: {
    activityId: z.number().describe('Strava activity ID'),
    keys: z
      .array(z.string())
      .optional()
      .describe(`Stream types to fetch. Options: ${STREAM_KEYS.join(', ')}. Default: all.`),
  },
  async handler({ activityId, keys }) {
    const streamKeys = keys && keys.length > 0 ? keys : [...STREAM_KEYS];
    const result = await fetchActivityStreams(activityId, streamKeys);
    if (!result.ok) {
      return {
        content: [{ type: 'text' as const, text: `Failed to get streams: ${result.error}` }],
        isError: true,
      };
    }

    return {
      content: [{ type: 'text' as const, text: JSON.stringify(result.value, null, 2) }],
    };
  },
});
