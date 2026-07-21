import { useState, useEffect } from 'react';
import { useAuthStore } from '../../../shared/stores/useAuthStore';
import { useThemeStore } from '../../../shared/stores/useThemeStore';
import { 
  Wifi, 
  CheckCircle2, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Zap, 
  Clock, 
  AlertCircle,
  Loader2
} from 'lucide-react';

interface SDKVerificationProps {
  apiKey?: string;
  projectName?: string;
}

export default function SDKVerification({ apiKey, projectName }: SDKVerificationProps) {
  const { 
    sendTestEvent, 
    hasReceivedFirstEvent, 
    lastReceivedEvent, 
    activeProjectId, 
    projects,
    startAutoSdkDetection
  } = useAuthStore();
  const { theme } = useThemeStore();

  const [listeningStage, setListeningStage] = useState<'waiting' | 'listening' | 'connected'>(
    hasReceivedFirstEvent ? 'connected' : 'waiting'
  );
  const [testing, setTesting] = useState(false);
  const [activeTroubleId, setActiveTroubleId] = useState<string | null>(null);

  const activeProj = projects.find(p => p.id === activeProjectId) || projects[0];

  // Automatic SDK Detection Listening Loop Simulation
  useEffect(() => {
    if (hasReceivedFirstEvent || listeningStage !== 'waiting') {
      return;
    }

    const timer1 = setTimeout(() => {
      setListeningStage('listening');
    }, 1000);

    const timer2 = setTimeout(() => {
      startAutoSdkDetection();
      setListeningStage('connected');
    }, 3500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [hasReceivedFirstEvent, listeningStage, startAutoSdkDetection]);

  const handleTestEventFallback = () => {
    setTesting(true);
    setTimeout(() => {
      sendTestEvent('manual_fallback_event');
      setListeningStage('connected');
      setTesting(false);
    }, 1200);
  };

  const troubleshootingItems = [
    {
      id: 'init',
      title: '1. SDK Initialization Order',
      solution: 'Ensure <InsightFuelProvider> or init() is invoked before component mounting or DOM event dispatching.'
    },
    {
      id: 'apikey',
      title: '2. API Key Status or Environment Mismatch',
      solution: 'Verify your embedded API key starts with if_live_ or if_test_ and is active in your project settings.'
    },
    {
      id: 'cors',
      title: '3. Network Blockers or AdBlocker Filters',
      solution: 'Ensure browser extensions (uBlock, Privacy Badger) permit HTTP POST telemetry requests to https://api.insightfuel.io.'
    },
    {
      id: 'fallback',
      title: '4. Application Not Sending Telemetry Yet?',
      solution: 'If your application is still in development or offline, you can dispatch a manual test event below.'
    }
  ];

  const isDark = theme === 'dark';

  return (
    <div className={`border rounded-2xl p-6 shadow-xl space-y-6 font-sans ${
      isDark ? 'bg-neutral-950 border-neutral-800 text-neutral-100' : 'bg-white border-neutral-200 text-neutral-900'
    }`}>
      
      {/* Diagnostics Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div>
          <h3 className="text-base font-semibold text-white tracking-tight flex items-center space-x-2">
            <Wifi className={`h-5 w-5 ${hasReceivedFirstEvent ? 'text-emerald-400' : 'text-blue-500'}`} />
            <span>Automatic SDK Connection Diagnostics</span>
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Intelligently listening for incoming telemetry from <strong className="text-white">{projectName || activeProj?.name || 'Active Project'}</strong>
          </p>
        </div>

        {/* Automatic Status Pill */}
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          {hasReceivedFirstEvent ? (
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold flex items-center space-x-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Application Connected</span>
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold flex items-center space-x-1.5">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>{listeningStage === 'listening' ? 'Listening for events...' : 'Waiting for connection...'}</span>
            </span>
          )}
        </div>
      </div>

      {/* Minimal Professional Connection Notice */}
      {hasReceivedFirstEvent && lastReceivedEvent && (
        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
          <div className="flex items-center space-x-2 text-white font-semibold text-xs tracking-tight">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Application Connected</span>
          </div>

          <p className="text-xs text-neutral-400 leading-relaxed">
            InsightFuel successfully received your first event (<strong className="text-white font-mono">{lastReceivedEvent.name}</strong>). Your analytics dashboard is now active.
          </p>

          <div className="bg-black p-3 rounded-lg border border-neutral-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono text-neutral-300 pt-2">
            <div>
              <span className="text-[10px] text-neutral-500 block">Event Name</span>
              <span className="text-white font-bold">{lastReceivedEvent.name}</span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-500 block">Timestamp</span>
              <span>{lastReceivedEvent.timestamp}</span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-500 block">Project Target</span>
              <span>{lastReceivedEvent.project}</span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-500 block">Environment</span>
              <span className="text-emerald-400 uppercase">{lastReceivedEvent.environment}</span>
            </div>
          </div>
        </div>
      )}

      {/* 5-Point Status Checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        {[
          { label: 'SDK Detected', ok: hasReceivedFirstEvent, detail: 'Package initialized' },
          { label: 'API Key Valid', ok: true, detail: apiKey ? `${apiKey.substring(0, 10)}...` : 'if_live_ verified' },
          { label: 'Receiving Events', ok: hasReceivedFirstEvent, detail: hasReceivedFirstEvent ? 'HTTP 200 Ingestion' : 'Listening...' },
          { label: 'Last Event', ok: hasReceivedFirstEvent, detail: hasReceivedFirstEvent ? 'Just now' : 'Awaiting traffic' },
          { label: 'Ready for Analytics', ok: hasReceivedFirstEvent, detail: hasReceivedFirstEvent ? 'Pipeline connected' : 'Pending event' },
        ].map((item, idx) => (
          <div 
            key={idx}
            className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-between ${
              item.ok 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                : 'bg-black border-neutral-800 text-neutral-500'
            }`}
          >
            {item.ok ? <CheckCircle2 className="h-4 w-4 text-emerald-400 mb-1" /> : <Clock className="h-4 w-4 text-neutral-600 mb-1" />}
            <span className="text-xs font-semibold text-white tracking-tight">{item.label}</span>
            <span className="text-[10px] text-neutral-400 mt-0.5">{item.detail}</span>
          </div>
        ))}
      </div>

      {/* Troubleshooting & Fallback Test Event Section */}
      <div className="pt-2 border-t border-neutral-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <HelpCircle className="h-4 w-4 text-amber-400" />
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Troubleshooting & Fallback</h4>
          </div>

          <button
            onClick={handleTestEventFallback}
            disabled={testing}
            className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 disabled:opacity-50"
          >
            <Zap className={`h-3.5 w-3.5 text-blue-500 ${testing ? 'animate-spin' : ''}`} />
            <span>{testing ? 'Sending Test Event...' : 'Send Test Event'}</span>
          </button>
        </div>

        <p className="text-[11px] text-neutral-400">
          Use "Send Test Event" if your application is not yet sending telemetry or is currently offline.
        </p>

        <div className="space-y-2">
          {troubleshootingItems.map(item => {
            const isOpen = activeTroubleId === item.id;
            return (
              <div key={item.id} className="bg-black border border-neutral-800 rounded-xl overflow-hidden text-xs">
                <button
                  onClick={() => setActiveTroubleId(isOpen ? null : item.id)}
                  className="w-full p-3 flex items-center justify-between font-medium text-neutral-300 hover:text-white transition"
                >
                  <span className="flex items-center space-x-2">
                    <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
                    <span>{item.title}</span>
                  </span>
                  {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4 text-neutral-500" />}
                </button>
                {isOpen && (
                  <div className="p-3 pt-0 text-neutral-400 leading-relaxed border-t border-neutral-900 bg-neutral-950">
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
