# @insightfuel/sdk-browser

The official Universal client-side analytics SDK for the **InsightFuel** Product Intelligence and User Behavior Analytics platform.

## Table of Contents
1. [Installation](#installation)
2. [Quick Start](#quick-start)
3. [Configuration Reference](#configuration-reference)
4. [Public API Reference](#public-api-reference)
5. [Framework Integration Guide](#framework-integration-guide)
6. [Plugin System](#plugin-system)
7. [Privacy & Compliance](#privacy--compliance)
8. [Troubleshooting & Diagnostics](#troubleshooting--diagnostics)

---

## Installation

Install `@insightfuel/sdk-browser` via npm, pnpm, or yarn:

```bash
npm install @insightfuel/sdk-browser
# or
pnpm add @insightfuel/sdk-browser
# or
yarn add @insightfuel/sdk-browser
```

---

## Quick Start

Initialize the SDK and start tracking automatically:

```javascript
import { InsightFuel } from '@insightfuel/sdk-browser';

// Initialize the SDK
InsightFuel.init({
  apiKey: 'YOUR_PROJECT_WRITE_KEY',
  apiHost: 'https://api.insightfuel.io', // Optional, defaults to production host
  debug: true // Enables diagnostic console logging
});

// Identify a user session
InsightFuel.identify('user_id_12345', {
  email: 'user@domain.com',
  plan: 'Enterprise'
});

// Send custom events
InsightFuel.track('dashboard_viewed', {
  tab: 'analytics_overview',
  refreshCount: 2
});
```

---

## Configuration Reference

The `InsightFuel.init()` method accepts a `Config` object:

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `apiKey` | `string` | **Required** | The write key generated in the InsightFuel dashboard for your project. |
| `apiHost` | `string` | `'https://api.insightfuel.io'` | Target ingestion server endpoint. |
| `autocapture` | `boolean \| AutocaptureOptions` | `true` | Globally enable or select specific automatic element tracking options. |
| `respectDNT` | `boolean` | `false` | When true, skips initialization if the browser's `doNotTrack` header is set to `1` or `yes`. |
| `samplingRate` | `number` | `1.0` | Ingestion sampling rate (0.0 to 1.0). Deterministically samples user events. |
| `blacklistSelectors` | `string[]` | `[]` | Excludes DOM nodes matching these query selectors from click and scroll triggers. |
| `debug` | `boolean` | `false` | Enables console output logging for internal SDK diagnostics. |
| `requestSigningKey` | `string` | `''` | When provided, signs the payload using an HMAC-SHA256 signature appended to headers. |
| `flushIntervalMs` | `number` | `10000` | Timer interval to flush local event buffers. |
| `batchSize` | `number` | `50` | Maximum event batch size. Reaching this triggers an immediate flush. |

### Autocapture Options
If providing a custom `autocapture` options object, you can set:
```typescript
{
  clicks: boolean;      // Auto-track button and link interactions
  forms: boolean;       // Auto-track form submit behaviors
  scrolls: boolean;     // Auto-track 25%, 50%, 75%, 100% scroll depth markers
  views: boolean;       // Auto-track page views and SPA client route updates
  errors: boolean;      // Auto-track javascript errors and promise exceptions
  performance: boolean; // Auto-track DNS, TCP, and TTFB navigation metrics
  clipboard: boolean;   // Auto-track copy/cut/paste actions
  downloads: boolean;   // Auto-track file downloads matching common extensions
}
```

---

## Public API Reference

### `init(options: Config): Promise<void>`
Initializes the configuration loader, core tracking loops, cookie generators, and attaches DOM auto-capture observers.

### `track(eventName: string, properties?: Record<string, any>): void`
Dispatches a custom event with metadata.
```javascript
InsightFuel.track('checkout_completed', { amount: 99.99, currency: 'USD' });
```

### `identify(distinctId: string, properties?: Record<string, any>): void`
Associates anonymous session interactions with a known client profile identifier.

### `group(groupId: string, properties?: Record<string, any>): void`
Maps the user to a B2B group container (e.g. organization, company space).

### `reset(): void`
Clears identifying keys, drops local user properties cache, and issues a new anonymous visitor distinct ID.

### `page(): void`
Triggers an explicit page view tracking event. Handy for custom routing loops where autocapture views is disabled.

### `optIn() / optOut()`
Updates GDPR/CCPA telemetry consent flags. When opted out, all buffering, auto-capture, and transport actions are suspended.

### `registerPlugin(plugin: InsightFuelPlugin): void`
Registers a plugin to execute hooks during event capture, buffering, or flushing cycles.

### `getDiagnostics(): Record<string, any>`
Inspects internal event buses, capabilities, registered plugins, and active diagnostics logs.

### `shutdown(): void`
Detaches all event listeners, flushes remaining queues, and terminates state timers.

---

## Framework Integration Guide

### React / Next.js
Initialize the SDK once at the root layout or application bootstrap entrypoint:
```jsx
// App.tsx / layout.tsx
import { useEffect } from 'react';
import { InsightFuel } from '@insightfuel/sdk-browser';

export default function RootLayout({ children }) {
  useEffect(() => {
    InsightFuel.init({
      apiKey: 'your_api_key_here',
      debug: process.env.NODE_ENV !== 'production'
    });
  }, []);

  return <>{children}</>;
}
```

### Vue / Nuxt
Wrap the SDK inside a Nuxt plugin or Vue app mounting loop:
```javascript
// plugins/insightfuel.client.js (Nuxt 3)
import { InsightFuel } from '@insightfuel/sdk-browser';

export default defineNuxtPlugin(() => {
  InsightFuel.init({
    apiKey: 'your_api_key_here',
    debug: false
  });
});
```

---

## Plugin System

Create plugins by implementing hook lifecycle loops:
```typescript
const MyLoggingPlugin = {
  name: 'ConsoleLogger',
  hooks: {
    onInit: (config) => {
      console.log('SDK initialized with key:', config.apiKey);
    },
    onBeforeCapture: (event) => {
      event.properties = { ...event.properties, global_label: 'labeled' };
      return event; // Or return null to drop event
    },
    onAfterFlush: (batch, success) => {
      console.log(`Flushed batch of ${batch.length}. Status: ${success}`);
    }
  }
};

InsightFuel.registerPlugin(MyLoggingPlugin);
```

---

## Privacy & Compliance

The SDK is built with Privacy-by-Design principles:
*   **Element Exclusion:** Add `data-insightfuel-ignore` to any element to prevent autocapture engines from tracking its clicks or scrolls.
*   **PII Masking:** Passwords, email matches, credit cards, and SSNs are automatically scrubbed from property fields at runtime using regex masks.
*   **Do Not Track:** Turn on `respectDNT` to honour user DNT browser parameters.

---

## Troubleshooting & Diagnostics

If telemetry is not appearing in the dashboard:
1.  **Turn on Debug Mode:** Set `debug: true` in config initialization to audit console messages.
2.  **Inspect System Status:** Run `InsightFuel.getDiagnostics()` in the browser developer console to view active queues, Capability supports, and error lists.
3.  **Element Ignore check:** Ensure the element you are tracking doesn't contain the `if-ignore` class or ignore attributes.
