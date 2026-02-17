import { defineTool } from '../types.ts';
import { getAthlete } from '../../api/athlete.ts';

export const getAthleteProfile = defineTool({
  name: 'get_athlete_profile',
  description: 'Get the authenticated athlete\'s profile information.',
  inputSchema: {},
  async handler() {
    const result = await getAthlete();
    if (!result.ok) {
      return {
        content: [{ type: 'text' as const, text: `Failed to get profile: ${result.error}` }],
        isError: true,
      };
    }

    const a = result.value;
    const lines = [
      `# ${a.firstname} ${a.lastname}`,
      a.username ? `Username: ${a.username}` : null,
      a.bio ? `Bio: ${a.bio}` : null,
      `Location: ${[a.city, a.state, a.country].filter(Boolean).join(', ') || 'not set'}`,
      `Sex: ${a.sex ?? 'not set'}`,
      `Premium: ${a.premium}`,
      `Summit: ${a.summit}`,
      a.weight ? `Weight: ${a.weight} kg` : null,
      a.ftp ? `FTP: ${a.ftp}` : null,
      `Member since: ${new Date(a.created_at).toLocaleDateString()}`,
      `Athlete ID: ${a.id}`,
    ];

    if (a.bikes.length > 0) {
      lines.push('', '## Bikes');
      for (const b of a.bikes) {
        lines.push(`- ${b.name} (${(b.distance / 1000).toFixed(0)} km)${b.primary ? ' [primary]' : ''} — ID: ${b.id}`);
      }
    }

    if (a.shoes.length > 0) {
      lines.push('', '## Shoes');
      for (const s of a.shoes) {
        lines.push(`- ${s.name} (${(s.distance / 1000).toFixed(0)} km)${s.primary ? ' [primary]' : ''} — ID: ${s.id}`);
      }
    }

    const text = lines.filter((l) => l !== null).join('\n');
    return { content: [{ type: 'text' as const, text }] };
  },
});
