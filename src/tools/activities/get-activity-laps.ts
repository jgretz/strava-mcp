import { z } from 'zod';
import { defineTool } from '../types.ts';
import { getActivityLaps as fetchActivityLaps } from '../../api/activities.ts';
import { formatLapLine, capOutput, compactJson } from '../../format.ts';

export const getActivityLaps = defineTool({
  name: 'get_activity_laps',
  description: 'Get lap data for a Strava activity.',
  inputSchema: {
    activityId: z.number().describe('Strava activity ID'),
    detail: z.enum(['summary', 'full']).default('summary').describe('summary: one-liner per lap (default). full: complete lap data as compact JSON.'),
  },
  async handler({ activityId, detail }) {
    const result = await fetchActivityLaps(activityId);
    if (!result.ok) {
      return {
        content: [{ type: 'text' as const, text: `Failed to get laps: ${result.error}` }],
        isError: true,
      };
    }

    if (detail === 'summary') {
      const lines = result.value.map((lap, i) => formatLapLine(lap, i + 1));
      const text = `## Laps (${result.value.length})\n${lines.join('\n')}`;
      return {
        content: [{ type: 'text' as const, text: capOutput(text) }],
      };
    }

    return {
      content: [{ type: 'text' as const, text: capOutput(compactJson(result.value)) }],
    };
  },
});
