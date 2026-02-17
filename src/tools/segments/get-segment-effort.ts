import { z } from 'zod';
import { defineTool } from '../types.ts';
import { getSegmentEffort as fetchSegmentEffort } from '../../api/segments.ts';

export const getSegmentEffort = defineTool({
  name: 'get_segment_effort',
  description: 'Get details about a specific segment effort.',
  inputSchema: {
    effortId: z.number().describe('Segment effort ID'),
  },
  async handler({ effortId }) {
    const result = await fetchSegmentEffort(effortId);
    if (!result.ok) {
      return {
        content: [{ type: 'text' as const, text: `Failed to get segment effort: ${result.error}` }],
        isError: true,
      };
    }

    return {
      content: [{ type: 'text' as const, text: JSON.stringify(result.value, null, 2) }],
    };
  },
});
