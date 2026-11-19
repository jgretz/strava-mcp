import type { StravaIds, WithStringId } from './types.ts';

// Fall back to the numeric id only for payloads that omit id_str. Below 2^53
// that is still exact; above it the numeric value was already rounded.
export function exactId(entity: StravaIds): string {
  return entity.id_str ?? String(entity.id);
}

export function withStringId<T extends StravaIds>(entity: T): WithStringId<T> {
  const { id: _id, id_str: _idStr, ...rest } = entity;
  return { ...rest, id: exactId(entity) };
}
