import { z } from 'zod';
import { defineTool } from '../types.ts';
import { getActivity } from '../../api/activities.ts';
import { ACTIVITY_TYPE_LABELS } from '../../config.ts';
import { formatDuration } from '../format.ts';

export const getActivityDetails = defineTool({
  name: 'get_activity_details',
  description:
    'Get full details of a Strava activity including gear, description, and all metrics.',
  inputSchema: {
    activityId: z.number().describe('Strava activity ID'),
  },
  async handler({ activityId }) {
    const result = await getActivity(activityId);
    if (!result.ok) {
      return {
        content: [{ type: 'text' as const, text: `Failed to get activity: ${result.error}` }],
        isError: true,
      };
    }

    const a = result.value;
    const type = ACTIVITY_TYPE_LABELS[a.sport_type] ?? a.sport_type;

    const lines = [
      `# ${a.name}`,
      `Type: ${type}`,
      `Date: ${new Date(a.start_date_local).toLocaleString()}`,
      `Timezone: ${a.timezone}`,
      a.description ? `Description: ${a.description}` : null,
      '',
      '## Metrics',
      `Distance: ${(a.distance / 1000).toFixed(2)} km`,
      `Moving Time: ${formatDuration(a.moving_time)}`,
      `Elapsed Time: ${formatDuration(a.elapsed_time)}`,
      `Elevation Gain: ${a.total_elevation_gain}m`,
      a.elev_high != null ? `Elevation High: ${a.elev_high}m` : null,
      a.elev_low != null ? `Elevation Low: ${a.elev_low}m` : null,
      `Average Speed: ${(a.average_speed * 3.6).toFixed(1)} km/h`,
      `Max Speed: ${(a.max_speed * 3.6).toFixed(1)} km/h`,
      a.average_heartrate != null ? `Average HR: ${a.average_heartrate} bpm` : null,
      a.max_heartrate != null ? `Max HR: ${a.max_heartrate} bpm` : null,
      a.average_cadence != null ? `Average Cadence: ${a.average_cadence}` : null,
      a.average_watts != null ? `Average Watts: ${a.average_watts}` : null,
      a.max_watts != null ? `Max Watts: ${a.max_watts}` : null,
      a.weighted_average_watts != null ? `Weighted Avg Watts: ${a.weighted_average_watts}` : null,
      a.kilojoules != null ? `Kilojoules: ${a.kilojoules}` : null,
      a.calories ? `Calories: ${a.calories}` : null,
      a.suffer_score != null ? `Suffer Score: ${a.suffer_score}` : null,
      '',
      '## Details',
      `Gear ID: ${a.gear_id ?? 'none'}`,
      a.gear ? `Gear: ${a.gear.name}` : null,
      `Device: ${a.device_name ?? 'unknown'}`,
      `Trainer: ${a.trainer}`,
      `Commute: ${a.commute}`,
      `Manual: ${a.manual}`,
      `Private: ${a.private}`,
      `Kudos: ${a.kudos_count}, Comments: ${a.comment_count}, Achievements: ${a.achievement_count}`,
    ];

    if (a.best_efforts && a.best_efforts.length > 0) {
      lines.push('', '## Best Efforts');
      for (const e of a.best_efforts) {
        lines.push(`- ${e.name}: ${formatDuration(e.elapsed_time)}`);
      }
    }

    if (a.segment_efforts && a.segment_efforts.length > 0) {
      lines.push('', '## Segment Efforts');
      for (const e of a.segment_efforts) {
        const ranks = [
          e.pr_rank ? `PR #${e.pr_rank}` : null,
          e.kom_rank ? `KOM #${e.kom_rank}` : null,
        ].filter(Boolean).join(', ');
        lines.push(`- ${e.name}: ${formatDuration(e.elapsed_time)}${ranks ? ` (${ranks})` : ''}`);
      }
    }

    const text = lines.filter((l) => l !== null).join('\n');
    return { content: [{ type: 'text' as const, text }] };
  },
});
