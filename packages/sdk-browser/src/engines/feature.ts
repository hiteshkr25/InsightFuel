import { RuntimeConfig } from '../types';
import { bus } from '../core/bus';

export class FeatureDetectionEngine {
  private static instance: FeatureDetectionEngine;
  private config?: RuntimeConfig;
  private observer?: MutationObserver;
  private discoveredFeatures: Set<string> = new Set();

  private constructor() {}

  public static getInstance(): FeatureDetectionEngine {
    if (!FeatureDetectionEngine.instance) {
      FeatureDetectionEngine.instance = new FeatureDetectionEngine();
    }
    return FeatureDetectionEngine.instance;
  }

  public init(config: RuntimeConfig): void {
    this.config = config;

    if (typeof window === 'undefined' || !('MutationObserver' in window)) {
      return;
    }

    // Attach MutationObserver to dynamically trace interactive elements
    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof HTMLElement) {
              this.scanForInteractiveFeatures(node);
            }
          });
        }
      });
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Run initial scan
    this.scanForInteractiveFeatures(document.body);
  }

  public generateStableSelector(element: HTMLElement): string {
    const path: string[] = [];
    let current: HTMLElement | null = element;

    while (current && current.nodeType === Node.ELEMENT_NODE) {
      let part = current.nodeName.toLowerCase();

      if (current.id) {
        // Only include ID if it doesn't look like an auto-generated random string
        if (!/\d{4,}/.test(current.id)) {
          part += `#${current.id}`;
          path.unshift(part);
          break; // IDs are unique, stop traversing up
        }
      }

      const classList = Array.from(current.classList);
      const staticClasses = classList.filter((c) => {
        // Strip common dynamic hashes: e.g. CSS-in-JS hashes, Vue scope IDs, or random hashes
        if (c.startsWith('data-v-')) return false;
        if (c.startsWith('css-') && c.length > 8) return false;
        if (/\b[a-f0-9]{8,}\b/.test(c)) return false; // Hex hashes
        if (/\d/.test(c) && /[a-zA-Z]/.test(c) && c.length > 6) return false; // Alphanumeric hash
        return true;
      });

      if (staticClasses.length > 0) {
        part += `.${staticClasses.join('.')}`;
      }

      path.unshift(part);
      current = current.parentElement;
    }

    return path.join(' > ');
  }

  public hashFeature(selector: string): string {
    // Simple FNV-1a hash representation for client-side hashing
    let hash = 2166136261;
    for (let i = 0; i < selector.length; i++) {
      hash ^= selector.charCodeAt(i);
      hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }
    return (hash >>> 0).toString(16);
  }

  private scanForInteractiveFeatures(root: HTMLElement): void {
    const selectors = ['button', 'a', 'input[type="submit"]', '[role="button"]', '[data-insightfuel-feature]'];
    selectors.forEach((sel) => {
      try {
        const elements = root.querySelectorAll(sel);
        elements.forEach((el) => {
          if (el instanceof HTMLElement) {
            this.discoverFeature(el);
          }
        });
      } catch {
        // Ignore selection issues
      }
    });
  }

  private discoverFeature(element: HTMLElement): void {
    const selector = this.generateStableSelector(element);
    const hash = this.hashFeature(selector);

    if (!this.discoveredFeatures.has(hash)) {
      this.discoveredFeatures.add(hash);
      
      // Auto-synchronize discovered features to the event bus
      bus.publish('event:captured', {
        event_id: this.generateUUID(),
        event_name: 'feature_discovered',
        category: 'feature',
        distinct_id: 'system',
        project_id: this.config?.apiKey ?? '',
        timestamp: new Date().toISOString(),
        properties: {
          selector,
          selector_hash: hash,
          tagName: element.tagName.toLowerCase(),
          innerText: element.innerText?.substring(0, 100) ?? '',
        },
      });
    }
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  public shutdown(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
    this.discoveredFeatures.clear();
  }
}

export const featureDetection = FeatureDetectionEngine.getInstance();
