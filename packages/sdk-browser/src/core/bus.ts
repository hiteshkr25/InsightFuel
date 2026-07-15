import { BusTopic, BusMessagePayload } from '../types';

type BusCallback<T extends BusTopic> = (payload: BusMessagePayload[T]) => void;

export class EventBus {
  private static instance: EventBus;
  private listeners: { [K in BusTopic]?: Set<BusCallback<any>> } = {};

  private constructor() {}

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  public subscribe<T extends BusTopic>(topic: T, callback: BusCallback<T>): () => void {
    if (!this.listeners[topic]) {
      this.listeners[topic] = new Set();
    }
    this.listeners[topic]!.add(callback);

    // Return an unsubscribe function for cleanup
    return () => {
      this.listeners[topic]?.delete(callback);
    };
  }

  public publish<T extends BusTopic>(topic: T, payload: BusMessagePayload[T]): void {
    const list = this.listeners[topic];
    if (list) {
      list.forEach((cb) => {
        try {
          cb(payload);
        } catch (error) {
          console.error(`[InsightFuel EventBus] Error in listener for topic ${topic}:`, error);
        }
      });
    }
  }

  public clear(): void {
    this.listeners = {};
  }
}

export const bus = EventBus.getInstance();
