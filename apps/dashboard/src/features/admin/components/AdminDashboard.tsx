import { useAuthStore, CustomerTenant, GlobalProject } from '../../../shared/stores/useAuthStore';
import { 
  Users, 
  Building2, 
  FolderKanban, 
  Key, 
  Activity, 
  CheckCircle2, 
  Zap
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigate: (view: string) => void;
}

export default function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const { allCustomers, allProjectsList, allApiKeysList, servicesHealth } = useAuthStore();

  const totalEvents = allProjectsList.reduce((acc: number, p: GlobalProject) => acc + p.eventCount, 0);
  const activeKeysCount = allApiKeysList.filter(k => k.status === 'active').length;
  const healthyServicesCount = servicesHealth.filter(s => s.status === 'healthy').length;

  return (
    <div className="space-y-8 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2.5">
            <Activity className="h-6 w-6 text-rose-500" />
            <span>Platform Operator Executive Dashboard</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time platform metrics across all tenant organizations, projects, and backend microservices.
          </p>
        </div>

        <div className="flex items-center space-x-3 self-start sm:self-auto">
          <button
            onClick={() => onNavigate('admin-services')}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-rose-600/30 transition flex items-center space-x-2"
          >
            <Activity className="h-4 w-4" />
            <span>Service Health ({healthyServicesCount}/8)</span>
          </button>
        </div>
      </div>

      {/* 7 Key Platform Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Customers */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Customers</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-white tracking-tight">{allCustomers.length}</p>
          <p className="mt-1 text-[11px] text-emerald-400 font-semibold flex items-center space-x-1">
            <span>{allCustomers.filter(c => c.status === 'active').length} active tenants</span>
          </p>
        </div>

        {/* Total Organizations */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Organizations</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-white tracking-tight">{allCustomers.length}</p>
          <p className="mt-1 text-[11px] text-slate-400">Multi-tenant isolation active</p>
        </div>

        {/* Total Projects */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Projects</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <FolderKanban className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-white tracking-tight">{allProjectsList.length}</p>
          <p className="mt-1 text-[11px] text-emerald-400 font-semibold">Configured across tenants</p>
        </div>

        {/* Active API Keys */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Active API Keys</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Key className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-white tracking-tight">{activeKeysCount}</p>
          <p className="mt-1 text-[11px] text-slate-400 font-mono">if_live_ public prefixes</p>
        </div>

        {/* Events Processed */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-lg sm:col-span-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Events Processed</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Zap className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-white tracking-tight">
            {totalEvents > 1000000 ? `${(totalEvents / 1000000).toFixed(2)}M` : totalEvents.toLocaleString()}
          </p>
          <p className="mt-1 text-[11px] text-emerald-400 font-semibold">
            Ingested via Kafka & ClickHouse analytical cluster
          </p>
        </div>

        {/* Microservice Health */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-lg sm:col-span-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Backend Service Status</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-emerald-400 tracking-tight">
            {healthyServicesCount} / 8 Healthy
          </p>
          <p className="mt-1 text-[11px] text-slate-400">
            0 Offline • 0 Warnings • Heartbeats operational
          </p>
        </div>

      </div>

      {/* Top Customers & Recent Registrations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top Customers by Traffic */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Top Platform Customers by Volume</h3>
            <button onClick={() => onNavigate('admin-customers')} className="text-xs font-semibold text-rose-400 hover:text-rose-300">
              View Customers →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-5">Customer / Company</th>
                  <th className="py-3 px-5">Projects</th>
                  <th className="py-3 px-5">Event Volume</th>
                  <th className="py-3 px-5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {allCustomers.map((cust: CustomerTenant) => (
                  <tr key={cust.id} className="hover:bg-slate-850/50 transition">
                    <td className="py-3.5 px-5 font-semibold text-white">
                      <div>
                        <p>{cust.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{cust.companyName}</p>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 font-bold text-slate-300">{cust.projectsCount}</td>
                    <td className="py-3.5 px-5 font-mono text-blue-400 font-bold">
                      {cust.eventVolume.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        cust.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {cust.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Microservices Quick Status */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white">Microservice Latency & Heartbeats</h3>
            <button onClick={() => onNavigate('admin-services')} className="text-xs font-semibold text-rose-400 hover:text-rose-300">
              Full Diagnostics →
            </button>
          </div>

          <div className="space-y-3">
            {servicesHealth.slice(0, 5).map((svc) => (
              <div key={svc.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <div>
                    <p className="font-bold text-white">{svc.name}</p>
                    <p className="text-[10px] text-slate-500 font-mono">{svc.directory}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-blue-400">{svc.latencyMs}ms</span>
                  <p className="text-[10px] text-slate-400">{svc.lastHeartbeat}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
