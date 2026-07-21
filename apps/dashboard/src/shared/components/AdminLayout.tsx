import React from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { useThemeStore } from '../stores/useThemeStore';
import { 
  ShieldCheck, 
  Users, 
  FolderKanban, 
  Key, 
  Activity, 
  BarChart3, 
  FileText, 
  LogOut, 
  ArrowRight,
  Sun,
  Moon
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeView: string;
  onViewChange: (view: string) => void;
}

export default function AdminLayout({ children, activeView, onViewChange }: AdminLayoutProps) {
  const { user, logout, switchPortalMode } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();

  const navItems = [
    { id: 'admin-overview', label: 'SuperAdmin Dashboard', icon: ShieldCheck },
    { id: 'admin-customers', label: 'Customer Management', icon: Users },
    { id: 'admin-projects', label: 'Global Projects', icon: FolderKanban },
    { id: 'admin-api-keys', label: 'API Keys Control', icon: Key },
    { id: 'admin-services', label: 'Microservice Health', icon: Activity },
    { id: 'admin-usage', label: 'Platform Usage', icon: BarChart3 },
    { id: 'admin-audit-logs', label: 'Security Audit Logs', icon: FileText }
  ];

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen flex font-sans ${isDark ? 'bg-black text-neutral-100' : 'bg-white text-neutral-900'}`}>
      
      {/* SUPERADMIN SIDEBAR */}
      <aside className={`w-64 flex-shrink-0 flex flex-col border-r ${
        isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
      }`}>
        
        {/* Brand Header */}
        <div className={`h-16 px-5 flex items-center justify-between border-b ${
          isDark ? 'border-neutral-800' : 'border-neutral-200'
        }`}>
          <div className="flex items-center space-x-2.5">
            <div className="h-7 w-7 rounded-lg bg-neutral-900 border border-neutral-700 flex items-center justify-center text-red-500">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <span className="font-semibold text-sm tracking-tight block">InsightFuel</span>
              <span className="text-[10px] text-red-400 font-semibold uppercase tracking-wider block">SuperAdmin Operator</span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`w-full px-3 py-2 rounded-lg text-xs font-medium flex items-center space-x-2.5 transition ${
                  isActive 
                    ? (isDark ? 'bg-neutral-800 text-white font-semibold' : 'bg-neutral-200 text-neutral-900 font-semibold')
                    : (isDark ? 'text-neutral-400 hover:text-white hover:bg-neutral-900' : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100')
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-red-500' : 'text-neutral-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Bottom Controls */}
        <div className={`p-4 border-t space-y-2 ${isDark ? 'border-neutral-800 bg-neutral-950' : 'border-neutral-200 bg-neutral-50'}`}>
          <button
            onClick={() => switchPortalMode('customer')}
            className={`w-full py-1.5 px-3 rounded-lg border text-xs font-medium transition flex items-center justify-between ${
              isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white' : 'bg-white border-neutral-200 text-neutral-700 hover:text-black'
            }`}
          >
            <span>Customer View</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>

          <div className="flex items-center justify-between pt-2">
            <div className="min-w-0 pr-2">
              <p className="text-xs font-semibold text-white truncate">{user?.name || 'SuperAdmin'}</p>
              <p className="text-[10px] text-neutral-500 truncate">{user?.email}</p>
            </div>
            
            <button
              onClick={logout}
              className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-neutral-800 rounded-md transition"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

      </aside>

      {/* MAIN VIEWPORT */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <header className={`h-16 px-8 flex items-center justify-between border-b ${
          isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-white border-neutral-200'
        }`}>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="h-4 w-4 text-red-500" />
            <h1 className="text-sm font-semibold tracking-tight">Platform Control Center</h1>
          </div>

          <div className="flex items-center space-x-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg border transition ${
                isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white' : 'bg-neutral-100 border-neutral-200 text-neutral-700 hover:text-black'
              }`}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-neutral-600" />}
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
