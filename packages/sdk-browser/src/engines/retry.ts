import { InsightFuelEvent } from '../types';
import { bus } from '../core/bus';
import { transport } from './transport';
import { pluginManager } from '../core/plugin';

interface RetryBatch {
  id: string;
  attempts: number;
  nextRetryTime: number;
  events: InsightFuelEvent[];
}

export class RetryEngine {
  private static instance: RetryEngine;
  private isOnline = true;
  private retryQueue: RetryBatch[] = [];
  private retryTimer?: any;

  private constructor() {}

  public static getInstance(): RetryEngine {
    if (!RetryEngine.instance) {
      RetryEngine.instance = new RetryEngine();
    }
    return RetryEngine.instance;
  }

  public init(): void {
    
    if (typeof window !== 'undefined') {
      this.isOnline = navigator.onLine ?? true;
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);
    }

    this.loadRetryQueue();

    // Listen to buffer flushes
    bus.subscribe('buffer:flush', async ({ batch }) => {
      await this.processBatch(batch);
    });

    this.startRetryScheduler();
  }

  private async processBatch(batch: InsightFuelEvent[]): Promise<void> {
    // Run plugin hooks
    const processedBatch = pluginManager.runBeforeFlush(batch);
    if (processedBatch.length === 0) return;

    if (!this.isOnline) {
      bus.publish('diagnostics:log', { level: 'warn', message: 'Client offline. Spooling events for retry.' });
      this.spoolBatch(processedBatch);
      return;
    }

    const success = await transport.send(processedBatch);
    pluginManager.runAfterFlush(processedBatch, success);

    if (!success) {
      bus.publish('diagnostics:log', { level: 'warn', message: 'Transport send failed. Spooling batch for retry.' });
      this.spoolBatch(processedBatch);
    }
  }

  private spoolBatch(events: InsightFuelEvent[]): void {
    const batchId = `rb_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newBatch: RetryBatch = {
      id: batchId,
      attempts: 0,
      nextRetryTime: Date.now() + 2000, // 2s initial delay
      events,
    };

    this.retryQueue.push(newBatch);
    this.saveRetryQueue();
  }

  private async processRetryQueue(): Promise<void> {
    if (this.retryQueue.length === 0 || !this.isOnline) return;

    const now = Date.now();
    const readyBatches = this.retryQueue.filter((b) => b.nextRetryTime <= now);

    for (const batch of readyBatches) {
      batch.attempts += 1;
      
      bus.publish('diagnostics:log', {
        level: 'info',
        message: `Retrying batch ${batch.id}. Attempt #${batch.attempts}`,
      });

      const success = await transport.send(batch.events);
      if (success) {
        // Remove from queue
        this.retryQueue = this.retryQueue.filter((b) => b.id !== batch.id);
        bus.publish('diagnostics:log', { level: 'info', message: `Batch ${batch.id} delivered on retry.` });
      } else {
        if (batch.attempts >= 5) {
          // Drop batch
          this.retryQueue = this.retryQueue.filter((b) => b.id !== batch.id);
          bus.publish('diagnostics:log', {
            level: 'error',
            message: `Batch ${batch.id} exceeded maximum retries. Dropping events.`,
          });
        } else {
          // Calculate exponential delay: 2s, 4s, 8s, 16s...
          const delay = Math.pow(2, batch.attempts) * 2000;
          batch.nextRetryTime = Date.now() + delay;
          bus.publish('diagnostics:log', {
            level: 'warn',
            message: `Retry failed for batch ${batch.id}. Rescheduling in ${delay}ms.`,
          });
        }
      }
    }

    this.saveRetryQueue();
  }

  private loadRetryQueue(): void {
    try {
      const stored = localStorage.getItem('if_retry_queue');
      if (stored) {
        this.retryQueue = JSON.parse(stored);
      }
    } catch {
      // Ignore
    }
  }

  private saveRetryQueue(): void {
    try {
      localStorage.setItem('if_retry_queue', JSON.stringify(this.retryQueue));
    } catch {
      // Ignore
    }
  }

  private startRetryScheduler(): void {
    if (this.retryTimer) clearInterval(this.retryTimer);
    this.retryTimer = setInterval(async () => {
      await this.processRetryQueue();
    }, 5000); // Check queue every 5s
  }

  private handleOnline = (): void => {
    this.isOnline = true;
    bus.publish('network:online', undefined);
    bus.publish('diagnostics:log', { level: 'info', message: 'Client network online. Flushing retry queue.' });
    this.processRetryQueue();
  };

  private handleOffline = (): void => {
    this.isOnline = false;
    bus.publish('network:offline', undefined);
    bus.publish('diagnostics:log', { level: 'warn', message: 'Client network offline.' });
  };

  public shutdown(): void {
    if (this.retryTimer) clearInterval(this.retryTimer);
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline);
      window.removeEventListener('offline', this.handleOffline);
    }
  }
}

export const retry = RetryEngine.getInstance();
