import { useState } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { 
  LayoutDashboard, 
  Users, 
  FolderKanban, 
  Key, 
  Activity, 
  BarChart3, 
  ShieldCheck, 
  LogOut, 
  Shield, 
  Menu, 
  X, 
  Eye
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeView: string;
  onViewChange: (view: string) => void;
}

export default function AdminLayout({ children, activeView, onViewChange }: AdminLayoutProps) {
  const { user, logout, switchPortalMode } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Admin Dashboard', view: 'admin-overview', icon: LayoutDashboard },
    { name: 'Customer Management', view: 'admin-customers', icon: Users },
    { name: 'All Projects', view: 'admin-projects', icon: FolderKanban },
    { name: 'API Keys Control', view: 'admin-api-keys', icon: Key },
    { name: 'Microservice Health', view: 'admin-services', icon: Activity },
    { name: 'Usage Analytics', view: 'admin-usage', icon: BarChart3 },
    { name: 'Platform Audit Logs', view: 'admin-audit-logs', icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans antialiased">
      
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-rose-900/30 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:h-screen
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand Operator Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-rose-900/40 bg-rose-950/20">
          <div className="flex items-center space-x-2.5">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center shadow-md shadow-rose-500/20 border border-rose-400/30">
              <Shield className="h-4.5 w-4.5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight leading-none text-white">
                Insight<span className="text-rose-500">Fuel</span>
              </span>
              <span className="text-[9px] text-rose-400 font-extrabold tracking-widest uppercase mt-0.5 flex items-center space-x-1">
                <span>Platform Admin</span>
              </span>
            </div>
          </div>
          <button className="lg:hidden text-slate-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Superadmin Badge Banner */}
        <div className="p-3.5 border-b border-slate-800/80 bg-slate-950/60">
          <div className="bg-rose-950/40 border border-rose-900/60 p-2.5 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="h-4 w-4 text-rose-400" />
              <span className="text-xs font-bold text-white">Operator Console</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[9px] font-extrabold uppercase tracking-wider shadow">
              Superadmin
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigation.map(item => {
            const Icon = item.icon;
            const active = activeView === item.view;
            return (
              <button
                key={item.name}
                onClick={() => {
                  onViewChange(item.view);
                  setSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150
                  ${active 
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/25 border border-rose-500/30' 
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
                  }
                `}
              >
                <Icon className={`h-4.5 w-4.5 ${active ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* View as Customer CTA Button */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
          <button
            onClick={() => switchPortalMode('customer')}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-blue-400 hover:border-blue-500/40 transition text-xs font-medium"
            title="Inspect Customer SaaS Portal View"
          >
            <Eye className="h-3.5 w-3.5 text-blue-400" />
            <span>View as Customer</span>
          </button>
        </div>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center space-x-3 truncate">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="h-8.5 w-8.5 rounded-full object-cover border border-rose-500/40" />
            ) : (
              <div className="h-8.5 w-8.5 rounded-full bg-rose-900/60 border border-rose-500/30 flex items-center justify-center text-rose-300 font-bold text-xs">
                <Shield className="h-4 w-4" />
              </div>
            )}
            <div className="truncate">
              <p className="text-xs font-semibold text-white truncate max-w-[110px]">
                {user?.name || 'Superadmin'}
              </p>
              <p className="text-[10px] text-rose-400 font-mono truncate max-w-[110px]">
                {user?.email || 'admin@insightfuel.io'}
              </p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="text-slate-400 hover:text-red-400 transition p-2 hover:bg-slate-800 rounded-xl"
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>

      {/* Main Admin Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto h-screen relative bg-slate-950">
        
        {/* Top Operator Header */}
        <header className="h-16 bg-slate-900/90 backdrop-blur-md border-b border-rose-900/30 flex items-center justify-between px-6 sticky top-0 z-30 shadow-md">
          <div className="flex items-center space-x-4">
            <button 
              className="lg:hidden p-2 hover:bg-slate-800 rounded-xl text-slate-400" 
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex items-center space-x-2 text-xs">
              <span className="text-rose-400 font-bold uppercase tracking-wider flex items-center space-x-1">
                <Shield className="h-3.5 w-3.5" />
                <span>InsightFuel Core Platform</span>
              </span>
              <span className="text-slate-600">/</span>
              <span className="text-white font-semibold bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
                System Operator Console
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>All 8 Services Healthy</span>
            </span>
          </div>
        </header>

        {/* Dynamic Admin Body */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
