import { z } from 'zod';
import { defineTool } from '../types.ts';
import { listSegmentEfforts as fetchSegmentEfforts } from '../../api/segments.ts';

export const listSegmentEfforts = defineTool({
  name: 'list_segment_efforts',
  description: 'List all efforts on a specific segment.',
  inputSchema: {
    segmentId: z.number().describe('Strava segment ID'),
    startDate: z.string().optional().describe('ISO 8601 start date filter'),
    endDate: z.string().optional().describe('ISO 8601 end date filter'),
    perPage: z.number().optional().describe('Results per page (default 30)'),
  },
  async handler({ segmentId, startDate, endDate, perPage }) {
    const result = await fetchSegmentEfforts({ segmentId, startDate, endDate, perPage });
    if (!result.ok) {
      return {
        content: [{ type: 'text' as const, text: `Failed to list efforts: ${result.error}` }],
        isError: true,
      };
    }

    return {
      content: [{ type: 'text' as const, text: JSON.stringify(result.value, null, 2) }],
    };
  },
});
