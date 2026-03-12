import { describe, it, expect } from "bun:test";
import {
  capOutput,
  formatDuration,
  formatDistance,
  formatPace,
  formatSpeed,
  formatActivityLine,
  formatLapLine,
  formatSegmentEffortLine,
  formatGearLine,
  formatRouteLine,
  formatSegmentLine,
  formatSplitLine,
  avg,
  min,
  max,
  sum,
  formatStreamSummary,
} from "../src/format.ts";
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
} from "../src/types.ts";

describe("capOutput", () => {
  it("returns text unchanged when under limit", () => {
    const text = "hello world";
    expect(capOutput(text)).toBe(text);
  });

  it("truncates and appends message when over limit", () => {
    const text = "x".repeat(3100);
    const result = capOutput(text);
    expect(result.length).toBeLessThan(text.length);
    expect(result).toContain("truncated");
    expect(result).toContain("100 chars");
  });
});

describe("formatDuration", () => {
  it('formats 0 seconds as "0s"', () => {
    expect(formatDuration(0)).toBe("0s");
  });

  it("formats seconds only", () => {
    expect(formatDuration(59)).toBe("59s");
  });

  it("formats minutes and seconds", () => {
    expect(formatDuration(60)).toBe("1m");
    expect(formatDuration(65)).toBe("1m 5s");
  });

  it("formats hours minutes and seconds", () => {
    expect(formatDuration(3661)).toBe("1h 1m 1s");
    expect(formatDuration(3600)).toBe("1h");
  });
});

describe("formatDistance", () => {
  it("formats meters as km with 1 decimal", () => {
    expect(formatDistance(0)).toBe("0.0km");
    expect(formatDistance(5123.4)).toBe("5.1km");
    expect(formatDistance(42195)).toBe("42.2km");
  });
});

describe("formatPace", () => {
  it('returns "-" for 0 m/s', () => {
    expect(formatPace(0)).toBe("-");
  });

  it("converts m/s to min/km format", () => {
    // 5:00/km = 1000m / 300s = 3.33 m/s
    const result = formatPace(3.333);
    expect(result).toMatch(/\d+:\d+\/km/);
  });

  it("handles edge case where seconds round to 60", () => {
    // 3.336 m/s → 299.76 sec/km → rounds to 5:00/km, not 4:60/km
    expect(formatPace(3.336)).toBe("5:00/km");
  });
});

describe("formatSpeed", () => {
  it("returns 0 km/h for 0 m/s", () => {
    expect(formatSpeed(0)).toBe("0.0km/h");
  });

  it("converts m/s to km/h", () => {
    // 8.333 m/s = 30 km/h
    expect(formatSpeed(8.333)).toBe("30.0km/h");
  });
});

describe("aggregation helpers", () => {
  it("avg calculates average", () => {
    expect(avg([100, 140, 160])).toBe(133);
  });

  it("min finds minimum", () => {
    expect(min([100, 140, 160])).toBe(100);
  });

  it("max finds maximum", () => {
    expect(max([100, 140, 160])).toBe(160);
  });

  it("sum adds numbers", () => {
    expect(sum([100, 140, 160])).toBe(400);
  });
});

describe("formatActivityLine", () => {
  it("formats activity summary as single line", () => {
    const activity: ActivitySummary = {
      id: 1,
      name: "Morning Run",
      sport_type: "Run",
      start_date_local: "2024-01-15T08:00:00Z",
      distance: 5000,
      moving_time: 1800,
      elapsed_time: 1800,
      average_heartrate: 150,
      max_heartrate: 180,
      average_speed: 2.78,
      total_elevation_gain: 50,
      description: "Test",
      gear_id: null,
      suffer_score: null,
    };

    const result = formatActivityLine(activity);
    expect(result).toContain("2024-01-15");
    expect(result).toContain("Run");
    expect(result).toContain("Morning Run");
    expect(result).toContain("5.0km");
    expect(result).toContain("30m");
    expect(result).toContain("HR 150");
  });
});

describe("formatLapLine", () => {
  it("formats lap data as single line", () => {
    const lap: Lap = {
      id: 1,
      name: "Lap 1",
      elapsed_time: 600,
      moving_time: 600,
      start_date: "2024-01-15T08:00:00Z",
      start_date_local: "2024-01-15T08:00:00Z",
      distance: 1000,
      average_speed: 1.67,
      max_speed: 3,
      average_cadence: null,
      average_watts: null,
      average_heartrate: 150,
      max_heartrate: 170,
      lap_index: 0,
      split: 1,
      total_elevation_gain: 10,
      pace_zone: 0,
    };

    const result = formatLapLine(lap, 1);
    expect(result).toContain("Lap 1:");
    expect(result).toContain("1.0km");
    expect(result).toContain("10m");
    expect(result).toContain("HR 150");
  });
});

