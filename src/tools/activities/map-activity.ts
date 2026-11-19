import type { Activity, ActivitySummary, ActivityWithSplits, StravaIds, WithStringId } from '../../types.ts';
import { exactId, withStringId } from '../../ids.ts';

type SummaryKey = Exclude<keyof ActivitySummary, 'id'>;
type SplitsKey = Exclude<keyof ActivityWithSplits, 'id'>;

const SUMMARY_KEYS: SummaryKey[] = [
  'name', 'sport_type', 'start_date_local', 'distance',
  'moving_time', 'elapsed_time', 'average_heartrate', 'max_heartrate',
  'average_speed', 'total_elevation_gain', 'description', 'gear_id',
  'suffer_score',
];

const SPLITS_KEYS: SplitsKey[] = [
  ...SUMMARY_KEYS,
  'splits_metric', 'splits_standard', 'laps',
];

export type ActivityOutput = Omit<WithStringId<Activity>, 'athlete'> & {
  athlete: WithStringId<StravaIds>;
};

export function toSummary(activity: Activity): ActivitySummary {
  return {
    id: exactId(activity),
    ...Object.fromEntries(SUMMARY_KEYS.map(function (k) {
      return [k, activity[k]];
    })),
  } as ActivitySummary;
}

export function toSplitsSummary(activity: Activity): ActivityWithSplits {
  return {
    id: exactId(activity),
    ...Object.fromEntries(SPLITS_KEYS.map(function (k) {
      return [k, activity[k]];
    })),
  } as ActivityWithSplits;
}

// Full JSON: every activity/athlete id is the exact string from id_str
export function toActivityOutput(activity: Activity): ActivityOutput {
  return { ...withStringId(activity), athlete: withStringId(activity.athlete) };
}

export type DetailLevel = 'basic' | 'splits' | 'full';

export function mapActivity(activity: Activity, detail: DetailLevel): ActivityOutput | ActivityWithSplits | ActivitySummary {
  if (detail === 'basic') return toSummary(activity);
  if (detail === 'splits') return toSplitsSummary(activity);
  return toActivityOutput(activity);
}
