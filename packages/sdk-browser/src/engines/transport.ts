import { RuntimeConfig, InsightFuelEvent } from '../types';
import { bus } from '../core/bus';

export class TransportLayer {
  private static instance: TransportLayer;
  private config?: RuntimeConfig;

  private constructor() {}

  public static getInstance(): TransportLayer {
    if (!TransportLayer.instance) {
      TransportLayer.instance = new TransportLayer();
    }
    return TransportLayer.instance;
  }

  public init(config: RuntimeConfig): void {
    this.config = config;
  }

  public async send(batch: InsightFuelEvent[], useBeacon = false): Promise<boolean> {
    if (!this.config) {
      return false;
    }
    const config = this.config;

    if (batch.length === 0) return true;

    const payloadString = JSON.stringify({
      events: batch,
      apiKey: config.apiKey,
      sentAt: new Date().toISOString(),
    });

    const signature = config.requestSigningKey
      ? await this.signPayload(payloadString, config.requestSigningKey)
      : '';

    const url = `${config.apiHost}/api/v1/ingest`;

    // 1. Try sendBeacon if requested (primarily on unload/page hidden)
    if (useBeacon && typeof navigator !== 'undefined' && navigator.sendBeacon) {
      try {
        const blob = new Blob([payloadString], { type: 'application/json' });
        const queued = navigator.sendBeacon(url, blob);
        if (queued) {
          bus.publish('diagnostics:log', { level: 'info', message: `Batch of ${batch.length} sent via Beacon API.` });
          return true;
        }
      } catch (err) {
        bus.publish('diagnostics:log', {
          level: 'warn',
          message: 'Beacon delivery failed, falling back to Fetch.',
          details: err,
        });
      }
    }

    // 2. Try Fetch API
    if (typeof fetch !== 'undefined') {
      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'X-InsightFuel-ApiKey': config.apiKey,
        };
        if (signature) {
          headers['X-InsightFuel-Signature'] = signature;
        }

        const response = await fetch(url, {
          method: 'POST',
          mode: 'cors',
          headers,
          body: payloadString,
        });

        if (response.ok) {
          bus.publish('diagnostics:log', { level: 'info', message: `Batch of ${batch.length} flushed successfully.` });
          return true;
        }
      } catch (err) {
        bus.publish('diagnostics:log', {
          level: 'warn',
          message: 'Fetch delivery failed, trying XHR fallback.',
          details: err,
        });
      }
    }

    // 3. Fallback: XMLHttpRequest
    if (typeof XMLHttpRequest !== 'undefined') {
      return new Promise<boolean>((resolve) => {
        try {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', url, true);
          xhr.setRequestHeader('Content-Type', 'application/json');
          xhr.setRequestHeader('X-InsightFuel-ApiKey', config.apiKey);
          if (signature) {
            xhr.setRequestHeader('X-InsightFuel-Signature', signature);
          }

          xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
              if (xhr.status >= 200 && xhr.status < 300) {
                bus.publish('diagnostics:log', { level: 'info', message: `Batch of ${batch.length} sent via XHR.` });
                resolve(true);
              } else {
                resolve(false);
              }
            }
          };

          xhr.send(payloadString);
        } catch (err) {
          bus.publish('diagnostics:log', { level: 'error', message: 'All transport options exhausted.', details: err });
          resolve(false);
        }
      });
    }

    return false;
  }

  private async signPayload(payload: string, secret: string): Promise<string> {
    try {
      if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
        return '';
      }

      const encoder = new TextEncoder();
      const keyData = encoder.encode(secret);
      const messageData = encoder.encode(payload);

      const cryptoKey = await window.crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );

      const signature = await window.crypto.subtle.sign('HMAC', cryptoKey, messageData);
      return Array.from(new Uint8Array(signature))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    } catch {
      return '';
    }
  }
}

export const transport = TransportLayer.getInstance();
