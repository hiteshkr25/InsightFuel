import { useState } from 'react';
import { useAuthStore, Project, SupportedFramework } from '../../../shared/stores/useAuthStore';
import { useThemeStore } from '../../../shared/stores/useThemeStore';
import { 
  Code2, 
  Copy, 
  Check, 
  Terminal, 
  Boxes
} from 'lucide-react';
import SDKVerification from './SDKVerification';

export default function IntegrationsWorkspace() {
  const { projects, activeProjectId, apiKeys, selectedFramework, setSelectedFramework } = useAuthStore();
  const { theme } = useThemeStore();
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  const activeProj = projects.find((p: Project) => p.id === activeProjectId) || projects[0];
  const keys = apiKeys[activeProjectId] || [];
  const activeKey = keys[0]?.key || 'if_live_9f8a3c2b1e4d5f6a7b8c9d0e';

  const snippets: Record<SupportedFramework, { title: string; packageCmd: string; code: string }> = {
    react: {
      title: 'React 18+ SDK Setup',
      packageCmd: 'npm install @insightfuel/sdk-browser',
      code: `import React from 'react';\nimport { InsightFuelProvider } from '@insightfuel/sdk-browser';\n\nexport default function App() {\n  return (\n    <InsightFuelProvider apiKey="${activeKey}">\n      <YourStorefrontApp />\n    </InsightFuelProvider>\n  );\n}`
    },
    next: {
      title: 'Next.js App Router Setup',
      packageCmd: 'npm install @insightfuel/sdk-browser',
      code: `// app/providers.tsx\n'use client';\nimport { InsightFuelProvider } from '@insightfuel/sdk-browser';\n\nexport function Providers({ children }: { children: React.ReactNode }) {\n  return (\n    <InsightFuelProvider apiKey="${activeKey}">\n      {children}\n    </InsightFuelProvider>\n  );\n}`
    },
    vue: {
      title: 'Vue 3 Plugin Setup',
      packageCmd: 'npm install @insightfuel/sdk-browser',
      code: `import { createApp } from 'vue';\nimport { InsightFuelVuePlugin } from '@insightfuel/sdk-browser/vue';\nimport App from './App.vue';\n\nconst app = createApp(App);\napp.use(InsightFuelVuePlugin, {\n  apiKey: '${activeKey}'\n});\napp.mount('#app');`
    },
    angular: {
      title: 'Angular Module Setup',
      packageCmd: 'npm install @insightfuel/sdk-browser',
      code: `import { NgModule } from '@angular/core';\nimport { InsightFuelModule } from '@insightfuel/sdk-browser/angular';\n\n@NgModule({\n  imports: [\n    InsightFuelModule.forRoot({\n      apiKey: '${activeKey}'\n    })\n  ]\n})\nexport class AppModule {}`
    },
    js: {
      title: 'Vanilla JavaScript SDK Setup',
      packageCmd: 'npm install @insightfuel/browser',
      code: `import InsightFuel from '@insightfuel/browser';\n\nInsightFuel.init({\n  apiKey: '${activeKey}',\n  endpoint: 'https://api.insightfuel.io'\n});\n\n// Track custom event payload\nInsightFuel.track('button_clicked', {\n  button_id: 'checkout_now'\n});`
    },
    node: {
      title: 'Node.js Backend Server SDK',
      packageCmd: 'npm install @insightfuel/sdk-node',
      code: `const { InsightFuelServer } = require('@insightfuel/sdk-node');\n\nconst analytics = new InsightFuelServer({\n  apiKey: '${activeKey}',\n  endpoint: 'https://api.insightfuel.io'\n});\n\nanalytics.track('server_order_created', {\n  orderId: 'ord_9421'\n});`
    },
    python: {
      title: 'Python Backend & Analytics SDK',
      packageCmd: 'pip install insightfuel-sdk',
      code: `import insightfuel\n\ninsightfuel.init(\n    api_key="${activeKey}",\n    endpoint="https://api.insightfuel.io"\n)\n\n# Track python backend event\ninsightfuel.track(\n    event_name="order_processed",\n    properties={"order_id": "ord_9421", "amount": 149.50}\n)`
    },
    other: {
      title: 'HTML CDN Script Tag',
      packageCmd: 'No npm installation required',
      code: `<script \n  src="https://cdn.insightfuel.io/v1/sdk.js" \n  data-api-key="${activeKey}" \n  async>\n</script>`
    }
  };

  const activeSnippet = snippets[selectedFramework || 'react'] || snippets.react;

  const handleCopyKey = () => {
    navigator.clipboard.writeText(activeKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
  };

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(activeSnippet.code);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2500);
  };

  const isDark = theme === 'dark';

  return (
    <div className={`space-y-6 font-sans antialiased ${isDark ? 'text-neutral-100' : 'text-neutral-900'}`}>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight flex items-center space-x-2">
            <Code2 className="h-5 w-5 text-blue-500" />
            <span>SDK Installation & Signal Verification</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Generate dynamic framework snippets bound to project <strong className="text-white">{activeProj?.name}</strong>.
          </p>
        </div>

        {/* Public Write Key Box */}
        <div className="bg-neutral-950 border border-neutral-800 p-2.5 rounded-xl flex items-center space-x-3 text-xs">
          <div className="space-y-0.5">
            <span className="text-[10px] text-neutral-500 uppercase font-semibold block">Active Key</span>
            <span className="font-mono text-white font-medium">{activeKey.substring(0, 18)}...</span>
          </div>
          <button
            onClick={handleCopyKey}
            className="p-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 rounded-lg transition"
            title="Copy Key"
          >
            {copiedKey ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Framework Selector Tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-2 border-b border-neutral-800">
        {[
          { id: 'react', label: 'React' },
          { id: 'next', label: 'Next.js' },
          { id: 'vue', label: 'Vue 3' },
          { id: 'angular', label: 'Angular' },
          { id: 'js', label: 'JavaScript' },
          { id: 'node', label: 'Node.js' },
          { id: 'python', label: 'Python' },
          { id: 'other', label: 'HTML Script' }
        ].map(fw => (
          <button
            key={fw.id}
            onClick={() => setSelectedFramework(fw.id as any)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
              selectedFramework === fw.id
                ? 'bg-neutral-800 text-white font-semibold'
                : 'bg-neutral-950 text-neutral-400 hover:bg-neutral-900 border border-neutral-800'
            }`}
          >
            {fw.label}
          </button>
        ))}
      </div>

      {/* Snippet Code Container */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-semibold text-white">
            <Boxes className="h-4 w-4 text-blue-500" />
            <span>{activeSnippet.title}</span>
          </div>

          <button
            onClick={handleCopySnippet}
            className="px-3 py-1.5 bg-white text-black hover:bg-neutral-100 rounded-lg text-xs font-semibold shadow-sm transition flex items-center space-x-1"
          >
            {copiedSnippet ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copiedSnippet ? 'Copied' : 'Copy Code'}</span>
          </button>
        </div>

        {/* Package Command */}
        <div className="p-4 bg-black border-b border-neutral-900 text-xs font-mono text-neutral-300 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Terminal className="h-4 w-4 text-neutral-500" />
            <span>{activeSnippet.packageCmd}</span>
          </div>
        </div>

        {/* Code Snippet Box */}
        <div className="p-6 bg-black font-mono text-xs text-blue-300 overflow-x-auto leading-relaxed">
          <pre>{activeSnippet.code}</pre>
        </div>
      </div>

      {/* Embedded SDK Verification Component */}
      <SDKVerification apiKey={activeKey} projectName={activeProj?.name} />
    </div>
  );
}
