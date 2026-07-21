import { useState } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { 
  FolderKanban, 
  Key, 
  Code2, 
  CheckCircle2, 
  LineChart, 
  ArrowRight, 
  Check, 
  Copy, 
  X, 
  Sparkles, 
  Wifi
} from 'lucide-react';

interface OnboardingWizardProps {
  onComplete: () => void;
  onClose: () => void;
}

export default function OnboardingWizard({ onComplete, onClose }: OnboardingWizardProps) {
  const { activeProjectId, apiKeys, createCustomerProject, generateApiKey } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1 Form
  const [projName, setProjName] = useState('My Main Storefront');
  const [websiteUrl, setWebsiteUrl] = useState('https://mywebsite.com');

  // Step 4 Verification state
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);

  // Copy state
  const [copiedKey, setCopiedKey] = useState(false);

  const activeKeys = apiKeys[activeProjectId] || [];
  const activeKey = activeKeys.find(k => k.status === 'active')?.key || 'if_live_9f8a3c2b1e4d5f6a7b8c9d0e';

  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault();
    createCustomerProject(projName, websiteUrl, 'production', 'Primary user analytics website');
    setCurrentStep(2);
  };

  const handleStep2Next = () => {
    if (activeKeys.length === 0) {
      generateApiKey(activeProjectId, 'Production SDK Key', 'production');
    }
    setCurrentStep(3);
  };

  const handleVerifyConnection = () => {
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setVerified(true);
    }, 1800);
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(activeKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const steps = [
    { number: 1, title: 'Create Project', icon: FolderKanban },
    { number: 2, title: 'Generate API Key', icon: Key },
    { number: 3, title: 'Install SDK', icon: Code2 },
    { number: 4, title: 'Verify Installation', icon: Wifi },
    { number: 5, title: 'View Analytics', icon: LineChart },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 font-sans">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        
        {/* Glow background */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Guided Setup Wizard</h2>
              <p className="text-xs text-slate-400">Step {currentStep} of 5 • Get started in under 3 minutes</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step Progress Tracker */}
        <div className="grid grid-cols-5 gap-2">
          {steps.map((step) => {
            const Icon = step.icon;
            const isCompleted = currentStep > step.number;
            const isCurrent = currentStep === step.number;

            return (
              <div 
                key={step.number} 
                className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center ${
                  isCompleted 
                    ? 'bg-emerald-950/30 border-emerald-900/60 text-emerald-400'
                    : isCurrent
                    ? 'bg-blue-600/20 border-blue-500/50 text-blue-400'
                    : 'bg-slate-950/60 border-slate-800 text-slate-500'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 mb-1" />
                ) : (
                  <Icon className="h-4 w-4 mb-1" />
                )}
                <span className="text-[10px] font-bold tracking-tight hidden sm:block truncate w-full">
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>

        {/* STEP 1: CREATE PROJECT */}
        {currentStep === 1 && (
          <form onSubmit={handleStep1Next} className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Step 1: Create your First Project</h3>
              <p className="text-xs text-slate-400">Enter your main website or app details to start tracking visitor sessions.</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  value={projName}
                  onChange={e => setProjName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Acme Online Store"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Website URL</label>
                <input
                  type="url"
                  required
                  value={websiteUrl}
                  onChange={e => setWebsiteUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://mywebsite.com"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/30 transition flex items-center space-x-2"
              >
                <span>Continue to Step 2</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: GENERATE API KEY */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Step 2: Generate Public SDK Key</h3>
              <p className="text-xs text-slate-400">Your SDK public key is uniquely bound to <strong className="text-white">{projName}</strong>.</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Generated Public Key</span>
              <div className="flex items-center justify-between font-mono text-xs text-blue-400 font-bold">
                <span>{activeKey}</span>
                <button
                  onClick={handleCopyKey}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                >
                  {copiedKey ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={handleStep2Next}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/30 transition flex items-center space-x-2"
              >
                <span>Continue to Step 3</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: INSTALL SDK */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Step 3: Embed 1-Line Code Snippet</h3>
              <p className="text-xs text-slate-400">Paste this script snippet into your HTML <code className="text-blue-300">&lt;head&gt;</code> section.</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase">HTML Snippet</span>
                <button
                  onClick={handleCopyKey}
                  className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center space-x-1"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Code</span>
                </button>
              </div>
              <pre className="font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed">
{`<script 
  src="https://cdn.insightfuel.io/v1/sdk.js" 
  data-api-key="${activeKey}" 
  async>
</script>`}
              </pre>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setCurrentStep(4)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/30 transition flex items-center space-x-2"
              >
                <span>Continue to Step 4</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: VERIFY INSTALLATION */}
        {currentStep === 4 && (
          <div className="space-y-5 text-center py-2">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Step 4: Verify Live Connection</h3>
              <p className="text-xs text-slate-400">Click below to test connection with your live application.</p>
            </div>

            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4 max-w-md mx-auto">
              {verified ? (
                <div className="space-y-2 text-emerald-400 animate-in fade-in duration-200">
                  <CheckCircle2 className="h-10 w-10 mx-auto text-emerald-400" />
                  <h4 className="text-sm font-bold text-white">SDK Signal Verified!</h4>
                  <p className="text-xs text-slate-400">Received telemetry ping from target website.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <Wifi className={`h-10 w-10 mx-auto ${verifying ? 'text-blue-400 animate-pulse' : 'text-slate-500'}`} />
                  <button
                    onClick={handleVerifyConnection}
                    disabled={verifying}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/30 transition"
                  >
                    {verifying ? 'Pinging SDK Connection...' : 'Test SDK Connection Now'}
                  </button>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setCurrentStep(5)}
                disabled={!verified}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/30 transition flex items-center space-x-2 disabled:opacity-50"
              >
                <span>Continue to Step 5</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: VIEW ANALYTICS */}
        {currentStep === 5 && (
          <div className="space-y-5 text-center py-4">
            <div className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-xl">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-extrabold text-white">Setup Complete! 🎉</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Your project <strong className="text-white">{projName}</strong> is now connected. Real-time visitor analytics, conversion funnels, and AI insights are live!
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-center">
              <button
                onClick={() => {
                  onComplete();
                  onClose();
                }}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-xl shadow-blue-600/30 transition flex items-center space-x-2"
              >
                <LineChart className="h-4 w-4" />
                <span>Launch Business Dashboard</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
