import type { Activity, ActivitySummary, ActivityWithSplits } from '../../types.ts';

const SUMMARY_KEYS: (keyof ActivitySummary)[] = [
  'id', 'name', 'sport_type', 'start_date_local', 'distance',
  'moving_time', 'elapsed_time', 'average_heartrate', 'max_heartrate',
  'average_speed', 'total_elevation_gain', 'description', 'gear_id',
  'suffer_score',
];

const SPLITS_KEYS: (keyof ActivityWithSplits)[] = [
  ...SUMMARY_KEYS,
  'splits_metric', 'splits_standard', 'laps',
];

export function toSummary(activity: Activity): ActivitySummary {
  return Object.fromEntries(
    SUMMARY_KEYS.map((k) => [k, activity[k]]),
  ) as ActivitySummary;
}

export function toSplitsSummary(activity: Activity): ActivityWithSplits {
  return Object.fromEntries(
    SPLITS_KEYS.map((k) => [k, activity[k]]),
  ) as ActivityWithSplits;
}

export type DetailLevel = 'basic' | 'splits' | 'full';

export function mapActivity(activity: Activity, detail: DetailLevel): Activity | ActivityWithSplits | ActivitySummary {
  if (detail === 'basic') return toSummary(activity);
  if (detail === 'splits') return toSplitsSummary(activity);
  return activity;
}
