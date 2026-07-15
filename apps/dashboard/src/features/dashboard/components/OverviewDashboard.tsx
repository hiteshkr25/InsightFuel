import { useQuery } from '@tanstack/react-query';
import { api } from '../../../shared/services/api';
import { CardSkeleton, ChartSkeleton, TableSkeleton } from '../../../shared/components/Skeleton';
import { ErrorBoundary } from '../../../shared/components/ErrorBoundary';
import { 
  Users, 
  Activity, 
  Heart, 
  TrendingUp, 
  ArrowRight,
  TrendingDown
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

interface OverviewDashboardProps {
  projectId: string;
}

export default function OverviewDashboard({ projectId }: OverviewDashboardProps) {
  // Activity query
  const { data: activityData, isLoading: activityLoading, error: activityError } = useQuery({
    queryKey: ['activity', projectId],
    queryFn: () => api.getUserActivity(projectId, '', ''),
    staleTime: 30000
  });

  // Sessions query
  const { data: sessionsData, isLoading: sessionsLoading } = useQuery({
    queryKey: ['sessions', projectId],
    queryFn: () => api.getSessions(projectId, '', ''),
    staleTime: 30000
  });

  // Product Health query
  const { data: health, isLoading: healthLoading } = useQuery({
    queryKey: ['health', projectId],
    queryFn: () => api.getProductHealth(projectId),
    staleTime: 30000
  });

  // Feature Rankings query
  const { data: rankings, isLoading: rankingsLoading } = useQuery({
    queryKey: ['rankings', projectId],
    queryFn: () => api.getFeatureRankings(projectId),
    staleTime: 30000
  });

  // Recommendations query
  const { data: recommendations, isLoading: recommendationsLoading } = useQuery({
    queryKey: ['recommendations', projectId],
    queryFn: () => api.getRecommendations(projectId),
    staleTime: 30000
  });

  const isLoading = activityLoading || sessionsLoading || healthLoading || rankingsLoading || recommendationsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2"><ChartSkeleton /></div>
          <div><ChartSkeleton /></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2"><TableSkeleton /></div>
          <div><TableSkeleton /></div>
        </div>
      </div>
    );
  }

  if (activityError) {
    return (
      <div className="p-6 text-center text-red-600 bg-red-50 border border-red-200 rounded-xl">
        Failed to load overview data. Please try again later.
      </div>
    );
  }

  const latestActivity = activityData?.[activityData.length - 1] || {};
  const previousActivity = activityData?.[activityData.length - 2] || {};
  const dauDiff = latestActivity.dau && previousActivity.dau 
    ? ((latestActivity.dau - previousActivity.dau) / previousActivity.dau * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Project Overview</h1>
        <p className="text-slate-500 text-sm mt-1">
          Operational metrics and product signals for project <span className="font-semibold text-slate-700">{projectId}</span>
        </p>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ErrorBoundary>
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium text-xs uppercase tracking-wider">Daily Active Users</span>
              <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-slate-900">{latestActivity.dau || 0}</span>
              <span className={`text-xs font-semibold flex items-center ${parseFloat(dauDiff) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {parseFloat(dauDiff) >= 0 ? '+' : ''}{dauDiff}%
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Compared to yesterday</p>
          </div>
        </ErrorBoundary>

        <ErrorBoundary>
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium text-xs uppercase tracking-wider">Active Sessions</span>
              <div className="h-8 w-8 rounded-lg bg-purple-50 flex items-center justify-center">
                <Activity className="h-5 w-5 text-purple-500" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-slate-900">{sessionsData?.length || 0}</span>
              <span className="text-xs text-slate-400 font-medium">real-time</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Active within portal now</p>
          </div>
        </ErrorBoundary>

        <ErrorBoundary>
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium text-xs uppercase tracking-wider">Product Health Index</span>
              <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <Heart className="h-5 w-5 text-emerald-500" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-slate-900">{health?.health_score || 'N/A'}%</span>
              <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                {health?.health_category}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Weighted metric index average</p>
          </div>
        </ErrorBoundary>

        <ErrorBoundary>
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium text-xs uppercase tracking-wider">Maturity Status</span>
              <div className="h-8 w-8 rounded-lg bg-orange-50 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-orange-500" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline space-x-2">
              <span className="text-xl font-bold text-slate-900">{health?.maturity_stage || 'Unknown'}</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5 truncate">{health?.maturity_reason}</p>
          </div>
        </ErrorBoundary>
      </div>

      {/* Graphs Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ErrorBoundary>
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm lg:col-span-2">
            <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-4">Traffic Volume Trends (DAU)</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityData}>
                  <defs>
                    <linearGradient id="dauColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="timestamp" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="dau" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#dauColor)" name="Daily Active Users" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </ErrorBoundary>

        <ErrorBoundary>
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-4">Live Session Quality Index</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sessionsData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="session_id" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="quality_score" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Quality Score" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </ErrorBoundary>
      </div>

      {/* Feature Rankings & Recommendations Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ErrorBoundary>
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm lg:col-span-2 overflow-x-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">Top Performing Features</h2>
            </div>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold bg-slate-50/50">
                  <th className="py-2.5 px-3">Feature ID</th>
                  <th className="py-2.5 px-3">Adoption</th>
                  <th className="py-2.5 px-3">WoW Growth</th>
                  <th className="py-2.5 px-3">Health Status</th>
                </tr>
              </thead>
              <tbody>
                {rankings?.map((f: any) => (
                  <tr key={f.feature_id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-700">{f.feature_id}</td>
                    <td className="py-3 px-3">{(f.adoption_rate * 100).toFixed(0)}%</td>
                    <td className="py-3 px-3 flex items-center">
                      {f.growth_rate_wow >= 0 ? (
                        <TrendingUp className="h-3.5 w-3.5 text-green-500 mr-1" />
                      ) : (
                        <TrendingDown className="h-3.5 w-3.5 text-red-500 mr-1" />
                      )}
                      <span className={f.growth_rate_wow >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                        {(f.growth_rate_wow * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        f.health_status === 'growing' ? 'bg-green-50 text-green-700' :
                        f.health_status === 'declining' ? 'bg-red-50 text-red-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {f.health_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ErrorBoundary>

        <ErrorBoundary>
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">Top AI Recommendations</h2>
            </div>
            <div className="space-y-4">
              {recommendations?.map((r: any) => (
                <div key={r.id} className="p-4 rounded-lg bg-slate-50 border border-slate-100 flex flex-col space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                      r.severity === 'critical' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {r.severity}
                    </span>
                    <span className="text-[10px] text-slate-400">Score: {r.priority_score}</span>
                  </div>
                  <h3 className="font-bold text-xs text-slate-800 truncate">{r.title}</h3>
                  <p className="text-[10px] text-slate-500 line-clamp-2">{r.description}</p>
                  <div className="pt-1 flex items-center space-x-2 text-[10px] font-semibold text-blue-600">
                    <span>Action required</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ErrorBoundary>
      </div>
    </div>
  );
}
