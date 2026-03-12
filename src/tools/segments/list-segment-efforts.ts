import { z } from 'zod';
import { defineTool } from '../types.ts';
import { listSegmentEfforts as fetchSegmentEfforts } from '../../api/segments.ts';
import { formatSegmentEffortLine, capOutput, compactJson } from '../../format.ts';

export const listSegmentEfforts = defineTool({
  name: 'list_segment_efforts',
  description: 'List all efforts on a specific segment.',
  inputSchema: {
    segmentId: z.number().describe('Strava segment ID'),
    startDate: z.string().optional().describe('ISO 8601 start date filter'),
    endDate: z.string().optional().describe('ISO 8601 end date filter'),
    perPage: z.number().optional().describe('Results per page (default 30)'),
    detail: z.enum(['summary', 'full']).default('summary').describe('summary: one-liner per effort (default). full: complete effort data as compact JSON.'),
  },
  async handler({ segmentId, startDate, endDate, perPage, detail }) {
    const result = await fetchSegmentEfforts({ segmentId, startDate, endDate, perPage });
    if (!result.ok) {
      return {
        content: [{ type: 'text' as const, text: `Failed to list efforts: ${result.error}` }],
        isError: true,
      };
    }

    if (detail === 'summary') {
      const lines = result.value.map((e) => formatSegmentEffortLine(e));
      const text = `## Segment Efforts (${result.value.length})\n${lines.join('\n')}`;
      return {
        content: [{ type: 'text' as const, text: capOutput(text) }],
      };
    }

    return {
      content: [{ type: 'text' as const, text: capOutput(compactJson(result.value)) }],
    };
  },
});
