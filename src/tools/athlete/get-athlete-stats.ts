import { z } from 'zod';
import { defineTool } from '../types.ts';
import { getAthleteStats as fetchAthleteStats } from '../../api/athlete.ts';
import {
  formatAthleteStatsSummary,
  capOutput,
  compactJson,
} from '../../format.ts';

export const getAthleteStats = defineTool({
  name: 'get_athlete_stats',
  description:
    'Get activity statistics for an athlete grouped by sport and time period.',
  inputSchema: {
    athleteId: z.number().describe('Athlete ID (get from get_athlete_profile)'),
    detail: z
      .enum(['summary', 'full'])
      .default('summary')
      .describe(
        'summary: formatted stats table (default). full: raw stats data as compact JSON.',
      ),
  },
  async handler({ athleteId, detail }) {
    const result = await fetchAthleteStats(athleteId);
    if (!result.ok) {
      return {
        content: [
          {
            type: 'text' as const,
            text: `Failed to get stats: ${result.error}`,
          },
        ],
        isError: true,
      };
    }

    if (detail === 'summary') {
      const text = formatAthleteStatsSummary(result.value);
      return {
        content: [{ type: 'text' as const, text: capOutput(text) }],
      };
    }

    return {
      content: [
        {
          type: 'text' as const,
          text: capOutput(compactJson(result.value)),
        },
      ],
    };
  },
});
