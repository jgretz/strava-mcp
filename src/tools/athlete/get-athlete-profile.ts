import { z } from 'zod';
import { defineTool } from '../types.ts';
import { getAthlete } from '../../api/athlete.ts';
import { capOutput, compactJson } from '../../format.ts';

export const getAthleteProfile = defineTool({
  name: 'get_athlete_profile',
  description: 'Get the authenticated athlete\'s profile information.',
  inputSchema: {
    detail: z.enum(['summary', 'full']).default('summary').describe('summary: formatted profile (default). full: complete athlete data as compact JSON.'),
  },
  async handler({ detail }) {
    const result = await getAthlete();
    if (!result.ok) {
      return {
        content: [{ type: 'text' as const, text: `Failed to get profile: ${result.error}` }],
        isError: true,
      };
    }

    if (detail === 'summary') {
      const a = result.value;
      const text = `## ${a.firstname} ${a.lastname}
Location: ${a.city ?? '-'}, ${a.state ?? '-'}, ${a.country ?? '-'}
Weight: ${a.weight ?? '-'}kg | FTP: ${a.ftp ?? '-'}w
Premium: ${a.premium} | Summit: ${a.summit}
Bikes: ${a.bikes.length} | Shoes: ${a.shoes.length}`;
      return {
        content: [{ type: 'text' as const, text: capOutput(text) }],
      };
    }

    return {
      content: [{ type: 'text' as const, text: capOutput(compactJson(result.value)) }],
    };
  },
});
