import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { McpTool } from './types.ts';
import { connectStrava } from './auth/connect-strava.ts';
import { getActivities } from './activities/get-activities.ts';
import { getActivityDetails } from './activities/get-activity-details.ts';
import { getActivityStreams } from './activities/get-activity-streams.ts';
import { getActivityLaps } from './activities/get-activity-laps.ts';
import { getAthleteProfile } from './athlete/get-athlete-profile.ts';
import { getAthleteStats } from './athlete/get-athlete-stats.ts';
import { getAthleteZones } from './athlete/get-athlete-zones.ts';
import { getGear } from './athlete/get-gear.ts';
import { getSegment } from './segments/get-segment.ts';
import { exploreSegments } from './segments/explore-segments.ts';
import { getSegmentEffort } from './segments/get-segment-effort.ts';
import { listSegmentEfforts } from './segments/list-segment-efforts.ts';
import { getRoute } from './routes/get-route.ts';
import { listAthleteRoutes } from './routes/list-athlete-routes.ts';
import { exportRouteGpx } from './routes/export-route-gpx.ts';
import { exportRouteTcx } from './routes/export-route-tcx.ts';

export const tools: McpTool[] = [
  connectStrava,
  getActivities,
  getActivityDetails,
  getActivityStreams,
  getActivityLaps,
  getAthleteProfile,
  getAthleteStats,
  getAthleteZones,
  getGear,
  getSegment,
  exploreSegments,
  getSegmentEffort,
  listSegmentEfforts,
  getRoute,
  listAthleteRoutes,
  exportRouteGpx,
  exportRouteTcx,
];

export function registerTools(server: McpServer): void {
  for (const tool of tools) {
    server.registerTool(
      tool.name,
      {
        description: tool.description,
        inputSchema: tool.inputSchema,
        annotations: tool.annotations,
      },
      tool.handler,
    );
  }
}
