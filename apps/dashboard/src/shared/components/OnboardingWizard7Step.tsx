import { useState, useEffect } from 'react';
import { useAuthStore, SupportedFramework } from '../stores/useAuthStore';
import { useThemeStore } from '../stores/useThemeStore';
import { 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Building2, 
  FolderKanban, 
  Key, 
  Code2, 
  ShieldCheck, 
  Sparkles,
  X,
  Copy,
  Check,
  Zap,
  Terminal,
  Loader2
} from 'lucide-react';

interface OnboardingWizard7StepProps {
  onComplete: () => void;
  onClose: () => void;
}

export default function OnboardingWizard7Step({ onComplete, onClose }: OnboardingWizard7StepProps) {
  const { theme } = useThemeStore();
  const { 
    onboardingStep, 
    setOnboardingStep, 
    createOrganization, 
    createCustomerProject, 
    generateApiKey,
    selectedFramework,
    setSelectedFramework,
    sendTestEvent,
    hasReceivedFirstEvent,
    lastReceivedEvent,
    apiKeys,
    activeProjectId,
    skipOnboarding,
    startAutoSdkDetection
  } = useAuthStore();

  const [orgName, setOrgName] = useState('Acme E-Commerce');
  const [projName, setProjName] = useState('Primary Web Storefront');
  const [websiteUrl, setWebsiteUrl] = useState('https://shop.acme.com');
  const [framework, setFramework] = useState<SupportedFramework>(selectedFramework || 'react');

  // Explicit API Key Form State
  const [keyDisplayName, setKeyDisplayName] = useState('Production Key');
  const [keyEnv, setKeyEnv] = useState<'production' | 'development'>('production');
  const [keyGenerated, setKeyGenerated] = useState(false);

  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [listeningStage, setListeningStage] = useState<'waiting' | 'listening' | 'connected'>(
    hasReceivedFirstEvent ? 'connected' : 'waiting'
  );

  const keys = apiKeys[activeProjectId] || [];
  const activeKeyStr = keys[0]?.key || 'if_live_9f8a3c2b1e4d5f6a7b8c9d0e';

  // Automatic SDK Detection in Step 6
  useEffect(() => {
    if (onboardingStep !== 6 || hasReceivedFirstEvent || listeningStage !== 'waiting') {
      return;
    }

    const t1 = setTimeout(() => setListeningStage('listening'), 800);
    const t2 = setTimeout(() => {
      startAutoSdkDetection();
      setListeningStage('connected');
    }, 3000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onboardingStep, hasReceivedFirstEvent, listeningStage, startAutoSdkDetection]);

  const steps = [
    { num: 1, title: 'Welcome', icon: Sparkles },
    { num: 2, title: 'Organization', icon: Building2 },
    { num: 3, title: 'First Project', icon: FolderKanban },
    { num: 4, title: 'API Key', icon: Key },
    { num: 5, title: 'Install SDK', icon: Code2 },
    { num: 6, title: 'Verification', icon: ShieldCheck },
    { num: 7, title: 'Analytics', icon: CheckCircle2 }
  ];

  const frameworkSnippets: Record<SupportedFramework, { name: string; pkg: string; code: string }> = {
    react: {
      name: 'React 18+',
      pkg: 'npm install @insightfuel/sdk-browser',
      code: `import { InsightFuelProvider } from '@insightfuel/sdk-browser';\n\nexport default function App() {\n  return (\n    <InsightFuelProvider apiKey="${activeKeyStr}">\n      <YourStorefront />\n    </InsightFuelProvider>\n  );\n}`
    },
    next: {
      name: 'Next.js App Router',
      pkg: 'npm install @insightfuel/sdk-browser',
      code: `'use client';\nimport { InsightFuelProvider } from '@insightfuel/sdk-browser';\n\nexport function Providers({ children }) {\n  return (\n    <InsightFuelProvider apiKey="${activeKeyStr}">\n      {children}\n    </InsightFuelProvider>\n  );\n}`
    },
    vue: {
      name: 'Vue 3',
      pkg: 'npm install @insightfuel/sdk-browser',
      code: `import { createApp } from 'vue';\nimport { InsightFuelVuePlugin } from '@insightfuel/sdk-browser/vue';\n\nconst app = createApp(App);\napp.use(InsightFuelVuePlugin, { apiKey: '${activeKeyStr}' });`
    },
    angular: {
      name: 'Angular',
      pkg: 'npm install @insightfuel/sdk-browser',
      code: `import { InsightFuelModule } from '@insightfuel/sdk-browser/angular';\n\n@NgModule({\n  imports: [InsightFuelModule.forRoot({ apiKey: '${activeKeyStr}' })]\n})\nexport class AppModule {}`
    },
    js: {
      name: 'Vanilla JavaScript',
      pkg: 'npm install @insightfuel/browser',
      code: `import InsightFuel from '@insightfuel/browser';\n\nInsightFuel.init({ apiKey: '${activeKeyStr}' });\nInsightFuel.track('page_viewed');`
    },
    node: {
      name: 'Node.js Backend',
      pkg: 'npm install @insightfuel/sdk-node',
      code: `const { InsightFuelServer } = require('@insightfuel/sdk-node');\nconst analytics = new InsightFuelServer({ apiKey: '${activeKeyStr}' });\nanalytics.track('order_placed');`
    },
    python: {
      name: 'Python',
      pkg: 'pip install insightfuel-sdk',
      code: `import insightfuel\n\ninsightfuel.init(api_key="${activeKeyStr}")\ninsightfuel.track(event_name="order_processed", properties={"amount": 149.50})`
    },
    other: {
      name: 'HTML CDN Script Tag',
      pkg: 'CDN Script Embedding',
      code: `<script src="https://cdn.insightfuel.io/v1/sdk.js" data-api-key="${activeKeyStr}" async></script>`
    }
  };

  const currentSnippet = frameworkSnippets[framework];

  const handleGenerateKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyDisplayName) return;
    generateApiKey(activeProjectId || 'proj_1', keyDisplayName, keyEnv);
    setKeyGenerated(true);
  };

  const handleNext = () => {
    if (onboardingStep === 2 && orgName) {
      createOrganization(orgName);
    } else if (onboardingStep === 3 && projName && websiteUrl) {
      setSelectedFramework(framework);
      createCustomerProject(projName, websiteUrl, 'production', 'Initial Storefront', framework);
    }

    if (onboardingStep < 7) {
      setOnboardingStep(onboardingStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (onboardingStep > 1) {
      setOnboardingStep(onboardingStep - 1);
    }
  };

  const handleSkipSetup = () => {
    skipOnboarding();
    onClose();
  };

  const handleTestEventFallback = () => {
    sendTestEvent('manual_fallback_event');
    setListeningStage('connected');
  };

  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className={`w-full max-w-2xl border rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 ${
        isDark ? 'bg-neutral-950 border-neutral-800 text-neutral-100' : 'bg-white border-neutral-200 text-neutral-900'
      }`}>
        
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="h-7 w-7 rounded-md bg-neutral-900 border border-neutral-800 flex items-center justify-center text-blue-500 font-semibold text-xs">
              {onboardingStep}/7
            </div>
            <span className="font-semibold text-sm tracking-tight text-white">InsightFuel Setup Guide</span>
          </div>

          <div className="flex items-center space-x-3">
            <button 
              onClick={handleSkipSetup}
              className="text-xs text-neutral-400 hover:text-white transition"
            >
              Skip Setup
            </button>
            <button onClick={onClose} className="text-neutral-500 hover:text-white p-1 rounded-md">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* 7-Step Progress Indicator */}
        <div className="flex items-center justify-between gap-1 overflow-x-auto pb-2">
          {steps.map((st) => {
            const Icon = st.icon;
            const isCurrent = onboardingStep === st.num;
            const isPassed = onboardingStep > st.num;

            return (
              <div key={st.num} className="flex flex-col items-center min-w-[64px]">
                <div className={`h-8 w-8 rounded-lg border flex items-center justify-center text-xs font-semibold transition ${
                  isPassed 
                    ? 'bg-blue-600 border-blue-500 text-white' 
                    : isCurrent 
                    ? 'bg-neutral-900 border-blue-500 text-blue-400 font-bold' 
                    : 'bg-neutral-900 border-neutral-800 text-neutral-600'
                }`}>
                  {isPassed ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                <span className={`text-[10px] mt-1 truncate ${isCurrent ? 'text-white font-semibold' : 'text-neutral-500'}`}>
                  {st.title}
                </span>
              </div>
            );
          })}
        </div>

        {/* Step Dynamic Content */}
        <div className="py-2 space-y-4">
          
          {/* STEP 1: WELCOME */}
          {onboardingStep === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-white tracking-tight">Welcome to InsightFuel</h2>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  InsightFuel is a high-performance customer and product analytics platform. Let's get your first workspace and telemetry SDK configured.
                </p>
              </div>

              <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 space-y-3 text-xs">
                <span className="font-semibold text-white">Setup Checklist</span>
                <ul className="space-y-2 text-neutral-300">
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>Create Isolated Workspace Organization</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>Configure First Web Project & Framework</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>Generate API Key for Environment</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>Automatic Signal Verification & Activation</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* STEP 2: CREATE ORGANIZATION */}
          {onboardingStep === 2 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-white tracking-tight">Create Workspace Organization</h2>
                <p className="text-xs text-neutral-400 mt-1">Organizations group team members, billing, and projects.</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Organization Name *</label>
                <input
                  type="text"
                  value={orgName}
                  onChange={e => setOrgName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-black border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. Acme E-Commerce Inc"
                />
              </div>
            </div>
          )}

          {/* STEP 3: CREATE FIRST PROJECT & FRAMEWORK */}
          {onboardingStep === 3 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-white tracking-tight">Create First Project & Select Framework</h2>
                <p className="text-xs text-neutral-400 mt-1">Define your web application details and framework.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Project Name *</label>
                  <input
                    type="text"
                    value={projName}
                    onChange={e => setProjName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-black border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="My Storefront"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Website URL *</label>
                  <input
                    type="url"
                    value={websiteUrl}
                    onChange={e => setWebsiteUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-black border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="https://shop.acme.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Select Application Framework *</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'react', label: 'React' },
                    { id: 'next', label: 'Next.js' },
                    { id: 'vue', label: 'Vue 3' },
                    { id: 'angular', label: 'Angular' },
                    { id: 'js', label: 'JavaScript' },
                    { id: 'node', label: 'Node.js' },
                    { id: 'python', label: 'Python' },
                    { id: 'other', label: 'Other/HTML' }
                  ].map(fw => (
                    <button
                      key={fw.id}
                      type="button"
                      onClick={() => setFramework(fw.id as any)}
                      className={`p-2 rounded-xl border text-xs font-medium transition text-center ${
                        framework === fw.id
                          ? 'bg-blue-600 border-blue-500 text-white font-semibold'
                          : 'bg-black border-neutral-800 text-neutral-400 hover:text-white'
                      }`}
                    >
                      {fw.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: EXPLICIT API KEY GENERATION */}
          {onboardingStep === 4 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-white tracking-tight">Generate Write API Key</h2>
                <p className="text-xs text-neutral-400 mt-1">Specify an API key name and environment for telemetry authentication.</p>
              </div>

              {!keyGenerated ? (
                <form onSubmit={handleGenerateKeySubmit} className="bg-black p-4 rounded-xl border border-neutral-800 space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">API Key Name *</label>
                    <input
                      type="text"
                      required
                      value={keyDisplayName}
                      onChange={e => setKeyDisplayName(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="e.g. Production Key, Development Key"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">Environment *</label>
                    <select
                      value={keyEnv}
                      onChange={e => setKeyEnv(e.target.value as any)}
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value="production">Production (if_live_...)</option>
                      <option value="development">Development (if_test_...)</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-white text-black hover:bg-neutral-100 rounded-xl text-xs font-semibold shadow-sm transition flex items-center justify-center space-x-1.5"
                  >
                    <Key className="h-4 w-4" />
                    <span>Generate API Key</span>
                  </button>
                </form>
              ) : (
                <div className="bg-black p-4 rounded-xl border border-neutral-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-semibold text-neutral-400">{keyDisplayName} ({keyEnv})</span>
                    <span className="text-[10px] text-emerald-400 font-semibold uppercase">✓ Active Key</span>
                  </div>
                  <div className="flex items-center justify-between font-mono text-xs text-white">
                    <span>{activeKeyStr}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(activeKeyStr);
                        setCopiedKey(true);
                        setTimeout(() => setCopiedKey(false), 2000);
                      }}
                      className="p-1 text-neutral-400 hover:text-white"
                    >
                      {copiedKey ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 5: INSTALL SDK */}
          {onboardingStep === 5 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white tracking-tight">Install {currentSnippet.name} SDK</h2>
                  <p className="text-xs text-neutral-400 mt-0.5">Embed the telemetry package into your application codebase.</p>
                </div>
                <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">{currentSnippet.name}</span>
              </div>

              <div className="bg-black p-4 rounded-xl border border-neutral-800 font-mono text-xs text-neutral-200 space-y-2">
                <div className="flex items-center justify-between text-neutral-400">
                  <div className="flex items-center space-x-2">
                    <Terminal className="h-4 w-4" />
                    <span>{currentSnippet.pkg}</span>
                  </div>
                </div>
              </div>

              <div className="bg-black p-4 rounded-xl border border-neutral-800 font-mono text-xs text-blue-300 space-y-2 relative">
                <div className="flex items-center justify-between text-neutral-400 mb-1">
                  <span>Initialization Snippet</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(currentSnippet.code);
                      setCopiedCode(true);
                      setTimeout(() => setCopiedCode(false), 2000);
                    }}
                    className="text-xs text-white hover:text-blue-400 flex items-center space-x-1"
                  >
                    {copiedCode ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="overflow-x-auto leading-relaxed">{currentSnippet.code}</pre>
              </div>
            </div>
          )}

          {/* STEP 6: VERIFY CONNECTION */}
          {onboardingStep === 6 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-semibold text-white tracking-tight">Automatic SDK Connection Detection</h2>
                <p className="text-xs text-neutral-400 mt-0.5">InsightFuel is listening for incoming telemetry from your application.</p>
              </div>

              {hasReceivedFirstEvent ? (
                <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
                  <div className="flex items-center space-x-2 text-white font-semibold text-xs">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>✓ Application Connected</span>
                  </div>

                  {lastReceivedEvent && (
                    <p className="text-xs text-neutral-400">
                      Received first event <strong className="text-white font-mono">{lastReceivedEvent.name}</strong> from project <strong className="text-white">{lastReceivedEvent.project}</strong>.
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 text-center space-y-3">
                  <div className="h-10 w-10 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center mx-auto text-blue-400">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white">
                      {listeningStage === 'listening' ? 'Listening for events...' : 'Waiting for connection...'}
                    </h4>
                    <p className="text-[11px] text-neutral-400 mt-0.5">Start your application to transmit the first event payload.</p>
                  </div>

                  <div className="pt-2 border-t border-neutral-800">
                    <button
                      onClick={handleTestEventFallback}
                      className="text-xs text-neutral-400 hover:text-white underline flex items-center space-x-1 mx-auto"
                    >
                      <Zap className="h-3 w-3 text-blue-400" />
                      <span>Having trouble? Send Test Event</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 7: MINIMAL PROFESSIONAL SUCCESS NOTICE */}
          {onboardingStep === 7 && (
            <div className="space-y-4 py-2">
              <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
                <div className="flex items-center space-x-2 text-white font-semibold text-sm">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  <span>Application Connected</span>
                </div>

                <p className="text-xs text-neutral-400 leading-relaxed">
                  InsightFuel successfully received your first event. Your analytics dashboard is now active.
                </p>

                <div className="pt-2 flex items-center space-x-3">
                  <button
                    onClick={onComplete}
                    className="px-4 py-2 bg-white text-black hover:bg-neutral-100 rounded-xl text-xs font-semibold shadow-sm transition"
                  >
                    Explore Dashboard
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Controls */}
        <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={onboardingStep === 1}
            className="px-4 py-2 bg-neutral-900 text-neutral-300 rounded-xl text-xs font-semibold disabled:opacity-40 flex items-center space-x-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Previous</span>
          </button>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleSkipSetup}
              className="text-xs text-neutral-400 hover:text-white"
            >
              I'll connect later
            </button>

            <button
              onClick={handleNext}
              className="px-5 py-2 bg-white text-black hover:bg-neutral-100 rounded-xl text-xs font-semibold shadow-sm transition flex items-center space-x-1"
            >
              <span>{onboardingStep === 7 ? 'Continue to Dashboard' : 'Continue'}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
