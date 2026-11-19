import { describe, it, expect } from 'bun:test';
import { exactId, withStringId } from '../src/ids.ts';

// Real route id from list_athlete_routes; JSON.parse rounds it to ...922400
const ROUTE_ID = '3546500041732922368';
const parsed = JSON.parse(`{"id":${ROUTE_ID},"id_str":"${ROUTE_ID}","name":"Loop"}`);

describe('exactId', () => {
  it('should return id_str when the numeric id was rounded by JSON.parse', () => {
    expect(String(parsed.id)).not.toBe(ROUTE_ID);

    expect(exactId(parsed)).toBe(ROUTE_ID);
  });

  it('should fall back to the numeric id when id_str is absent', () => {
    const entity = { id: 42 } as { id: number; id_str: string };

    expect(exactId(entity)).toBe('42');
  });
});

describe('withStringId', () => {
  it('should replace the numeric id with the exact string id and drop id_str', () => {
    const result = withStringId(parsed);

    expect(result).toEqual({ id: ROUTE_ID, name: 'Loop' });
  });
});
