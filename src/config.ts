export const STRAVA_BASE_URL = 'https://www.strava.com/api/v3';
export const STRAVA_AUTH_URL = 'https://www.strava.com/oauth/authorize';
export const STRAVA_TOKEN_URL = 'https://www.strava.com/oauth/token';

export const STREAM_KEYS = [
  'time',
  'distance',
  'latlng',
  'altitude',
  'velocity_smooth',
  'heartrate',
  'cadence',
  'watts',
  'temp',
  'moving',
  'grade_smooth',
] as const;

export type StreamKey = (typeof STREAM_KEYS)[number];
