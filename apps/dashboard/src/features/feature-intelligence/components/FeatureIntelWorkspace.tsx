import { useQuery } from '@tanstack/react-query';
import { api } from '../../../shared/services/api';
import { ChartSkeleton, TableSkeleton } from '../../../shared/components/Skeleton';
import { ErrorBoundary } from '../../../shared/components/ErrorBoundary';
import { Cpu, Star } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface FeatureIntelWorkspaceProps {
  projectId: string;
}

export default function FeatureIntelWorkspace({ projectId }: FeatureIntelWorkspaceProps) {
  // Rankings query
  const { data: rankings, isLoading } = useQuery({
    queryKey: ['rankings', projectId],
    queryFn: () => api.getFeatureRankings(projectId),
    staleTime: 30000
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <ChartSkeleton />
        <TableSkeleton />
      </div>
    );
  }

  const chartData = rankings ? [...rankings].sort((a: any, b: any) => b.importance_score - a.importance_score) : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Feature Intelligence Workspace</h1>
        <p className="text-slate-500 text-sm mt-1">
          Perform deeper UI element interaction, adoption depth, and lifecycle transition audits.
        </p>
      </div>

      <ErrorBoundary>
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-4 flex items-center">
            <Star className="h-4.5 w-4.5 text-yellow-500 mr-2" />
            Feature Importance Distribution Rankings
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="feature_id" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip />
                <Bar dataKey="importance_score" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Importance Score" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </ErrorBoundary>

      <ErrorBoundary>
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm overflow-x-auto">
          <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-4 flex items-center">
            <Cpu className="h-4.5 w-4.5 text-blue-500 mr-2" />
            Interaction Stickiness Registry
          </h2>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold bg-slate-50/50">
                <th className="py-2.5 px-3">Feature ID</th>
                <th className="py-2.5 px-3">Adoption Rate</th>
                <th className="py-2.5 px-3">Daily Usage Freq</th>
                <th className="py-2.5 px-3">Stickiness Score</th>
                <th className="py-2.5 px-3">Trend Category</th>
                <th className="py-2.5 px-3">Insights Explanation</th>
              </tr>
            </thead>
            <tbody>
              {rankings?.map((f: any) => (
                <tr key={f.feature_id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-3 font-semibold text-slate-700">{f.feature_id}</td>
                  <td className="py-4 px-3">{(f.adoption_rate * 100).toFixed(0)}%</td>
                  <td className="py-4 px-3">{f.usage_frequency.toFixed(1)} clicks/day</td>
                  <td className="py-4 px-3">
                    <div className="flex items-center space-x-1.5">
                      <div className="w-12 bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div className="bg-blue-600 h-full" style={{ width: `${f.stickiness_score*100}%` }} />
                      </div>
                      <span>{(f.stickiness_score*100).toFixed(0)}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                      f.health_status === 'growing' ? 'bg-green-50 text-green-700' :
                      f.health_status === 'declining' ? 'bg-red-50 text-red-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {f.health_status}
                    </span>
                  </td>
                  <td className="py-4 px-3 text-slate-500 max-w-xs truncate">{f.explanation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ErrorBoundary>
    </div>
  );
}
