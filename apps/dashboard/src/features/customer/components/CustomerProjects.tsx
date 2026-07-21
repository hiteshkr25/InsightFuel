import { useState } from 'react';
import { useAuthStore, Project } from '../../../shared/stores/useAuthStore';
import { useThemeStore } from '../../../shared/stores/useThemeStore';
import { 
  FolderKanban, 
  Plus, 
  ExternalLink, 
  Copy, 
  Check, 
  X, 
  Globe, 
  Code2
} from 'lucide-react';
import EmptyState from '../../../shared/components/EmptyState';

interface CustomerProjectsProps {
  onNavigate: (view: string) => void;
}

export default function CustomerProjects({ onNavigate }: CustomerProjectsProps) {
  const { 
    projects, 
    createCustomerProject, 
    updateProjectStatus, 
    apiKeys, 
    switchProject, 
    activeProjectId,
    canManageKeys
  } = useAuthStore();

  const { theme } = useThemeStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused' | 'archived'>('all');

  // Form states
  const [name, setName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [environment, setEnvironment] = useState<'production' | 'staging' | 'development'>('production');
  const [description, setDescription] = useState('');

  const filteredProjects = projects.filter(p => statusFilter === 'all' || (p.status || 'active') === statusFilter);

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !websiteUrl) return;

    createCustomerProject(name, websiteUrl, environment, description);
    
    setName('');
    setWebsiteUrl('');
    setEnvironment('production');
    setDescription('');
    setModalOpen(false);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2500);
  };

  const isDark = theme === 'dark';

  return (
    <div className={`space-y-6 font-sans antialiased ${isDark ? 'text-neutral-100' : 'text-neutral-900'}`}>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight flex items-center space-x-2">
            <FolderKanban className="h-5 w-5 text-blue-500" />
            <span>Customer Projects Workspace</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Manage web storefronts, environments, status lifecycle, and public SDK keys.
          </p>
        </div>

        <div className="flex items-center space-x-3 self-start sm:self-auto">
          {/* Status Filter Tabs */}
          <div className="flex space-x-1 bg-neutral-900 border border-neutral-800 p-1 rounded-xl text-xs font-medium">
            {(['all', 'active', 'paused', 'archived'] as const).map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg uppercase transition ${
                  statusFilter === st ? 'bg-neutral-800 text-white font-semibold' : 'text-neutral-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {canManageKeys() && (
            <button
              onClick={() => setModalOpen(true)}
              className="px-4 py-2 bg-white text-black hover:bg-neutral-100 rounded-xl text-xs font-semibold shadow-sm transition flex items-center space-x-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>New Project</span>
            </button>
          )}
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects match criteria"
          description="Start tracking visitor traffic, user sessions, conversion funnels, and AI insights across your web applications."
          actionText={canManageKeys() ? 'Create New Project' : undefined}
          onAction={canManageKeys() ? () => setModalOpen(true) : undefined}
        />
      ) : (
        /* Projects Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((proj: Project) => {
            const keys = apiKeys[proj.id] || [];
            const primaryKey = keys[0]?.key || 'if_live_default_key';
            const isActive = proj.id === activeProjectId;
            const projStatus = proj.status || 'active';

            return (
              <div 
                key={proj.id}
                className={`bg-neutral-950 border rounded-2xl p-6 shadow-xl flex flex-col justify-between transition relative overflow-hidden ${
                  isActive ? 'border-blue-500/60 ring-1 ring-blue-500/30' : 'border-neutral-800 hover:border-neutral-700'
                }`}
              >
                {isActive && (
                  <div className="absolute top-0 right-0 bg-blue-600 text-white text-[9px] font-semibold uppercase px-3 py-1 rounded-bl-xl tracking-wider">
                    Current Active
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="text-base font-semibold text-white tracking-tight">{proj.name}</h3>
                      <a 
                        href={proj.websiteUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-xs text-neutral-400 hover:text-blue-400 flex items-center space-x-1.5 transition"
                      >
                        <Globe className="h-3.5 w-3.5 text-neutral-500" />
                        <span className="truncate max-w-[180px]">{proj.websiteUrl}</span>
                        <ExternalLink className="h-3 w-3 text-neutral-500" />
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                      proj.environment === 'production' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : proj.environment === 'staging'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                    }`}>
                      {proj.environment}
                    </span>

                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                      projStatus === 'active' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-neutral-900 text-neutral-400'
                    }`}>
                      {projStatus}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                    {proj.description || 'No description provided.'}
                  </p>

                  {/* Public SDK Key Display */}
                  <div className="bg-black p-3 rounded-xl border border-neutral-800 space-y-1">
                    <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block">Public Write Key</span>
                    <div className="flex items-center justify-between font-mono text-xs text-neutral-200">
                      <span className="truncate max-w-[180px]">{primaryKey}</span>
                      <button
                        onClick={() => handleCopy(primaryKey, proj.id)}
                        className="p-1 text-neutral-400 hover:text-white hover:bg-neutral-900 rounded transition"
                      >
                        {copiedKeyId === proj.id ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Status Selector & Actions */}
                <div className="pt-5 mt-5 border-t border-neutral-800 flex items-center justify-between gap-2">
                  <select
                    value={projStatus}
                    disabled={!canManageKeys()}
                    onChange={(e) => updateProjectStatus(proj.id, e.target.value as any)}
                    className="bg-black border border-neutral-800 rounded-xl px-2.5 py-1.5 text-xs text-neutral-300 font-medium focus:outline-none cursor-pointer disabled:opacity-50"
                  >
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="archived">Archived</option>
                  </select>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => switchProject(proj.id)}
                      disabled={isActive}
                      className={`py-1.5 px-3 rounded-xl text-xs font-semibold transition ${
                        isActive 
                          ? 'bg-neutral-900 text-neutral-500 cursor-default' 
                          : 'bg-white text-black hover:bg-neutral-100 shadow-sm'
                      }`}
                    >
                      {isActive ? 'Active' : 'Select'}
                    </button>
                    <button
                      onClick={() => {
                        switchProject(proj.id);
                        onNavigate('integrations');
                      }}
                      className="p-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded-xl transition"
                      title="SDK Setup & Verification"
                    >
                      <Code2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE PROJECT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-blue-500">
                  <FolderKanban className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-white">Create Customer Project</h3>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-neutral-400 hover:text-white p-1 hover:bg-neutral-900 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Project Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-black border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. My E-Commerce Storefront"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Website URL *</label>
                <div className="relative">
                  <Globe className="h-4 w-4 text-neutral-500 absolute left-3 top-3" />
                  <input
                    type="url"
                    required
                    value={websiteUrl}
                    onChange={e => setWebsiteUrl(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-black border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="https://shop.example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Environment *</label>
                <select
                  value={environment}
                  onChange={e => setEnvironment(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-black border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="production">Production (Live)</option>
                  <option value="staging">Staging</option>
                  <option value="development">Development</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-black border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                  placeholder="Primary web application analytics..."
                />
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
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
