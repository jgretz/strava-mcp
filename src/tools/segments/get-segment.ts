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

    const s = result.value;
    const lines = [
      `# ${s.name}`,
      `Type: ${s.activity_type}`,
      `Distance: ${(s.distance / 1000).toFixed(2)} km`,
      `Average Grade: ${s.average_grade}%`,
      `Maximum Grade: ${s.maximum_grade}%`,
      `Elevation High: ${s.elevation_high}m`,
      `Elevation Low: ${s.elevation_low}m`,
      `Total Elevation Gain: ${s.total_elevation_gain}m`,
      `Climb Category: ${s.climb_category}`,
      `Location: ${[s.city, s.state, s.country].filter(Boolean).join(', ') || 'unknown'}`,
      `Hazardous: ${s.hazardous}`,
      `Starred: ${s.starred}`,
      `Athletes: ${s.athlete_count}, Efforts: ${s.effort_count}, Stars: ${s.star_count}`,
    ];

    if (s.athlete_segment_stats) {
      const stats = s.athlete_segment_stats;
      lines.push('', '## Your Stats');
      lines.push(`Efforts: ${stats.effort_count}`);
      if (stats.pr_elapsed_time) {
        const m = Math.floor(stats.pr_elapsed_time / 60);
        const sec = stats.pr_elapsed_time % 60;
        lines.push(`PR: ${m}m ${sec}s (${stats.pr_date ?? 'unknown date'})`);
      }
    }

    return { content: [{ type: 'text' as const, text: lines.join('\n') }] };
  },
});
