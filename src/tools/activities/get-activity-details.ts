import { z } from 'zod';
import { defineTool } from '../types.ts';
import { getActivity } from '../../api/activities.ts';
import { mapActivity, toSummary } from './map-activity.ts';
import { formatActivityLine, formatSplitLine, capOutput, compactJson } from '../../format.ts';

export const getActivityDetails = defineTool({
  name: 'get_activity_details',
  description:
    'Get details of a Strava activity including gear, description, and all metrics.',
  inputSchema: {
    activityId: z.number().describe('Strava activity ID'),
    detail: z.enum(['basic', 'splits', 'full']).optional().describe('Level of detail: "basic" returns one-liner, "splits" adds splits section, "full" (default) returns all fields as JSON'),
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
