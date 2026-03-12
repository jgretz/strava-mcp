import { z } from 'zod';
import { defineTool } from '../types.ts';
import { getAthlete } from '../../api/athlete.ts';
import { formatGearLine, capOutput, compactJson } from '../../format.ts';

export const listAthleteGear = defineTool({
  name: 'list_athlete_gear',
  description:
    'List active gear (bikes and shoes) for the authenticated athlete. Does not include retired gear. Use get_gear to look up retired gear by ID when an activity references an unknown gear_id.',
  inputSchema: {
    detail: z
      .enum(['summary', 'full'])
      .default('summary')
      .describe(
        'summary: one-liner per gear (default). full: complete gear data as compact JSON.',
      ),
  },
  async handler({ detail }) {
    const result = await getAthlete();
    if (!result.ok) {
      return {
        content: [
          {
            type: 'text' as const,
            text: `Failed to get athlete gear: ${result.error}`,
          },
        ],
        isError: true,
      };
    }

    const { bikes, shoes } = result.value;

    if (detail === 'summary') {
      const bikeLines = bikes.map((b) => formatGearLine(b));
      const shoeLines = shoes.map((s) => formatGearLine(s));

      const parts: string[] = [];
      if (bikeLines.length > 0) {
        parts.push(`## Bikes\n${bikeLines.join('\n')}`);
      }
      if (shoeLines.length > 0) {
        parts.push(`## Shoes\n${shoeLines.join('\n')}`);
      }

      const text = parts.join('\n\n') || 'No gear found';

      return {
        content: [{ type: 'text' as const, text: capOutput(text) }],
      };
    }

    return {
      content: [
        {
          type: 'text' as const,
          text: capOutput(compactJson({ bikes, shoes })),
        },
      ],
    };
  },
});
