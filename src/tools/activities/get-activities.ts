import { z } from 'zod';
import { defineTool } from '../types.ts';
import { listActivities } from '../../api/activities.ts';
import { ACTIVITY_TYPE_LABELS } from '../../config.ts';
import { formatDuration, formatDistance } from '../format.ts';

export const getActivities = defineTool({
  name: 'get_activities',
  description:
    'List recent Strava activities with pagination and date filtering.',
  inputSchema: {
    page: z.number().optional().describe('Page number (default 1)'),
    perPage: z.number().optional().describe('Results per page (default 30, max 200)'),
    before: z.number().optional().describe('Unix timestamp — only activities before this time'),
    after: z.number().optional().describe('Unix timestamp — only activities after this time'),
  },
  async handler({ page, perPage, before, after }) {
    const result = await listActivities({ page, perPage, before, after });
    if (!result.ok) {
      return {
        content: [{ type: 'text' as const, text: `Failed to list activities: ${result.error}` }],
        isError: true,
      };
    }

    const activities = result.value;
    if (activities.length === 0) {
      return { content: [{ type: 'text' as const, text: 'No activities found.' }] };
    }

    const text = activities
      .map((a) => {
        const type = ACTIVITY_TYPE_LABELS[a.sport_type] ?? a.sport_type;
        const date = new Date(a.start_date_local).toLocaleDateString();
        return `- ${a.name} (${type}) — ${date} — ${formatDistance(a.distance)}, ${formatDuration(a.moving_time)}, ${a.total_elevation_gain}m elev — ID: ${a.id}`;
      })
      .join('\n');

    return { content: [{ type: 'text' as const, text }] };
  },
});
