import { useState } from 'react';
import { useAuthStore, Project, ApiKey } from '../../../shared/stores/useAuthStore';
import { 
  Code2, 
  Copy, 
  Check, 
  Terminal, 
  FolderGit2, 
  Sparkles,
  FileCode2
} from 'lucide-react';

type Framework = 'react' | 'next' | 'vue' | 'angular' | 'html';

export default function CustomerSdkGuide() {
  const { projects, activeProjectId, apiKeys, switchProject } = useAuthStore();
  const [selectedFramework, setSelectedFramework] = useState<Framework>('react');
  const [copiedSnippetId, setCopiedSnippetId] = useState<string | null>(null);

  const activeProj = projects.find((p: Project) => p.id === activeProjectId) || projects[0];
  const keys = apiKeys[activeProjectId] || [];
  const activeKey = keys.find((k: ApiKey) => k.status === 'active')?.key || 'if_live_9f8a3c2b1e4d5f6a7b8c9d0e';

  const handleCopy = (code: string, snippetId: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSnippetId(snippetId);
    setTimeout(() => setCopiedSnippetId(null), 2500);
  };

  const getSnippets = () => {
    switch (selectedFramework) {
      case 'react':
        return {
          install: 'npm install @insightfuel/sdk-browser',
          setup: `import React from 'react';
import { InsightFuelProvider } from '@insightfuel/sdk-browser';
import App from './App';

export default function Root() {
  return (
    <InsightFuelProvider apiKey="${activeKey}">
      <App />
    </InsightFuelProvider>
  );
}`,
          track: `import { useInsightFuel } from '@insightfuel/sdk-browser';

export function CheckoutButton() {
  const { track } = useInsightFuel();

  const handleClick = () => {
    track('checkout_button_clicked', {
      cart_total: 149.99,
      item_count: 3
    });
  };

  return <button onClick={handleClick}>Complete Purchase</button>;
}`
        };

      case 'next':
        return {
          install: 'npm install @insightfuel/sdk-browser',
          setup: `// app/providers.tsx
'use client';

import { InsightFuelProvider } from '@insightfuel/sdk-browser';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <InsightFuelProvider apiKey="${activeKey}">
      {children}
    </InsightFuelProvider>
  );
}`,
          track: `// app/checkout/page.tsx
'use client';
import { useInsightFuel } from '@insightfuel/sdk-browser';

export default function CheckoutPage() {
  const { track } = useInsightFuel();
  
  return (
    <button onClick={() => track('order_completed', { order_id: 'ord_98765' })}>
      Pay Now
    </button>
  );
}`
        };

      case 'vue':
        return {
          install: 'npm install @insightfuel/sdk-browser',
          setup: `// main.js or main.ts
import { createApp } from 'vue';
import { InsightFuelVuePlugin } from '@insightfuel/sdk-browser/vue';
import App from './App.vue';

const app = createApp(App);

app.use(InsightFuelVuePlugin, {
  apiKey: '${activeKey}'
});

app.mount('#app');`,
          track: `<script setup>
import { useInsightFuel } from '@insightfuel/sdk-browser/vue';

const { track } = useInsightFuel();

function trackClick() {
  track('feature_used', { feature_name: 'dark_mode_toggle' });
}
</script>`
        };

      case 'angular':
        return {
          install: 'npm install @insightfuel/sdk-browser',
          setup: `// app.module.ts
import { NgModule } from '@angular/core';
import { InsightFuelModule } from '@insightfuel/sdk-browser/angular';

@NgModule({
  imports: [
    InsightFuelModule.forRoot({
      apiKey: '${activeKey}'
    })
  ]
})
export class AppModule { }`,
          track: `// app.component.ts
import { Component } from '@angular/core';
import { InsightFuelService } from '@insightfuel/sdk-browser/angular';

@Component({ selector: 'app-root', templateUrl: './app.component.html' })
export class AppComponent {
  constructor(private analytics: InsightFuelService) {}

  onSubscribe() {
    this.analytics.track('newsletter_subscribed', { plan: 'pro' });
  }
}`
        };

      case 'html':
      default:
        return {
          install: '<!-- No package installation required -->',
          setup: `<!-- Add to your <head> section -->
<script 
  src="https://cdn.insightfuel.io/v1/sdk.js" 
  data-api-key="${activeKey}" 
  async>
</script>`,
          track: `<script>
  // Trigger custom events anywhere in your HTML scripts
  window.InsightFuel && window.InsightFuel.track('button_clicked', {
    element_id: 'hero_cta',
    page_url: window.location.href
  });
</script>`
        };
    }
  };

  const snippets = getSnippets();

  const frameworks = [
    { id: 'react', name: 'React', icon: '⚛️' },
    { id: 'next', name: 'Next.js', icon: '▲' },
    { id: 'vue', name: 'Vue 3', icon: '🟢' },
    { id: 'angular', name: 'Angular', icon: '🅰️' },
    { id: 'html', name: 'HTML / Vanilla JS', icon: '🌐' },
  ];

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2.5">
            <Code2 className="h-6 w-6 text-blue-500" />
            <span>SDK Integration Guide</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Copy production-ready code snippets with your real SDK Key auto-injected.
          </p>
        </div>

        {/* Project Selector */}
        <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 self-start sm:self-auto">
          <FolderGit2 className="h-4 w-4 text-blue-400" />
          <span className="text-xs text-slate-400 font-medium">Target Project:</span>
          <select
            value={activeProjectId}
            onChange={(e) => switchProject(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            {projects.map((proj: Project) => (
              <option key={proj.id} value={proj.id}>{proj.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Active API Key Indicator */}
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2.5">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-400">Auto-injecting key for <strong>{activeProj?.name}</strong>:</span>
          <code className="bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-blue-400 font-mono font-semibold">
            {activeKey}
          </code>
        </div>
        <button
          onClick={() => handleCopy(activeKey, 'key_header')}
          className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center space-x-1"
        >
          {copiedSnippetId === 'key_header' ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy Key</span>
            </>
          )}
        </button>
      </div>

      {/* Framework Tabs */}
      <div className="flex space-x-2 border-b border-slate-800 pb-3 overflow-x-auto">
        {frameworks.map(fw => (
          <button
            key={fw.id}
            onClick={() => setSelectedFramework(fw.id as Framework)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition whitespace-nowrap ${
              selectedFramework === fw.id
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
            }`}
          >
            <span>{fw.icon}</span>
            <span>{fw.name}</span>
          </button>
        ))}
      </div>

      {/* Code Snippets Section */}
      <div className="space-y-6">
        
        {/* Step 1: Install Package */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Terminal className="h-4 w-4 text-blue-400" />
              <h3 className="text-sm font-bold text-white">Step 1: Package Installation</h3>
            </div>
            <button
              onClick={() => handleCopy(snippets.install, 'install_cmd')}
              className="text-xs font-semibold text-slate-400 hover:text-white flex items-center space-x-1 p-1 rounded hover:bg-slate-800 transition"
            >
              {copiedSnippetId === 'install_cmd' ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/90 font-mono text-xs text-blue-300 overflow-x-auto">
            {snippets.install}
          </div>
        </div>

        {/* Step 2: Initialize Provider */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileCode2 className="h-4 w-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Step 2: Initialize SDK Provider</h3>
            </div>
            <button
              onClick={() => handleCopy(snippets.setup, 'setup_code')}
              className="text-xs font-semibold text-slate-400 hover:text-white flex items-center space-x-1 p-1 rounded hover:bg-slate-800 transition"
            >
              {copiedSnippetId === 'setup_code' ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/90 font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed">
            <pre>{snippets.setup}</pre>
          </div>
        </div>

        {/* Step 3: Track Events */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">Step 3: Custom Event Tracking</h3>
            </div>
            <button
              onClick={() => handleCopy(snippets.track, 'track_code')}
              className="text-xs font-semibold text-slate-400 hover:text-white flex items-center space-x-1 p-1 rounded hover:bg-slate-800 transition"
            >
              {copiedSnippetId === 'track_code' ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/90 font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed">
            <pre>{snippets.track}</pre>
          </div>
        </div>

      </div>
    </div>
  );
}
