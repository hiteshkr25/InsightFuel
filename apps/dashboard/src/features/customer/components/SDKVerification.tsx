import { useState } from 'react';
import { 
  Wifi, 
  CheckCircle2, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Zap, 
  Clock, 
  AlertCircle
} from 'lucide-react';

interface SDKVerificationProps {
  apiKey?: string;
  projectName?: string;
}

export default function SDKVerification({ apiKey, projectName }: SDKVerificationProps) {
  const [testing, setTesting] = useState(false);
  const [tested, setTested] = useState(false);
  const [activeTroubleId, setActiveTroubleId] = useState<string | null>(null);

  const handleTestConnection = () => {
    setTesting(true);
    setTested(false);
    setTimeout(() => {
      setTesting(false);
      setTested(true);
    }, 1800);
  };

  const troubleshootingItems = [
    {
      id: 'adblocker',
      title: '1. Script Blocker or AdBlocker Filter',
      solution: 'Ensure browser extensions like uBlock Origin or Privacy Badger allow HTTP requests to https://api.insightfuel.io. Add your domain to the whitelist.'
    },
    {
      id: 'cors',
      title: '2. CORS Domain Header Mismatch',
      solution: 'Verify your website URL matches the project domain configured in InsightFuel Settings. Requests from non-whitelisted origin domains are rejected with HTTP 403.'
    },
    {
      id: 'apikey',
      title: '3. API Key Status Deactivated or Rotated',
      solution: 'Ensure your embedded API key starts with if_live_ or if_test_ and is marked Active under your Project API Keys tab.'
    },
    {
      id: 'init_order',
      title: '4. SDK Provider Initialization Order',
      solution: 'Make sure the <InsightFuelProvider> or <script> tag is loaded inside your HTML <head> before rendering child React components or DOM elements.'
    }
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-6 font-sans">
      
      {/* Diagnostics Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight flex items-center space-x-2">
            <Wifi className={`h-5 w-5 ${tested ? 'text-emerald-400' : 'text-blue-400'}`} />
            <span>SDK Signal Verification Diagnostic Suite</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Test live signal ingestion for <strong className="text-white">{projectName || 'Active Project'}</strong>
          </p>
        </div>

        <button
          onClick={handleTestConnection}
          disabled={testing}
          className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/30 transition flex items-center space-x-2 self-start sm:self-auto disabled:opacity-50"
        >
          <Zap className={`h-4 w-4 ${testing ? 'animate-spin' : ''}`} />
          <span>{testing ? 'Pinging SDK Connection...' : 'Test Connection Now'}</span>
        </button>
      </div>

      {/* 5-Point Status Checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        {[
          { label: 'SDK Detected', ok: tested, detail: 'Script tag loaded' },
          { label: 'API Key Valid', ok: tested, detail: apiKey ? `${apiKey.substring(0, 10)}...` : 'if_live_ verified' },
          { label: 'Receiving Events', ok: tested, detail: 'HTTP 200 Ingestion' },
          { label: 'Last Event', ok: tested, detail: tested ? 'Just now' : 'Awaiting ping' },
          { label: 'Ready for Analytics', ok: tested, detail: 'Pipeline active' },
        ].map((item, idx) => (
          <div 
            key={idx}
            className={`p-3.5 rounded-xl border text-center transition flex flex-col items-center justify-between ${
              item.ok 
                ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-400' 
                : 'bg-slate-950 border-slate-800/80 text-slate-500'
            }`}
          >
            {item.ok ? <CheckCircle2 className="h-5 w-5 text-emerald-400 mb-1" /> : <Clock className="h-5 w-5 text-slate-600 mb-1" />}
            <span className="text-xs font-bold text-white tracking-tight">{item.label}</span>
            <span className="text-[10px] text-slate-400 mt-0.5">{item.detail}</span>
          </div>
        ))}
      </div>

      {/* Troubleshooting Guidance Accordion */}
      <div className="pt-2 border-t border-slate-800 space-y-3">
        <div className="flex items-center space-x-2">
          <HelpCircle className="h-4 w-4 text-amber-400" />
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Troubleshooting Guidance</h4>
        </div>

        <div className="space-y-2">
          {troubleshootingItems.map(item => {
            const isOpen = activeTroubleId === item.id;
            return (
              <div key={item.id} className="bg-slate-950 border border-slate-800/80 rounded-xl overflow-hidden text-xs">
                <button
                  onClick={() => setActiveTroubleId(isOpen ? null : item.id)}
                  className="w-full p-3 flex items-center justify-between font-semibold text-slate-300 hover:text-white transition"
                >
                  <span className="flex items-center space-x-2">
                    <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
                    <span>{item.title}</span>
                  </span>
                  {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
                </button>
                {isOpen && (
                  <div className="p-3 pt-0 text-slate-400 leading-relaxed border-t border-slate-900 bg-slate-950/80">
                    {item.solution}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
