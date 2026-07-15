import { Config, RuntimeConfig, AutocaptureOptions } from '../types';
import { bus } from './bus';

const DEFAULT_FLUSH_INTERVAL = 10000;
const DEFAULT_BATCH_SIZE = 50;

const DEFAULT_CONFIG: Omit<RuntimeConfig, 'apiKey'> = {
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
  flushIntervalMs: DEFAULT_FLUSH_INTERVAL,
  batchSize: DEFAULT_BATCH_SIZE,
};

export class ConfigLoader {
  private static instance: ConfigLoader;
  private currentConfig?: RuntimeConfig;

  private constructor() {}

  public static getInstance(): ConfigLoader {
    if (!ConfigLoader.instance) {
      ConfigLoader.instance = new ConfigLoader();
    }
    return ConfigLoader.instance;
  }

  public get(): RuntimeConfig {
    if (!this.currentConfig) {
      throw new Error('[InsightFuel] SDK has not been initialized. Call init() first.');
    }
    return this.currentConfig;
  }

  public validate(config: Partial<Config>): void {
    if (!config.apiKey || typeof config.apiKey !== 'string' || config.apiKey.trim() === '') {
      throw new Error('[InsightFuel] API Key is required for initialization.');
    }
    if (config.samplingRate !== undefined) {
      if (config.samplingRate < 0 || config.samplingRate > 1) {
        throw new Error('[InsightFuel] Config samplingRate must be between 0.0 and 1.0');
      }
    }
    if (config.flushIntervalMs !== undefined && config.flushIntervalMs < 500) {
      throw new Error('[InsightFuel] Config flushIntervalMs cannot be less than 500ms');
    }
  }

  public async initialize(localConfig: Config): Promise<RuntimeConfig> {
    this.validate(localConfig);

    const merged = this.mergeConfigs(DEFAULT_CONFIG, localConfig);
    this.currentConfig = merged;

    // Trigger local config loaded on the bus
    bus.publish('config:loaded', this.currentConfig);
    bus.publish('diagnostics:log', { level: 'info', message: 'SDK Local Configuration Loaded successfully.' });

    // Asynchronously try fetching remote configuration and update if successful
    this.fetchRemoteConfig(merged).catch((err) => {
      bus.publish('diagnostics:log', {
        level: 'warn',
        message: 'Could not fetch remote configuration, falling back to local merge.',
        details: err.message,
      });
    });

    return this.currentConfig;
  }

  private mergeConfigs(base: Omit<RuntimeConfig, 'apiKey'>, input: Config): RuntimeConfig {
    const autocaptureResolved: Required<AutocaptureOptions> = { ...base.resolvedAutocapture };

    if (typeof input.autocapture === 'boolean') {
      const val = input.autocapture;
      Object.keys(autocaptureResolved).forEach((key) => {
        (autocaptureResolved as any)[key] = val;
      });
    } else if (typeof input.autocapture === 'object' && input.autocapture !== null) {
      Object.assign(autocaptureResolved, input.autocapture);
    }

    return {
      apiKey: input.apiKey,
      apiHost: input.apiHost ?? base.apiHost,
      autocapture: input.autocapture ?? base.autocapture,
      resolvedAutocapture: autocaptureResolved,
      respectDNT: input.respectDNT ?? base.respectDNT,
      samplingRate: input.samplingRate ?? base.samplingRate,
      blacklistSelectors: input.blacklistSelectors ?? base.blacklistSelectors,
      properties: { ...base.properties, ...input.properties },
      debug: input.debug ?? base.debug,
      requestSigningKey: input.requestSigningKey ?? base.requestSigningKey,
      flushIntervalMs: input.flushIntervalMs ?? base.flushIntervalMs,
      batchSize: input.batchSize ?? base.batchSize,
    };
  }

  private async fetchRemoteConfig(current: RuntimeConfig): Promise<void> {
    const cacheKey = `if_config_${current.apiKey}`;
    const cacheExpiryKey = `if_config_expiry_${current.apiKey}`;
    
    // Check local storage configuration cache
    try {
      const cached = localStorage.getItem(cacheKey);
      const expiry = localStorage.getItem(cacheExpiryKey);
      if (cached && expiry && Date.now() < parseInt(expiry, 10)) {
        const remoteData = JSON.parse(cached);
        this.updateConfigWithRemote(remoteData);
        return;
      }
    } catch {
      // Ignore localStorage issues
    }

    // Call configuration endpoint
    const url = `${current.apiHost}/api/v1/config?apiKey=${current.apiKey}`;
    try {
      const response = await fetch(url, { method: 'GET', mode: 'cors' });
      if (response.ok) {
        const remoteData = await response.json();
        
        // Cache configuration for 1 hour
        try {
          localStorage.setItem(cacheKey, JSON.stringify(remoteData));
          localStorage.setItem(cacheExpiryKey, (Date.now() + 3600000).toString());
        } catch {
          // Ignore write failures
        }

        this.updateConfigWithRemote(remoteData);
      }
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Network failure');
    }
  }

  private updateConfigWithRemote(remoteData: any): void {
    if (!this.currentConfig || !remoteData) return;

    const updated = this.mergeConfigs(this.currentConfig, remoteData);
    this.currentConfig = updated;

    bus.publish('config:loaded', this.currentConfig);
    bus.publish('diagnostics:log', { level: 'info', message: 'SDK Configuration updated with remote settings.' });
  }
}

export const configLoader = ConfigLoader.getInstance();
