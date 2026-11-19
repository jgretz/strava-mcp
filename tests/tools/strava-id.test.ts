import { describe, it, expect } from 'bun:test';
import { z } from 'zod';
import { getActivityDetails } from '../../src/tools/activities/get-activity-details.ts';
import { getActivityLaps } from '../../src/tools/activities/get-activity-laps.ts';
import { getActivityStreams } from '../../src/tools/activities/get-activity-streams.ts';
import { updateActivity } from '../../src/tools/activities/update-activity.ts';
import { getAthleteStats } from '../../src/tools/athlete/get-athlete-stats.ts';
import { getRoute } from '../../src/tools/routes/get-route.ts';
import { exportRouteGpx } from '../../src/tools/routes/export-route-gpx.ts';
import { exportRouteTcx } from '../../src/tools/routes/export-route-tcx.ts';
import type { McpTool } from '../../src/tools/types.ts';

const ROUTE_ID = '3546500041732922368';

const CASES: [string, McpTool, string][] = [
  ['getActivityDetails', getActivityDetails, 'activityId'],
  ['getActivityLaps', getActivityLaps, 'activityId'],
  ['getActivityStreams', getActivityStreams, 'activityId'],
  ['updateActivity', updateActivity, 'activityId'],
  ['getAthleteStats', getAthleteStats, 'athleteId'],
  ['getRoute', getRoute, 'routeId'],
  ['exportRouteGpx', exportRouteGpx, 'routeId'],
  ['exportRouteTcx', exportRouteTcx, 'routeId'],
];

function parse(tool: McpTool, field: string, value: unknown) {
  return z.object(tool.inputSchema as z.ZodRawShape).safeParse({ [field]: value });
}

describe.each(CASES)('%s id input', (_name, tool, field) => {
  it(`should accept a 19-digit string for ${tool.name}.${field}`, () => {
    const result = parse(tool, field, ROUTE_ID);

    expect(result.success).toBe(true);
    expect(result.data?.[field]).toBe(ROUTE_ID);
  });

  it(`should reject a number for ${tool.name}.${field}`, () => {
    const result = parse(tool, field, Number(ROUTE_ID));

    expect(result.success).toBe(false);
  });

  it(`should reject a non-digit string for ${tool.name}.${field}`, () => {
    const results = ['abc', '12a4', '-1', '1.5', ''].map(function (v) {
      return parse(tool, field, v).success;
    });

    expect(results).toEqual([false, false, false, false, false]);
  });
});
