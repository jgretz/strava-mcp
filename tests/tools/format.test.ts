import { describe, it, expect } from 'bun:test';
import { formatDuration, formatDistance } from '../../src/tools/format.ts';

describe('formatDuration', () => {
  it('should format seconds only', () => {
    expect(formatDuration(45)).toBe('0m 45s');
  });

  it('should format minutes and seconds', () => {
    expect(formatDuration(125)).toBe('2m 5s');
  });

  it('should format hours, minutes, and seconds', () => {
    expect(formatDuration(3661)).toBe('1h 1m 1s');
  });

  it('should handle zero', () => {
    expect(formatDuration(0)).toBe('0m 0s');
  });

  it('should handle exact hour', () => {
    expect(formatDuration(7200)).toBe('2h 0m 0s');
  });
});

describe('formatDistance', () => {
  it('should convert meters to km with 2 decimal places', () => {
    expect(formatDistance(1000)).toBe('1.00 km');
  });

  it('should handle fractional km', () => {
    expect(formatDistance(1500)).toBe('1.50 km');
  });

  it('should handle zero', () => {
    expect(formatDistance(0)).toBe('0.00 km');
  });

  it('should handle large distances', () => {
    expect(formatDistance(42195)).toBe('42.20 km');
  });
});
