import { z } from 'zod';
import { defineTool } from '../types.ts';
import { getGear as fetchGear } from '../../api/gear.ts';

export const getGear = defineTool({
  name: 'get_gear',
  description: 'Get details about a piece of gear (shoe or bike) by ID.',
  inputSchema: {
    gearId: z.string().describe('Gear ID (e.g. "b12345" for bikes, "g12345" for shoes)'),
  },
  async handler({ gearId }) {
    const result = await fetchGear(gearId);
    if (!result.ok) {
      return {
        content: [{ type: 'text' as const, text: `Failed to get gear: ${result.error}` }],
        isError: true,
      };
    }

    return {
      content: [{ type: 'text' as const, text: JSON.stringify(result.value, null, 2) }],
    };
  },
});
