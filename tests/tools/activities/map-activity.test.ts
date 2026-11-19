import { describe, it, expect } from 'bun:test';
import { toSummary, toSplitsSummary, mapActivity } from '../../../src/tools/activities/map-activity.ts';
import type { Activity } from '../../../src/types.ts';

// 19-digit id (the real route id from Strava, used here as a 64-bit activity id)
const BIG_ID = '3546500041732922368';
const ATHLETE_ID = '9007199254740993';

function makeActivity(): Activity {
  return JSON.parse(`{
    "id": ${BIG_ID}, "id_str": "${BIG_ID}", "name": "Morning Run",
    "sport_type": "Run", "start_date_local": "2024-01-15T08:00:00Z",
    "distance": 5000, "moving_time": 1800, "elapsed_time": 1800,
    "average_heartrate": 150, "max_heartrate": 180, "average_speed": 2.78,
    "total_elevation_gain": 50, "description": null, "gear_id": null,
    "suffer_score": null, "splits_metric": [], "splits_standard": [], "laps": [],
    "athlete": { "id": ${ATHLETE_ID}, "id_str": "${ATHLETE_ID}" }
  }`) as Activity;
}

describe('toSummary', () => {
  it('should emit the exact id_str value as id', () => {
    const result = toSummary(makeActivity());

    expect(result.id).toBe(BIG_ID);
  });

  it('should not emit id_str', () => {
    const result = toSummary(makeActivity());

    expect(result).not.toHaveProperty('id_str');
  });
});

describe('toSplitsSummary', () => {
  it('should emit the exact id_str value as id', () => {
    const result = toSplitsSummary(makeActivity());

    expect(result.id).toBe(BIG_ID);
  });
});

describe('mapActivity', () => {
  it('should replace the activity and athlete ids with exact strings when detail is full', () => {
    const result = mapActivity(makeActivity(), 'full');

    expect(JSON.stringify(result)).toContain(`"id":"${BIG_ID}"`);
    expect(JSON.stringify(result)).toContain(`"athlete":{"id":"${ATHLETE_ID}"}`);
  });

  it('should not emit id_str when detail is full', () => {
    const result = mapActivity(makeActivity(), 'full');

    expect(JSON.stringify(result)).not.toContain('id_str');
  });
});
