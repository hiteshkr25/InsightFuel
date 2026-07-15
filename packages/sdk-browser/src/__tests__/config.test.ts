// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { configLoader } from '../core/config';

describe('Configuration Loader', () => {
  it('should throw errors for invalid configurations', () => {
    expect(() => configLoader.validate({ apiKey: '' })).toThrow('API Key is required');
    expect(() => configLoader.validate({ apiKey: 'some-key', samplingRate: -0.1 })).toThrow('samplingRate must be between 0.0 and 1.0');
    expect(() => configLoader.validate({ apiKey: 'some-key', flushIntervalMs: 200 })).toThrow('cannot be less than 500ms');
  });

  it('should initialize with correct default merges', async () => {
    const initialized = await configLoader.initialize({
      apiKey: 'test-api-key',
      samplingRate: 0.5,
    });

    expect(initialized.apiKey).toBe('test-api-key');
    expect(initialized.samplingRate).toBe(0.5);
    expect(initialized.apiHost).toBe('https://api.insightfuel.io');
    expect(initialized.resolvedAutocapture.clicks).toBe(true);
  });
});
