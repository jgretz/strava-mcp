import { z } from 'zod';
import { defineTool } from '../types.ts';
import { getSegment as fetchSegment } from '../../api/segments.ts';

export const getSegment = defineTool({
  name: 'get_segment',
  description: 'Get detailed information about a Strava segment.',
  inputSchema: {
    segmentId: z.number().describe('Strava segment ID'),
  },
  async handler({ segmentId }) {
    const result = await fetchSegment(segmentId);
    if (!result.ok) {
      return {
        content: [{ type: 'text' as const, text: `Failed to get segment: ${result.error}` }],
        isError: true,
      };
    }

    return {
      content: [{ type: 'text' as const, text: JSON.stringify(result.value, null, 2) }],
    };
  },
});
