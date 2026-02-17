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

    const g = result.value;
    const lines = [
      `# ${g.name}`,
      `Brand: ${g.brand_name || 'unknown'}`,
      `Model: ${g.model_name || 'unknown'}`,
      g.description ? `Description: ${g.description}` : null,
      `Distance: ${(g.distance / 1000).toFixed(0)} km`,
      `Primary: ${g.primary}`,
      `ID: ${g.id}`,
    ];

    const text = lines.filter((l) => l !== null).join('\n');
    return { content: [{ type: 'text' as const, text }] };
  },
});
