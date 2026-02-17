import { z } from 'zod';
import { defineTool } from '../types.ts';
import { getSegmentEffort as fetchSegmentEffort } from '../../api/segments.ts';
import { formatDuration } from '../format.ts';

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

    const e = result.value;
    const lines = [
      `# ${e.name}`,
      `Date: ${new Date(e.start_date_local).toLocaleString()}`,
      `Elapsed Time: ${formatDuration(e.elapsed_time)}`,
      `Moving Time: ${formatDuration(e.moving_time)}`,
      `Distance: ${(e.distance / 1000).toFixed(2)} km`,
      e.average_heartrate != null ? `Average HR: ${e.average_heartrate} bpm` : null,
      e.max_heartrate != null ? `Max HR: ${e.max_heartrate} bpm` : null,
      e.average_watts != null ? `Average Watts: ${e.average_watts}` : null,
      e.kom_rank != null ? `KOM Rank: #${e.kom_rank}` : null,
      e.pr_rank != null ? `PR Rank: #${e.pr_rank}` : null,
    ];

    if (e.achievements.length > 0) {
      lines.push('', '## Achievements');
      for (const a of e.achievements) {
        lines.push(`- ${a.type} (rank ${a.rank})`);
      }
    }

    const text = lines.filter((l) => l !== null).join('\n');
    return { content: [{ type: 'text' as const, text }] };
  },
});
