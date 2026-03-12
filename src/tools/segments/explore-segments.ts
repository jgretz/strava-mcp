import { z } from 'zod';
import { defineTool } from '../types.ts';
import { exploreSegments as fetchExploreSegments } from '../../api/segments.ts';
import { formatSegmentLine, capOutput, compactJson } from '../../format.ts';

export const exploreSegments = defineTool({
  name: 'explore_segments',
  description: 'Search for Strava segments within a geographic bounding box.',
  inputSchema: {
    swLat: z.number().describe('Southwest corner latitude'),
    swLng: z.number().describe('Southwest corner longitude'),
    neLat: z.number().describe('Northeast corner latitude'),
    neLng: z.number().describe('Northeast corner longitude'),
    activityType: z.enum(['running', 'riding']).optional().describe('Filter by activity type'),
    minClimbCategory: z.number().optional().describe('Minimum climb category (0–5)'),
    maxClimbCategory: z.number().optional().describe('Maximum climb category (0–5)'),
    detail: z.enum(['summary', 'full']).default('summary').describe('summary: one-liner per segment (default). full: complete data as compact JSON.'),
  },
  async handler({ swLat, swLng, neLat, neLng, activityType, minClimbCategory, maxClimbCategory, detail }) {
    const bounds = `${swLat},${swLng},${neLat},${neLng}`;
    const result = await fetchExploreSegments({ bounds, activityType, minClimbCategory, maxClimbCategory });
    if (!result.ok) {
      return {
        content: [{ type: 'text' as const, text: `Failed to explore segments: ${result.error}` }],
        isError: true,
      };
    }

    if (detail === 'summary') {
      const lines = result.value.segments.map((s) => formatSegmentLine(s));
      const text = `## Segments (${result.value.segments.length})\n${lines.join('\n')}`;
      return {
        content: [{ type: 'text' as const, text: capOutput(text) }],
      };
    }

    return {
      content: [{ type: 'text' as const, text: capOutput(compactJson(result.value)) }],
    };
  },
});
