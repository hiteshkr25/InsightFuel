import { Config, RuntimeConfig, InsightFuelEvent, InsightFuelPlugin } from './types';
import { bus } from './core/bus';
import { configLoader } from './core/config';
import { diagnostics } from './core/diagnostics';
import { pluginManager } from './core/plugin';
import { privacy } from './engines/privacy';
import { transport } from './engines/transport';
import { identity } from './engines/identity';
import { session } from './engines/session';
import { buffer } from './engines/buffer';
import { retry } from './engines/retry';
import { featureDetection } from './engines/feature';
import { autoCapture } from './engines/autocapture';

export class InsightFuelSDK {
  private static instance: InsightFuelSDK;
  private config?: RuntimeConfig;
  private isInitialized = false;
  private eventCleanup: (() => void)[] = [];

  private constructor() {}

  public static getInstance(): InsightFuelSDK {
    if (!InsightFuelSDK.instance) {
      InsightFuelSDK.instance = new InsightFuelSDK();
    }
    return InsightFuelSDK.instance;
  }

  public async init(options: Config): Promise<void> {
    if (this.isInitialized) {
      bus.publish('diagnostics:log', { level: 'warn', message: 'InsightFuel SDK is already initialized.' });
      return;
    }

    // Initialize diagnostics first
    diagnostics.init();

    // 1. Load Configurations
    try {
      this.config = await configLoader.initialize(options);
    } catch (err) {
      console.error('[InsightFuel] Initialization failed:', err);
      return;
    }

    // Bind debug mode to window object for diagnostics logger inspects
    if (typeof window !== 'undefined') {
      (window as any).__InsightFuelDebug__ = this.config.debug;
    }

    // 2. Initialize Core Subsystems
    privacy.init(this.config);
    pluginManager.init(this.config);
    transport.init(this.config);
    identity.init();
    session.init();
    buffer.init(this.config);
    retry.init();

    // 3. Register Event Processor pipelines on the Bus
    const unsub = bus.subscribe('event:captured', (rawEvent) => {
      this.processCapturedEvent(rawEvent);
    });
    this.eventCleanup.push(unsub);

    // 4. Initialize Capture Engines (DOM listeners)
    if (this.config.respectDNT && privacy.checkDNT()) {
      bus.publish('diagnostics:log', {
        level: 'info',
        message: 'DNT header detected and respectDNT is enabled. Autocapture disabled.',
      });
    } else if (!privacy.isTrackingAllowed()) {
      bus.publish('diagnostics:log', {
        level: 'info',
        message: 'Consent check failed (User Opted Out). Autocapture disabled.',
      });
    } else {
      featureDetection.init(this.config);
      autoCapture.init(this.config);
    }

    this.isInitialized = true;
    bus.publish('diagnostics:log', { level: 'info', message: 'InsightFuel Browser SDK fully initialized.' });
  }

  private processCapturedEvent(event: InsightFuelEvent): void {
    if (!this.config) return;

    // Check tracking permissions
    if (!privacy.isTrackingAllowed()) {
      return;
    }

    // Evaluate sampling rate: deterministic random drop
    if (this.config.samplingRate < 1.0) {
      // Determinstically slice by uuid suffix mapping to double float value
      const suffix = event.event_id.slice(-4);
      const val = parseInt(suffix, 16) / 65535;
      if (val > this.config.samplingRate) {
        return; // Dropped by sampler
      }
    }

    // Scrub event metadata properties for sensitive info
    const sanitizedProps = privacy.sanitizeEventProperties(event.properties);
    const sanitizedEvent: InsightFuelEvent = {
      ...event,
      properties: sanitizedProps,
    };

    // Run plugin beforeCapture hooks
    const finalEvent = pluginManager.runBeforeCapture(sanitizedEvent);
    if (!finalEvent) return; // Dropped by plugin filter

    // Route event to buffer queues
    bus.publish('event:sanitized', finalEvent);

    // Run plugin afterCapture hooks
    pluginManager.runAfterCapture(finalEvent);
  }

  public track(eventName: string, properties?: Record<string, any>): void {
    if (!this.isInitialized || !this.config) {
      console.warn('[InsightFuel] Cannot call track() before init().');
      return;
    }

    const payload: InsightFuelEvent = {
      event_id: this.generateUUID(),
      event_name: eventName,
      category: 'custom',
      distinct_id: identity.getDistinctId(),
      project_id: this.config.apiKey,
      timestamp: new Date().toISOString(),
      properties,
      context: {
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        referrer: typeof document !== 'undefined' ? document.referrer : undefined,
        session_id: session.getSessionId(),
        sdk_version: '1.0.0',
        language: typeof navigator !== 'undefined' ? navigator.language : undefined,
      },
    };

    bus.publish('event:captured', payload);
  }

  public identify(distinctId: string, properties?: Record<string, any>): void {
    identity.identify(distinctId, properties);
  }

  public group(groupId: string, properties?: Record<string, any>): void {
    this.track('group', { group_id: groupId, ...properties });
  }

  public reset(): void {
    identity.reset();
  }

  public page(): void {
    if (typeof window === 'undefined') return;
    this.track('page_view', {
      url: window.location.href,
      path: window.location.pathname,
      title: document.title,
      referrer: document.referrer,
    });
  }

  public optIn(): void {
    privacy.optIn();
  }

  public optOut(): void {
    privacy.optOut();
  }

  public registerPlugin(plugin: InsightFuelPlugin): void {
    pluginManager.register(plugin);
  }

  public getDiagnostics(): Record<string, any> {
    return {
      status: diagnostics.getStatus(),
      logs: diagnostics.getLogs(),
      plugins: pluginManager.getPlugins().map((p) => p.name),
    };
  }

  public shutdown(): void {
    bus.publish('diagnostics:log', { level: 'info', message: 'SDK Shutting down.' });

    // Tear down listeners
    autoCapture.shutdown();
    featureDetection.shutdown();
    buffer.shutdown();
    retry.shutdown();
    session.shutdown();
    pluginManager.shutdown();

    this.eventCleanup.forEach((unsub) => unsub());
    this.eventCleanup = [];

    bus.clear();
    diagnostics.clear();

    this.isInitialized = false;
    this.config = undefined;
  }

  private generateUUID(): string {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
      return window.crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}

export const InsightFuel = InsightFuelSDK.getInstance();
export default InsightFuel;
