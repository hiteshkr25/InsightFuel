import { RuntimeConfig, InsightFuelEvent } from '../types';
import { bus } from '../core/bus';
import { identity } from './identity';
import { session } from './session';
import { privacy } from './privacy';
import { featureDetection } from './feature';

export class AutoCaptureEngine {
  private static instance: AutoCaptureEngine;
  private config?: RuntimeConfig;
  private activeListeners: { name: string; target: EventTarget; fn: EventListener }[] = [];
  private originalPushState?: typeof history.pushState;
  private originalReplaceState?: typeof history.pushState;
  private scrollThresholds: Record<number, boolean> = { 25: false, 50: false, 75: false, 100: false };

  private constructor() {}

  public static getInstance(): AutoCaptureEngine {
    if (!AutoCaptureEngine.instance) {
      AutoCaptureEngine.instance = new AutoCaptureEngine();
    }
    return AutoCaptureEngine.instance;
  }

  public init(config: RuntimeConfig): void {
    this.config = config;

    const opts = config.resolvedAutocapture;

    if (opts.views) this.trackPageView();
    if (opts.clicks) this.attachClickListener();
    if (opts.forms) this.attachFormListener();
    if (opts.errors) this.attachErrorListeners();
    if (opts.scrolls) this.attachScrollListener();
    if (opts.clipboard) this.attachClipboardListener();
    if (opts.performance) this.capturePerformanceMetrics();

    // Hook SPA route changes (History API pushState/replaceState)
    if (opts.views && typeof window !== 'undefined') {
      this.hookHistoryApi();
      this.addListener('popstate', window, () => this.trackPageView());
    }
  }

  private addListener(name: string, target: EventTarget, fn: EventListener, options?: AddEventListenerOptions): void {
    target.addEventListener(name, fn, options);
    this.activeListeners.push({ name, target, fn });
  }

  private trackPageView(): void {
    if (typeof window === 'undefined') return;

    // Reset scroll tracking flags for new page view
    this.scrollThresholds = { 25: false, 50: false, 75: false, 100: false };

    this.captureEvent('page_view', 'navigation', {
      url: window.location.href,
      path: window.location.pathname,
      title: document.title,
      referrer: document.referrer,
    });
  }

