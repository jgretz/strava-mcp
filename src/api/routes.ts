import { stravaGet, stravaGetText } from './client.ts';
import type { Result, Route } from '../types.ts';

export function getRoute(id: number): Promise<Result<Route, string>> {
  return stravaGet<Route>(`/routes/${id}`);
}

type ListRoutesOpts = {
  page?: number;
  perPage?: number;
};

export function listAthleteRoutes(athleteId: number, opts: ListRoutesOpts = {}): Promise<Result<Route[], string>> {
  const params: Record<string, string> = {};
  if (opts.page !== undefined) params.page = String(opts.page);
  if (opts.perPage !== undefined) params.per_page = String(opts.perPage);
  return stravaGet<Route[]>(`/athletes/${athleteId}/routes`, params);
}

export function exportRouteGpx(id: number): Promise<Result<string, string>> {
  return stravaGetText(`/routes/${id}/export_gpx`);
}

export function exportRouteTcx(id: number): Promise<Result<string, string>> {
  return stravaGetText(`/routes/${id}/export_tcx`);
}
