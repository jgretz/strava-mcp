import { stravaGet } from './client.ts';
import type { Result, Gear } from '../types.ts';

export function getGear(id: string): Promise<Result<Gear, string>> {
  return stravaGet<Gear>(`/gear/${id}`);
}
