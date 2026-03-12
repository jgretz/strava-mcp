import { z } from 'zod';
import { defineTool } from '../types.ts';
import { getRoute as fetchRoute } from '../../api/routes.ts';
import { formatRouteLine, formatSegmentLine, capOutput, compactJson } from '../../format.ts';

export const getRoute = defineTool({
  name: 'get_route',
  description: 'Get details about a Strava route.',
  inputSchema: {
    routeId: z.number().describe('Strava route ID'),
    detail: z.enum(['summary', 'full']).default('summary').describe('summary: one-liner with segments if present (default). full: complete route data as compact JSON.'),
  },
  async handler({ routeId, detail }) {
    const result = await fetchRoute(routeId);
    if (!result.ok) {
      return {
        content: [{ type: 'text' as const, text: `Failed to get route: ${result.error}` }],
        isError: true,
      };
    }

    if (detail === 'summary') {
      let text = formatRouteLine(result.value);
      if (result.value.segments && result.value.segments.length > 0) {
        const segmentLines = result.value.segments.map((s) => formatSegmentLine(s));
        text += `\n### Segments\n${segmentLines.join('\n')}`;
      }
      return {
        content: [{ type: 'text' as const, text: capOutput(text) }],
      };
    }

    return {
      content: [{ type: 'text' as const, text: capOutput(compactJson(result.value)) }],
    };
  },
});
