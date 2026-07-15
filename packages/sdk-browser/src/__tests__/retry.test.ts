// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { retry } from '../engines/retry';
import { bus } from '../core/bus';
import { transport } from '../engines/transport';

vi.mock('../engines/transport', () => ({
  transport: {
    send: vi.fn(() => Promise.resolve(true)),
    init: vi.fn(),
  },
}));

describe('Retry Engine', () => {
  beforeEach(() => {
    bus.clear();
    localStorage.clear();
  });

  it('should attempt direct send when online', async () => {
    retry.init();

    const mockEvent = {
      event_id: '1',
      event_name: 'test_event',
      category: 'custom' as const,
      distinct_id: 'user',
      project_id: 'test-api-key',
      timestamp: new Date().toISOString(),
    };

    bus.publish('buffer:flush', { batch: [mockEvent] });

    expect(transport.send).toHaveBeenCalledWith([mockEvent]);
  });
});
