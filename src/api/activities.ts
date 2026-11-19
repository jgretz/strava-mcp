import { stravaGet, stravaPut } from './client.ts';
import type { Result, Activity, UpdatableActivity, Lap, Stream } from '../types.ts';

type ListActivitiesOpts = {
  page?: number;
  perPage?: number;
  before?: number;
  after?: number;
};

export function listActivities(opts: ListActivitiesOpts = {}): Promise<Result<Activity[], string>> {
  const params: Record<string, string> = {};
  if (opts.page !== undefined) params.page = String(opts.page);
  if (opts.perPage !== undefined) params.per_page = String(opts.perPage);
  if (opts.before !== undefined) params.before = String(opts.before);
  if (opts.after !== undefined) params.after = String(opts.after);
  return stravaGet<Activity[]>('/athlete/activities', params);
}

export function getActivity(id: string): Promise<Result<Activity, string>> {
  return stravaGet<Activity>(`/activities/${id}`);
}

export function getActivityStreams(id: string, keys: string[]): Promise<Result<Stream[], string>> {
  return stravaGet<Stream[]>(`/activities/${id}/streams`, {
    keys: keys.join(','),
    key_type: 'time',
  });
}

export function getActivityLaps(id: string): Promise<Result<Lap[], string>> {
  return stravaGet<Lap[]>(`/activities/${id}/laps`);
}

export function updateActivity(id: string, data: UpdatableActivity): Promise<Result<Activity, string>> {
  return stravaPut<Activity>(`/activities/${id}`, data);
}
