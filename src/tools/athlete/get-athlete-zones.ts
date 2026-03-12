import { z } from 'zod';
import { defineTool } from '../types.ts';
import { getAthleteZones as fetchAthleteZones } from '../../api/athlete.ts';
import { formatZonesSummary, capOutput, compactJson } from '../../format.ts';

export const getAthleteZones = defineTool({
  name: 'get_athlete_zones',
  description: 'Get the authenticated athlete\'s heart rate and power zones.',
  inputSchema: {
    detail: z
      .enum(['summary', 'full'])
      .default('summary')
      .describe(
        'summary: formatted zones (default). full: complete zones data as compact JSON.',
      ),
  },
  async handler({ detail }) {
    const result = await fetchAthleteZones();
    if (!result.ok) {
      return {
        content: [
          {
            type: 'text' as const,
            text: `Failed to get zones: ${result.error}`,
          },
        ],
        isError: true,
      };
    }

    if (detail === 'summary') {
      const text = formatZonesSummary(
        result.value.heart_rate,
        result.value.power,
      );
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
