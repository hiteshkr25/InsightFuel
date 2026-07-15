import { describe, it, expect } from 'vitest';
import { generateUUID, getUTCTimestamp, isObject } from './index';

describe('Shared Utilities Mocks', () => {
  it('should generate a valid UUID shape', () => {
    const uuid = generateUUID();
    expect(uuid).toBeTypeOf('string');
    expect(uuid.length).toBe(36);
    expect(uuid.split('-').length).toBe(5);
  });

  it('should return a UTC ISO timestamp', () => {
    const timestamp = getUTCTimestamp();
    expect(timestamp).toContain('Z');
    expect(new Date(timestamp).getTime()).not.toBeNaN();
  });

  it('should identify plain objects correctly', () => {
    expect(isObject({ key: 'value' })).toBe(true);
    expect(isObject([1, 2, 3])).toBe(false);
    expect(isObject(null)).toBe(false);
    expect(isObject('string')).toBe(false);
  });
});
