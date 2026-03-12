import type {
  ActivitySummary,
  Lap,
  SegmentEffort,
  Segment,
  ExploreSegment,
  Gear,
  Route,
  Split,
  Stream,
  AthleteStats,
  ZoneRange,
} from "./types.ts";

export const MAX_OUTPUT_CHARS = 3000;

export function capOutput(
  text: string,
  max: number = MAX_OUTPUT_CHARS,
): string {
  if (text.length <= max) return text;
  const truncated = text.length - max;
  return `${text.slice(0, max)}\n... truncated (${truncated} chars). Use detail:'full' or narrow your query.`;
}

export function compactJson(data: unknown): string {
  return JSON.stringify(data);
}

// Basic converters
export function formatDuration(seconds: number): string {
  if (seconds === 0) return "0s";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

  return parts.join(" ");
}

export function formatDistance(meters: number): string {
  return `${(meters / 1000).toFixed(1)}km`;
}

export function formatPace(metersPerSecond: number): string {
  if (metersPerSecond === 0) return "-";

  const secondsPerKm = 1000 / metersPerSecond;
  const minutes = Math.floor(secondsPerKm / 60);
  const seconds = Math.round(secondsPerKm % 60);

  return `${minutes}:${seconds.toString().padStart(2, "0")}/km`;
}

export function formatSpeed(metersPerSecond: number): string {
  const kmh = metersPerSecond * 3.6;
  return `${kmh.toFixed(1)}km/h`;
}

// Aggregation helpers
export function avg(arr: number[]): number {
  if (arr.length === 0) return 0;
  return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
}

export function min(arr: number[]): number {
  return Math.min(...arr);
}

export function max(arr: number[]): number {
  return Math.max(...arr);
}

export function sum(arr: number[]): number {
  return Math.round(arr.reduce((a, b) => a + b, 0));
}

export function formatStreamSummary(streams: Stream[]): string {
  const summaries: string[] = [];

  for (const stream of streams) {
    const data = stream.data;
    if (!data || data.length === 0) continue;

    switch (stream.type) {
      case "heartrate": {
        const filtered = data.filter((d) => d > 0);
        if (filtered.length > 0) {
          summaries.push(
            `HR: avg ${avg(filtered)} bpm, max ${max(filtered)} bpm`,
          );
        }
        break;
      }
      case "velocity_smooth": {
        const filtered = data.filter((d) => d > 0);
        if (filtered.length > 0) {
          const avgPace = formatPace(avg(filtered));
          const bestPace = formatPace(max(filtered));
          summaries.push(`Pace: avg ${avgPace}, best ${bestPace}`);
        }
        break;
      }
      case "altitude": {
        let elevGain = 0;
        let elevLoss = 0;
        for (let i = 1; i < data.length; i++) {
          const delta = data[i]! - data[i - 1]!;
          if (delta > 0) elevGain += delta;
          else elevLoss -= delta;
        }
        if (elevGain > 0 || elevLoss > 0) {
          summaries.push(
            `Elevation: ${Math.round(elevGain)}m gain, ${Math.round(elevLoss)}m loss`,
          );
        }
        break;
      }
      case "watts": {
        const filtered = data.filter((d) => d > 0);
        if (filtered.length > 0) {
          summaries.push(`Power: avg ${avg(filtered)}w, max ${max(filtered)}w`);
        }
        break;
      }
      case "cadence": {
        const filtered = data.filter((d) => d > 0);
        if (filtered.length > 0) {
          summaries.push(
            `Cadence: avg ${avg(filtered)} rpm, max ${max(filtered)} rpm`,
          );
        }
        break;
      }
      case "temp": {
        const filtered = data.filter((d) => d > -50);
        if (filtered.length > 0) {
          summaries.push(
            `Temp: avg ${avg(filtered)}°C, min ${min(filtered)}°C, max ${max(filtered)}°C`,
          );
        }
        break;
      }
    }
  }

  return summaries.length > 0
    ? summaries.join("\n")
    : "No stream data available";
}

// Domain formatters
export function formatActivityLine(a: ActivitySummary): string {
  const date = new Date(a.start_date_local).toISOString().split("T")[0];
  const distance = formatDistance(a.distance);
  const duration = formatDuration(a.moving_time);
  const hr = a.average_heartrate ? Math.round(a.average_heartrate) : "-";
  const score = a.suffer_score ?? "-";

  return `${date} | ${a.sport_type} | ${a.name} | ${distance} | ${duration} | HR ${hr} | suffer:${score}`;
}

