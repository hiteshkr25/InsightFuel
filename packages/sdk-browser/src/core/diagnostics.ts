import { bus } from './bus';

export interface DiagnosticLog {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  details?: any;
}

export class DiagnosticsManager {
  private static instance: DiagnosticsManager;
  private logs: DiagnosticLog[] = [];
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): DiagnosticsManager {
    if (!DiagnosticsManager.instance) {
      DiagnosticsManager.instance = new DiagnosticsManager();
    }
    return DiagnosticsManager.instance;
  }

  public init(): void {
    if (this.isInitialized) return;
    this.isInitialized = true;

    bus.subscribe('diagnostics:log', (log) => {
      const entry: DiagnosticLog = {
        timestamp: new Date().toISOString(),
        level: log.level,
        message: log.message,
        details: log.details,
      };

      // Cache up to 100 entries
      this.logs.push(entry);
      if (this.logs.length > 100) {
        this.logs.shift();
      }

      // Mirror to console if configLoader is in debug mode
      // We read from configLoader dynamically to prevent dependency cycles
      try {
        const debugMode = (window as any).__InsightFuelDebug__ || false;
        if (debugMode) {
          const prefix = `[InsightFuel Diagnostics] [${entry.level.toUpperCase()}]`;
          if (entry.level === 'error') {
            console.error(prefix, entry.message, entry.details || '');
          } else if (entry.level === 'warn') {
            console.warn(prefix, entry.message, entry.details || '');
          } else {
            console.log(prefix, entry.message, entry.details || '');
          }
        }
      } catch {
        // Safe console guard
      }
    });
  }

  public getLogs(): DiagnosticLog[] {
    return [...this.logs];
  }

  public checkCapabilities(): Record<string, boolean> {
    const hasWindow = typeof window !== 'undefined';
    return {
      fetch: hasWindow && 'fetch' in window,
      beacon: hasWindow && 'sendBeacon' in navigator,
      localStorage: (() => {
        try {
          return hasWindow && 'localStorage' in window && window.localStorage !== null;
        } catch {
          return false;
        }
      })(),
      sessionStorage: (() => {
        try {
          return hasWindow && 'sessionStorage' in window && window.sessionStorage !== null;
        } catch {
          return false;
        }
      })(),
      mutationObserver: hasWindow && 'MutationObserver' in window,
      cookie: hasWindow && 'cookie' in document,
    };
  }

  public getStatus(): Record<string, any> {
    return {
      initialized: this.isInitialized,
      capabilities: this.checkCapabilities(),
      logCount: this.logs.length,
      version: '1.0.0',
    };
  }

  public clear(): void {
    this.logs = [];
  }
}

export const diagnostics = DiagnosticsManager.getInstance();
