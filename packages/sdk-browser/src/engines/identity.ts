import { bus } from '../core/bus';

export class IdentityEngine {
  private static instance: IdentityEngine;
  private distinctId = '';
  private anonymousId = '';

  private constructor() {}

  public static getInstance(): IdentityEngine {
    if (!IdentityEngine.instance) {
      IdentityEngine.instance = new IdentityEngine();
    }
    return IdentityEngine.instance;
  }

  public init(): void {

    // Load or generate identity
    const savedAnon = this.getCookie('if_anon_id') || this.getLocal('if_anon_id');
    const savedDistinct = this.getCookie('if_distinct_id') || this.getLocal('if_distinct_id');

    if (savedAnon) {
      this.anonymousId = savedAnon;
    } else {
      this.anonymousId = this.generateUUID();
      this.setCookie('if_anon_id', this.anonymousId, 365);
      this.setLocal('if_anon_id', this.anonymousId);
    }

    if (savedDistinct) {
      this.distinctId = savedDistinct;
    } else {
      this.distinctId = this.anonymousId;
      this.setCookie('if_distinct_id', this.distinctId, 365);
      this.setLocal('if_distinct_id', this.distinctId);
    }

    bus.publish('diagnostics:log', {
      level: 'info',
      message: `Identity Engine loaded distinctId: ${this.distinctId}`,
    });
  }

  public identify(newDistinctId: string, properties?: Record<string, any>): void {
    if (!newDistinctId || newDistinctId.trim() === '') return;

    this.distinctId = newDistinctId;
    this.setCookie('if_distinct_id', this.distinctId, 365);
    this.setLocal('if_distinct_id', this.distinctId);

    // Save identified state user properties
    if (properties) {
      this.setLocal('if_user_properties', JSON.stringify(properties));
    }

    bus.publish('identity:changed', {
      distinctId: this.distinctId,
      anonymousId: this.anonymousId,
      type: 'identify',
    });
    bus.publish('diagnostics:log', { level: 'info', message: `User identified as distinctId: ${newDistinctId}` });
  }

  public reset(): void {
    this.anonymousId = this.generateUUID();
    this.distinctId = this.anonymousId;

    this.setCookie('if_anon_id', this.anonymousId, 365);
    this.setCookie('if_distinct_id', this.distinctId, 365);
    this.setLocal('if_anon_id', this.anonymousId);
    this.setLocal('if_distinct_id', this.distinctId);
    this.removeLocal('if_user_properties');

    bus.publish('identity:changed', {
      distinctId: this.distinctId,
      anonymousId: this.anonymousId,
      type: 'reset',
    });
    bus.publish('diagnostics:log', { level: 'info', message: 'Identity reset, new anonymous credentials issued.' });
  }

  public getDistinctId(): string {
    return this.distinctId;
  }

  public getAnonymousId(): string {
    return this.anonymousId;
  }

  private generateUUID(): string {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
      return window.crypto.randomUUID();
    }
    // Fallback pseudo-random generator
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  // Cookie helpers
  private setCookie(name: string, value: string, days: number): void {
    if (typeof document === 'undefined') return;
    let expires = '';
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = '; expires=' + date.toUTCString();
    }
    document.cookie = `${name}=${encodeURIComponent(value)}${expires}; path=/; SameSite=Lax`;
  }

  private getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
    return null;
  }

  // LocalStorage helpers
  private setLocal(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Ignore localStorage blocks
    }
  }

  private getLocal(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  private removeLocal(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore
    }
  }
}

export const identity = IdentityEngine.getInstance();
