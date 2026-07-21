import { useState } from 'react';
import { useAuthStore, Project, ApiKey } from '../../../shared/stores/useAuthStore';
import { 
  Code2, 
  Copy, 
  Check, 
  Terminal, 
  FolderGit2, 
  Boxes,
  Webhook
} from 'lucide-react';
import SDKVerification from './SDKVerification';

type Framework = 'react' | 'next' | 'vue' | 'angular' | 'html' | 'javascript' | 'node';

export default function IntegrationsWorkspace() {
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
          setup: `import React from 'react';\nimport { InsightFuelProvider } from '@insightfuel/sdk-browser';\n\nexport default function App() {\n  return (\n    <InsightFuelProvider apiKey="${activeKey}">\n      <MainComponent />\n    </InsightFuelProvider>\n  );\n}`
        };
      case 'next':
        return {
          install: 'npm install @insightfuel/sdk-browser',
          setup: `// app/providers.tsx\n'use client';\nimport { InsightFuelProvider } from '@insightfuel/sdk-browser';\n\nexport function Providers({ children }: { children: React.ReactNode }) {\n  return <InsightFuelProvider apiKey="${activeKey}">{children}</InsightFuelProvider>;\n}`
        };
      case 'vue':
        return {
          install: 'npm install @insightfuel/sdk-browser',
          setup: `import { createApp } from 'vue';\nimport { InsightFuelVuePlugin } from '@insightfuel/sdk-browser/vue';\nimport App from './App.vue';\n\nconst app = createApp(App);\napp.use(InsightFuelVuePlugin, { apiKey: '${activeKey}' });\napp.mount('#app');`
        };
      case 'angular':
        return {
          install: 'npm install @insightfuel/sdk-browser',
          setup: `import { NgModule } from '@angular/core';\nimport { InsightFuelModule } from '@insightfuel/sdk-browser/angular';\n\n@NgModule({\n  imports: [InsightFuelModule.forRoot({ apiKey: '${activeKey}' })]\n})\nexport class AppModule {}`
        };
      case 'javascript':
        return {
          install: 'npm install @insightfuel/browser',
          setup: `import InsightFuel from '@insightfuel/browser';\n\nInsightFuel.init({\n  apiKey: '${activeKey}',\n  endpoint: 'https://api.insightfuel.io'\n});\n\nInsightFuel.track('checkout_button_clicked', { amount: 149.99 });`
        };
      case 'node':
        return {
          install: 'npm install @insightfuel/sdk-node',
          setup: `const { InsightFuelServer } = require('@insightfuel/sdk-node');\n\nconst analytics = new InsightFuelServer({\n  apiKey: '${activeKey}',\n  endpoint: 'https://api.insightfuel.io'\n});\n\nanalytics.track('user_signed_up', { userId: 'usr_123' });`
        };
      case 'html':
      default:
        return {
          install: '<!-- No package installation required -->',
          setup: `<script \n  src="https://cdn.insightfuel.io/v1/sdk.js" \n  data-api-key="${activeKey}" \n  async>\n</script>`
        };
    }
  };

  const snippets = getSnippets();

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2.5">
            <Boxes className="h-6 w-6 text-blue-500" />
            <span>Integrations & SDK Installation</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Embed InsightFuel analytics SDKs into frontend frameworks, vanilla scripts, or backend servers.
          </p>
        </div>

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

      {/* Embedded SDK Verification Suite */}
      <SDKVerification apiKey={activeKey} projectName={activeProj?.name} />

      {/* Framework Selection Tabs */}
      <div className="flex space-x-2 border-b border-slate-800 pb-3 overflow-x-auto">
        {[
          { id: 'react', name: 'React', icon: '⚛️' },
          { id: 'next', name: 'Next.js', icon: '▲' },
          { id: 'vue', name: 'Vue 3', icon: '🟢' },
          { id: 'angular', name: 'Angular', icon: '🅰️' },
          { id: 'javascript', name: 'JavaScript SDK', icon: '📜' },
          { id: 'node', name: 'Node.js Backend', icon: '🟢' },
          { id: 'html', name: 'HTML / Vanilla JS', icon: '🌐' },
        ].map(fw => (
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

      {/* Code Snippets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Terminal className="h-4 w-4 text-blue-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Package Install</h3>
            </div>
            <button
              onClick={() => handleCopy(snippets.install, 'install_cmd')}
              className="text-xs font-semibold text-slate-400 hover:text-white flex items-center space-x-1"
            >
              {copiedSnippetId === 'install_cmd' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-blue-300">
            {snippets.install}
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Code2 className="h-4 w-4 text-indigo-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">SDK Provider Setup</h3>
            </div>
            <button
              onClick={() => handleCopy(snippets.setup, 'setup_code')}
              className="text-xs font-semibold text-slate-400 hover:text-white flex items-center space-x-1"
            >
              {copiedSnippetId === 'setup_code' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed">
            <pre>{snippets.setup}</pre>
          </div>
        </div>
      </div>

      {/* Webhooks & Platform Connectors */}
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white tracking-tight flex items-center space-x-2">
          <Webhook className="h-4 w-4 text-cyan-400" />
          <span>Webhooks & Third-Party Platform Connectors</span>
        </h3>
        <p className="text-xs text-slate-400">Stream InsightFuel visitor alerts to Slack, Zapier, Segment, or custom HTTP Webhooks.</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-white">Slack Alerts Connector</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">Connected</span>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-white">Zapier Automation</span>
            <button className="text-[11px] text-blue-400 font-semibold hover:text-blue-300">Connect →</button>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-white">Segment Data Sync</span>
            <button className="text-[11px] text-blue-400 font-semibold hover:text-blue-300">Connect →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
