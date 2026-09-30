import { z } from 'zod';
import { defineTool } from '../types.ts';
import { getActivity } from '../../api/activities.ts';
import { toSummary } from './map-activity.ts';
import { formatActivityLine, formatActivityDetail, formatSplitLine, capOutput, compactJson } from '../../format.ts';

export const getActivityDetails = defineTool({
  name: 'get_activity_details',
  description:
    'Get a single Strava activity: metrics, gear, and the full untruncated description. Use this (not get_activities) whenever you need an activity description.',
  inputSchema: {
    activityId: z.number().describe('Strava activity ID'),
    detail: z.enum(['basic', 'splits', 'full', 'raw']).optional().describe('Level of detail: "full" (default) returns metrics, gear, and the complete description; "basic" returns a one-liner; "splits" adds per-km splits; "raw" returns the entire Strava JSON (large, truncated at 3000 chars)'),
  },
  async handler({ activityId, detail }) {
    const result = await getActivity(activityId);
    if (!result.ok) {
      return {
        content: [{ type: 'text' as const, text: `Failed to get activity: ${result.error}` }],
        isError: true,
      };
    }

    const level = detail ?? 'full';
    const activity = result.value;

    if (level === 'full') {
      return {
        content: [{ type: 'text' as const, text: formatActivityDetail(activity) }],
      };
    }

    if (level === 'basic') {
      const summary = toSummary(activity);
      return {
        content: [{ type: 'text' as const, text: capOutput(formatActivityLine(summary)) }],
      };
    }

    if (level === 'splits') {
      const summary = toSummary(activity);
      let text = formatActivityLine(summary);
      if (activity.splits_metric && activity.splits_metric.length > 0) {
        const splitLines = activity.splits_metric.map((s, i) => formatSplitLine(s, i + 1));
        text += `\n### Splits\n${splitLines.join('\n')}`;
      }
      return {
        content: [{ type: 'text' as const, text: capOutput(text) }],
      };
    }

    return {
      content: [{ type: 'text' as const, text: capOutput(compactJson(activity)) }],
    };
  },
});
