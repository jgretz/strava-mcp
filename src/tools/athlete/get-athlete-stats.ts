import { z } from 'zod';
import { defineTool } from '../types.ts';
import { getAthleteStats as fetchAthleteStats } from '../../api/athlete.ts';

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

    return {
      content: [{ type: 'text' as const, text: JSON.stringify(result.value, null, 2) }],
    };
  },
});
