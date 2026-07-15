import { useState } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { 
  LayoutDashboard, 
  BarChart3, 
  Cpu, 
  Activity, 
  Heart, 
  FolderGit2, 
  Bell, 
  LogOut, 
  User, 
  Menu, 
  X,
  Sparkles
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeView: string;
  onViewChange: (view: string) => void;
}

export default function DashboardLayout({ children, activeView, onViewChange }: DashboardLayoutProps) {
  const { 
    user, 
    logout, 
    activeOrgId, 
    activeProjectId, 
    orgs, 
    projects, 
    switchOrganization, 
    switchProject 
  } = useAuthStore();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const navigation = [
    { name: 'Overview', view: 'overview', icon: LayoutDashboard },
    { name: 'Analytics Workspace', view: 'analytics', icon: BarChart3 },
    { name: 'Feature Intelligence', view: 'feature-intel', icon: Cpu },
    { name: 'Product Health', view: 'product-health', icon: Heart },
    { name: 'AI Recommendations', view: 'recommendations', icon: Sparkles },
    { name: 'Executive Analytics', view: 'executive', icon: Activity },
    { name: 'Project Administration', view: 'admin', icon: FolderGit2 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col border-r border-slate-800 transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:h-screen
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-850 bg-slate-950">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="font-bold text-white text-sm">IF</span>
            </div>
            <span className="font-bold text-lg tracking-tight">Insight<span className="text-blue-500">Fuel</span></span>
          </div>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        <div className="p-4 border-b border-slate-800/60 bg-slate-900/50">
          <label className="block text-[10px] font-semibold tracking-wider text-slate-400 uppercase mb-1">
            Organization
          </label>
          <select 
            value={activeOrgId}
            onChange={(e) => switchOrganization(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            {orgs.map(org => (
              <option key={org.id} value={org.id}>{org.name}</option>
            ))}
          </select>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
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
                  w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150
                  ${active 
                    ? 'bg-blue-600 text-white font-semibold' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }
                `}
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-full bg-blue-900/50 flex items-center justify-center border border-blue-500/30">
              <User className="h-4.5 w-4.5 text-blue-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white truncate max-w-[120px]">
                {user?.email || 'Demo User'}
              </p>
              <p className="text-[10px] text-slate-500 uppercase font-semibold">
                {user?.role || 'Owner'}
              </p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="text-slate-400 hover:text-red-400 transition-colors p-1.5 hover:bg-slate-800 rounded-lg"
            title="Log Out"
          >
            <LogOut className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto h-screen relative">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center space-x-4">
            <button 
              className="lg:hidden p-1.5 hover:bg-slate-100 rounded-lg text-slate-500" 
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>

            <div className="flex items-center space-x-2">
              <FolderGit2 className="h-4.5 w-4.5 text-slate-400" />
              <span className="text-slate-500 text-xs">/</span>
              <select
                value={activeProjectId}
                onChange={(e) => switchProject(e.target.value)}
                className="bg-slate-100 border border-slate-200 rounded px-2.5 py-1 text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                {projects.filter(p => p.orgId === activeOrgId).map(proj => (
                  <option key={proj.id} value={proj.id}>{proj.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-4 relative">
            <button 
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 relative"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
            >
              <Bell className="h-5.5 w-5.5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 top-12 w-80 bg-white border border-slate-200 rounded-lg shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                  <span className="font-semibold text-xs text-slate-700">Notifications</span>
                  <button className="text-[10px] text-blue-600 font-semibold" onClick={() => setNotificationsOpen(false)}>
                    Close
                  </button>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  <div className="px-4 py-3 hover:bg-slate-50 border-b border-slate-100 text-xs cursor-pointer">
                    <p className="font-semibold text-slate-800">Reliability Alert</p>
                    <p className="text-slate-500 mt-0.5">JS error rates spike above threshold of 70%.</p>
                  </div>
                  <div className="px-4 py-3 hover:bg-slate-50 text-xs cursor-pointer">
                    <p className="font-semibold text-slate-800">Adoption warning</p>
                    <p className="text-slate-500 mt-0.5">User interaction adoption rates dropped by 12.0%.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
