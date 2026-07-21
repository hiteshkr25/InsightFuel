import { useState } from 'react';
import { 
  Search, 
  BookOpen, 
  AlertCircle, 
  Copy, 
  Check, 
  ArrowLeft, 
  ChevronRight
} from 'lucide-react';

interface DocsPortalProps {
  onBackToLanding: () => void;
  onNavigateAuth: () => void;
}

interface DocArticle {
  id: string;
  category: string;
  title: string;
  summary: string;
  content: string;
  codeSnippet?: string;
}

export default function DocsPortal({ onBackToLanding, onNavigateAuth }: DocsPortalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const docsArticles: DocArticle[] = [
    {
      id: 'quickstart',
      category: 'Quick Start',
      title: '5-Minute Quick Start Guide',
      summary: 'Get up and running with InsightFuel analytics in under 5 minutes.',
      content: 'To start tracking visitor engagement, create your project in the InsightFuel portal to retrieve your production write key. Next, embed our lightweight SDK into your application.',
      codeSnippet: 'import { InsightFuelProvider } from \'@insightfuel/sdk-browser\';\n\nexport default function App() {\n  return (\n    <InsightFuelProvider apiKey=\'if_live_9f8a3c2b1e4d5f6a7b8c9d0e\'>\n      <MainStorefront />\n    </InsightFuelProvider>\n  );\n}'
    },
    {
      id: 'install',
      category: 'Installation',
      title: 'Package Installation Options',
      summary: 'npm, pnpm, yarn, and script tag delivery channels.',
      content: 'InsightFuel SDKs are distributed via NPM packages and globally cached CDN script tags.',
      codeSnippet: '# NPM\nnpm install @insightfuel/sdk-browser\n\n# Script Tag Delivery\n<script src=\'https://cdn.insightfuel.io/v1/sdk.js\' data-api-key=\'YOUR_WRITE_KEY\' async></script>'
    },
    {
      id: 'sdk_react',
      category: 'SDK Guides',
      title: 'React & Next.js Provider Integration',
      summary: 'Context provider for React 18+ and Next.js App Router.',
      content: 'Wrap your main layout or App component with InsightFuelProvider to automatically measure pageview transitions and active user sessions.',
      codeSnippet: '// app/providers.tsx\n\'use client\';\nimport { InsightFuelProvider } from \'@insightfuel/sdk-browser\';\n\nexport function Providers({ children }: { children: React.ReactNode }) {\n  return <InsightFuelProvider apiKey={process.env.NEXT_PUBLIC_INSIGHT_KEY}>{children}</InsightFuelProvider>;\n}'
    },
    {
      id: 'sdk_js',
      category: 'SDK Guides',
      title: 'Vanilla JavaScript SDK Guide',
      summary: 'Direct initialization for single-page applications and custom scripts.',
      content: 'Initialize the global InsightFuel singleton object with your API key.',
      codeSnippet: 'import InsightFuel from \'@insightfuel/browser\';\n\nInsightFuel.init({\n  apiKey: \'if_live_9f8a3c2b1e4d5f6a7b8c9d0e\',\n  endpoint: \'https://api.insightfuel.io\'\n});\n\nInsightFuel.track(\'checkout_button_clicked\', { amount: 149.99 });'
    },
    {
      id: 'events_custom',
      category: 'Tracking Events',
      title: 'Custom Event Payloads & Properties',
      summary: 'Track custom button clicks, form conversions, and checkout transactions.',
      content: 'Pass event payload objects containing metadata properties such as transaction values, category names, or feature flags.',
      codeSnippet: '// Track custom user event\nInsightFuel.track(\'subscription_upgraded\', {\n  plan: \'Growth Pro\',\n  monthly_revenue: 49.00,\n  currency: \'USD\'\n});'
    },
    {
      id: 'api_ingest',
      category: 'API Reference',
      title: 'REST Ingestion Endpoint Reference',
      summary: 'POST /api/v1/events/ingest payload specification.',
      content: 'HTTP API reference for server-to-server event ingestion without requiring client-side JavaScript.',
      codeSnippet: 'POST /api/v1/events/ingest HTTP/1.1\nHost: api.insightfuel.io\nContent-Type: application/json\nX-API-Key: if_live_9f8a3c2b1e4d5f6a7b8c9d0e\n\n{\n  \'event\': \'order_completed\',\n  \'properties\': { \'total\': 299.00 }\n}'
    },
    {
      id: 'troubleshooting',
      category: 'Troubleshooting',
      title: 'CORS & Script Blocker Resolution',
      summary: 'Diagnose AdBlocker rules, CORS headers, and 403 API key rejections.',
      content: 'If event requests return HTTP 403 Forbidden, verify that your project domain matches the origin domain sending telemetry requests.',
      codeSnippet: '// Verify API key prefix\nif (!key.startsWith(\'if_live_\') && !key.startsWith(\'if_test_\')) {\n  console.error(\'Invalid InsightFuel key format\');\n}'
    }
  ];

  const filteredDocs = docsArticles.filter(art => {
    const matchesSearch = searchQuery === '' || 
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      art.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCat = activeCategory === 'all' || art.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  const handleCopy = (snippet: string, id: string) => {
    navigator.clipboard.writeText(snippet);
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
              <BookOpen className="h-5 w-5 text-blue-500" />
              <span className="font-extrabold text-base text-white">InsightFuel Documentation</span>
            </div>
          </div>

          <button
            onClick={onNavigateAuth}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition"
          >
            Open Dashboard →
          </button>
        </div>
      </header>

      {/* Docs Body Container */}
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Nav Categories */}
        <div className="space-y-4">
          
          {/* Interactive Search Bar */}
          <div className="relative">
            <Search className="h-4 w-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search documentation..."
              className="w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Categories Filter list */}
          <div className="space-y-1 bg-slate-900/60 p-2 rounded-2xl border border-slate-800/80 text-xs font-semibold">
            {['all', 'Quick Start', 'Installation', 'SDK Guides', 'Tracking Events', 'API Reference', 'Troubleshooting'].map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`w-full text-left px-3 py-2 rounded-xl transition flex items-center justify-between ${
                  activeCategory === cat ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <span className="capitalize">{cat}</span>
                {activeCategory === cat && <ChevronRight className="h-3.5 w-3.5" />}
              </button>
            ))}
          </div>
        </div>

        {/* Documentation Content Articles */}
        <div className="lg:col-span-3 space-y-6">
          {filteredDocs.length === 0 ? (
            <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
              <AlertCircle className="h-8 w-8 text-amber-400 mx-auto" />
              <h3 className="text-base font-bold text-white">No documentation topics matched '{searchQuery}'</h3>
              <p className="text-xs text-slate-400">Try searching for 'React', 'Installation', 'API', or 'CORS'.</p>
            </div>
          ) : (
            filteredDocs.map(article => (
              <article key={article.id} className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-xl space-y-4">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-extrabold uppercase">
                    {article.category}
                  </span>
                </div>

                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-white tracking-tight">{article.title}</h2>
                  <p className="text-xs text-slate-400">{article.summary}</p>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {article.content}
                </p>

                {article.codeSnippet && (
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-blue-200 relative group overflow-x-auto leading-relaxed">
                    <button
                      onClick={() => handleCopy(article.codeSnippet!, article.id)}
                      className="absolute top-3 right-3 p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition"
                    >
                      {copiedId === article.id ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                    <pre>{article.codeSnippet}</pre>
                  </div>
                )}
              </article>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
