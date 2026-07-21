import React, { useState } from 'react';
import { useAuthStore, Organization, Project } from '../stores/useAuthStore';
import { useThemeStore } from '../stores/useThemeStore';
import { 
  LayoutDashboard, 
  FolderKanban, 
  BarChart3, 
  Key, 
  Code2, 
  Users, 
  Settings, 
  LogOut, 
  Building2, 
  Sparkles,
  ChevronDown,
  Sun,
  Moon,
  Compass
} from 'lucide-react';

interface CustomerLayoutProps {
  children: React.ReactNode;
  activeView: string;
  onViewChange: (view: string) => void;
  onLaunchOnboarding: () => void;
  onNavigateLanding?: () => void;
}

export default function CustomerLayout({ 
  children, 
  activeView, 
  onViewChange,
  onLaunchOnboarding,
  onNavigateLanding
}: CustomerLayoutProps) {
  const { 
    user, 
    orgs, 
    projects, 
    activeOrgId, 
    activeProjectId, 
    switchOrganization, 
    switchProject, 
    logout 
  } = useAuthStore();

  const { theme, toggleTheme } = useThemeStore();
  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false);
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);

  const activeOrg = orgs.find((o: Organization) => o.id === activeOrgId) || orgs[0];
  const activeProject = projects.find((p: Project) => p.id === activeProjectId) || projects[0];

  const handleLogout = () => {
    logout();
    if (onNavigateLanding) {
      onNavigateLanding();
    }
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'api-keys', label: 'API Keys', icon: Key },
    { id: 'integrations', label: 'SDK Setup', icon: Code2 },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen flex font-sans ${isDark ? 'bg-black text-neutral-100' : 'bg-white text-neutral-900'}`}>
      
      {/* LEFT SIDEBAR */}
      <aside className={`w-64 flex-shrink-0 flex flex-col border-r ${
        isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
      }`}>
        
        {/* Brand Logo Header */}
        <div className={`h-16 px-5 flex items-center justify-between border-b ${
          isDark ? 'border-neutral-800' : 'border-neutral-200'
        }`}>
          <div 
            onClick={() => onNavigateLanding && onNavigateLanding()} 
            className="flex items-center space-x-2.5 cursor-pointer select-none"
            title="Go to Home"
          >
            <div className="h-7 w-7 rounded-lg bg-neutral-900 border border-neutral-700 flex items-center justify-center text-white">
              <Sparkles className="h-4 w-4 text-blue-500" />
            </div>
            <span className="font-semibold text-base tracking-tight">
              Insight<span className="text-blue-500">Fuel</span>
            </span>
          </div>
        </div>

        {/* Workspace & Project Switchers */}
        <div className="p-4 space-y-2.5 border-b border-neutral-800/60">
          
          {/* Organization Switcher */}
          <div className="relative">
            <label className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider block mb-1">Organization</label>
            <button
              onClick={() => setOrgDropdownOpen(!orgDropdownOpen)}
              className={`w-full px-3 py-2 rounded-lg border text-xs font-medium flex items-center justify-between transition ${
                isDark ? 'bg-neutral-900 border-neutral-800 hover:border-neutral-700 text-white' : 'bg-white border-neutral-200 hover:border-neutral-300 text-neutral-900'
              }`}
            >
              <div className="flex items-center space-x-2 truncate">
                <Building2 className="h-3.5 w-3.5 text-neutral-400 flex-shrink-0" />
                <span className="truncate">{activeOrg?.name || 'My Organization'}</span>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-neutral-400" />
            </button>

            {orgDropdownOpen && (
              <div className={`absolute top-full left-0 right-0 mt-1 z-50 rounded-lg border shadow-lg py-1 ${
                isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-200' : 'bg-white border-neutral-200 text-neutral-800'
              }`}>
                {orgs.map((o: Organization) => (
                  <button
                    key={o.id}
                    onClick={() => {
                      switchOrganization(o.id);
                      setOrgDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-neutral-800/50 flex items-center justify-between ${
                      o.id === activeOrgId ? 'text-blue-500 font-semibold' : ''
                    }`}
                  >
                    <span>{o.name}</span>
                    <span className="text-[10px] text-neutral-500 uppercase">{o.plan}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Project Switcher */}
          <div className="relative">
            <label className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider block mb-1">Project</label>
            <button
              onClick={() => setProjectDropdownOpen(!projectDropdownOpen)}
              className={`w-full px-3 py-2 rounded-lg border text-xs font-medium flex items-center justify-between transition ${
                isDark ? 'bg-neutral-900 border-neutral-800 hover:border-neutral-700 text-white' : 'bg-white border-neutral-200 hover:border-neutral-300 text-neutral-900'
              }`}
            >
              <div className="flex items-center space-x-2 truncate">
                <FolderKanban className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                <span className="truncate">{activeProject?.name || 'Primary Storefront'}</span>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-neutral-400" />
            </button>

            {projectDropdownOpen && (
              <div className={`absolute top-full left-0 right-0 mt-1 z-50 rounded-lg border shadow-lg py-1 ${
                isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-200' : 'bg-white border-neutral-200 text-neutral-800'
              }`}>
                {projects.map((p: Project) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      switchProject(p.id);
                      setProjectDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-neutral-800/50 ${
                      p.id === activeProjectId ? 'text-blue-500 font-semibold' : ''
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Nav Links */}
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
                <Icon className={`h-4 w-4 ${isActive ? 'text-blue-500' : 'text-neutral-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* SIMPLIFIED CUSTOMER SIDEBAR BOTTOM SECTION */}
        <div className={`p-4 border-t ${isDark ? 'border-neutral-800 bg-neutral-950' : 'border-neutral-200 bg-neutral-50'}`}>
          <div className="flex items-center justify-between">
            <div className="min-w-0 pr-2">
              <p className="text-xs font-medium text-white truncate">{user?.name || 'Customer'}</p>
              <p className="text-[10px] text-neutral-400 truncate">{user?.email}</p>
            </div>
            
            <div className="flex items-center space-x-1 flex-shrink-0">
              <button
                onClick={() => onViewChange('settings')}
                className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-md transition"
                title="Settings"
              >
                <Settings className="h-4 w-4" />
              </button>
              <button
                onClick={handleLogout}
                className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-neutral-800 rounded-md transition"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header Bar */}
        <header className={`h-16 px-8 flex items-center justify-between border-b ${
          isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-white border-neutral-200'
        }`}>
          
          <div className="flex items-center space-x-3">
            <h1 className="text-base font-semibold tracking-tight capitalize">{activeView.replace('-', ' ')}</h1>
          </div>

          <div className="flex items-center space-x-4">
            
            {/* Guided Onboarding Launch button */}
            <button
              onClick={onLaunchOnboarding}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition flex items-center space-x-1.5 ${
                isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white' : 'bg-neutral-100 border-neutral-200 text-neutral-700 hover:text-neutral-900'
              }`}
            >
              <Compass className="h-3.5 w-3.5 text-blue-500" />
              <span>Setup Guide</span>
            </button>

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

        {/* Page Content Viewport */}
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
