import { useState } from 'react';
import { useAuthStore, Organization } from '../../../shared/stores/useAuthStore';
import { 
  Settings, 
  User, 
  Building2, 
  ShieldCheck, 
  Check, 
  UserPlus, 
  KeyRound
} from 'lucide-react';

type Tab = 'profile' | 'organization' | 'security';

export default function CustomerSettings() {
  const { user, updateProfile, orgs, activeOrgId } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  // Form states
  const [name, setName] = useState(user?.name || '');
  const [companyName, setCompanyName] = useState(user?.companyName || '');
  const [savedMsg, setSavedMsg] = useState('');

  // Team invite state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('developer');
  const [teamMembers, setTeamMembers] = useState([
    { name: user?.name || 'Customer User', email: user?.email || 'user@company.com', role: 'Owner', status: 'Active' },
    { name: 'Alex Smith', email: 'alex@company.com', role: 'Admin', status: 'Active' },
    { name: 'Dev Lead', email: 'dev@company.com', role: 'Developer', status: 'Active' }
  ]);

  const activeOrg = orgs.find((o: Organization) => o.id === activeOrgId) || orgs[0];

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(name, companyName);
    setSavedMsg('Profile details updated successfully!');
    setTimeout(() => setSavedMsg(''), 3000);
  };

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    setTeamMembers([
      ...teamMembers,
      { name: inviteEmail.split('@')[0], email: inviteEmail, role: inviteRole.charAt(0).toUpperCase() + inviteRole.slice(1), status: 'Pending Invite' }
    ]);
    setInviteEmail('');
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2.5">
          <Settings className="h-6 w-6 text-blue-500" />
          <span>Account & Organization Settings</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage profile details, team members, organization structure, and account security.
        </p>
      </div>

      {savedMsg && (
        <div className="bg-emerald-950/40 border border-emerald-900/60 p-4 rounded-2xl text-emerald-300 text-xs font-semibold flex items-center space-x-2">
          <Check className="h-4 w-4 text-emerald-400" />
          <span>{savedMsg}</span>
        </div>
      )}

      {/* Tabs Selector */}
      <div className="flex space-x-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition ${
            activeTab === 'profile'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
          }`}
        >
          <User className="h-4 w-4" />
          <span>Personal Profile</span>
        </button>

        <button
          onClick={() => setActiveTab('organization')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition ${
            activeTab === 'organization'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
          }`}
        >
          <Building2 className="h-4 w-4" />
          <span>Organization & Team</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition ${
            activeTab === 'security'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          <span>Security & Auth</span>
        </button>
      </div>

      {/* TAB 1: PROFILE */}
      {activeTab === 'profile' && (
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 shadow-xl max-w-2xl space-y-6">
          <h3 className="text-base font-bold text-white">Profile Details</h3>
          
          <form onSubmit={handleProfileSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Company / Organization Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Email Address (Read-only)
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-400 text-xs cursor-not-allowed"
              />
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/30 transition"
              >
                Save Profile Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: ORGANIZATION & TEAM */}
      {activeTab === 'organization' && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white">Invite Team Member</h3>
            <form onSubmit={handleInviteSubmit} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                required
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                placeholder="colleague@company.com"
                className="flex-1 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={inviteRole}
                onChange={e => setInviteRole(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                <option value="admin">Admin</option>
                <option value="developer">Developer</option>
                <option value="viewer">Viewer</option>
              </select>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/30 transition flex items-center justify-center space-x-1.5"
              >
                <UserPlus className="h-4 w-4" />
                <span>Send Invite</span>
              </button>
            </form>
          </div>

          <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Organization Team Members ({teamMembers.length})</h3>
              <span className="text-xs text-slate-400">Org: {activeOrg?.name}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-6">Name</th>
                    <th className="py-3 px-6">Email</th>
                    <th className="py-3 px-6">Role</th>
                    <th className="py-3 px-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {teamMembers.map((m, idx) => (
                    <tr key={idx} className="hover:bg-slate-850/50">
                      <td className="py-3.5 px-6 font-semibold text-white">{m.name}</td>
                      <td className="py-3.5 px-6 text-slate-400">{m.email}</td>
                      <td className="py-3.5 px-6">
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-semibold">
                          {m.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-6">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          m.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SECURITY */}
      {activeTab === 'security' && (
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 shadow-xl max-w-2xl space-y-6">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <KeyRound className="h-5 w-5 text-blue-400" />
            <span>Security & Authentication</span>
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Current Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                New Password
              </label>
              <input
                type="password"
                placeholder="At least 8 characters"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => { setSavedMsg('Password updated successfully!'); setTimeout(() => setSavedMsg(''), 3000); }}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/30 transition"
              >
                Update Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
