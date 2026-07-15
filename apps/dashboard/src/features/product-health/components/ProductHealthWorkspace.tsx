import { useQuery } from '@tanstack/react-query';
import { api } from '../../../shared/services/api';
import { ChartSkeleton, TableSkeleton } from '../../../shared/components/Skeleton';
import { ErrorBoundary } from '../../../shared/components/ErrorBoundary';
import { ShieldCheck, Award } from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface ProductHealthWorkspaceProps {
  projectId: string;
}

export default function ProductHealthWorkspace({ projectId }: ProductHealthWorkspaceProps) {
  // Product Health query
  const { data: health, isLoading } = useQuery({
    queryKey: ['health', projectId],
    queryFn: () => api.getProductHealth(projectId),
    staleTime: 30000
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
        <TableSkeleton />
      </div>
    );
  }

  const radarData = [
    { subject: 'Acquisition', value: health?.score_acquisition || 0 },
    { subject: 'Activation', value: health?.score_activation || 0 },
    { subject: 'Engagement', value: health?.score_engagement || 0 },
    { subject: 'Retention', value: health?.score_retention || 0 },
    { subject: 'Adoption', value: health?.score_feature_adoption || 0 },
    { subject: 'Performance', value: health?.score_performance || 0 },
    { subject: 'Reliability', value: health?.score_reliability || 0 },
    { subject: 'UX Quality', value: health?.score_user_experience || 0 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Product Health Workspace</h1>
        <p className="text-slate-500 text-sm mt-1">
          Monitor overall stability, weighted dimensions status, and platform maturity categories.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ErrorBoundary>
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-2">Overall Score</h2>
              <p className="text-slate-500 text-xs">Weighted dimension platform score</p>
            </div>
            <div className="my-6 flex items-center justify-center relative">
              <div className="h-32 w-32 rounded-full border-8 border-slate-100 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-3xl font-extrabold text-slate-800">{health?.health_score}%</span>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">Healthy</p>
                </div>
              </div>
            </div>
            <div className="text-center text-xs text-slate-500 bg-slate-50 py-2 rounded border border-slate-100">
              Confidence Index: <span className="font-bold text-slate-700">{(health?.confidence_score * 100).toFixed(0)}%</span>
            </div>
          </div>
        </ErrorBoundary>

        <ErrorBoundary>
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm lg:col-span-2">
            <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-4">Health Dimensions Breakdown</h2>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" stroke="#64748b" fontSize={10} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#94a3b8" fontSize={8} />
                  <Radar name="Health" dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </ErrorBoundary>
      </div>

      <ErrorBoundary>
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-4 flex items-center">
            <Award className="h-4.5 w-4.5 text-blue-500 mr-2" />
            Maturity Stage Analysis
          </h2>
          <div className="p-6 rounded-lg bg-blue-50/50 border border-blue-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Current Classification</span>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{health?.maturity_stage}</h3>
              <p className="text-slate-600 text-sm mt-1.5">{health?.maturity_reason}</p>
            </div>
            <div className="flex items-center space-x-2 text-xs text-slate-500 bg-white border border-slate-200 p-4 rounded-lg shadow-sm">
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
              <div>
                <p className="font-semibold text-slate-700">Telemetry Validated</p>
                <p className="text-[10px] text-slate-400">Metadata schema matching verified</p>
              </div>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    </div>
  );
}
