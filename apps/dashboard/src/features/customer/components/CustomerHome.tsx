import { useState } from 'react';
import { useAuthStore, Project, Organization } from '../../../shared/stores/useAuthStore';
import { 
  Users, 
  Clock, 
  TrendingUp, 
  Activity, 
  Heart, 
  Sparkles, 
  ArrowUpRight, 
  Copy, 
  Check, 
  ExternalLink,
  Zap,
  HelpCircle,
  Info
} from 'lucide-react';

interface CustomerHomeProps {
  onNavigate: (view: string) => void;
  onLaunchOnboarding?: () => void;
}

export default function CustomerHome({ onNavigate, onLaunchOnboarding }: CustomerHomeProps) {
  const { user, projects, activeProjectId, apiKeys, orgs, activeOrgId } = useAuthStore();
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  const activeOrg = orgs.find((o: Organization) => o.id === activeOrgId) || orgs[0];
  const activeProj = projects.find((p: Project) => p.id === activeProjectId) || projects[0];

  const totalEvents = projects.reduce((acc: number, p: Project) => acc + p.eventCount, 0);

  const handleCopyKey = (keyString: string, keyId: string) => {
    navigator.clipboard.writeText(keyString);
    setCopiedKeyId(keyId);
    setTimeout(() => setCopiedKeyId(null), 2500);
  };

  const topFeatures = [
    { name: '1-Click Checkout Pay Button', engagement: '94.2%', users: 1420 },
    { name: 'Dark Mode Switcher', engagement: '78.5%', users: 980 },
    { name: 'Invoice PDF Downloader', engagement: '45.0%', users: 510 },
  ];

  const recentActivities = [
    { time: 'Just now', user: 'sarah@acme.com', action: 'Completed Checkout ($149.99)' },
    { time: '3 mins ago', user: 'mscott@dunder.com', action: 'Viewed Pricing Tier Matrix' },
    { time: '8 mins ago', user: 'david@enterprise.io', action: 'Generated Production API Key' },
    { time: '14 mins ago', user: 'elena@techcorp.de', action: 'Installed React SDK Tracker' },
  ];

  return (
    <div className="space-y-8 font-sans">
      
      {/* SaaS Executive Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900 border border-blue-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Executive Business Overview • Pro Tier Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.name || 'Customer'} 👋
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl">
              Track site visitors, analyze conversion funnels, and optimize user experience for <strong className="text-white">{activeProj?.name}</strong>.
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {onLaunchOnboarding && (
              <button
                onClick={onLaunchOnboarding}
                className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/30 transition flex items-center space-x-2"
              >
                <HelpCircle className="h-4 w-4" />
                <span>Launch Onboarding Wizard</span>
              </button>
            )}
            <button
              onClick={() => onNavigate('sdk-installation')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-slate-700 transition flex items-center space-x-2"
            >
              <Zap className="h-4 w-4" />
              <span>SDK Setup</span>
            </button>
          </div>
        </div>
      </div>

      {/* AI Business Insights Banner */}
      <div className="bg-gradient-to-r from-indigo-950/60 via-slate-900 to-blue-950/60 border border-indigo-500/30 rounded-2xl p-5 shadow-xl flex items-start space-x-4">
        <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex-shrink-0 mt-0.5">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">AI Business Recommendation</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[9px] font-extrabold">High Impact</span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed">
            "Checkout funnel conversion increased by <strong>+14.2%</strong> after reducing form fields. Recommend promoting the <em>1-Click Pay Button</em> feature on mobile storefronts."
          </p>
        </div>
      </div>

      {/* 6 Key Business Metrics Cards Grid with Tooltips */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* 1. VISITORS */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-lg group relative">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center space-x-1">
              <span>Unique Visitors</span>
              <Info className="h-3 w-3 text-slate-500 cursor-help" />
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-white tracking-tight">142,800</p>
          <p className="mt-1 text-[11px] text-emerald-400 font-semibold flex items-center space-x-1">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>+18.4% growth vs last week</span>
          </p>
        </div>

        {/* 2. SESSIONS */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center space-x-1">
              <span>User Sessions</span>
              <Info className="h-3 w-3 text-slate-500 cursor-help" />
            </span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-white tracking-tight">194,500</p>
          <p className="mt-1 text-[11px] text-slate-400 flex items-center space-x-1">
            <span>Avg Duration: </span>
            <strong className="text-white">3m 45s</strong>
          </p>
        </div>

        {/* 3. ACTIVE USERS */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center space-x-1">
              <span>Active Users Right Now</span>
              <Info className="h-3 w-3 text-slate-500 cursor-help" />
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-white tracking-tight">1,420</p>
          <p className="mt-1 text-[11px] text-emerald-400 font-semibold flex items-center space-x-1">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Live online pulse</span>
          </p>
        </div>

        {/* 4. CONVERSION RATE */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center space-x-1">
              <span>Conversion Rate</span>
              <Info className="h-3 w-3 text-slate-500 cursor-help" />
            </span>
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

        {/* 5. HEALTH SCORE */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center space-x-1">
              <span>Product Health Score</span>
              <Info className="h-3 w-3 text-slate-500 cursor-help" />
            </span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <Heart className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-white tracking-tight">98 / 100</p>
          <p className="mt-1 text-[11px] text-emerald-400 font-semibold flex items-center space-x-1">
            <span>99.4% error-free sessions</span>
          </p>
        </div>

        {/* 6. TOTAL EVENTS */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center space-x-1">
              <span>Events Tracked</span>
              <Info className="h-3 w-3 text-slate-500 cursor-help" />
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Zap className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-white tracking-tight">
            {totalEvents > 1000000 ? `${(totalEvents / 1000000).toFixed(2)}M` : totalEvents.toLocaleString()}
          </p>
          <p className="mt-1 text-[11px] text-slate-400 flex items-center space-x-1">
            <span>Monthly quota used: </span>
            <strong className="text-emerald-400">45%</strong>
          </p>
        </div>

      </div>

      {/* Top Features & Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top Features Used */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white tracking-tight">Top Features Used</h3>
            <button onClick={() => onNavigate('analytics')} className="text-xs font-semibold text-blue-400 hover:text-blue-300">
              View Analytics →
            </button>
          </div>

          <div className="space-y-3">
            {topFeatures.map((feat, i) => (
              <div key={i} className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-white">{feat.name}</p>
                  <p className="text-[10px] text-slate-400">{feat.users.toLocaleString()} active users</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs font-extrabold">
                  {feat.engagement}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white tracking-tight">Recent Activity Feed</h3>
            <span className="text-xs text-slate-400">Live events</span>
          </div>

          <div className="space-y-3">
            {recentActivities.map((act, i) => (
              <div key={i} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs">
                <div className="space-y-0.5 truncate max-w-[240px]">
                  <p className="font-semibold text-white truncate">{act.action}</p>
                  <p className="text-[10px] text-slate-500 font-mono truncate">{act.user}</p>
                </div>
                <span className="text-[10px] text-slate-400 flex-shrink-0">{act.time}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Projects Table */}
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Customer Projects</h3>
            <p className="text-xs text-slate-400 mt-0.5">Organization: {activeOrg.name}</p>
          </div>
          <button
            onClick={() => onNavigate('projects')}
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center space-x-1"
          >
            <span>Manage Projects</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-6">Project Name</th>
                <th className="py-3.5 px-6">Website URL</th>
                <th className="py-3.5 px-6">Environment</th>
                <th className="py-3.5 px-6">Events Tracked</th>
                <th className="py-3.5 px-6">Public Key</th>
                <th className="py-3.5 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {projects.map((proj: Project) => {
                const keys = apiKeys[proj.id] || [];
                const sdkKey = keys[0]?.key || 'if_live_default_key';
                return (
                  <tr key={proj.id} className="hover:bg-slate-850/50 transition">
                    <td className="py-4 px-6 font-semibold text-white">
                      <div className="flex items-center space-x-2">
                        <span className={`h-2 w-2 rounded-full ${proj.sdkConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                        <span>{proj.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-400">
                      <a href={proj.websiteUrl} target="_blank" rel="noreferrer" className="hover:text-blue-400 flex items-center space-x-1">
                        <span className="truncate max-w-[160px]">{proj.websiteUrl}</span>
                        <ExternalLink className="h-3 w-3 text-slate-500" />
                      </a>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {proj.environment}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-mono text-slate-300">
                      {proj.eventCount.toLocaleString()}
                    </td>
                    <td className="py-4 px-6 font-mono text-slate-400">
                      <div className="flex items-center space-x-2">
                        <span>{sdkKey.substring(0, 14)}...</span>
                        <button
                          onClick={() => handleCopyKey(sdkKey, proj.id)}
                          className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
                        >
                          {copiedKeyId === proj.id ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => onNavigate('analytics')}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium text-[11px] transition"
                      >
                        Analytics
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
