import { useAuthStore, ServiceHealth } from '../../../shared/stores/useAuthStore';
import { 
  Activity, 
  Clock
} from 'lucide-react';

export default function AdminServices() {
  const { servicesHealth } = useAuthStore();

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2.5">
            <Activity className="h-6 w-6 text-rose-500" />
            <span>Microservice Health & Heartbeat Diagnostic Monitor</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time status, latency, uptime %, and heartbeats across all 8 monorepo microservices.
          </p>
        </div>

        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold self-start sm:self-auto">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          <span>All Systems Operational</span>
        </div>
      </div>

      {/* 8 Microservice Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {servicesHealth.map((svc: ServiceHealth) => {
          const isHealthy = svc.status === 'healthy';

          return (
            <div 
              key={svc.id}
              className={`bg-slate-900/90 border rounded-2xl p-5 shadow-xl space-y-4 flex flex-col justify-between transition ${
                isHealthy ? 'border-slate-800/80 hover:border-slate-700' : 'border-red-500/60'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${isHealthy ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                      <h3 className="text-base font-bold text-white tracking-tight">{svc.name}</h3>
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono">{svc.directory}</p>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                    isHealthy ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    {svc.status}
                  </span>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5 font-mono text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Response Latency:</span>
                    <span className="text-blue-400 font-bold">{svc.latencyMs} ms</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Target Uptime:</span>
                    <span className="text-emerald-400 font-bold">{svc.uptime}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center space-x-1">
                  <Clock className="h-3 w-3 text-slate-500" />
                  <span>Heartbeat</span>
                </span>
                <span className="font-semibold text-slate-200">{svc.lastHeartbeat}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
