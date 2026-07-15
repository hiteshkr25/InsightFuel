import { InsightFuelPlugin, RuntimeConfig, InsightFuelEvent } from '../types';
import { bus } from './bus';

export class PluginManager {
  private static instance: PluginManager;
  private plugins: Map<string, InsightFuelPlugin> = new Map();
  private config?: RuntimeConfig;

  private constructor() {}

  public static getInstance(): PluginManager {
    if (!PluginManager.instance) {
      PluginManager.instance = new PluginManager();
    }
    return PluginManager.instance;
  }

  public register(plugin: InsightFuelPlugin): void {
    if (!plugin.name) {
      bus.publish('diagnostics:log', { level: 'error', message: 'Attempted to register anonymous plugin.' });
      return;
    }
    
    if (this.plugins.has(plugin.name)) {
      bus.publish('diagnostics:log', {
        level: 'warn',
        message: `Plugin "${plugin.name}" is already registered. Overwriting.`,
      });
    }

    this.plugins.set(plugin.name, plugin);
    bus.publish('diagnostics:log', { level: 'info', message: `Plugin "${plugin.name}" registered successfully.` });

    // If config is already initialized, call onInit immediately
    if (this.config && plugin.hooks.onInit) {
      try {
        plugin.hooks.onInit(this.config);
      } catch (err) {
        bus.publish('diagnostics:log', {
          level: 'error',
          message: `Plugin "${plugin.name}" failed onInit.`,
          details: err instanceof Error ? err.message : err,
        });
      }
    }
  }

  public init(config: RuntimeConfig): void {
    this.config = config;
    this.plugins.forEach((plugin) => {
      if (plugin.hooks.onInit) {
        try {
          plugin.hooks.onInit(config);
        } catch (err) {
          bus.publish('diagnostics:log', {
            level: 'error',
            message: `Plugin "${plugin.name}" failed onInit.`,
            details: err instanceof Error ? err.message : err,
          });
        }
      }
    });
  }

  public runBeforeCapture(event: InsightFuelEvent): InsightFuelEvent | null {
    let currentEvent: InsightFuelEvent | null = event;
    
    for (const plugin of this.plugins.values()) {
      if (plugin.hooks.onBeforeCapture) {
        try {
          const processed = plugin.hooks.onBeforeCapture(currentEvent);
          if (processed === null) {
            bus.publish('diagnostics:log', {
              level: 'info',
              message: `Event "${currentEvent.event_name}" dropped by plugin "${plugin.name}".`,
            });
            return null;
          }
          if (processed) {
            currentEvent = processed;
          }
        } catch (err) {
          bus.publish('diagnostics:log', {
            level: 'error',
            message: `Plugin "${plugin.name}" threw during onBeforeCapture.`,
            details: err instanceof Error ? err.message : err,
          });
        }
      }
    }
    
    return currentEvent;
  }

  public runAfterCapture(event: InsightFuelEvent): void {
    this.plugins.forEach((plugin) => {
      if (plugin.hooks.onAfterCapture) {
        try {
          plugin.hooks.onAfterCapture(event);
        } catch (err) {
          bus.publish('diagnostics:log', {
            level: 'error',
            message: `Plugin "${plugin.name}" threw during onAfterCapture.`,
            details: err instanceof Error ? err.message : err,
          });
        }
      }
    });
  }

  public runBeforeFlush(batch: InsightFuelEvent[]): InsightFuelEvent[] {
    let currentBatch = [...batch];
    
    for (const plugin of this.plugins.values()) {
      if (plugin.hooks.onBeforeFlush) {
        try {
          const processed = plugin.hooks.onBeforeFlush(currentBatch);
          if (processed === null) {
            return [];
          }
          if (processed) {
            currentBatch = processed;
          }
        } catch (err) {
          bus.publish('diagnostics:log', {
            level: 'error',
            message: `Plugin "${plugin.name}" threw during onBeforeFlush.`,
            details: err instanceof Error ? err.message : err,
          });
        }
      }
    }
    
    return currentBatch;
  }

  public runAfterFlush(batch: InsightFuelEvent[], success: boolean): void {
    this.plugins.forEach((plugin) => {
      if (plugin.hooks.onAfterFlush) {
        try {
          plugin.hooks.onAfterFlush(batch, success);
        } catch (err) {
          bus.publish('diagnostics:log', {
            level: 'error',
            message: `Plugin "${plugin.name}" threw during onAfterFlush.`,
            details: err instanceof Error ? err.message : err,
          });
        }
      }
    });
  }

  public shutdown(): void {
    this.plugins.forEach((plugin) => {
      if (plugin.hooks.onShutdown) {
        try {
          plugin.hooks.onShutdown();
        } catch (err) {
          console.error(`[InsightFuel PluginManager] Shutdown error in plugin "${plugin.name}":`, err);
        }
      }
    });
    this.plugins.clear();
    this.config = undefined;
  }

  public getPlugins(): InsightFuelPlugin[] {
    return Array.from(this.plugins.values());
  }
}

export const pluginManager = PluginManager.getInstance();
