import { stravaGet } from './client.ts';
import type { Result, Athlete, AthleteStats, AthleteZones } from '../types.ts';

export function getAthlete(): Promise<Result<Athlete, string>> {
  return stravaGet<Athlete>('/athlete');
}

export function getAthleteStats(athleteId: number): Promise<Result<AthleteStats, string>> {
  return stravaGet<AthleteStats>(`/athletes/${athleteId}/stats`);
}

export function getAthleteZones(): Promise<Result<AthleteZones, string>> {
  return stravaGet<AthleteZones>('/athlete/zones');
}
