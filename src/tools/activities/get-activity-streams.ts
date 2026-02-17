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

    const streams = result.value;
    if (streams.length === 0) {
      return { content: [{ type: 'text' as const, text: 'No stream data available.' }] };
    }

    const lines = [`# Activity ${activityId} Streams`, ''];
    for (const stream of streams) {
      const data = stream.data;
      const nums = data.filter((d): d is number => typeof d === 'number');
      const min = nums.reduce((a, b) => Math.min(a, b), Infinity);
      const max = nums.reduce((a, b) => Math.max(a, b), -Infinity);
      const avg = nums.reduce((sum, v) => sum + v, 0) / nums.length;
      lines.push(`## ${stream.type}`);
      lines.push(`Points: ${data.length}, Min: ${min.toFixed(1)}, Max: ${max.toFixed(1)}, Avg: ${avg.toFixed(1)}`);
      lines.push('');
    }

    return { content: [{ type: 'text' as const, text: lines.join('\n') }] };
  },
});
