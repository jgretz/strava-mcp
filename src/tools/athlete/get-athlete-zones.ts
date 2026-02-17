import { defineTool } from '../types.ts';
import { getAthleteZones as fetchAthleteZones } from '../../api/athlete.ts';

export const getAthleteZones = defineTool({
  name: 'get_athlete_zones',
  description: 'Get the authenticated athlete\'s heart rate and power zones.',
  inputSchema: {},
  async handler() {
    const result = await fetchAthleteZones();
    if (!result.ok) {
      return {
        content: [{ type: 'text' as const, text: `Failed to get zones: ${result.error}` }],
        isError: true,
      };
    }

    const zones = result.value;
    const lines = ['# Athlete Zones', ''];

    lines.push(`## Heart Rate (custom: ${zones.heart_rate.custom_zones})`);
    for (let i = 0; i < zones.heart_rate.zones.length; i++) {
      const z = zones.heart_rate.zones[i]!;
      const max = z.max === -1 ? '∞' : String(z.max);
      lines.push(`  Zone ${i + 1}: ${z.min}–${max} bpm`);
    }

    if (zones.power) {
      lines.push('', `## Power (custom: ${zones.power.custom_zones})`);
      for (let i = 0; i < zones.power.zones.length; i++) {
        const z = zones.power.zones[i]!;
        const max = z.max === -1 ? '∞' : String(z.max);
        lines.push(`  Zone ${i + 1}: ${z.min}–${max} W`);
      }
    }

    return { content: [{ type: 'text' as const, text: lines.join('\n') }] };
  },
});