  private attachClickListener(): void {
    if (typeof document === 'undefined') return;

    this.addListener('click', document, (e: Event) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      // Find the nearest interactive elements up the DOM tree
      const interactiveEl = target.closest('a, button, input[type="submit"], [role="button"]') as HTMLElement;
      if (!interactiveEl || privacy.shouldIgnoreElement(interactiveEl)) return;

      const stableSelector = featureDetection.generateStableSelector(interactiveEl);

      // 1. Check for Downloads
      const isAnchor = interactiveEl.tagName.toLowerCase() === 'a';
      if (isAnchor) {
        const href = interactiveEl.getAttribute('href') || '';
        const downloadRegex = /\.(zip|pdf|tar|csv|docx|xlsx|dmg|exe|mp4|mp3|gz)$/i;
        if (downloadRegex.test(href) && this.config?.resolvedAutocapture.downloads) {
          this.captureEvent('download', 'navigation', {
            url: href,
            text: interactiveEl.innerText?.trim().substring(0, 100),
            selector: stableSelector,
          });
          return;
        }

        // 2. Check for Outbound links
        try {
          if (href.startsWith('http') && !href.includes(window.location.hostname)) {
            this.captureEvent('outbound_click', 'navigation', {
              url: href,
              text: interactiveEl.innerText?.trim().substring(0, 100),
              selector: stableSelector,
            });
            return;
          }
        } catch {
          // Ignore URL parse crashes
        }
      }

      // 3. Regular Click Capture
      this.captureEvent('click', 'user', {
        tagName: interactiveEl.tagName.toLowerCase(),
        text: interactiveEl.innerText?.trim().substring(0, 100),
        selector: stableSelector,
        id: interactiveEl.id || undefined,
      });
    }, { capture: true });
  }

  private attachFormListener(): void {
    if (typeof document === 'undefined') return;

    this.addListener('submit', document, (e: Event) => {
      const form = e.target as HTMLFormElement;
      if (!form || privacy.shouldIgnoreElement(form)) return;

      const stableSelector = featureDetection.generateStableSelector(form);
      const action = form.getAttribute('action') || '';

      this.captureEvent('form_submit', 'user', {
        action,
        selector: stableSelector,
        id: form.id || undefined,
      });
    }, { capture: true });
  }

  private attachClipboardListener(): void {
    if (typeof document === 'undefined') return;

    const handler = (action: 'copy' | 'cut' | 'paste') => {
      this.captureEvent(action, 'user', {
        path: window.location.pathname,
      });
    };

    this.addListener('copy', document, () => handler('copy'));
    this.addListener('cut', document, () => handler('cut'));
    this.addListener('paste', document, () => handler('paste'));
  }

  private attachScrollListener(): void {
    if (typeof window === 'undefined') return;

    let ticking = false;

    const checkScroll = () => {
      const doc = document.documentElement;
      const body = document.body;
      const scrollTop = doc.scrollTop || body.scrollTop;
      const scrollHeight = doc.scrollHeight || body.scrollHeight;
      const clientHeight = doc.clientHeight;

      const totalScrollable = scrollHeight - clientHeight;
      if (totalScrollable <= 0) return;

      const pct = Math.round((scrollTop / totalScrollable) * 100);

      const thresholds = [25, 50, 75, 100];
      thresholds.forEach((th) => {
        if (pct >= th && !this.scrollThresholds[th]) {
          this.scrollThresholds[th] = true;
          this.captureEvent('scroll_depth', 'user', {
            depth_pct: th,
            path: window.location.pathname,
          });
        }
      });
    };

    this.addListener('scroll', window, () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          checkScroll();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  private attachErrorListeners(): void {
    if (typeof window === 'undefined') return;

    // Standard JavaScript Exception hooks
    this.addListener('error', window, (event: Event) => {
      const errEvent = event as ErrorEvent;
      this.captureEvent('exception', 'error', {
        message: errEvent.message || 'Unknown javascript execution error',
        filename: errEvent.filename,
        lineno: errEvent.lineno,
        colno: errEvent.colno,
        stack: errEvent.error?.stack || undefined,
      });
    });

    // Unhandled Promises hooks
    this.addListener('unhandledrejection', window, (event: Event) => {
      const rejection = event as PromiseRejectionEvent;
      const reason = rejection.reason;
      this.captureEvent('promise_rejection', 'error', {
        message: reason instanceof Error ? reason.message : String(reason),
        stack: reason instanceof Error ? reason.stack : undefined,
      });
    });
  }

  private capturePerformanceMetrics(): void {
    if (typeof window === 'undefined' || !window.performance) return;

    // Run when window loads
    const trackPerformance = () => {
      try {
        const [nav] = performance.getEntriesByType('navigation') as any[];
        if (nav) {
          this.captureEvent('performance_load', 'performance', {
            dns_time: nav.domainLookupEnd - nav.domainLookupStart,
            tcp_time: nav.connectEnd - nav.connectStart,
            ttfb: nav.responseStart - nav.requestStart,
            dom_interactive: nav.domInteractive,
            dom_complete: nav.domComplete,
            load_event: nav.loadEventEnd,
          });
        } else if (performance.timing) {
          // Fallback legacy navigation APIs
          const t = performance.timing;
          this.captureEvent('performance_load', 'performance', {
            dns_time: t.domainLookupEnd - t.domainLookupStart,
            tcp_time: t.connectEnd - t.connectStart,
            ttfb: t.responseStart - t.requestStart,
            dom_interactive: t.domInteractive - t.navigationStart,
            dom_complete: t.domComplete - t.navigationStart,
            load_event: t.loadEventEnd - t.navigationStart,
          });
        }
      } catch (err) {
        // Safe check
      }
    };

    if (document.readyState === 'complete') {
      trackPerformance();
    } else {
      this.addListener('load', window, () => trackPerformance());
    }
  }

  private hookHistoryApi(): void {
    if (typeof window === 'undefined' || !window.history) return;

    this.originalPushState = window.history.pushState;
    this.originalReplaceState = window.history.replaceState;

    window.history.pushState = (...args) => {
      this.originalPushState!.apply(window.history, args);
      this.trackPageView();
    };

    window.history.replaceState = (...args) => {
      this.originalReplaceState!.apply(window.history, args);
      this.trackPageView();
    };
  }

  private captureEvent(name: string, category: InsightFuelEvent['category'], properties?: Record<string, any>): void {
    if (!this.config) return;

    const width = typeof window !== 'undefined' ? window.innerWidth : undefined;
    const height = typeof window !== 'undefined' ? window.innerHeight : undefined;

    const rawEvent: InsightFuelEvent = {
      event_id: this.generateUUID(),
      event_name: name,
      category,
      distinct_id: identity.getDistinctId(),
      project_id: this.config.apiKey,
      timestamp: new Date().toISOString(),
      properties,
      context: {
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        referrer: typeof document !== 'undefined' ? document.referrer : undefined,
        session_id: session.getSessionId(),
        sdk_version: '1.0.0',
        viewport_width: width,
        viewport_height: height,
        language: typeof navigator !== 'undefined' ? navigator.language : undefined,
      },
    };

    bus.publish('event:captured', rawEvent);
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  public shutdown(): void {
    // Restore history hooks
    if (typeof window !== 'undefined' && window.history) {
      if (this.originalPushState) window.history.pushState = this.originalPushState;
      if (this.originalReplaceState) window.history.replaceState = this.originalReplaceState;
    }

    // Detach all DOM event listeners
    this.activeListeners.forEach(({ name, target, fn }) => {
      target.removeEventListener(name, fn);
    });
    this.activeListeners = [];
  }
}

export const autoCapture = AutoCaptureEngine.getInstance();
