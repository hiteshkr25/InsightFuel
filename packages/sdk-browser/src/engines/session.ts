import { bus } from '../core/bus';
import { identity } from './identity';

const SESSION_TIMEOUT_MS = 1800000; // 30 minutes
const HEARTBEAT_INTERVAL_MS = 30000; // 30 seconds

export class SessionEngine {
  private static instance: SessionEngine;
  private sessionId = '';
  private lastActivity = Date.now();
  private heartbeatTimer?: any;

  private constructor() {}

  public static getInstance(): SessionEngine {
    if (!SessionEngine.instance) {
      SessionEngine.instance = new SessionEngine();
    }
    return SessionEngine.instance;
  }

  public init(): void {

    // Listen to tab storage updates for cross-tab session syncing
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', this.handleCrossTabUpdate);
      this.attachActivityListeners();
    }

    this.recoverOrCreateSession();
    this.startHeartbeat();
  }

  public getSessionId(): string {
    // Check for idle expiration before returning
    if (Date.now() - this.lastActivity > SESSION_TIMEOUT_MS) {
      bus.publish('diagnostics:log', { level: 'info', message: 'Session expired due to inactivity. Re-creating.' });
      this.createNewSession();
    }
    return this.sessionId;
  }

  public touch(): void {
    this.lastActivity = Date.now();
    try {
      localStorage.setItem('if_session_last_activity', this.lastActivity.toString());
    } catch {
      // Ignore
    }
  }

  private recoverOrCreateSession(): void {
    try {
      const savedSession = localStorage.getItem('if_session_id');
      const savedActivity = localStorage.getItem('if_session_last_activity');

      if (savedSession && savedActivity) {
        const activityTime = parseInt(savedActivity, 10);
        if (Date.now() - activityTime < SESSION_TIMEOUT_MS) {
          this.sessionId = savedSession;
          this.lastActivity = activityTime;
          bus.publish('diagnostics:log', { level: 'info', message: `Recovered active session: ${this.sessionId}` });
          return;
        }
      }
    } catch {
      // Ignore storage read errors
    }

    this.createNewSession();
  }

  private createNewSession(): void {
    this.sessionId = this.generateUUID();
    this.lastActivity = Date.now();

    try {
      localStorage.setItem('if_session_id', this.sessionId);
      localStorage.setItem('if_session_last_activity', this.lastActivity.toString());
    } catch {
      // Ignore storage write errors
    }

    bus.publish('session:started', {
      sessionId: this.sessionId,
      distinctId: identity.getDistinctId(),
    });
    bus.publish('diagnostics:log', { level: 'info', message: `Created new session: ${this.sessionId}` });
  }

  private startHeartbeat(): void {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    
    this.heartbeatTimer = setInterval(() => {
      // Check idle expiration
      if (Date.now() - this.lastActivity > SESSION_TIMEOUT_MS) {
        this.createNewSession();
      } else {
        bus.publish('session:heartbeat', { sessionId: this.sessionId });
      }
    }, HEARTBEAT_INTERVAL_MS);
  }

  private attachActivityListeners(): void {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach((eventName) => {
      window.addEventListener(eventName, () => this.touch(), { passive: true });
    });
  }

  private handleCrossTabUpdate = (event: StorageEvent): void => {
    if (event.key === 'if_session_id' && event.newValue) {
      this.sessionId = event.newValue;
      this.lastActivity = Date.now();
      bus.publish('diagnostics:log', {
        level: 'info',
        message: `Synced session across tab boundary: ${this.sessionId}`,
      });
    }
  };

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

  public shutdown(): void {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', this.handleCrossTabUpdate);
    }
  }
}

export const session = SessionEngine.getInstance();
