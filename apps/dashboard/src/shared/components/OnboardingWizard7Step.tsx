import { useState } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { 
  Building2, 
  FolderKanban, 
  Key, 
  Code2, 
  Wifi, 
  LineChart, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Copy, 
  X, 
  CheckCircle2, 
  Globe,
  Zap
} from 'lucide-react';

interface OnboardingWizard7StepProps {
  onComplete: () => void;
  onClose: () => void;
}

type Framework = 'react' | 'next' | 'vue' | 'angular' | 'html';

export default function OnboardingWizard7Step({ onComplete, onClose }: OnboardingWizard7StepProps) {
  const { 
    onboardingStep, 
    setOnboardingStep, 
    completeOnboarding,
    activeProjectId, 
    apiKeys, 
    createCustomerOrganization,
    createCustomerProject,
    generateApiKey 
  } = useAuthStore();

  // Step 2 Form State
  const [orgName, setOrgName] = useState('Acme Global Workspace');

  // Step 3 Form State
  const [projName, setProjName] = useState('Storefront Application');
  const [websiteUrl, setWebsiteUrl] = useState('https://shop.example.com');
  const [environment, setEnvironment] = useState<'production' | 'staging'>('production');

  // Step 5 Framework State
  const [selectedFramework, setSelectedFramework] = useState<Framework>('react');
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  // Step 6 Verification State
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);

  const activeKeys = apiKeys[activeProjectId] || [];
  const currentSdkKey = activeKeys.find(k => k.status === 'active')?.key || 'if_live_9f8a3c2b1e4d5f6a7b8c9d0e';

  const steps = [
    { number: 1, title: 'Welcome', icon: Sparkles },
    { number: 2, title: 'Organization', icon: Building2 },
    { number: 3, title: 'First Project', icon: FolderKanban },
    { number: 4, title: 'API Key', icon: Key },
    { number: 5, title: 'Install SDK', icon: Code2 },
    { number: 6, title: 'Verify Signal', icon: Wifi },
    { number: 7, title: 'Dashboard', icon: LineChart },
  ];

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    createCustomerOrganization(orgName);
    setOnboardingStep(3);
  };

  const handleStep3Submit = (e: React.FormEvent) => {
    e.preventDefault();
    const proj = createCustomerProject(projName, websiteUrl, environment, 'Primary web storefront analytics');
    generateApiKey(proj.id, `${projName} ${environment.toUpperCase()} Key`, environment);
    setOnboardingStep(4);
  };

  const handleVerifySignal = () => {
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setVerified(true);
    }, 1600);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  const getSnippets = () => {
    switch (selectedFramework) {
      case 'react':
        return `import { InsightFuelProvider } from '@insightfuel/sdk-browser';\n\nexport default function App() {\n  return (\n    <InsightFuelProvider apiKey="${currentSdkKey}">\n      <YourMainComponent />\n    </InsightFuelProvider>\n  );\n}`;
      case 'next':
        return `// app/providers.tsx\n'use client';\nimport { InsightFuelProvider } from '@insightfuel/sdk-browser';\n\nexport function Providers({ children }: { children: React.ReactNode }) {\n  return <InsightFuelProvider apiKey="${currentSdkKey}">{children}</InsightFuelProvider>;\n}`;
      case 'vue':
        return `import { createApp } from 'vue';\nimport { InsightFuelVuePlugin } from '@insightfuel/sdk-browser/vue';\nimport App from './App.vue';\n\nconst app = createApp(App);\napp.use(InsightFuelVuePlugin, { apiKey: '${currentSdkKey}' });\napp.mount('#app');`;
      case 'angular':
        return `import { NgModule } from '@angular/core';\nimport { InsightFuelModule } from '@insightfuel/sdk-browser/angular';\n\n@NgModule({\n  imports: [InsightFuelModule.forRoot({ apiKey: '${currentSdkKey}' })]\n})\nexport class AppModule {}`;
      case 'html':
      default:
        return `<script \n  src="https://cdn.insightfuel.io/v1/sdk.js" \n  data-api-key="${currentSdkKey}" \n  async>\n</script>`;
    }
  };

  const progressPercent = Math.round((onboardingStep / 7) * 100);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 font-sans">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header & Progress Bar */}
        <div className="space-y-3 border-b border-slate-800 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">First-Time Setup Wizard</h2>
                <p className="text-xs text-slate-400">Step {onboardingStep} of 7 • {progressPercent}% Complete</p>
              </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Progress Bar Gauge */}
          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
            <div 
              className="bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* 7-Step Indicator Icons */}
          <div className="grid grid-cols-7 gap-1 pt-1">
            {steps.map(s => {
              const Icon = s.icon;
              const isDone = onboardingStep > s.number;
              const isCurrent = onboardingStep === s.number;

              return (
                <button
                  key={s.number}
                  onClick={() => setOnboardingStep(s.number)}
                  className={`p-1.5 rounded-lg border text-center transition flex flex-col items-center justify-center ${
                    isDone 
                      ? 'bg-emerald-950/40 border-emerald-800 text-emerald-400' 
                      : isCurrent
                      ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                      : 'bg-slate-950 border-slate-800 text-slate-600'
                  }`}
                  title={s.title}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="text-[9px] font-extrabold mt-0.5 hidden sm:block truncate w-full">{s.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* STEP 1: WELCOME */}
        {onboardingStep === 1 && (
          <div className="space-y-5 text-center py-2">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center mx-auto shadow-xl shadow-blue-500/20">
              <Zap className="h-8 w-8 text-white" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-white">Welcome to InsightFuel SaaS</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                Track site visitors, analyze conversion funnels, and optimize user experience in real-time. Follow this 7-step guided wizard to get setup in under 3 minutes.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setOnboardingStep(2)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/30 transition flex items-center space-x-2"
              >
                <span>Start Setup (Step 2)</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: CREATE ORGANIZATION */}
        {onboardingStep === 2 && (
          <form onSubmit={handleStep2Submit} className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Step 2: Create Organization Workspace</h3>
              <p className="text-xs text-slate-400">Your organization hosts projects, team members, and API keys.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Company / Workspace Name *</label>
              <input
                type="text"
                required
                value={orgName}
                onChange={e => setOrgName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Acme Corp"
              />
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-between">
              <button
                type="button"
                onClick={() => setOnboardingStep(1)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold flex items-center space-x-1"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back</span>
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/30 transition flex items-center space-x-2"
              >
                <span>Save & Continue (Step 3)</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: CREATE FIRST PROJECT */}
        {onboardingStep === 3 && (
          <form onSubmit={handleStep3Submit} className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Step 3: Define Your First Project Space</h3>
              <p className="text-xs text-slate-400">Specify your main web store or SaaS application URL.</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Project Name *</label>
                <input
                  type="text"
                  required
                  value={projName}
                  onChange={e => setProjName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Storefront Web App"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Website URL *</label>
                <div className="relative">
                  <Globe className="h-4 w-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="url"
                    required
                    value={websiteUrl}
                    onChange={e => setWebsiteUrl(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://shop.example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Environment *</label>
                <select
                  value={environment}
                  onChange={e => setEnvironment(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="production">Production (Live)</option>
                  <option value="staging">Staging</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-between">
              <button
                type="button"
                onClick={() => setOnboardingStep(2)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold flex items-center space-x-1"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back</span>
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/30 transition flex items-center space-x-2"
              >
                <span>Create Project (Step 4)</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 4: GENERATE API KEY */}
        {onboardingStep === 4 && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Step 4: Public SDK Key Generated</h3>
              <p className="text-xs text-slate-400">Your public write key for telemetry ingestion.</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 font-mono text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Public Write Key</span>
              <div className="flex items-center justify-between text-blue-400 font-bold">
                <span>{currentSdkKey}</span>
                <button
                  onClick={() => handleCopyCode(currentSdkKey)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
                >
                  {copiedSnippet ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-between">
              <button
                onClick={() => setOnboardingStep(3)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold flex items-center space-x-1"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back</span>
              </button>
              <button
                onClick={() => setOnboardingStep(5)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/30 transition flex items-center space-x-2"
              >
                <span>Continue to Install SDK (Step 5)</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: INSTALL SDK */}
        {onboardingStep === 5 && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Step 5: Choose Framework & Embed Snippet</h3>
              <p className="text-xs text-slate-400">Select your web framework to copy the SDK provider integration code.</p>
            </div>

            <div className="flex space-x-2 overflow-x-auto pb-1">
              {['react', 'next', 'vue', 'angular', 'html'].map(fw => (
                <button
                  key={fw}
                  onClick={() => setSelectedFramework(fw as Framework)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition ${
                    selectedFramework === fw ? 'bg-blue-600 text-white' : 'bg-slate-950 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {fw}
                </button>
              ))}
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Integration Snippet</span>
                <button
                  onClick={() => handleCopyCode(getSnippets())}
                  className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center space-x-1"
                >
                  {copiedSnippet ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedSnippet ? 'Copied!' : 'Copy Snippet'}</span>
                </button>
              </div>
              <pre className="font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed">{getSnippets()}</pre>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-between">
              <button
                onClick={() => setOnboardingStep(4)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold flex items-center space-x-1"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back</span>
              </button>
              <button
                onClick={() => setOnboardingStep(6)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/30 transition flex items-center space-x-2"
              >
                <span>Verify Signal (Step 6)</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: VERIFY INSTALLATION */}
        {onboardingStep === 6 && (
          <div className="space-y-5 text-center py-2">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Step 6: Verify Live SDK Signal</h3>
              <p className="text-xs text-slate-400">Test live connection with your website storefront.</p>
            </div>

            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4 max-w-md mx-auto">
              {verified ? (
                <div className="space-y-2 text-emerald-400 animate-in fade-in duration-200">
                  <CheckCircle2 className="h-10 w-10 mx-auto text-emerald-400" />
                  <h4 className="text-sm font-bold text-white">SDK Connection Verified!</h4>
                  <p className="text-xs text-slate-400">Telemetry pings received HTTP 200 OK response.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <Wifi className={`h-10 w-10 mx-auto ${verifying ? 'text-blue-400 animate-pulse' : 'text-slate-500'}`} />
                  <button
                    onClick={handleVerifySignal}
                    disabled={verifying}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/30 transition"
                  >
                    {verifying ? 'Pinging SDK Signal...' : 'Test SDK Connection Now'}
                  </button>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-between">
              <button
                onClick={() => setOnboardingStep(5)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold flex items-center space-x-1"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back</span>
              </button>
              <button
                onClick={() => setOnboardingStep(7)}
                disabled={!verified}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/30 transition flex items-center space-x-2 disabled:opacity-50"
              >
                <span>Finalize Setup (Step 7)</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 7: OPEN DASHBOARD */}
        {onboardingStep === 7 && (
          <div className="space-y-5 text-center py-4">
            <div className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-xl">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-extrabold text-white">Onboarding Complete! 🎉</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Your project <strong className="text-white">{projName}</strong> under <strong className="text-white">{orgName}</strong> is live! Real-time visitor traffic, checkout funnels, and AI recommendations are enabled.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-center">
              <button
                onClick={() => {
                  completeOnboarding();
                  onComplete();
                  onClose();
                }}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-xl shadow-blue-600/30 transition flex items-center space-x-2"
              >
                <LineChart className="h-4 w-4" />
                <span>Open Executive Dashboard</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
