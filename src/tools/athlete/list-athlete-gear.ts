import { defineTool } from '../types.ts';
import { getAthlete } from '../../api/athlete.ts';

export const listAthleteGear = defineTool({
  name: 'list_athlete_gear',
  description:
    'List active gear (bikes and shoes) for the authenticated athlete. Does not include retired gear. Use get_gear to look up retired gear by ID when an activity references an unknown gear_id.',
  inputSchema: {},
  async handler() {
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
    return {
      content: [
        { type: 'text' as const, text: JSON.stringify({ bikes, shoes }, null, 2) },
      ],
    };
  },
});
