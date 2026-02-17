import { z } from 'zod';
import { defineTool } from '../types.ts';
import { exploreSegments as fetchExploreSegments } from '../../api/segments.ts';

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
  },
  async handler({ swLat, swLng, neLat, neLng, activityType, minClimbCategory, maxClimbCategory }) {
    const bounds = `${swLat},${swLng},${neLat},${neLng}`;
    const result = await fetchExploreSegments({ bounds, activityType, minClimbCategory, maxClimbCategory });
    if (!result.ok) {
      return {
        content: [{ type: 'text' as const, text: `Failed to explore segments: ${result.error}` }],
        isError: true,
      };
    }

    return {
      content: [{ type: 'text' as const, text: JSON.stringify(result.value, null, 2) }],
    };
  },
});
