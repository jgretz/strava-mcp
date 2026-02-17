import { z } from 'zod';
import { defineTool } from '../types.ts';
import { getGear as fetchGear } from '../../api/gear.ts';

export const getGear = defineTool({
  name: 'get_gear',
  description:
    'Get details about one or more pieces of gear (shoes or bikes) by ID. Accepts a single ID or an array of IDs. Works for both active and retired gear.',
  inputSchema: {
    gearIds: z
      .union([z.string(), z.array(z.string())])
      .describe('Gear ID or array of IDs (e.g. "b12345" for bikes, "g12345" for shoes)'),
  },
  async handler({ gearIds }) {
    const ids = Array.isArray(gearIds) ? gearIds : [gearIds];
    const results = await Promise.all(ids.map((id) => fetchGear(id)));

    const errors: string[] = [];
    const gear: unknown[] = [];

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      if (result.ok) {
        gear.push(result.value);
      } else {
        errors.push(`${ids[i]}: ${result.error}`);
      }
    }

    if (gear.length === 0) {
      return {
        content: [{ type: 'text' as const, text: `Failed to get gear: ${errors.join('; ')}` }],
        isError: true,
      };
    }

    const response: Record<string, unknown> = { gear };
    if (errors.length > 0) {
      response.errors = errors;
    }

    return {
      content: [{ type: 'text' as const, text: JSON.stringify(response, null, 2) }],
    };
  },
});
