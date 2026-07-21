import { useState } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { 
  Home, 
  FolderKanban, 
  Key, 
  Boxes, 
  LineChart, 
  Users, 
  Settings, 
  LogOut, 
  User, 
  Menu, 
  X, 
  Sparkles, 
  ShieldAlert, 
  CheckCircle2,
  ChevronDown,
  Building2,
  Cpu,
  HelpCircle,
  Code2
} from 'lucide-react';
import OnboardingWizard7Step from './OnboardingWizard7Step';

interface CustomerLayoutProps {
  children: React.ReactNode;
  activeView: string;
  onViewChange: (view: string) => void;
  onLaunchOnboarding?: () => void;
}

export default function CustomerLayout({ children, activeView, onViewChange }: CustomerLayoutProps) {
  const { 
    user, 
    logout, 
    activeOrgId, 
    activeProjectId, 
    orgs, 
    projects, 
    switchOrganization, 
    switchProject,
    switchPortalMode,
    resendVerification,
    verificationSent
  } = useAuthStore();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  const activeOrg = orgs.find(o => o.id === activeOrgId) || orgs[0];
  const activeProj = projects.find(p => p.id === activeProjectId) || projects[0];

  const navigation = [
    { name: 'Overview', view: 'overview', icon: Home, tooltip: 'Executive business overview & AI insights' },
    { name: 'Projects', view: 'projects', icon: FolderKanban, tooltip: 'Manage customer web projects & environments' },
    { name: 'Analytics', view: 'analytics', icon: LineChart, tooltip: 'Visitor traffic & checkout conversion funnels' },
    { name: 'API Keys', view: 'api-keys', icon: Key, tooltip: 'Production & Development public SDK keys' },
    { name: 'SDK Installation', view: 'sdk-installation', icon: Code2, tooltip: 'Multi-framework installation code snippets' },
    { name: 'Integrations', view: 'integrations', icon: Boxes, tooltip: 'Webhooks & third-party connectors' },
    { name: 'Team', view: 'team', icon: Users, tooltip: 'Organization members & role permissions' },
    { name: 'Settings', view: 'settings', icon: Settings, tooltip: 'Account, organization & subscription billing' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans antialiased">
      
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800/80 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:h-screen
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800/80 bg-slate-950/60">
          <div className="flex items-center space-x-2.5">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-md shadow-blue-500/20 border border-blue-400/20">
              <Sparkles className="h-4.5 w-4.5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight leading-none text-white">
                Insight<span className="text-blue-500">Fuel</span>
              </span>
              <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-0.5">
                Business Analytics
              </span>
            </div>
          </div>
          <button className="lg:hidden text-slate-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Organization / Project Selector */}
        <div className="p-3.5 border-b border-slate-800/80 bg-slate-950/40 relative">
          <button
            onClick={() => setOrgDropdownOpen(!orgDropdownOpen)}
            className="w-full bg-slate-950 hover:bg-slate-850 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between transition group"
            title="Switch Organization Workspace"
          >
            <div className="flex items-center space-x-2.5 truncate">
              <div className="h-7 w-7 rounded-lg bg-blue-950/60 border border-blue-800/50 flex items-center justify-center text-blue-400 font-bold text-xs">
                <Building2 className="h-4 w-4" />
              </div>
              <div className="truncate text-left">
                <p className="text-xs font-semibold text-white truncate max-w-[130px]">
                  {activeOrg?.name || 'My Organization'}
                </p>
                <p className="text-[10px] text-slate-400 truncate max-w-[130px]">
                  {activeProj?.name || 'No Active Project'}
                </p>
              </div>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-white transition" />
          </button>

          {/* Org & Project Dropdown Menu */}
          {orgDropdownOpen && (
            <div className="absolute left-3.5 right-3.5 top-16 z-50 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 space-y-2 animate-in fade-in duration-100">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1">Organizations</p>
                {orgs.map(org => (
                  <button
                    key={org.id}
                    onClick={() => {
                      switchOrganization(org.id);
                      setOrgDropdownOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition ${
                      org.id === activeOrgId ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="truncate">{org.name}</span>
                    {org.id === activeOrgId && <CheckCircle2 className="h-3.5 w-3.5 text-blue-400" />}
                  </button>
                ))}
              </div>

              <div className="pt-1 border-t border-slate-800">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1">Switch Project</p>
                {projects.filter(p => p.orgId === activeOrgId).map(proj => (
                  <button
                    key={proj.id}
                    onClick={() => {
                      switchProject(proj.id);
                      setOrgDropdownOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition ${
                      proj.id === activeProjectId ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' : 'text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <span className="truncate">{proj.name}</span>
                    {proj.id === activeProjectId && <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 8 Business Navigation Links */}
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
                title={item.tooltip}
                className={`
                  w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group relative
                  ${active 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25 border border-blue-500/30' 
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

        {/* Guided Setup Wizard Trigger Button */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 space-y-2">
          <button
            onClick={() => setOnboardingOpen(true)}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md transition"
            title="Launch 7-step guided setup wizard"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Guided Setup Wizard</span>
          </button>

          {/* Admin Switcher */}
          <button
            onClick={() => switchPortalMode('admin')}
            className="w-full flex items-center justify-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-blue-400 hover:border-blue-500/40 transition text-[11px] font-medium"
            title="Switch to Developer Console"
          >
            <Cpu className="h-3.5 w-3.5 text-blue-400" />
            <span>Switch to Platform Admin</span>
          </button>
        </div>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center space-x-3 truncate">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="h-8.5 w-8.5 rounded-full object-cover border border-slate-700" />
            ) : (
              <div className="h-8.5 w-8.5 rounded-full bg-blue-900/60 border border-blue-500/30 flex items-center justify-center text-blue-300 font-bold text-xs">
                <User className="h-4 w-4" />
              </div>
            )}
            <div className="truncate">
              <p className="text-xs font-semibold text-white truncate max-w-[110px]">
                {user?.name || 'Customer User'}
              </p>
              <p className="text-[10px] text-slate-400 truncate max-w-[110px]">
                {user?.email || 'user@company.com'}
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

      {/* Main Content Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto h-screen relative bg-slate-950">
        
        {/* Top Header Bar */}
        <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 flex items-center justify-between px-6 sticky top-0 z-30 shadow-md">
          <div className="flex items-center space-x-4">
            <button 
              className="lg:hidden p-2 hover:bg-slate-800 rounded-xl text-slate-400" 
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Active Project Breadcrumb */}
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-slate-400 font-medium">{activeOrg?.name}</span>
              <span className="text-slate-600">/</span>
              <span className="text-white font-semibold flex items-center space-x-1.5 bg-slate-800/60 px-2.5 py-1 rounded-lg border border-slate-700/50">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{activeProj?.name}</span>
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => onViewChange('sdk-installation')}
              className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600/30 text-xs font-semibold transition"
              title="SDK Code Snippets & Verification"
            >
              <Code2 className="h-3.5 w-3.5" />
              <span>SDK Installation</span>
            </button>
          </div>
        </header>

        {/* Verification Alert Banner */}
        {!user?.emailVerified && (
          <div className="bg-amber-950/40 border-b border-amber-900/50 px-6 py-2.5 flex items-center justify-between text-xs text-amber-200 font-medium">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="h-4 w-4 text-amber-400 flex-shrink-0" />
              <span>
                Please verify your email address (<strong>{user?.email}</strong>) to enable live event ingestion.
              </span>
            </div>
            <button
              onClick={resendVerification}
              className="px-3 py-1 bg-amber-900/60 hover:bg-amber-900 text-amber-200 border border-amber-700/50 rounded-lg transition text-[11px] font-semibold flex items-center space-x-1"
            >
              {verificationSent ? (
                <>
                  <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                  <span>Verification Email Sent!</span>
                </>
              ) : (
                <span>Resend Verification Email</span>
              )}
            </button>
          </div>
        )}

        {/* Dynamic SaaS Page Body */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* 7-Step Onboarding Wizard Modal */}
      {onboardingOpen && (
        <OnboardingWizard7Step
          onComplete={() => onViewChange('overview')}
          onClose={() => setOnboardingOpen(false)}
        />
      )}
    </div>
  );
}
