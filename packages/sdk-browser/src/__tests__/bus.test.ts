import { describe, it, expect, vi } from 'vitest';
import { bus } from '../core/bus';

describe('Event Bus Pub/Sub Core', () => {
  it('should deliver messages successfully to subscribers', () => {
    const callback = vi.fn();
    const unsubscribe = bus.subscribe('network:offline', callback);

    bus.publish('network:offline', undefined);

    expect(callback).toHaveBeenCalledTimes(1);
    unsubscribe();
  });

  it('should not notify subscribers after they unsubscribe', () => {
    const callback = vi.fn();
    const unsubscribe = bus.subscribe('network:online', callback);

    unsubscribe();
    bus.publish('network:online', undefined);

    expect(callback).not.toHaveBeenCalled();
  });
});
