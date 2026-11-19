import { z } from 'zod';

// Ids are strings because Strava ids may exceed 2^53: a JSON number that large
// is already rounded by the time it reaches us, so numbers are rejected.
export function stravaIdSchema(entity: string) {
  return z
    .string()
    .regex(/^\d+$/, `${entity} ID must be a string of digits`)
    .describe(
      `Strava ${entity} ID as a string of digits. Pass the id_str (or id) value exactly as returned by Strava, quoted, never as a number.`,
    );
}
