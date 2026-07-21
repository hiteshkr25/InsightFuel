import { useState } from 'react';
import { useAuthStore, Organization, WorkspaceInvitation } from '../../../shared/stores/useAuthStore';
import { useThemeStore } from '../../../shared/stores/useThemeStore';
import { 
  Users, 
  UserPlus, 
  Mail, 
  Trash2, 
  X, 
  Check, 
  Copy, 
  Building2,
  Crown,
  ShieldAlert
} from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'developer' | 'viewer';
  joinedDate: string;
  status: 'active' | 'pending';
  avatarUrl?: string;
}

export default function CustomerTeam() {
  const { 
    user, 
    orgs, 
    activeOrgId, 
    invitations, 
    inviteTeamMember, 
    revokeInvitation, 
    transferOwnership,
    canInviteMembers,
    canManageBilling
  } = useAuthStore();

  const { theme } = useThemeStore();
  const [activeTab, setActiveTab] = useState<'members' | 'invitations'>('members');
  const [modalOpen, setModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Invite Form State
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'developer' | 'viewer'>('admin');
  const [newOwnerEmail, setNewOwnerEmail] = useState('');

  const activeOrg = orgs.find((o: Organization) => o.id === activeOrgId) || orgs[0];
  const orgInvitations = invitations.filter((i: WorkspaceInvitation) => i.orgId === activeOrgId);

  const [members, setMembers] = useState<TeamMember[]>([
    {
      id: 'mem_101',
      name: user?.name || 'Hitesh Kumar',
      email: activeOrg?.ownerEmail || 'hitesh@insightfuel.io',
      role: 'owner',
      joinedDate: '2026-01-15',
      status: 'active',
      avatarUrl: user?.avatarUrl
    },
    {
      id: 'mem_102',
      name: 'Sarah Connor',
      email: 'sarah@acme.com',
      role: 'admin',
      joinedDate: '2026-02-10',
      status: 'active'
    },
    {
      id: 'mem_103',
      name: 'Michael Scott',
      email: 'mscott@acme.com',
      role: 'developer',
      joinedDate: '2026-03-01',
      status: 'active'
    }
  ]);

  const handleInviteMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    inviteTeamMember(inviteEmail, inviteRole);
    setInviteEmail('');
    setModalOpen(false);
  };

  const handleCopyInviteLink = (token: string) => {
    navigator.clipboard.writeText(`https://app.insightfuel.io/invite?token=${token}`);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  const handleTransferOwnershipSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOwnerEmail) return;

    transferOwnership(newOwnerEmail);
    setMembers(members.map(m => {
      if (m.email === newOwnerEmail) return { ...m, role: 'owner' };
      if (m.role === 'owner') return { ...m, role: 'admin' };
      return m;
    }));
    setTransferModalOpen(false);
  };

  const isDark = theme === 'dark';

  return (
    <div className={`space-y-6 font-sans antialiased ${isDark ? 'text-neutral-100' : 'text-neutral-900'}`}>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-500" />
            <span>Team & Role Management</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Manage organization permissions, pending email invitations, and workspace ownership for <strong className="text-white">{activeOrg?.name}</strong>.
          </p>
        </div>

        <div className="flex items-center space-x-3 self-start sm:self-auto">
          {canManageBilling() && (
            <button
              onClick={() => setTransferModalOpen(true)}
              className="px-3 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-amber-400 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5"
            >
              <Crown className="h-4 w-4 text-amber-400" />
              <span>Transfer Ownership</span>
            </button>
          )}

          {canInviteMembers() && (
            <button
              onClick={() => setModalOpen(true)}
              className="px-4 py-2 bg-white text-black hover:bg-neutral-100 rounded-xl text-xs font-semibold shadow-sm transition flex items-center space-x-2"
            >
              <UserPlus className="h-4 w-4" />
              <span>Invite Team Member</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-neutral-800 pb-3">
        <button
          onClick={() => setActiveTab('members')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition ${
            activeTab === 'members'
              ? 'bg-neutral-800 text-white font-semibold'
              : 'bg-neutral-950 text-neutral-400 hover:bg-neutral-900 border border-neutral-800'
          }`}
        >
          Active Members ({members.length})
        </button>

        <button
          onClick={() => setActiveTab('invitations')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition ${
            activeTab === 'invitations'
              ? 'bg-neutral-800 text-white font-semibold'
              : 'bg-neutral-950 text-neutral-400 hover:bg-neutral-900 border border-neutral-800'
          }`}
        >
          Pending Invitations ({orgInvitations.filter((i: WorkspaceInvitation) => i.status === 'pending').length})
        </button>
      </div>

      {/* TAB 1: ACTIVE MEMBERS */}
      {activeTab === 'members' && (
        <div className="bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Building2 className="h-4 w-4 text-blue-500" />
              <h3 className="text-sm font-semibold text-white">Active Members List</h3>
            </div>
            <span className="text-xs text-neutral-400 font-medium">Owner: {activeOrg?.ownerEmail}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-300">
              <thead className="bg-black text-neutral-400 uppercase text-[10px] font-semibold border-b border-neutral-800">
                <tr>
                  <th className="py-3.5 px-6">Member Name & Email</th>
                  <th className="py-3.5 px-6">Role Permission</th>
                  <th className="py-3.5 px-6">Joined Date</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900">
                {members.map((mem) => {
                  const isOwner = mem.email === activeOrg?.ownerEmail || mem.role === 'owner';

                  return (
                    <tr key={mem.id} className="hover:bg-neutral-900/50 transition">
                      <td className="py-4 px-6 font-semibold text-white">
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-blue-400 font-bold text-xs">
                            {mem.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="flex items-center space-x-1.5">
                              <span>{mem.name}</span>
                              {isOwner && <Crown className="h-3.5 w-3.5 text-amber-400" />}
                            </p>
                            <p className="text-[10px] text-neutral-500 font-mono">{mem.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        {isOwner ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-semibold uppercase flex items-center space-x-1 w-max">
                            <Crown className="h-3 w-3" />
                            <span>Owner</span>
                          </span>
                        ) : (
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase border w-max block ${
                            mem.role === 'admin'
                              ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                              : mem.role === 'developer'
                              ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                              : 'bg-neutral-900 text-neutral-400 border-neutral-800'
                          }`}>
                            {mem.role}
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-6 text-neutral-400 font-mono">
                        {mem.joinedDate}
                      </td>

                      <td className="py-4 px-6">
                        <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Active
                        </span>
                      </td>

                      <td className="py-4 px-6 text-right">
                        {!isOwner && canInviteMembers() && (
                          <button
                            onClick={() => setMembers(members.filter(m => m.id !== mem.id))}
                            className="p-1.5 text-neutral-500 hover:text-red-400 hover:bg-neutral-900 rounded-lg transition"
                            title="Remove Member"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: PENDING INVITATIONS */}
      {activeTab === 'invitations' && (
        <div className="bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Pending Team Invitations ({orgInvitations.length})</h3>
            <span className="text-xs text-neutral-400">Tokens valid for 7 days</span>
          </div>

          {orgInvitations.length === 0 ? (
            <div className="p-8 text-center text-neutral-500 text-xs">
              No pending invitations for this workspace.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-neutral-300">
                <thead className="bg-black text-neutral-400 uppercase text-[10px] font-semibold border-b border-neutral-800">
                  <tr>
                    <th className="py-3.5 px-6">Invited Email</th>
                    <th className="py-3.5 px-6">Role</th>
                    <th className="py-3.5 px-6">Invited By</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-900">
                  {orgInvitations.map((inv: WorkspaceInvitation) => (
                    <tr key={inv.id} className="hover:bg-neutral-900/50 transition">
                      <td className="py-4 px-6 font-semibold text-white font-mono">
                        {inv.email}
                      </td>

                      <td className="py-4 px-6">
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-semibold uppercase">
                          {inv.role}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-neutral-400">
                        {inv.invitedByEmail}
                      </td>

                      <td className="py-4 px-6">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                          inv.status === 'pending'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-neutral-900 text-neutral-400'
                        }`}>
                          {inv.status}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleCopyInviteLink(inv.token)}
                            className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 rounded-lg text-[11px] font-semibold transition flex items-center space-x-1"
                          >
                            {copiedToken === inv.token ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                            <span>{copiedToken === inv.token ? 'Copied' : 'Copy Link'}</span>
                          </button>

                          {canInviteMembers() && inv.status === 'pending' && (
                            <button
                              onClick={() => revokeInvitation(inv.id)}
                              className="p-1 text-neutral-500 hover:text-red-400 hover:bg-neutral-900 rounded-lg transition"
                              title="Revoke Invitation"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* INVITE TEAM MEMBER MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-blue-500">
                  <UserPlus className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-white">Invite Team Member</h3>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-neutral-400 hover:text-white p-1 hover:bg-neutral-900 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleInviteMember} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Work Email Address *</label>
                <div className="relative">
                  <Mail className="h-4 w-4 text-neutral-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-black border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="teammate@company.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Assign Role *</label>
                <select
                  value={inviteRole}
                  onChange={e => setInviteRole(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-black border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="admin">Admin (Manage projects, keys, & invite members)</option>
                  <option value="developer">Developer (View analytics & public SDK keys)</option>
                  <option value="viewer">Viewer (Read-only analytics view)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-neutral-800 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-neutral-900 text-neutral-300 rounded-xl text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-white text-black hover:bg-neutral-100 rounded-xl text-xs font-semibold shadow-sm transition"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TRANSFER OWNERSHIP MODAL */}
      {transferModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <Crown className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-white">Transfer Organization Ownership</h3>
              </div>
              <button onClick={() => setTransferModalOpen(false)} className="text-neutral-400 hover:text-white p-1 hover:bg-neutral-900 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleTransferOwnershipSubmit} className="space-y-4">
              <div className="bg-neutral-900 border border-neutral-800 p-3 rounded-xl text-xs text-amber-300 flex items-start space-x-2">
                <ShieldAlert className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>
                  Transferring ownership gives full control over organization billing, subscription plans, and project deletion to the new owner.
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Select New Owner *</label>
                <select
                  value={newOwnerEmail}
                  onChange={e => setNewOwnerEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-black border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                >
                  <option value="">Select team member...</option>
                  {members.filter(m => m.email !== activeOrg?.ownerEmail).map(m => (
                    <option key={m.id} value={m.email}>{m.name} ({m.email})</option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-neutral-800 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setTransferModalOpen(false)}
                  className="px-4 py-2 bg-neutral-900 text-neutral-300 rounded-xl text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newOwnerEmail}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-50"
                >
                  Confirm Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
