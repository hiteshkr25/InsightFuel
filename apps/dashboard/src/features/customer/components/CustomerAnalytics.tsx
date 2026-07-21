import { useState } from 'react';
import { useAuthStore, Project } from '../../../shared/stores/useAuthStore';
import { useThemeStore } from '../../../shared/stores/useThemeStore';
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  Activity, 
  Calendar
} from 'lucide-react';
import EmptyState from '../../../shared/components/EmptyState';

export default function CustomerAnalytics() {
  const { projects, activeProjectId, hasReceivedFirstEvent, startAutoSdkDetection } = useAuthStore();
  const { theme } = useThemeStore();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  const activeProj = projects.find((p: Project) => p.id === activeProjectId) || projects[0];
  const isDark = theme === 'dark';

  return (
    <div className={`space-y-6 font-sans antialiased ${isDark ? 'text-neutral-100' : 'text-neutral-900'}`}>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-blue-500" />
            <span>Customer Analytics Intelligence</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Analyze visitor traffic, active user sessions, conversion funnels, and feature usage for <strong className="text-white">{activeProj?.name}</strong>.
          </p>
        </div>

        <div className="flex items-center space-x-3 self-start sm:self-auto">
          <div className="flex space-x-1 bg-neutral-900 border border-neutral-800 p-1 rounded-xl text-xs font-medium">
            {(['7d', '30d', '90d'] as const).map(tr => (
              <button
                key={tr}
                onClick={() => setTimeRange(tr)}
                className={`px-3 py-1 rounded-lg uppercase transition ${
                  timeRange === tr ? 'bg-neutral-800 text-white font-semibold' : 'text-neutral-400 hover:text-white'
                }`}
              >
                {tr}
              </button>
            ))}
          </div>
        </div>
      </div>

      {!hasReceivedFirstEvent ? (
        <EmptyState
          icon={BarChart3}
          title="No Analytics Data Available Yet"
          description="Analytics will begin appearing automatically once traffic is received from your application."
          actionText="Connect Application SDK"
          onAction={startAutoSdkDetection}
        />
      ) : (
        <>
          {/* Analytics Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-neutral-950 p-5 rounded-xl border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span>Unique Visitors</span>
                <Users className="h-4 w-4 text-blue-500" />
              </div>
              <p className="text-2xl font-semibold text-white">48,290</p>
              <p className="text-[10px] font-semibold text-emerald-400">+14.2% vs previous period</p>
            </div>

            <div className="bg-neutral-950 p-5 rounded-xl border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span>Total Sessions</span>
                <Activity className="h-4 w-4 text-indigo-400" />
              </div>
              <p className="text-2xl font-semibold text-white">124,850</p>
              <p className="text-[10px] font-semibold text-emerald-400">+8.5% vs previous period</p>
            </div>

            <div className="bg-neutral-950 p-5 rounded-xl border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span>Avg Session Duration</span>
                <Calendar className="h-4 w-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-semibold text-white">4m 18s</p>
              <p className="text-[10px] font-semibold text-emerald-400">+12s longer engagement</p>
            </div>

            <div className="bg-neutral-950 p-5 rounded-xl border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span>Checkout Conversions</span>
                <TrendingUp className="h-4 w-4 text-cyan-400" />
              </div>
              <p className="text-2xl font-semibold text-white">4.85%</p>
              <p className="text-[10px] font-semibold text-emerald-400">+0.6% improvement</p>
            </div>
          </div>

          {/* Analytics Visual Chart Placeholder */}
          <div className="bg-neutral-950 p-6 rounded-xl border border-neutral-800 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
              <h2 className="text-sm font-semibold text-white">Visitor Traffic Trends ({timeRange})</h2>
              <span className="text-xs text-neutral-500 font-mono">Telemetry Endpoint: https://api.insightfuel.io</span>
            </div>

            <div className="h-48 flex items-end justify-between gap-2 pt-4 px-2">
              {[40, 55, 35, 65, 80, 70, 90, 85, 95, 75, 60, 88, 92, 100].map((val, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                  <div 
                    style={{ height: `${val}%` }} 
                    className="w-full bg-neutral-800 group-hover:bg-blue-500 rounded-t transition-all"
                  />
                  <span className="text-[9px] text-neutral-600 font-mono">d{idx + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
