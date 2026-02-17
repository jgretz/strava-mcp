// Result type — prefer over throwing
export type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

// Auth
export type AuthToken = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  athleteId: number;
};

export type LatLng = [number, number];

// Strava domain types — full API fields
export type Athlete = {
  id: number;
  username: string | null;
  firstname: string;
  lastname: string;
  bio: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  sex: string | null;
  premium: boolean;
  summit: boolean;
  created_at: string;
  updated_at: string;
  profile_medium: string;
  profile: string;
  weight: number | null;
  ftp: number | null;
  shoes: Gear[];
  bikes: Gear[];
};

export type Gear = {
  id: string;
  primary: boolean;
  name: string;
  brand_name: string;
  model_name: string;
  description: string;
  resource_state: number;
  distance: number;
  converted_distance: number;
};

export type Activity = {
  id: number;
  name: string;
  description: string | null;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  type: string;
  sport_type: string;
  workout_type: number | null;
  start_date: string;
  start_date_local: string;
  timezone: string;
  utc_offset: number;
  start_latlng: LatLng | null;
  end_latlng: LatLng | null;
  location_city: string | null;
  location_state: string | null;
  location_country: string | null;
  achievement_count: number;
  kudos_count: number;
  comment_count: number;
  athlete_count: number;
  photo_count: number;
  trainer: boolean;
  commute: boolean;
  manual: boolean;
  private: boolean;
  visibility: string;
  gear_id: string | null;
  gear: Gear | null;
  average_speed: number;
  max_speed: number;
  average_cadence: number | null;
  average_watts: number | null;
  max_watts: number | null;
  weighted_average_watts: number | null;
  kilojoules: number | null;
  device_watts: boolean | null;
  has_heartrate: boolean;
  average_heartrate: number | null;
  max_heartrate: number | null;
  elev_high: number | null;
  elev_low: number | null;
  suffer_score: number | null;
  calories: number;
  device_name: string | null;
  embed_token: string | null;
  splits_metric: Split[] | null;
  splits_standard: Split[] | null;
  laps: Lap[] | null;
  best_efforts: BestEffort[] | null;
  segment_efforts: SegmentEffort[] | null;
  athlete: { id: number };
  map: ActivityMap | null;
};

export type ActivityMap = {
  id: string;
  summary_polyline: string | null;
  polyline: string | null;
};

export type Split = {
  distance: number;
  elapsed_time: number;
  elevation_difference: number;
  moving_time: number;
  split: number;
  average_speed: number;
  average_heartrate: number | null;
  pace_zone: number;
};

export type Lap = {
  id: number;
  name: string;
  elapsed_time: number;
  moving_time: number;
  start_date: string;
  start_date_local: string;
  distance: number;
  average_speed: number;
  max_speed: number;
  average_cadence: number | null;
  average_watts: number | null;
  average_heartrate: number | null;
  max_heartrate: number | null;
  lap_index: number;
  split: number;
  total_elevation_gain: number;
  pace_zone: number;
};

export type BestEffort = {
  id: number;
  name: string;
  elapsed_time: number;
  moving_time: number;
  start_date: string;
  distance: number;
};

export type SegmentEffort = {
  id: number;
  name: string;
  elapsed_time: number;
  moving_time: number;
  start_date: string;
  start_date_local: string;
  distance: number;
  average_watts: number | null;
  average_heartrate: number | null;
  max_heartrate: number | null;
  segment: Segment;
  kom_rank: number | null;
  pr_rank: number | null;
  achievements: { type_id: number; type: string; rank: number }[];
};

export type Segment = {
  id: number;
  name: string;
  activity_type: string;
  distance: number;
  average_grade: number;
  maximum_grade: number;
  elevation_high: number;
  elevation_low: number;
  start_latlng: LatLng;
  end_latlng: LatLng;
  climb_category: number;
  city: string | null;
  state: string | null;
  country: string | null;
  private: boolean;
  starred: boolean;
  athlete_segment_stats: {
    pr_elapsed_time: number | null;
    pr_date: string | null;
    effort_count: number;
  } | null;
  total_elevation_gain: number;
  map: ActivityMap | null;
  effort_count: number;
  athlete_count: number;
  star_count: number;
  hazardous: boolean;
};

export type ExploreSegment = {
  id: number;
  name: string;
  climb_category: number;
  climb_category_desc: string;
  avg_grade: number;
  start_latlng: LatLng;
  end_latlng: LatLng;
  elev_difference: number;
  distance: number;
  points: string;
};

export type ExploreSegmentsResponse = {
  segments: ExploreSegment[];
};

export type Stream = {
  type: string;
  data: number[];
  series_type: string;
  original_size: number;
  resolution: string;
};

export type Route = {
  id: number;
  name: string;
  description: string | null;
  distance: number;
  elevation_gain: number;
  type: number;
  sub_type: number;
  private: boolean;
  starred: boolean;
  timestamp: number;
  map: ActivityMap | null;
  estimated_moving_time: number;
  segments: Segment[];
  created_at: string;
  updated_at: string;
};

export type Zone = {
  min: number;
  max: number;
};

export type ZoneRange = {
  custom_zones: boolean;
  zones: Zone[];
};

export type AthleteZones = {
  heart_rate: ZoneRange;
  power: ZoneRange | null;
};

export type ActivityTotal = {
  count: number;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  elevation_gain: number;
  achievement_count?: number;
};

export type AthleteStats = {
  biggest_ride_distance: number | null;
  biggest_climb_elevation_gain: number | null;
  recent_ride_totals: ActivityTotal;
  recent_run_totals: ActivityTotal;
  recent_swim_totals: ActivityTotal;
  ytd_ride_totals: ActivityTotal;
  ytd_run_totals: ActivityTotal;
  ytd_swim_totals: ActivityTotal;
  all_ride_totals: ActivityTotal;
  all_run_totals: ActivityTotal;
  all_swim_totals: ActivityTotal;
};
