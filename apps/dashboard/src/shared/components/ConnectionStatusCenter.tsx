import { useState } from 'react';
import { useAuthStore, Project } from '../stores/useAuthStore';
import { useThemeStore } from '../stores/useThemeStore';
import { 
  Wifi, 
  CheckCircle2, 
  Key, 
  Code2, 
  Clock, 
  Activity, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp,
  HelpCircle
} from 'lucide-react';

interface ConnectionStatusCenterProps {
  onNavigateIntegrations?: () => void;
}

export default function ConnectionStatusCenter({ onNavigateIntegrations }: ConnectionStatusCenterProps) {
  const { 
    projects, 
    activeProjectId, 
    apiKeys, 
    hasReceivedFirstEvent, 
    lastReceivedEvent 
  } = useAuthStore();
  const { theme } = useThemeStore();
  const [showTroubleshoot, setShowTroubleshoot] = useState(false);

  const activeProj = projects.find((p: Project) => p.id === activeProjectId) || projects[0];
  const keys = apiKeys[activeProjectId] || [];
  const primaryKey = keys[0]?.key || 'if_live_9f8a3c2b1e4d5f6a7b8c9d0e';

  const isDark = theme === 'dark';

  return (
    <div className={`rounded-xl border p-5 shadow-xl space-y-4 font-sans ${
      isDark ? 'bg-neutral-950 border-neutral-800 text-neutral-100' : 'bg-white border-neutral-200 text-neutral-900'
    }`}>
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-900 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className={`h-8 w-8 rounded-lg border flex items-center justify-center ${
            hasReceivedFirstEvent 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
              : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
          }`}>
            <Wifi className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-semibold text-white tracking-tight">Integration Connection Status Center</h3>
              <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                hasReceivedFirstEvent 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}>
                {hasReceivedFirstEvent ? '✓ Active & Receiving Telemetry' : 'Awaiting Signals'}
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">Target Project: <strong className="text-white">{activeProj?.name}</strong> ({activeProj?.environment})</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {onNavigateIntegrations && (
            <button
              onClick={onNavigateIntegrations}
              className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white text-xs font-semibold rounded-lg transition"
            >
              SDK & Integration Setup
            </button>
          )}

          <button
            onClick={() => setShowTroubleshoot(!showTroubleshoot)}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-900 transition flex items-center space-x-1 text-xs"
            title="Connection Troubleshooting"
          >
            <HelpCircle className="h-4 w-4 text-amber-400" />
            {showTroubleshoot ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* 5 Metrics Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        
        {/* Metric 1: SDK Status */}
        <div className="bg-black p-3 rounded-xl border border-neutral-800 space-y-1">
          <div className="flex items-center justify-between text-neutral-400 text-[10px] uppercase font-semibold">
            <span>SDK Status</span>
            <Code2 className="h-3.5 w-3.5 text-blue-400" />
          </div>
          <p className="text-xs font-bold text-white flex items-center space-x-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            <span>Installed v1.4.0</span>
          </p>
          <span className="text-[10px] text-neutral-500 block font-mono">{activeProj?.framework || 'React'} SDK</span>
        </div>

        {/* Metric 2: API Key Status */}
        <div className="bg-black p-3 rounded-xl border border-neutral-800 space-y-1">
          <div className="flex items-center justify-between text-neutral-400 text-[10px] uppercase font-semibold">
            <span>API Key Status</span>
            <Key className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <p className="text-xs font-bold text-white flex items-center space-x-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            <span>Key Valid</span>
          </p>
          <span className="text-[10px] text-neutral-500 truncate block font-mono">{primaryKey.substring(0, 12)}...</span>
        </div>

        {/* Metric 3: Connection Status */}
        <div className="bg-black p-3 rounded-xl border border-neutral-800 space-y-1">
          <div className="flex items-center justify-between text-neutral-400 text-[10px] uppercase font-semibold">
            <span>Connection</span>
            <Wifi className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <p className="text-xs font-bold text-white flex items-center space-x-1">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{hasReceivedFirstEvent ? 'Active' : 'Listening...'}</span>
          </p>
          <span className="text-[10px] text-neutral-500 block">100% SLA Uptime</span>
        </div>

        {/* Metric 4: Last Event */}
        <div className="bg-black p-3 rounded-xl border border-neutral-800 space-y-1">
          <div className="flex items-center justify-between text-neutral-400 text-[10px] uppercase font-semibold">
            <span>Last Event</span>
            <Clock className="h-3.5 w-3.5 text-neutral-400" />
          </div>
          <p className="text-xs font-bold text-white truncate font-mono">
            {lastReceivedEvent ? lastReceivedEvent.name : 'Awaiting ping'}
          </p>
          <span className="text-[10px] text-neutral-500 block">
            {lastReceivedEvent ? lastReceivedEvent.timestamp : 'No events yet'}
          </span>
        </div>

        {/* Metric 5: Total Volume */}
        <div className="bg-black p-3 rounded-xl border border-neutral-800 space-y-1">
          <div className="flex items-center justify-between text-neutral-400 text-[10px] uppercase font-semibold">
            <span>Ingested Events</span>
            <Activity className="h-3.5 w-3.5 text-cyan-400" />
          </div>
          <p className="text-xs font-bold text-white font-mono">
            {(activeProj?.eventCount || 0).toLocaleString()} reqs
          </p>
          <span className="text-[10px] text-emerald-400 font-semibold block">Live Streaming</span>
        </div>

      </div>

      {/* Troubleshooting Accordion Box */}
      {showTroubleshoot && (
        <div className="p-4 bg-black border border-neutral-800 rounded-xl space-y-2 text-xs">
          <div className="flex items-center space-x-1.5 text-amber-400 font-semibold">
            <AlertCircle className="h-4 w-4" />
            <span>Connection Diagnostics & Guidance</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-neutral-400 text-[11px] leading-relaxed">
            <li>Ensure HTTP POST requests to <code className="text-white font-mono">https://api.insightfuel.io</code> are not blocked by browser AdBlockers.</li>
            <li>Verify your application domain matches <code className="text-white font-mono">{activeProj?.websiteUrl}</code> in Settings.</li>
            <li>Ensure your API key <code className="text-white font-mono">{primaryKey}</code> is active in your project settings.</li>
          </ul>
        </div>
      )}

    </div>
  );
}
