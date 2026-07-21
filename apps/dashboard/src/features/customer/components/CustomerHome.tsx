import { 
  Sparkles, 
  ArrowUpRight, 
  Info,
  Compass,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuthStore, Project } from '../../../shared/stores/useAuthStore';
import { useThemeStore } from '../../../shared/stores/useThemeStore';
import ConnectionStatusCenter from '../../../shared/components/ConnectionStatusCenter';
import OnboardingProgressChecklist from '../../../shared/components/OnboardingProgressChecklist';

interface CustomerHomeProps {
  onNavigate: (view: string) => void;
  onLaunchOnboarding: () => void;
}

export default function CustomerHome({ onNavigate, onLaunchOnboarding }: CustomerHomeProps) {
  const { 
    projects, 
    activeProjectId, 
    hasReceivedFirstEvent, 
    lastReceivedEvent,
    isSetupSkipped
  } = useAuthStore();
  const { theme } = useThemeStore();
  const activeProj = projects.find((p: Project) => p.id === activeProjectId) || projects[0];

  const executiveMetrics = [
    { title: 'Total Visitors', value: hasReceivedFirstEvent ? '48,290' : '0', change: hasReceivedFirstEvent ? '+14.2%' : 'Awaiting data', tooltip: 'Unique client sessions measured over the past 30 days.' },
    { title: 'Active Sessions', value: hasReceivedFirstEvent ? '1,420' : '0', change: hasReceivedFirstEvent ? 'Live Now' : 'Offline', tooltip: 'Current active connections transmitting telemetry.' },
    { title: 'Conversion Rate', value: hasReceivedFirstEvent ? '4.85%' : '0.0%', change: hasReceivedFirstEvent ? '+0.6%' : 'Baseline', tooltip: 'Percentage of visitor sessions reaching payment checkout.' },
    { title: 'Health Score', value: hasReceivedFirstEvent ? '99.4%' : '100%', change: 'Optimal', tooltip: 'Composite service availability and API key validity.' }
  ];

  const topFeatures = [
    { name: 'Storefront Checkout Button', category: 'Conversion Funnel', usageCount: '18,420 clicks', conversionImpact: '+24.2%' },
    { name: 'Product Recommendation Carousel', category: 'Discovery Engine', usageCount: '12,890 views', conversionImpact: '+18.5%' },
    { name: 'One-Click Apple Pay', category: 'Payment Gate', usageCount: '9,140 uses', conversionImpact: '+32.0%' }
  ];

  const isDark = theme === 'dark';

  return (
    <div className={`space-y-6 font-sans antialiased ${isDark ? 'text-neutral-100' : 'text-neutral-900'}`}>
      
      {/* 1. PRIORITY CONNECTION STATUS CENTER AT THE VERY TOP */}
      <ConnectionStatusCenter onNavigateIntegrations={() => onNavigate('integrations')} />

      {/* 2. Setup Skipped Subtle Reminder Banner */}
      {isSetupSkipped && !hasReceivedFirstEvent && (
        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center space-x-2.5">
            <AlertCircle className="h-4 w-4 text-amber-400 flex-shrink-0" />
            <div>
              <span className="font-semibold text-white">SDK Connection Pending: </span>
              <span className="text-neutral-400">Your application is not sending telemetry events yet.</span>
            </div>
          </div>

          <button
            onClick={onLaunchOnboarding}
            className="px-3 py-1.5 bg-white text-black hover:bg-neutral-100 font-semibold rounded-lg shadow-sm transition flex-shrink-0"
          >
            Resume Setup Guide
          </button>
        </div>
      )}

      {/* 3. Persistent Setup Progress Checklist Widget */}
      <OnboardingProgressChecklist onLaunchWizard={onLaunchOnboarding} onNavigate={onNavigate} />

      {/* 4. Minimal Connection Notice */}
      {hasReceivedFirstEvent && lastReceivedEvent && (
        <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          isDark ? 'bg-neutral-950 border-neutral-800 text-neutral-300' : 'bg-white border-neutral-200 text-neutral-900 shadow-sm'
        }`}>
          <div className="space-y-0.5">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <h3 className="text-xs font-semibold text-white tracking-tight">Application Connected</h3>
            </div>
            <p className="text-xs text-neutral-400">
              InsightFuel successfully received event <strong className="text-white font-mono">{lastReceivedEvent.name}</strong> at {lastReceivedEvent.timestamp}. Your analytics dashboard is active.
            </p>
          </div>

          <button
            onClick={() => onNavigate('analytics')}
            className="px-3 py-1.5 bg-white text-black hover:bg-neutral-100 rounded-lg text-xs font-semibold shadow-sm transition flex items-center space-x-1 self-start sm:self-auto"
          >
            <span>Explore Analytics</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* 5. Header Banner */}
      <div className={`p-6 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
        isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'
      }`}>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-blue-500 uppercase tracking-wider">Executive Overview</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold uppercase">
              {activeProj?.environment || 'Production'}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-900 text-neutral-400 border border-neutral-800 font-mono uppercase">
              {activeProj?.framework || 'React'}
            </span>
          </div>
          <h1 className="text-xl font-semibold text-white tracking-tight">{activeProj?.name || 'Primary Storefront'}</h1>
          <p className="text-xs text-neutral-400">Real-time visitor tracking and business conversion insights.</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onLaunchOnboarding}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition flex items-center space-x-1.5 ${
              isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white' : 'bg-neutral-100 border-neutral-200 text-neutral-700'
            }`}
          >
            <Compass className="h-3.5 w-3.5 text-blue-500" />
            <span>Setup Guide</span>
          </button>

          <button
            onClick={() => onNavigate('analytics')}
            className="px-4 py-2 bg-white text-black hover:bg-neutral-100 rounded-lg text-xs font-semibold shadow-sm transition flex items-center space-x-1"
          >
            <span>Deep Analytics</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* 6. Executive Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {executiveMetrics.map((m, idx) => (
          <div key={idx} className={`p-5 rounded-xl border space-y-3 ${
            isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-neutral-400 flex items-center space-x-1">
                <span>{m.title}</span>
                <span title={m.tooltip}>
                  <Info className="h-3 w-3 text-neutral-500 cursor-help" />
                </span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-neutral-900 border border-neutral-800 text-[10px] font-semibold text-emerald-400">
                {m.change}
              </span>
            </div>
            <div className="text-2xl font-semibold text-white tracking-tight">{m.value}</div>
          </div>
        ))}
      </div>

      {/* 7. AI Business Insights & Top Features Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Top Feature Engagement List */}
        <div className={`lg:col-span-2 p-6 rounded-xl border space-y-4 ${
          isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
            <h2 className="text-sm font-semibold text-white">Top Feature Engagements</h2>
            <button onClick={() => onNavigate('analytics')} className="text-xs text-blue-500 hover:underline">View All</button>
          </div>

          <div className="divide-y divide-neutral-900">
            {topFeatures.map((f, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <p className="font-semibold text-white">{f.name}</p>
                  <p className="text-[10px] text-neutral-500">{f.category}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono font-medium text-neutral-200">{f.usageCount}</p>
                  <p className="text-[10px] font-semibold text-emerald-400">{f.conversionImpact} conversion</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Business Recommendations */}
        <div className={`p-6 rounded-xl border space-y-4 ${
          isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'
        }`}>
          <div className="flex items-center space-x-2 border-b border-neutral-900 pb-3">
            <Sparkles className="h-4 w-4 text-blue-500" />
            <h2 className="text-sm font-semibold text-white">AI Recommendations</h2>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800 space-y-1">
              <p className="font-semibold text-white">Checkout Friction Detected</p>
              <p className="text-neutral-400 text-[11px]">Mobile sessions drop off 14% on step 2. Enabling Apple Pay is recommended.</p>
            </div>

            <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800 space-y-1">
              <p className="font-semibold text-white">High Visitor Traffic Peak</p>
              <p className="text-neutral-400 text-[11px]">Organic search traffic grew +28% this week from product category pages.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
