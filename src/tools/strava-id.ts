import { z } from 'zod';

// Ids are strings because Strava ids may exceed 2^53: a JSON number that large
// is already rounded by the time it reaches us. Models still send all-digit ids
// unquoted, so a number is accepted while it is a safe integer, and rejected
// once it may have been rounded.
export function stravaIdSchema(entity: string) {
  const digits = z.string().regex(/^\d+$/, `${entity} ID must be a string of digits`);
  const safeNumber = z
    .number()
    .int()
    .nonnegative()
    .refine(Number.isSafeInteger, {
      message: `${entity} ID exceeds 2^53 and may be rounded; pass it as a quoted string`,
    })
    .transform(String);

  return z
    .union([digits, safeNumber])
    .describe(
      `Strava ${entity} ID. Pass the id_str (or id) value exactly as returned by Strava, as a quoted string.`,
    );
}
