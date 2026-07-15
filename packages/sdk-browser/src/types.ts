export interface AutocaptureOptions {
  clicks?: boolean;
  forms?: boolean;
  scrolls?: boolean;
  views?: boolean;
  errors?: boolean;
  performance?: boolean;
  clipboard?: boolean;
  downloads?: boolean;
}

export interface Config {
  apiKey: string;
  apiHost?: string;
  autocapture?: boolean | AutocaptureOptions;
  respectDNT?: boolean;
  samplingRate?: number; // 0.0 to 1.0
  blacklistSelectors?: string[];
  properties?: Record<string, any>;
  debug?: boolean;
  requestSigningKey?: string;
  flushIntervalMs?: number;
  batchSize?: number;
}

export interface RuntimeConfig extends Required<Config> {
  resolvedAutocapture: Required<AutocaptureOptions>;
}

export interface InsightFuelEvent {
  event_id: string;
  event_name: string;
  category: 'navigation' | 'feature' | 'session' | 'performance' | 'error' | 'business' | 'system' | 'user' | 'custom';
  distinct_id: string;
  project_id: string;
  timestamp: string;
  properties?: Record<string, any>;
  properties_num?: Record<string, number>;
  context?: {
    url?: string;
    referrer?: string;
    browser?: string;
    os?: string;
    device?: string;
    session_id?: string;
    sdk_version?: string;
    screen_width?: number;
    screen_height?: number;
    viewport_width?: number;
    viewport_height?: number;
    language?: string;
  };
}

export interface PluginLifecycleHooks {
  onInit?: (config: RuntimeConfig) => void;
  onBeforeCapture?: (event: InsightFuelEvent) => InsightFuelEvent | null | void;
  onAfterCapture?: (event: InsightFuelEvent) => void;
  onBeforeFlush?: (batch: InsightFuelEvent[]) => InsightFuelEvent[] | null | void;
  onAfterFlush?: (batch: InsightFuelEvent[], success: boolean) => void;
  onShutdown?: () => void;
}

export interface InsightFuelPlugin {
  name: string;
  hooks: PluginLifecycleHooks;
}

// Internal Event Bus Message definitions
export type BusTopic =
  | 'config:loaded'
  | 'event:captured'
  | 'event:sanitized'
  | 'session:started'
  | 'session:heartbeat'
  | 'identity:changed'
  | 'buffer:flush'
  | 'network:offline'
  | 'network:online'
  | 'diagnostics:log';

export interface BusMessagePayload {
  'config:loaded': RuntimeConfig;
  'event:captured': InsightFuelEvent;
  'event:sanitized': InsightFuelEvent;
  'session:started': { sessionId: string; distinctId: string };
  'session:heartbeat': { sessionId: string };
  'identity:changed': { distinctId: string; anonymousId: string; type: 'identify' | 'reset' };
  'buffer:flush': { batch: InsightFuelEvent[]; isUnload?: boolean };
  'network:offline': void;
  'network:online': void;
  'diagnostics:log': { level: 'info' | 'warn' | 'error'; message: string; details?: any };
}