describe("formatSegmentEffortLine", () => {
  it("formats segment effort as single line", () => {
    const effort: SegmentEffort = {
      id: 1,
      name: "Test Climb",
      elapsed_time: 300,
      moving_time: 300,
      start_date: "2024-01-15T08:00:00Z",
      start_date_local: "2024-01-15T08:00:00Z",
      distance: 1000,
      average_watts: null,
      average_heartrate: 160,
      max_heartrate: 180,
      segment: {} as any,
      kom_rank: null,
      pr_rank: 5,
      achievements: [],
    };

    const result = formatSegmentEffortLine(effort);
    expect(result).toContain("Test Climb");
    expect(result).toContain("1.0km");
    expect(result).toContain("PR:5");
  });
});

describe("formatGearLine", () => {
  it("formats gear as single line", () => {
    const gear: Gear = {
      id: "g123",
      primary: true,
      name: "Road Bike",
      brand_name: "Trek",
      model_name: "Domane",
      description: "Primary bike",
      resource_state: 2,
      distance: 50000,
      converted_distance: 50000,
    };

    const result = formatGearLine(gear);
    expect(result).toContain("g123");
    expect(result).toContain("Road Bike");
    expect(result).toContain("Trek");
    expect(result).toContain("50.0km");
  });
});

describe("formatRouteLine", () => {
  it("formats route as single line", () => {
    const route: Route = {
      id: 1,
      name: "Morning Route",
      description: null,
      distance: 10000,
      elevation_gain: 200,
      type: 1,
      sub_type: 1,
      private: false,
      starred: false,
      timestamp: 1000,
      map: null,
      estimated_moving_time: 1800,
      segments: [],
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    };

    const result = formatRouteLine(route);
    expect(result).toContain("Morning Route");
    expect(result).toContain("10.0km");
    expect(result).toContain("200m gain");
  });
});

describe("formatSegmentLine", () => {
  it("formats Segment with average_grade", () => {
    const segment: Segment = {
      id: 1,
      name: "Climb",
      activity_type: "Ride",
      distance: 2000,
      average_grade: 5.5,
      maximum_grade: 10,
      elevation_high: 500,
      elevation_low: 400,
      start_latlng: [0, 0],
      end_latlng: [0, 0],
      climb_category: 2,
      city: null,
      state: null,
      country: null,
      private: false,
      starred: false,
      athlete_segment_stats: null,
      total_elevation_gain: 100,
      map: null,
      effort_count: 10,
      athlete_count: 50,
      star_count: 100,
      hazardous: false,
    };

    const result = formatSegmentLine(segment);
    expect(result).toContain("Climb");
    expect(result).toContain("2.0km");
    expect(result).toContain("5.5%");
  });

  it("formats ExploreSegment with avg_grade", () => {
    const segment: ExploreSegment = {
      id: 1,
      name: "Climb",
      climb_category: 2,
      climb_category_desc: "Moderate",
      avg_grade: 5.5,
      start_latlng: [0, 0],
      end_latlng: [0, 0],
      elev_difference: 100,
      distance: 2000,
      points: "polyline",
    };

    const result = formatSegmentLine(segment);
    expect(result).toContain("Climb");
    expect(result).toContain("2.0km");
    expect(result).toContain("5.5%");
  });
});

describe("formatSplitLine", () => {
  it("formats split as single line", () => {
    const split: Split = {
      distance: 1000,
      elapsed_time: 300,
      elevation_difference: 10,
      moving_time: 300,
      split: 1,
      average_speed: 3.33,
      average_heartrate: 150,
      pace_zone: 0,
    };

    const result = formatSplitLine(split, 1);
    expect(result).toContain("Split 1:");
    expect(result).toContain("1.0km");
    expect(result).toContain("5m");
  });
});

describe("formatStreamSummary", () => {
  it("formats heart rate stream", () => {
    const streams: Stream[] = [
      {
        type: "heartrate",
        data: [120, 140, 160, 150],
        series_type: "time",
        original_size: 4,
        resolution: "1",
      },
    ];

    const result = formatStreamSummary(streams);
    expect(result).toContain("HR:");
    expect(result).toContain("avg");
    expect(result).toContain("max 160");
  });

  it("formats velocity_smooth stream with unrounded pace", () => {
    const streams: Stream[] = [
      {
        type: "velocity_smooth",
        data: [3.33, 3.33, 3.34],
        series_type: "time",
        original_size: 3,
        resolution: "1",
      },
    ];

    const result = formatStreamSummary(streams);
    expect(result).toContain("Pace:");
    // avg of [3.33, 3.33, 3.34] = ~3.333 m/s = 5:00/km, not 3 m/s = 5:33/km
    expect(result).toContain("5:0");
  });

  it("formats altitude stream with elevation gain/loss", () => {
    const streams: Stream[] = [
      {
        type: "altitude",
        data: [100, 110, 120, 115, 125],
        series_type: "distance",
        original_size: 5,
        resolution: "10",
      },
    ];

    const result = formatStreamSummary(streams);
    expect(result).toContain("Elevation:");
    expect(result).toContain("gain");
    expect(result).toContain("loss");
  });

  it('returns "No stream data available" for empty streams', () => {
    const streams: Stream[] = [];
    const result = formatStreamSummary(streams);
    expect(result).toBe("No stream data available");
  });
});
