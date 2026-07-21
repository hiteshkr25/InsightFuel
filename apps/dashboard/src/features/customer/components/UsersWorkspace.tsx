import { useState } from 'react';
import { useAuthStore, Project } from '../../../shared/stores/useAuthStore';
import { 
  Users, 
  UserCheck, 
  MapPin, 
  Sparkles, 
  TrendingUp, 
  Filter
} from 'lucide-react';

export default function UsersWorkspace() {
  const { projects, activeProjectId, switchProject } = useAuthStore();
  const [selectedSegment, setSelectedSegment] = useState('all');

  const activeProj = projects.find((p: Project) => p.id === activeProjectId) || projects[0];

  const activeUserProfiles = [
    { id: 'usr_891', name: 'Sarah Connor', email: 'sarah@acme.com', location: 'San Francisco, CA', plan: 'Pro', lastSeen: '2 mins ago', sessions: 24 },
    { id: 'usr_892', name: 'Michael Scott', email: 'mscott@dunder.com', location: 'Scranton, PA', plan: 'Starter', lastSeen: '12 mins ago', sessions: 9 },
    { id: 'usr_893', name: 'David Wallace', email: 'david@enterprise.io', location: 'New York, NY', plan: 'Enterprise', lastSeen: '1 hour ago', sessions: 68 },
    { id: 'usr_894', name: 'Elena Rostova', email: 'elena@techcorp.de', location: 'Berlin, Germany', plan: 'Pro', lastSeen: '3 hours ago', sessions: 41 },
  ];

  const featureAdoption = [
    { feature: 'Checkout One-Click Pay', adoptionRate: '84.2%', usersCount: 1240, sentiment: 'High Adoption' },
    { feature: 'Dark Mode Switcher', adoptionRate: '71.5%', usersCount: 980, sentiment: 'Popular' },
    { feature: 'Export CSV Invoices', adoptionRate: '42.8%', usersCount: 520, sentiment: 'Moderate' },
    { feature: 'Two-Factor Auth Toggle', adoptionRate: '38.0%', usersCount: 410, sentiment: 'Growing' },
  ];

  const retentionCohorts = [
    { week: 'Week 1 (Signup)', rate: '100%' },
    { week: 'Week 2 Retention', rate: '78.4%' },
    { week: 'Week 3 Retention', rate: '64.2%' },
    { week: 'Week 4 Retention', rate: '58.9%' },
  ];

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2.5">
            <Users className="h-6 w-6 text-blue-500" />
            <span>Users & Behavior Insights</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Active user profiles, feature adoption scores & retention cohorts for <span className="text-blue-400 font-semibold">{activeProj?.name}</span>
          </p>
        </div>

        {/* Project Selector & Filter */}
        <div className="flex items-center space-x-3 self-start sm:self-auto">
          <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={selectedSegment}
              onChange={e => setSelectedSegment(e.target.value)}
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900">All Customers</option>
              <option value="pro" className="bg-slate-900">Pro Users Only</option>
              <option value="enterprise" className="bg-slate-900">Enterprise Customers</option>
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

      {/* Metric Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Active Customers</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <UserCheck className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-white tracking-tight">1,472</p>
          <p className="mt-1 text-[11px] text-emerald-400 font-semibold flex items-center space-x-1">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>+12.8% active growth this month</span>
          </p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">30-Day Retention</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-white tracking-tight">58.9%</p>
          <p className="mt-1 text-[11px] text-slate-400 flex items-center space-x-1">
            <span className="text-emerald-400 font-semibold">+6.4%</span>
            <span>higher than SaaS benchmark</span>
          </p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Top Geography</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <MapPin className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-white tracking-tight">United States (62%)</p>
          <p className="mt-1 text-[11px] text-slate-400 flex items-center space-x-1">
            <span>Followed by Germany (18%) & UK (12%)</span>
          </p>
        </div>
      </div>

      {/* Feature Adoption Scores */}
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white tracking-tight flex items-center space-x-2">
          <Sparkles className="h-4 w-4 text-cyan-400" />
          <span>Top Feature Adoption Scores</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featureAdoption.map((item, idx) => (
            <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-white truncate max-w-[140px]">{item.feature}</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[9px] font-extrabold uppercase">
                  {item.sentiment}
                </span>
              </div>
              <p className="text-xl font-extrabold text-white">{item.adoptionRate}</p>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full" 
                  style={{ width: item.adoptionRate }} 
                />
              </div>
              <span className="text-[10px] text-slate-400 block">{item.usersCount.toLocaleString()} active users</span>
            </div>
          ))}
        </div>
      </div>

      {/* Retention Cohort Graph & Active Profiles */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Retention Graph */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white">4-Week Cohort Retention</h3>
          <div className="space-y-3 pt-2">
            {retentionCohorts.map((cohort, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>{cohort.week}</span>
                  <span className="font-bold text-blue-400">{cohort.rate}</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: cohort.rate }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Profiles Table */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl lg:col-span-2">
          <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Recent Active User Profiles</h3>
            <span className="text-xs text-slate-400">Real-time session updates</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-6">Customer Name</th>
                  <th className="py-3 px-6">Location</th>
                  <th className="py-3 px-6">Plan</th>
                  <th className="py-3 px-6">Total Sessions</th>
                  <th className="py-3 px-6 text-right">Last Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {activeUserProfiles.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-850/50 transition">
                    <td className="py-3.5 px-6 font-semibold text-white">
                      <div>
                        <p>{user.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{user.email}</p>
                      </div>
                    </td>
                    <td className="py-3.5 px-6 text-slate-400">{user.location}</td>
                    <td className="py-3.5 px-6">
                      <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold">
                        {user.plan}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 font-bold text-white">{user.sessions}</td>
                    <td className="py-3.5 px-6 text-right text-slate-400">{user.lastSeen}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
