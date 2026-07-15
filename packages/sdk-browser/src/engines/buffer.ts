import { RuntimeConfig, InsightFuelEvent } from '../types';
import { bus } from '../core/bus';

export class BufferEngine {
  private static instance: BufferEngine;
  private queue: InsightFuelEvent[] = [];
  private config?: RuntimeConfig;
  private flushTimer?: any;

  private constructor() {}

  public static getInstance(): BufferEngine {
    if (!BufferEngine.instance) {
      BufferEngine.instance = new BufferEngine();
    }
    return BufferEngine.instance;
  }

  public init(config: RuntimeConfig): void {
    this.config = config;
    this.startFlushTimer();

    // Listen to sanitized events on the bus
    bus.subscribe('event:sanitized', (event) => {
      this.add(event);
    });

    // Listen to window beforeunload to flush remaining events
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => this.flush(true));
      window.addEventListener('pagehide', () => this.flush(true));
    }
  }

  public add(event: InsightFuelEvent): void {
    this.queue.push(event);

    if (this.config && this.queue.length >= this.config.batchSize) {
      bus.publish('diagnostics:log', { level: 'info', message: 'Batch size threshold met. Flushing.' });
      this.flush();
    }
  }

  public flush(isUnload = false): void {
    if (this.queue.length === 0) return;

    const batch = [...this.queue];
    this.queue = [];

    // Publish to the event bus for transport/retry systems to capture
    bus.publish('buffer:flush', { batch, isUnload });
  }

  private startFlushTimer(): void {
    if (this.flushTimer) clearInterval(this.flushTimer);

    const interval = this.config?.flushIntervalMs ?? 10000;
    this.flushTimer = setInterval(() => {
      this.flush();
    }, interval);
  }

  public shutdown(): void {
    if (this.flushTimer) clearInterval(this.flushTimer);
    this.flush(); // final flush
  }
}

export const buffer = BufferEngine.getInstance();
