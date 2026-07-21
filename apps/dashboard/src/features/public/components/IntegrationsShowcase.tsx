import { useState } from 'react';
import { 
  Boxes, 
  ArrowLeft, 
  Copy, 
  Check
} from 'lucide-react';
import { useThemeStore } from '../../../shared/stores/useThemeStore';

interface IntegrationsShowcaseProps {
  onBackToLanding: () => void;
  onNavigateAuth: () => void;
}

export default function IntegrationsShowcase({ onBackToLanding, onNavigateAuth }: IntegrationsShowcaseProps) {
  const { theme } = useThemeStore();
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

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen font-sans antialiased ${isDark ? 'bg-black text-neutral-100' : 'bg-white text-neutral-900'}`}>
      
      {/* Header */}
      <header className={`sticky top-0 z-50 border-b ${isDark ? 'bg-black border-neutral-800' : 'bg-white border-neutral-200'}`}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBackToLanding}
              className={`p-1.5 border rounded-lg transition flex items-center space-x-1 text-xs font-medium ${
                isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white' : 'bg-neutral-100 border-neutral-200 text-neutral-600 hover:text-black'
              }`}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back</span>
            </button>
            <div className="flex items-center space-x-2">
              <Boxes className="h-4 w-4 text-blue-500" />
              <span className="font-semibold text-sm">SDK Integrations</span>
            </div>
          </div>

          <button
            onClick={onNavigateAuth}
            className="px-4 py-2 bg-neutral-100 hover:bg-white text-black rounded-lg text-xs font-semibold transition shadow-sm"
          >
            Get Started Free →
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-8">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Universal SDK Ecosystem</span>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Plug-and-Play Integrations for Any Stack</h1>
          <p className="text-xs text-neutral-400">Lightweight, asynchronous telemetry SDKs designed for zero main-thread overhead.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {integrations.map(item => (
            <div key={item.id} className={`border rounded-xl p-6 space-y-4 flex flex-col justify-between ${
              isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'
            }`}>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{item.icon}</span>
                  <h3 className="text-sm font-semibold text-white">{item.name}</h3>
                </div>

                <div className={`p-2.5 rounded-lg border font-mono text-[11px] text-blue-400 flex items-center justify-between ${
                  isDark ? 'bg-black border-neutral-800' : 'bg-neutral-50 border-neutral-200'
                }`}>
                  <span className="truncate">{item.pkg}</span>
                  <button onClick={() => handleCopy(item.pkg, `${item.id}_pkg`)} className="p-1 text-neutral-400 hover:text-white">
                    {copiedId === `${item.id}_pkg` ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>

                <div className={`p-3 rounded-lg border font-mono text-[10px] text-neutral-300 overflow-x-auto leading-relaxed ${
                  isDark ? 'bg-black border-neutral-800' : 'bg-neutral-950 text-neutral-200 border-neutral-900'
                }`}>
                  <pre>{item.snippet}</pre>
                </div>
              </div>

              <button
                onClick={onNavigateAuth}
                className="w-full py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 rounded-lg text-xs font-medium border border-neutral-800 transition mt-2"
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
