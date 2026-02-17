import { defineTool } from '../types.ts';
import { getAthleteZones as fetchAthleteZones } from '../../api/athlete.ts';

export const getAthleteZones = defineTool({
  name: 'get_athlete_zones',
  description: 'Get the authenticated athlete\'s heart rate and power zones.',
  inputSchema: {},
  async handler() {
    const result = await fetchAthleteZones();
    if (!result.ok) {
      return {
        content: [{ type: 'text' as const, text: `Failed to get zones: ${result.error}` }],
        isError: true,
      };
    }

    return {
      content: [{ type: 'text' as const, text: JSON.stringify(result.value, null, 2) }],
    };
  },
});
