import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../shared/services/api';
import { TableSkeleton } from '../../../shared/components/Skeleton';
import { ErrorBoundary } from '../../../shared/components/ErrorBoundary';
import { Sparkles, ShieldCheck, Clock, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';

interface AIRecommendationsWorkspaceProps {
  projectId: string;
}

export default function AIRecommendationsWorkspace({ projectId }: AIRecommendationsWorkspaceProps) {
  const queryClient = useQueryClient();

  // Recommendations query
  const { data: recs, isLoading, refetch } = useQuery({
    queryKey: ['recommendations', projectId],
    queryFn: () => api.getRecommendations(projectId),
    staleTime: 30000
  });

  // Mutate recommendation status
  const mutation = useMutation({
    mutationFn: ({ recId, targetStatus }: { recId: string; targetStatus: string }) => 
      api.updateRecommendationStatus(recId, projectId, targetStatus),
    onSuccess: () => {
      // Invalidate query to trigger refresh
      queryClient.invalidateQueries({ queryKey: ['recommendations', projectId] });
    }
  });

  const handleStatusChange = (recId: string, targetStatus: string) => {
    mutation.mutate({ recId, targetStatus });
  };

  if (isLoading) {
    return <TableSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center">
            <Sparkles className="h-6 w-6 text-blue-500 mr-2" />
            AI Recommendations Workspace
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Explainable and actionable product advice driven by statistical signals.
          </p>
        </div>
        <button 
          onClick={() => refetch()}
          className="flex items-center space-x-1 px-3 py-1.5 border border-slate-200 rounded text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      <div className="space-y-4">
        {!recs || recs.length === 0 ? (
          <div className="text-center py-12 bg-white border border-slate-200 rounded-xl">
            <p className="text-slate-400 text-sm">No active recommendations found.</p>
          </div>
        ) : (
          recs.map((r: any) => (
            <ErrorBoundary key={r.id}>
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-150 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      r.severity === 'critical' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                    }`}>
                      {r.severity}
                    </span>
                    <span className="text-slate-400 text-xs">/</span>
                    <span className="text-slate-500 text-xs font-semibold">{r.category}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 bg-white px-2 py-1 rounded border border-slate-200 shadow-sm">
                    <span>Priority Rank:</span>
                    <span className="text-blue-600 font-bold">{r.priority_score}</span>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  <div>
                    <h3 className="font-bold text-lg text-slate-800">{r.title}</h3>
                    <p className="text-slate-600 text-sm mt-1">{r.description}</p>
                  </div>

                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 space-y-2">
                    <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">Supporting Evidence</span>
                    <p className="text-slate-700 text-xs font-medium">{r.evidence?.explanation}</p>
                    <div className="pt-2 flex flex-wrap gap-4 text-[10px] text-slate-400 font-medium border-t border-slate-200/50">
                      <div>Data Quality: <span className="font-bold text-slate-600">95%</span></div>
                      <div>Statistical: <span className="font-bold text-slate-600">90%</span></div>
                      <div>Overall Confidence: <span className="font-bold text-blue-600">{(r.overall_confidence * 100).toFixed(0)}%</span></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <div className="space-y-1">
                      <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">Suggested Action</span>
                      <p className="text-slate-700 text-xs font-medium leading-relaxed">{r.suggested_action}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">Expected Impact</span>
                      <p className="text-slate-700 text-xs font-medium leading-relaxed">{r.expected_impact}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-400 text-xs">Status: <span className="font-bold text-slate-700">{r.status}</span></span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {r.status === 'Generated' && (
                        <>
                          <button 
                            onClick={() => handleStatusChange(r.id, 'Reviewed')}
                            className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold transition-colors animate-pulse-once"
                          >
                            <ShieldCheck className="h-3.5 w-3.5" />
                            <span>Mark Reviewed</span>
                          </button>
                          <button 
                            onClick={() => handleStatusChange(r.id, 'Dismissed')}
                            className="flex items-center space-x-1 px-3 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded text-xs font-semibold transition-colors"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            <span>Dismiss</span>
                          </button>
                        </>
                      )}
                      {r.status === 'Reviewed' && (
                        <>
                          <button 
                            onClick={() => handleStatusChange(r.id, 'Accepted')}
                            className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold transition-colors"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Accept Recommendation</span>
                          </button>
                          <button 
                            onClick={() => handleStatusChange(r.id, 'Dismissed')}
                            className="flex items-center space-x-1 px-3 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded text-xs font-semibold transition-colors"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            <span>Dismiss</span>
                          </button>
                        </>
                      )}
                      {r.status === 'Accepted' && (
                        <button 
                          onClick={() => handleStatusChange(r.id, 'Resolved')}
                          className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold transition-colors"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Resolve alert</span>
                        </button>
                      )}
                      {(r.status === 'Dismissed' || r.status === 'Resolved') && (
                        <button 
                          onClick={() => handleStatusChange(r.id, 'Archived')}
                          className="flex items-center space-x-1 px-3 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded text-xs font-semibold transition-colors"
                        >
                          <Clock className="h-3.5 w-3.5" />
                          <span>Archive record</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </ErrorBoundary>
          ))
        )}
      </div>
    </div>
  );
}
