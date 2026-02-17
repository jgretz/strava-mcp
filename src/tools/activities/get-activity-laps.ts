import { z } from 'zod';
import { defineTool } from '../types.ts';
import { getActivityLaps as fetchActivityLaps } from '../../api/activities.ts';
import { formatDuration } from '../format.ts';

export const getActivityLaps = defineTool({
  name: 'get_activity_laps',
  description: 'Get lap data for a Strava activity.',
  inputSchema: {
    activityId: z.number().describe('Strava activity ID'),
  },
  async handler({ activityId }) {
    const result = await fetchActivityLaps(activityId);
    if (!result.ok) {
      return {
        content: [{ type: 'text' as const, text: `Failed to get laps: ${result.error}` }],
        isError: true,
      };
    }

    const laps = result.value;
    if (laps.length === 0) {
      return { content: [{ type: 'text' as const, text: 'No lap data available.' }] };
    }

    const lines = [`# Activity ${activityId} Laps`, ''];
    for (const lap of laps) {
      const parts = [
        `Lap ${lap.lap_index}: ${lap.name}`,
        `  Distance: ${(lap.distance / 1000).toFixed(2)} km`,
        `  Moving Time: ${formatDuration(lap.moving_time)}`,
        `  Avg Speed: ${(lap.average_speed * 3.6).toFixed(1)} km/h`,
        `  Max Speed: ${(lap.max_speed * 3.6).toFixed(1)} km/h`,
        `  Elevation Gain: ${lap.total_elevation_gain}m`,
        lap.average_heartrate != null ? `  Avg HR: ${lap.average_heartrate} bpm` : null,
        lap.max_heartrate != null ? `  Max HR: ${lap.max_heartrate} bpm` : null,
        lap.average_cadence != null ? `  Avg Cadence: ${lap.average_cadence}` : null,
        lap.average_watts != null ? `  Avg Watts: ${lap.average_watts}` : null,
      ];
      lines.push(parts.filter((p) => p !== null).join('\n'));
      lines.push('');
    }

    return { content: [{ type: 'text' as const, text: lines.join('\n') }] };
  },
});
