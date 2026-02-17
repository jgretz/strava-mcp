import { z } from 'zod';
import { defineTool } from '../types.ts';
import { listSegmentEfforts as fetchSegmentEfforts } from '../../api/segments.ts';
import { formatDuration } from '../format.ts';

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

    const efforts = result.value;
    if (efforts.length === 0) {
      return { content: [{ type: 'text' as const, text: 'No efforts found.' }] };
    }

    const text = efforts
      .map((e) => {
        const date = new Date(e.start_date_local).toLocaleDateString();
        const ranks = [
          e.pr_rank ? `PR #${e.pr_rank}` : null,
          e.kom_rank ? `KOM #${e.kom_rank}` : null,
        ].filter(Boolean).join(', ');
        return `- ${date}: ${formatDuration(e.elapsed_time)}${ranks ? ` (${ranks})` : ''} — ID: ${e.id}`;
      })
      .join('\n');

    return { content: [{ type: 'text' as const, text }] };
  },
});
