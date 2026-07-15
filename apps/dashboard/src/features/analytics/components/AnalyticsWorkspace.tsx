import { useQuery } from '@tanstack/react-query';
import { api } from '../../../shared/services/api';
import { ChartSkeleton, TableSkeleton } from '../../../shared/components/Skeleton';
import { ErrorBoundary } from '../../../shared/components/ErrorBoundary';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Layers, RefreshCw, GitBranch } from 'lucide-react';

interface AnalyticsWorkspaceProps {
  projectId: string;
}

export default function AnalyticsWorkspace({ projectId }: AnalyticsWorkspaceProps) {
  // Funnels query
  const { data: funnels, isLoading: funnelsLoading } = useQuery({
    queryKey: ['funnels', projectId],
    queryFn: () => api.getFunnels(projectId, '', ''),
    staleTime: 30000
  });

  // Retention query
  const { data: retention, isLoading: retentionLoading } = useQuery({
    queryKey: ['retention', projectId],
    queryFn: () => api.getRetention(projectId, '', ''),
    staleTime: 30000
  });

  // Journeys query
  const { data: journeys, isLoading: journeysLoading } = useQuery({
    queryKey: ['journeys', projectId],
    queryFn: () => api.getJourneys(projectId, '', ''),
    staleTime: 30000
  });

  const isLoading = funnelsLoading || retentionLoading || journeysLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
        <TableSkeleton />
      </div>
    );
  }

  // Retention Pivot Map
  const cohorts: { [key: string]: { [day: number]: number } } = {};
  retention?.forEach((r: any) => {
    if (!cohorts[r.cohort_date]) {
      cohorts[r.cohort_date] = {};
    }
    cohorts[r.cohort_date][r.day_number] = r.retention_rate;
  });

  const cohortDays = [0, 1, 7, 30];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Analytics Workspace</h1>
        <p className="text-slate-500 text-sm mt-1">
          Perform deeper conversions behavioral analysis and user journeys mapping.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ErrorBoundary>
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wider flex items-center">
                <Layers className="h-4.5 w-4.5 text-blue-500 mr-2" />
                Checkout Funnel Drop-offs
              </h2>
            </div>
            <div className="h-64 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnels} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis type="category" dataKey="step_name" stroke="#94a3b8" fontSize={10} tickLine={false} width={80} />
                  <Tooltip />
                  <Bar dataKey="completed_users" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Completed Users">
                    {funnels?.map((_: any, index: number) => {
                      const colors = ['#3b82f6', '#60a5fa', '#93c5fd'];
                      return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </ErrorBoundary>

        <ErrorBoundary>
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wider flex items-center">
                <GitBranch className="h-4.5 w-4.5 text-purple-500 mr-2" />
                Top User Navigation Flow Pathways
              </h2>
            </div>
            <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
              {journeys?.map((j: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 rounded bg-slate-50 border border-slate-100 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold px-2 py-0.5 rounded bg-slate-200 text-slate-700">{j.source_path}</span>
                    <span className="text-slate-400 font-bold">→</span>
                    <span className="font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">{j.target_path}</span>
                  </div>
                  <div className="font-semibold text-slate-600">
                    {j.transition_count} sessions
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ErrorBoundary>
      </div>

      <ErrorBoundary>
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm overflow-x-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wider flex items-center">
              <RefreshCw className="h-4.5 w-4.5 text-emerald-500 mr-2" />
              Weekly Cohort Retention Heatmap
            </h2>
          </div>
          <table className="w-full text-center border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-255 bg-slate-50/50">
                <th className="py-2.5 px-3 text-left text-slate-400 font-semibold">Cohort Week</th>
                {cohortDays.map(day => (
                  <th key={day} className="py-2.5 px-3 text-slate-400 font-semibold">Day {day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.keys(cohorts).map(week => (
                <tr key={week} className="border-b border-slate-100">
                  <td className="py-4 px-3 text-left font-semibold text-slate-700">{week}</td>
                  {cohortDays.map(day => {
                    const rate = cohorts[week][day];
                    const percent = rate !== undefined ? `${(rate * 100).toFixed(0)}%` : '-';
                    
                    let bgClass = 'bg-slate-100 text-slate-400';
                    if (rate !== undefined) {
                      if (rate >= 0.8) bgClass = 'bg-emerald-600 text-white font-semibold';
                      else if (rate >= 0.5) bgClass = 'bg-emerald-500/80 text-white font-semibold';
                      else if (rate >= 0.3) bgClass = 'bg-emerald-500/40 text-emerald-900';
                      else bgClass = 'bg-emerald-500/10 text-emerald-800';
                    }

                    return (
                      <td key={day} className="py-4 px-3">
                        <div className={`mx-auto w-12 py-1 rounded text-center text-xs ${bgClass}`}>
                          {percent}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ErrorBoundary>
    </div>
  );
}
