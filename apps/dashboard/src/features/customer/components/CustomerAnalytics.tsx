import { useState } from 'react';
import { useAuthStore, Project } from '../../../shared/stores/useAuthStore';
import { 
  LineChart as LineChartIcon, 
  Users, 
  Clock, 
  TrendingUp, 
  Eye, 
  Calendar
} from 'lucide-react';

export default function CustomerAnalytics() {
  const { projects, activeProjectId, switchProject } = useAuthStore();
  const [timeRange, setTimeRange] = useState('7d');

  const activeProj = projects.find((p: Project) => p.id === activeProjectId) || projects[0];

  const pageviewsData = [
    { path: '/checkout/step-1', views: 42100, avgTime: '42s', bounceRate: '18.2%' },
    { path: '/products/collection', views: 38900, avgTime: '1m 12s', bounceRate: '24.5%' },
    { path: '/homepage', views: 95400, avgTime: '2m 05s', bounceRate: '12.0%' },
    { path: '/pricing', views: 18200, avgTime: '1m 45s', bounceRate: '31.4%' },
  ];

  const funnelSteps = [
    { step: '1. Landing Visit', users: 10000, conversion: '100%' },
    { step: '2. Product Viewed', users: 6800, conversion: '68.0%' },
    { step: '3. Add to Cart', users: 3200, conversion: '32.0%' },
    { step: '4. Completed Checkout', users: 1950, conversion: '19.5%' },
  ];

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2.5">
            <LineChartIcon className="h-6 w-6 text-blue-500" />
            <span>Customer Analytics</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time session trends, user journeys & conversion funnel performance for <span className="text-blue-400 font-semibold">{activeProj?.name}</span>
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-3 self-start sm:self-auto">
          <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300">
            <Calendar className="h-4 w-4 text-slate-400" />
            <select
              value={timeRange}
              onChange={e => setTimeRange(e.target.value)}
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
            >
              <option value="24h" className="bg-slate-900">Last 24 Hours</option>
              <option value="7d" className="bg-slate-900">Last 7 Days</option>
              <option value="30d" className="bg-slate-900">Last 30 Days</option>
            </select>
          </div>

          <select
            value={activeProjectId}
            onChange={(e) => switchProject(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            {projects.map((proj: Project) => (
              <option key={proj.id} value={proj.id}>{proj.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Active Visitors</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-white tracking-tight">1,420</p>
          <p className="mt-1 text-[11px] text-emerald-400 font-semibold flex items-center space-x-1">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Live on website right now</span>
          </p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Pageviews</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Eye className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-white tracking-tight">194,900</p>
          <p className="mt-1 text-[11px] text-slate-400 flex items-center space-x-1">
            <span className="text-emerald-400 font-semibold">+14.2%</span>
            <span>vs previous period</span>
          </p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Avg Session Time</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-white tracking-tight">3m 45s</p>
          <p className="mt-1 text-[11px] text-slate-400 flex items-center space-x-1">
            <span className="text-emerald-400 font-semibold">+8.5%</span>
            <span>engagement uplift</span>
          </p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Funnel Conversion</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-white tracking-tight">19.5%</p>
          <p className="mt-1 text-[11px] text-slate-400 flex items-center space-x-1">
            <span className="text-emerald-400 font-semibold">1,950 sales</span>
            <span>completed</span>
          </p>
        </div>
      </div>

      {/* Conversion Funnel Section */}
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white tracking-tight flex items-center space-x-2">
          <TrendingUp className="h-4 w-4 text-cyan-400" />
          <span>Checkout Conversion Funnel</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
          {funnelSteps.map((step, idx) => (
            <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 block">{step.step}</span>
              <p className="text-xl font-extrabold text-white">{step.users.toLocaleString()}</p>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full" 
                  style={{ width: step.conversion }} 
                />
              </div>
              <span className="text-[10px] font-bold text-blue-400 block text-right">{step.conversion} conversion</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Pageviews Table */}
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Top Pageviews & Journeys</h3>
          <span className="text-xs text-slate-400">{activeProj?.websiteUrl}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-6">Page Path</th>
                <th className="py-3.5 px-6">Total Views</th>
                <th className="py-3.5 px-6">Avg Duration</th>
                <th className="py-3.5 px-6">Bounce Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {pageviewsData.map((row, i) => (
                <tr key={i} className="hover:bg-slate-850/50 transition">
                  <td className="py-4 px-6 font-mono text-blue-400 font-semibold">
                    {row.path}
                  </td>
                  <td className="py-4 px-6 font-semibold text-white">
                    {row.views.toLocaleString()}
                  </td>
                  <td className="py-4 px-6 text-slate-400">
                    {row.avgTime}
                  </td>
                  <td className="py-4 px-6 text-slate-300">
                    <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 border border-slate-700">
                      {row.bounceRate}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
