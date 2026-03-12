import { z } from 'zod';
import { defineTool } from '../types.ts';
import { getSegmentEffort as fetchSegmentEffort } from '../../api/segments.ts';
import { formatSegmentEffortLine, capOutput, compactJson } from '../../format.ts';

export const getSegmentEffort = defineTool({
  name: 'get_segment_effort',
  description: 'Get details about a specific segment effort.',
  inputSchema: {
    effortId: z.number().describe('Segment effort ID'),
    detail: z.enum(['summary', 'full']).default('summary').describe('summary: one-liner (default). full: complete effort data as compact JSON.'),
  },
  async handler({ effortId, detail }) {
    const result = await fetchSegmentEffort(effortId);
    if (!result.ok) {
      return {
        content: [{ type: 'text' as const, text: `Failed to get segment effort: ${result.error}` }],
        isError: true,
      };
    }

    if (detail === 'summary') {
      const text = formatSegmentEffortLine(result.value);
      return {
        content: [{ type: 'text' as const, text: capOutput(text) }],
      };
    }

    return {
      content: [{ type: 'text' as const, text: capOutput(compactJson(result.value)) }],
    };
  },
});
