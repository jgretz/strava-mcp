import { z } from 'zod';
import { defineTool } from '../types.ts';
import { getAthleteStats as fetchAthleteStats } from '../../api/athlete.ts';
import type { ActivityTotal } from '../../types.ts';

function formatTotal(label: string, total: ActivityTotal): string {
  if (total.count === 0) return `${label}: no activities`;
  return `${label}: ${total.count} activities, ${(total.distance / 1000).toFixed(0)} km, ${Math.floor(total.moving_time / 3600)}h moving, ${total.elevation_gain.toFixed(0)}m elev`;
}

export const getAthleteStats = defineTool({
  name: 'get_athlete_stats',
  description: 'Get activity statistics for an athlete grouped by sport and time period.',
  inputSchema: {
    athleteId: z.number().describe('Athlete ID (get from get_athlete_profile)'),
  },
  async handler({ athleteId }) {
    const result = await fetchAthleteStats(athleteId);
    if (!result.ok) {
      return {
        content: [{ type: 'text' as const, text: `Failed to get stats: ${result.error}` }],
        isError: true,
      };
    }

    const s = result.value;
    const lines = [
      '# Athlete Stats',
      '',
      '## Recent (4 weeks)',
      formatTotal('Ride', s.recent_ride_totals),
      formatTotal('Run', s.recent_run_totals),
      formatTotal('Swim', s.recent_swim_totals),
      '',
      '## Year to Date',
      formatTotal('Ride', s.ytd_ride_totals),
      formatTotal('Run', s.ytd_run_totals),
      formatTotal('Swim', s.ytd_swim_totals),
      '',
      '## All Time',
      formatTotal('Ride', s.all_ride_totals),
      formatTotal('Run', s.all_run_totals),
      formatTotal('Swim', s.all_swim_totals),
    ];

    if (s.biggest_ride_distance) {
      lines.push('', `Biggest ride: ${(s.biggest_ride_distance / 1000).toFixed(1)} km`);
    }
    if (s.biggest_climb_elevation_gain) {
      lines.push(`Biggest climb: ${s.biggest_climb_elevation_gain.toFixed(0)}m`);
    }

    return { content: [{ type: 'text' as const, text: lines.join('\n') }] };
  },
});
