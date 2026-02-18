import { z } from 'zod';
import { defineTool } from '../types.ts';
import { updateActivity as updateActivityApi } from '../../api/activities.ts';
import type { UpdatableActivity } from '../../types.ts';

export const updateActivity = defineTool({
  name: 'update_activity',
  description:
    'Update an existing Strava activity. Can change name, description, sport type, gear, and commute/trainer/visibility flags.',
  annotations: {
    destructiveHint: true,
    idempotentHint: true,
    readOnlyHint: false,
  },
  inputSchema: {
    activityId: z.number().describe('Strava activity ID'),
    name: z.string().optional().describe('New name for the activity'),
    description: z.string().optional().describe('New description for the activity'),
    sportType: z.string().optional().describe('Sport type (e.g. Run, Ride, Swim, Hike)'),
    gearId: z.string().optional().describe('Gear ID to associate, or "none" to remove gear'),
    commute: z.boolean().optional().describe('Whether this activity is a commute'),
    trainer: z.boolean().optional().describe('Whether this activity was on a trainer'),
    hideFromHome: z.boolean().optional().describe('Whether to hide from the home feed'),
  },
  async handler({ activityId, name, description, sportType, gearId, commute, trainer, hideFromHome }) {
    const data: UpdatableActivity = {};
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;
    if (sportType !== undefined) data.sport_type = sportType;
    if (gearId !== undefined) data.gear_id = gearId;
    if (commute !== undefined) data.commute = commute;
    if (trainer !== undefined) data.trainer = trainer;
    if (hideFromHome !== undefined) data.hide_from_home = hideFromHome;

    const result = await updateActivityApi(activityId, data);
    if (!result.ok) {
      return {
        content: [{ type: 'text' as const, text: `Failed to update activity: ${result.error}` }],
        isError: true,
      };
    }

    return {
      content: [{ type: 'text' as const, text: JSON.stringify(result.value, null, 2) }],
    };
  },
});
