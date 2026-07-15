import { RuntimeConfig } from '../types';
import { bus } from '../core/bus';

export class PrivacyEngine {
  private static instance: PrivacyEngine;
  private config?: RuntimeConfig;
  private hasConsent = true;

  private constructor() {}

  public static getInstance(): PrivacyEngine {
    if (!PrivacyEngine.instance) {
      PrivacyEngine.instance = new PrivacyEngine();
    }
    return PrivacyEngine.instance;
  }

  public init(config: RuntimeConfig): void {
    this.config = config;

    // Load initial consent preferences from local store
    try {
      const stored = localStorage.getItem('if_user_consent');
      if (stored !== null) {
        this.hasConsent = stored === 'true';
      } else if (config.respectDNT && this.checkDNT()) {
        this.hasConsent = false;
        bus.publish('diagnostics:log', { level: 'info', message: 'DNT header detected, auto-opt-out.' });
      }
    } catch {
      // LocalStorage backup fallback
    }
  }

  public optIn(): void {
    this.hasConsent = true;
    try {
      localStorage.setItem('if_user_consent', 'true');
    } catch {
      // Ignore write failures
    }
    bus.publish('diagnostics:log', { level: 'info', message: 'User opted in to telemetry.' });
  }

  public optOut(): void {
    this.hasConsent = false;
    try {
      localStorage.setItem('if_user_consent', 'false');
    } catch {
      // Ignore write failures
    }
    bus.publish('diagnostics:log', { level: 'info', message: 'User opted out of telemetry.' });
  }

  public isTrackingAllowed(): boolean {
    return this.hasConsent;
  }

  public checkDNT(): boolean {
    if (typeof window === 'undefined') return false;
    const nav = window.navigator as any;
    const dnt = nav.doNotTrack ?? nav.msDoNotTrack ?? (window as any).doNotTrack;
    return dnt === '1' || dnt === 'yes';
  }

  public shouldIgnoreElement(element: HTMLElement): boolean {
    if (!element) return true;

    // Direct attribute filters
    if (element.hasAttribute('data-insightfuel-ignore') || element.hasAttribute('data-if-ignore')) {
      return true;
    }

    // Class filters
    if (element.classList && (element.classList.contains('if-ignore') || element.classList.contains('insightfuel-ignore'))) {
      return true;
    }

    // Blacklist selectors verification
    if (this.config?.blacklistSelectors) {
      for (const selector of this.config.blacklistSelectors) {
        try {
          if (element.matches(selector)) {
            return true;
          }
        } catch {
          // Ignore invalid selector matching syntax
        }
      }
    }

    return false;
  }

  public maskSensitiveText(text: string, fieldType?: string): string {
    if (!text) return '';

    // Mask passwords immediately
    if (fieldType === 'password') {
      return '********';
    }

    let result = text;

    // Email pattern masking
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    result = result.replace(emailRegex, '[EMAIL_MASKED]');

    // Credit Card pattern masking
    const ccRegex = /\b(?:\d[ -]*?){13,16}\b/g;
    result = result.replace(ccRegex, '[CREDIT_CARD_MASKED]');

    // SSN / National Identification patterns (XXX-XX-XXXX)
    const ssnRegex = /\b\d{3}-\d{2}-\d{4}\b/g;
    result = result.replace(ssnRegex, '[SSN_MASKED]');

    return result;
  }

  public sanitizeEventProperties(properties?: Record<string, any>): Record<string, any> | undefined {
    if (!properties) return undefined;
    const sanitized: Record<string, any> = {};

    Object.entries(properties).forEach(([key, value]) => {
      // Lowercase check to inspect if key implies PII
      const lowerKey = key.toLowerCase();
      const piiKeywords = ['password', 'secret', 'token', 'cvv', 'card', 'phone', 'ssn', 'email', 'name', 'address'];

      const isPiiKey = piiKeywords.some((keyword) => lowerKey.includes(keyword));

      if (isPiiKey && typeof value === 'string') {
        sanitized[key] = this.maskSensitiveText(value, lowerKey.includes('password') ? 'password' : '');
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        sanitized[key] = this.sanitizeEventProperties(value);
      } else {
        sanitized[key] = value;
      }
    });

    return sanitized;
  }
}

export const privacy = PrivacyEngine.getInstance();
