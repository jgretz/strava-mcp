import { z } from 'zod';
import { defineTool } from '../types.ts';
import { getSegment as fetchSegment } from '../../api/segments.ts';
import { formatSegmentLine, capOutput, compactJson } from '../../format.ts';

export const getSegment = defineTool({
  name: 'get_segment',
  description: 'Get detailed information about a Strava segment.',
  inputSchema: {
    segmentId: z.number().describe('Strava segment ID'),
    detail: z.enum(['summary', 'full']).default('summary').describe('summary: one-liner with PR info (default). full: complete segment data as compact JSON.'),
  },
  async handler({ segmentId, detail }) {
    const result = await fetchSegment(segmentId);
    if (!result.ok) {
      return {
        content: [{ type: 'text' as const, text: `Failed to get segment: ${result.error}` }],
        isError: true,
      };
    }

    if (detail === 'summary') {
      let text = formatSegmentLine(result.value);
      if (result.value.athlete_segment_stats) {
        const stats = result.value.athlete_segment_stats;
        text += `\nPR: ${stats.pr_elapsed_time}s on ${stats.pr_date ?? 'unknown'} | ${result.value.effort_count} efforts`;
      }
      return {
        content: [{ type: 'text' as const, text: capOutput(text) }],
      };
    }

    return {
      content: [{ type: 'text' as const, text: capOutput(compactJson(result.value)) }],
    };
  },
});
