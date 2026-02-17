import { defineTool } from '../types.ts';
import { getAthlete } from '../../api/athlete.ts';

export const getAthleteProfile = defineTool({
  name: 'get_athlete_profile',
  description: 'Get the authenticated athlete\'s profile information.',
  inputSchema: {},
  async handler() {
    const result = await getAthlete();
    if (!result.ok) {
      return {
        content: [{ type: 'text' as const, text: `Failed to get profile: ${result.error}` }],
        isError: true,
      };
    }

    return {
      content: [{ type: 'text' as const, text: JSON.stringify(result.value, null, 2) }],
    };
  },
});
