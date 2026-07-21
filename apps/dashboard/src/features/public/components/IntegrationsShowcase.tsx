import { useState } from 'react';
import { 
  Boxes, 
  ArrowLeft, 
  Copy, 
  Check
} from 'lucide-react';

interface IntegrationsShowcaseProps {
  onBackToLanding: () => void;
  onNavigateAuth: () => void;
}

export default function IntegrationsShowcase({ onBackToLanding, onNavigateAuth }: IntegrationsShowcaseProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const integrations = [
    {
      id: 'react',
      name: 'React 18+',
      icon: '⚛️',
      pkg: 'npm install @insightfuel/sdk-browser',
      snippet: 'import React from \'react\';\nimport { InsightFuelProvider } from \'@insightfuel/sdk-browser\';\n\nexport default function App() {\n  return (\n    <InsightFuelProvider apiKey=\'YOUR_PUBLIC_WRITE_KEY\'>\n      <MainStorefront />\n    </InsightFuelProvider>\n  );\n}'
    },
    {
      id: 'next',
      name: 'Next.js App Router',
      icon: '▲',
      pkg: 'npm install @insightfuel/sdk-browser',
      snippet: '// app/providers.tsx\n\'use client\';\nimport { InsightFuelProvider } from \'@insightfuel/sdk-browser\';\n\nexport function Providers({ children }: { children: React.ReactNode }) {\n  return <InsightFuelProvider apiKey={process.env.NEXT_PUBLIC_INSIGHT_KEY}>{children}</InsightFuelProvider>;\n}'
    },
    {
      id: 'vue',
      name: 'Vue 3 Plugin',
      icon: '🟢',
      pkg: 'npm install @insightfuel/sdk-browser',
      snippet: 'import { createApp } from \'vue\';\nimport { InsightFuelVuePlugin } from \'@insightfuel/sdk-browser/vue\';\nimport App from \'./App.vue\';\n\nconst app = createApp(App);\napp.use(InsightFuelVuePlugin, { apiKey: \'YOUR_PUBLIC_WRITE_KEY\' });\napp.mount(\'#app\');'
    },
    {
      id: 'angular',
      name: 'Angular Module',
      icon: '🅰️',
      pkg: 'npm install @insightfuel/sdk-browser',
      snippet: 'import { NgModule } from \'@angular/core\';\nimport { InsightFuelModule } from \'@insightfuel/sdk-browser/angular\';\n\n@NgModule({\n  imports: [InsightFuelModule.forRoot({ apiKey: \'YOUR_PUBLIC_WRITE_KEY\' })]\n})\nexport class AppModule {}'
    },
    {
      id: 'js',
      name: 'JavaScript SDK',
      icon: '📜',
      pkg: 'npm install @insightfuel/browser',
      snippet: 'import InsightFuel from \'@insightfuel/browser\';\n\nInsightFuel.init({\n  apiKey: \'YOUR_PUBLIC_WRITE_KEY\',\n  endpoint: \'https://api.insightfuel.io\'\n});\n\nInsightFuel.track(\'checkout_completed\', { amount: 149.99 });'
    },
    {
      id: 'node',
      name: 'Node.js Backend Server',
      icon: '🟢',
      pkg: 'npm install @insightfuel/sdk-node',
      snippet: 'const { InsightFuelServer } = require(\'@insightfuel/sdk-node\');\n\nconst analytics = new InsightFuelServer({\n  apiKey: \'YOUR_PUBLIC_WRITE_KEY\',\n  endpoint: \'https://api.insightfuel.io\'\n});\n\nanalytics.track(\'user_registered\', { userId: \'usr_123\' });'
    }
  ];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased">
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBackToLanding}
              className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition flex items-center space-x-1 text-xs font-semibold"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
            <div className="flex items-center space-x-2">
              <Boxes className="h-5 w-5 text-indigo-400" />
              <span className="font-extrabold text-base text-white">SDK & Framework Integrations</span>
            </div>
          </div>

          <button
            onClick={onNavigateAuth}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition"
          >
            Get Started Free →
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Universal SDK Ecosystem</span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Plug-and-Play Integrations for Any Stack</h1>
          <p className="text-xs text-slate-400">Lightweight, asynchronous telemetry SDKs designed for zero main-thread overhead.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {integrations.map(item => (
            <div key={item.id} className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4 flex flex-col justify-between hover:border-blue-500/40 transition">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{item.icon}</span>
                  <h3 className="text-base font-bold text-white tracking-tight">{item.name}</h3>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-blue-300 flex items-center justify-between">
                  <span className="truncate">{item.pkg}</span>
                  <button onClick={() => handleCopy(item.pkg, `${item.id}_pkg`)} className="p-1 text-slate-400 hover:text-white">
                    {copiedId === `${item.id}_pkg` ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[10px] text-slate-300 overflow-x-auto leading-relaxed">
                  <pre>{item.snippet}</pre>
                </div>
              </div>

              <button
                onClick={onNavigateAuth}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition mt-2"
              >
                Generate API Key & Install
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