export function formatLapLine(lap: Lap, i: number): string {
  const distance = formatDistance(lap.distance);
  const duration = formatDuration(lap.moving_time);
  const pace = formatPace(lap.average_speed);
  const hr = lap.average_heartrate ? Math.round(lap.average_heartrate) : "-";

  return `Lap ${i}: ${distance} | ${duration} | ${pace} | HR ${hr}`;
}

export function formatSegmentEffortLine(e: SegmentEffort): string {
  const distance = formatDistance(e.distance);
  const duration = formatDuration(e.moving_time);
  const pace = formatPace(e.moving_time > 0 ? e.distance / e.moving_time : 0);
  const hr = e.average_heartrate ? Math.round(e.average_heartrate) : "-";
  const pr = e.pr_rank ?? "-";

  return `${e.name} | ${distance} | ${duration} | ${pace} | HR ${hr} | PR:${pr}`;
}

export function formatGearLine(g: Gear): string {
  const distance = formatDistance(g.distance);
  return `${g.id} | ${g.name} | ${g.brand_name} ${g.model_name} | ${distance}`;
}

export function formatRouteLine(r: Route): string {
  const distance = formatDistance(r.distance);
  const gain = Math.round(r.elevation_gain);
  const time = formatDuration(r.estimated_moving_time);

  return `${r.name} | ${distance} | ${gain}m gain | ${time}`;
}

export function formatSegmentLine(s: Segment | ExploreSegment): string {
  const distance = formatDistance(s.distance);
  const grade =
    "average_grade" in s ? s.average_grade.toFixed(1) : s.avg_grade.toFixed(1);

  return `${s.name} | ${distance} | ${grade}% | cat:${s.climb_category}`;
}

export function formatSplitLine(s: Split, i: number): string {
  const distance = formatDistance(s.distance);
  const duration = formatDuration(s.moving_time);
  const pace = formatPace(s.moving_time > 0 ? s.distance / s.moving_time : 0);
  const hr = s.average_heartrate ? Math.round(s.average_heartrate) : "-";

  return `Split ${i}: ${distance} | ${duration} | ${pace} | HR ${hr}`;
}

// Athlete formatters
export function formatAthleteStatsSummary(stats: AthleteStats): string {
  const sections = [
    {
      title: "Recent",
      data: {
        Ride: stats.recent_ride_totals,
        Run: stats.recent_run_totals,
        Swim: stats.recent_swim_totals,
      },
    },
    {
      title: "YTD",
      data: {
        Ride: stats.ytd_ride_totals,
        Run: stats.ytd_run_totals,
        Swim: stats.ytd_swim_totals,
      },
    },
    {
      title: "All-time",
      data: {
        Ride: stats.all_ride_totals,
        Run: stats.all_run_totals,
        Swim: stats.all_swim_totals,
      },
    },
  ];

  const lines: string[] = [];
  for (const section of sections) {
    lines.push(`## ${section.title}`);
    for (const [sport, totals] of Object.entries(section.data)) {
      const distance = formatDistance(totals.distance);
      const time = formatDuration(totals.moving_time);
      lines.push(
        `${sport}: ${totals.count} activities | ${distance} | ${time}`,
      );
    }
  }

  return lines.join("\n");
}

export function formatZonesSummary(
  heart_rate: ZoneRange,
  power: ZoneRange | null,
): string {
  const lines: string[] = [];

  lines.push("## HR Zones");
  const hrZones = heart_rate.zones;
  if (hrZones && hrZones.length > 0) {
    for (let i = 0; i < hrZones.length; i++) {
      const z = hrZones[i]!;
      lines.push(`Zone ${i + 1}: ${z.min}-${z.max} bpm`);
    }
  }

  if (power) {
    const pwZones = power.zones;
    if (pwZones && pwZones.length > 0) {
      lines.push("\n## Power Zones");
      for (let i = 0; i < pwZones.length; i++) {
        const z = pwZones[i]!;
        lines.push(`Zone ${i + 1}: ${z.min}-${z.max}w`);
      }
    }
  }

  return lines.join("\n");
}
