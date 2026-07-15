// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { bus } from '../core/bus';
import { buffer } from '../engines/buffer';
import { InsightFuelEvent } from '../types';

describe('Buffer Queue Engine', () => {
  beforeEach(() => {
    bus.clear();
  });

  it('should flush immediately when batch size threshold is met', () => {
    const flushMock = vi.fn();
    bus.subscribe('buffer:flush', flushMock);

    // Mock runtime configuration values
    buffer.init({
      apiKey: 'test-api-key',
      apiHost: 'https://api.insightfuel.io',
      autocapture: true,
      resolvedAutocapture: {
        clicks: true,
        forms: true,
        scrolls: true,
        views: true,
        errors: true,
        performance: true,
        clipboard: false,
        downloads: true,
      },
      respectDNT: false,
      samplingRate: 1.0,
      blacklistSelectors: [],
      properties: {},
      debug: false,
      requestSigningKey: '',
      flushIntervalMs: 10000,
      batchSize: 2, // Flush on 2 events
    });

    const mockEvent: InsightFuelEvent = {
      event_id: '1',
      event_name: 'test_event',
      category: 'custom',
      distinct_id: 'user',
      project_id: 'test-api-key',
      timestamp: new Date().toISOString(),
    };

    buffer.add(mockEvent);
    expect(flushMock).not.toHaveBeenCalled();

    buffer.add(mockEvent);
    expect(flushMock).toHaveBeenCalledTimes(1);
  });
});
