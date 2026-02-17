import { z } from 'zod';
import { defineTool } from '../types.ts';
import { getRoute as fetchRoute } from '../../api/routes.ts';

export const getRoute = defineTool({
  name: 'get_route',
  description: 'Get details about a Strava route.',
  inputSchema: {
    routeId: z.number().describe('Strava route ID'),
  },
  async handler({ routeId }) {
    const result = await fetchRoute(routeId);
    if (!result.ok) {
      return {
        content: [{ type: 'text' as const, text: `Failed to get route: ${result.error}` }],
        isError: true,
      };
    }

    const r = result.value;
    const lines = [
      `# ${r.name}`,
      r.description ? `Description: ${r.description}` : null,
      `Distance: ${(r.distance / 1000).toFixed(2)} km`,
      `Elevation Gain: ${r.elevation_gain.toFixed(0)}m`,
      `Estimated Moving Time: ${Math.floor(r.estimated_moving_time / 3600)}h ${Math.floor((r.estimated_moving_time % 3600) / 60)}m`,
      `Type: ${r.type === 1 ? 'Ride' : r.type === 2 ? 'Run' : String(r.type)}`,
      `Private: ${r.private}`,
      `Starred: ${r.starred}`,
      `Created: ${new Date(r.created_at).toLocaleDateString()}`,
      `ID: ${r.id}`,
    ];

    if (r.segments.length > 0) {
      lines.push('', `## Segments (${r.segments.length})`);
      for (const s of r.segments) {
        lines.push(`- ${s.name} — ${(s.distance / 1000).toFixed(2)} km, ${s.average_grade}% avg grade`);
      }
    }

    const text = lines.filter((l) => l !== null).join('\n');
    return { content: [{ type: 'text' as const, text }] };
  },
});
