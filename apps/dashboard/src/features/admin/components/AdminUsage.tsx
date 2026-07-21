import { useAuthStore, CustomerTenant } from '../../../shared/stores/useAuthStore';
import { 
  BarChart3, 
  Database, 
  TrendingUp, 
  AlertCircle, 
  HardDrive, 
  Zap
} from 'lucide-react';

export default function AdminUsage() {
  const { allCustomers, allProjectsList } = useAuthStore();

  const totalEventVolume = allCustomers.reduce((acc, c) => acc + c.eventVolume, 0);
  const inactiveCustomers = allCustomers.filter(c => c.status === 'suspended' || c.eventVolume === 0);

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2.5">
          <BarChart3 className="h-6 w-6 text-rose-500" />
          <span>Platform Global Usage Analytics</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Monitor tenant consumption, API request distribution, and analytical storage quotas.
        </p>
      </div>

      {/* Storage & Data Ingestion Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">ClickHouse Storage</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Database className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-white tracking-tight">418.4 GB</p>
          <p className="mt-1 text-[11px] text-slate-400">Columnar analytical DB allocation</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Redis Cache Memory</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <HardDrive className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-white tracking-tight">12.8 GB</p>
          <p className="mt-1 text-[11px] text-slate-400">Real-time session memory cache</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Monthly Event Ingestion</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Zap className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-white tracking-tight">
            {(totalEventVolume / 1000000).toFixed(2)}M / 10M
          </p>
          <p className="mt-1 text-[11px] text-emerald-400 font-semibold">21.8% of global platform quota</p>
        </div>
      </div>

      {/* Highest Traffic Tenants & Inactive Customers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Highest Traffic Projects */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white tracking-tight flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-blue-400" />
            <span>Highest Traffic Project Spaces</span>
          </h3>

          <div className="space-y-3">
            {allProjectsList.map((proj) => (
              <div key={proj.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 flex justify-between items-center text-xs">
                <div>
                  <p className="font-bold text-white">{proj.name}</p>
                  <p className="text-[10px] text-slate-400">{proj.orgName} ({proj.ownerEmail})</p>
                </div>
                <span className="font-mono text-blue-400 font-bold">{proj.eventCount.toLocaleString()} events</span>
              </div>
            ))}
          </div>
        </div>

        {/* Inactive Customers Alert */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white tracking-tight flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-amber-400" />
            <span>Inactive or Suspended Accounts ({inactiveCustomers.length})</span>
          </h3>

          <div className="space-y-3">
            {inactiveCustomers.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">All customer accounts are active and producing events.</p>
            ) : (
              inactiveCustomers.map((cust: CustomerTenant) => (
                <div key={cust.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-white">{cust.name}</p>
                    <p className="text-[10px] text-slate-400">{cust.companyName} ({cust.email})</p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-extrabold uppercase">
                    {cust.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
