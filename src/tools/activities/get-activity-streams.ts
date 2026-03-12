import { z } from 'zod';
import { defineTool } from '../types.ts';
import { getActivityStreams as fetchActivityStreams } from '../../api/activities.ts';
import { STREAM_KEYS } from '../../config.ts';
import { formatStreamSummary, capOutput, compactJson } from '../../format.ts';

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
    detail: z.enum(['summary', 'raw']).default('summary').describe('summary: statistical aggregates (default). raw: full stream arrays as compact JSON.'),
  },
  async handler({ activityId, keys, detail }) {
    const streamKeys = keys && keys.length > 0 ? keys : [...STREAM_KEYS];
    const result = await fetchActivityStreams(activityId, streamKeys);
    if (!result.ok) {
      return {
        content: [{ type: 'text' as const, text: `Failed to get streams: ${result.error}` }],
        isError: true,
      };
    }

    if (detail === 'summary') {
      const text = formatStreamSummary(result.value);
      return {
        content: [{ type: 'text' as const, text: capOutput(text) }],
      };
    }

    return {
      content: [{ type: 'text' as const, text: capOutput(compactJson(result.value)) }],
    };
  },
});
