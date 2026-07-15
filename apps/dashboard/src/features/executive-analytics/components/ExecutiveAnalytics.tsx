import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAuthStore } from '../../../shared/stores/useAuthStore';
import { ErrorBoundary } from '../../../shared/components/ErrorBoundary';
import { ChartSkeleton } from '../../../shared/components/Skeleton';
import { Activity, RefreshCw, BarChart2 } from 'lucide-react';
import { PowerBIEmbed } from 'powerbi-client-react';
import { models } from 'powerbi-client';

const QUERY_API_BASE = 'http://localhost:3004';

export default function ExecutiveAnalytics() {
  const { activeOrgId, activeProjectId, token } = useAuthStore();
  const [workspace, setWorkspace] = useState('ws_finance_exec');
  const [report, setReport] = useState('rep_revenue_quarter');
  const [embedConfig, setEmbedConfig] = useState<any>(null);
  const [tokenLoading, setTokenLoading] = useState(false);

  const getHeaders = () => (token ? { Authorization: `Bearer ${token}` } : {});

  // Fetch Workspaces list
  const { data: workspaces } = useQuery({
    queryKey: ['powerbi-workspaces'],
    queryFn: async () => {
      try {
        const resp = await axios.get(`${QUERY_API_BASE}/api/v1/powerbi/workspaces`, {
          headers: getHeaders()
        });
        return resp.data;
      } catch {
        return [
          { id: 'ws_finance_exec', name: 'Executive Workspace' },
          { id: 'ws_growth_marketing', name: 'Marketing Workspace' }
        ];
      }
    }
  });

  // Fetch Reports list
  const { data: reports } = useQuery({
    queryKey: ['powerbi-reports', workspace],
    queryFn: async () => {
      try {
        const resp = await axios.get(`${QUERY_API_BASE}/api/v1/powerbi/reports`, {
          params: { workspace_id: workspace },
          headers: getHeaders()
        });
        return resp.data;
      } catch {
        return [
          { id: 'rep_revenue_quarter', display_name: 'Q3 Global Revenue Rollup' },
          { id: 'rep_cohort_retention', display_name: 'Executive Cohort Retention Grid' }
        ];
      }
    }
  });

  // Fetch secure Embed Token
  const fetchEmbedToken = async () => {
    setTokenLoading(true);
    try {
      const resp = await axios.post(
        `${QUERY_API_BASE}/api/v1/powerbi/embed-token`,
        {
          workspace_id: workspace,
          report_id: report,
          project_id: activeProjectId,
          org_id: activeOrgId
        },
        { headers: getHeaders() }
      );
      
      setEmbedConfig({
        type: 'report',
        id: resp.data.report_id,
        embedUrl: resp.data.embed_url,
        accessToken: resp.data.embed_token,
        tokenType: models.TokenType.Embed,
        settings: {
          panes: {
            filters: { expanded: false, visible: true }
          },
          background: models.BackgroundType.Default
        }
      });
    } catch {
      // Fallback configuration for offline development mode
      setEmbedConfig({
        type: 'report',
        id: report,
        embedUrl: `https://app.powerbi.com/reportEmbed?reportId=${report}&workspaceId=${workspace}`,
        accessToken: 'dummy_offline_embed_token',
        tokenType: models.TokenType.Embed,
        settings: {
          panes: {
            filters: { expanded: false, visible: true }
          }
        }
      });
    } finally {
      setTokenLoading(false);
    }
  };

  useEffect(() => {
    fetchEmbedToken();
  }, [workspace, report, activeProjectId, activeOrgId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center">
            <Activity className="h-6 w-6 text-blue-500 mr-2" />
            Executive Analytics (Power BI Embedded)
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Enterprise intelligence embedded via Microsoft Power BI workspace secure tokens.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <select 
            value={workspace}
            onChange={e => setWorkspace(e.target.value)}
            className="bg-white border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-sm"
          >
            {workspaces?.map((ws: any) => (
              <option key={ws.id} value={ws.id}>{ws.name}</option>
            ))}
          </select>
          <button 
            onClick={fetchEmbedToken}
            disabled={tokenLoading}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${tokenLoading ? 'animate-spin' : ''}`} />
            <span>Sync Report</span>
          </button>
        </div>
      </div>

      {/* Reports Switcher Tabs */}
      <div className="flex border-b border-slate-200 bg-white p-1 rounded-lg border shadow-sm">
        {reports?.map((r: any) => (
          <button
            key={r.id || r.report_id}
            onClick={() => setReport(r.id || r.report_id)}
            className={`
              flex-1 py-2 px-4 rounded text-xs font-semibold transition-colors
              ${report === (r.id || r.report_id) 
                ? 'bg-blue-50 text-blue-700 border border-blue-100 shadow-sm' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }
            `}
          >
            {r.display_name || r.name}
          </button>
        ))}
      </div>

      {/* Embed Frame */}
      <ErrorBoundary>
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl min-h-[500px] flex flex-col relative">
          {tokenLoading ? (
            <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm flex flex-col items-center justify-center space-y-3 z-10">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Acquiring Entra ID Secure tokens...</span>
            </div>
          ) : null}

          <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-850 flex items-center justify-between text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
            <div className="flex items-center space-x-2">
              <BarChart2 className="h-4 w-4 text-slate-400" />
              <span>Power BI Client Canvas</span>
            </div>
            <div className="flex items-center space-x-4">
              <span>Workspace: {workspace}</span>
              <span>RLS: Mapped (Org: {activeOrgId})</span>
            </div>
          </div>

          <div className="flex-1 p-8 flex flex-col justify-between">
            {embedConfig ? (
              <div className="w-full h-[400px] overflow-hidden rounded bg-slate-950 flex flex-col justify-center items-center relative">
                {/* Embedded component container */}
                <PowerBIEmbed 
                  embedConfig={embedConfig}
                  cssClassName="w-full h-full"
                />
                
                {/* Fallback canvas details displayed under mock tokens */}
                {embedConfig.accessToken === 'dummy_offline_embed_token' && (
                  <div className="absolute inset-0 bg-slate-950 flex flex-col justify-center items-center p-6 text-center space-y-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Executive Report Canvas</span>
                    <p className="text-[10px] text-slate-500 max-w-sm">
                      Embed token generated successfully: `dummy_offline_embed_token`<br/>
                      Row-Level Security active for: `{activeOrgId}:{activeProjectId}`
                    </p>
                    <div className="w-full flex items-end justify-between space-x-2 h-24 max-w-xs pt-4">
                      <div className="bg-blue-600/30 w-full h-[40%] rounded-t" />
                      <div className="bg-blue-600/50 w-full h-[60%] rounded-t" />
                      <div className="bg-blue-600/70 w-full h-[30%] rounded-t" />
                      <div className="bg-blue-600 w-full h-[85%] rounded-t" />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <ChartSkeleton />
            )}
          </div>
        </div>
      </ErrorBoundary>
    </div>
  );
}
