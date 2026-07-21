import { useState } from 'react';
import { useAuthStore, ApiKey, Project } from '../../../shared/stores/useAuthStore';
import { useThemeStore } from '../../../shared/stores/useThemeStore';
import { 
  Key, 
  Plus, 
  RotateCw, 
  Power, 
  Trash2, 
  Copy, 
  Check, 
  FolderGit2, 
  X
} from 'lucide-react';
import EmptyState from '../../../shared/components/EmptyState';

export default function CustomerApiKeys() {
  const { 
    projects, 
    activeProjectId, 
    apiKeys, 
    switchProject, 
    generateApiKey, 
    rotateApiKey, 
    toggleKeyStatus, 
    deleteApiKey,
    canManageKeys
  } = useAuthStore();

  const { theme } = useThemeStore();
  const [activeTab, setActiveTab] = useState<'all' | 'production' | 'development' | 'staging'>('all');
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Form State
  const [keyName, setKeyName] = useState('');
  const [environment, setEnvironment] = useState<'production' | 'development' | 'staging'>('production');

  const activeProj = projects.find((p: Project) => p.id === activeProjectId) || projects[0];
  const keysList = apiKeys[activeProjectId] || [];

  const filteredKeys = keysList.filter(k => activeTab === 'all' || k.environment === activeTab);

  const handleCopy = (keyString: string, id: string) => {
    navigator.clipboard.writeText(keyString);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2500);
  };

  const handleGenerateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName) return;
    generateApiKey(activeProjectId, keyName, environment);
    setKeyName('');
    setModalOpen(false);
  };

  const isDark = theme === 'dark';

  return (
    <div className={`space-y-6 font-sans antialiased ${isDark ? 'text-neutral-100' : 'text-neutral-900'}`}>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight flex items-center space-x-2">
            <Key className="h-5 w-5 text-blue-500" />
            <span>API Keys Control Center</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Manage Development & Production write keys, inspect request counts, rotate or revoke tokens.
          </p>
        </div>

        <div className="flex items-center space-x-3 self-start sm:self-auto">
          {/* Project Selector */}
          <div className="flex items-center space-x-2 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-1.5">
            <FolderGit2 className="h-4 w-4 text-blue-500" />
            <select
              value={activeProjectId}
              onChange={(e) => switchProject(e.target.value)}
              className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer"
            >
              {projects.map((proj: Project) => (
                <option key={proj.id} value={proj.id} className="bg-neutral-900">{proj.name}</option>
              ))}
            </select>
          </div>

          {canManageKeys() && (
            <button
              onClick={() => setModalOpen(true)}
              className="px-4 py-2 bg-white text-black hover:bg-neutral-100 rounded-xl text-xs font-semibold shadow-sm transition flex items-center space-x-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>Generate New Key</span>
            </button>
          )}
        </div>
      </div>

      {/* Development vs Production Environment Tabs */}
      <div className="flex space-x-2 border-b border-neutral-800 pb-3">
        {(['all', 'production', 'development', 'staging'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium uppercase tracking-wider transition ${
              activeTab === tab 
                ? 'bg-neutral-800 text-white font-semibold' 
                : 'bg-neutral-950 text-neutral-400 hover:bg-neutral-900 border border-neutral-800'
            }`}
          >
            {tab} Keys
          </button>
        ))}
      </div>

      {/* Keys Table */}
      {filteredKeys.length === 0 ? (
        <EmptyState
          icon={Key}
          title="No API keys found for environment"
          description="Generate public write keys to connect your web storefronts, mobile apps, or backend servers to InsightFuel."
          actionText={canManageKeys() ? 'Generate First API Key' : undefined}
          onAction={canManageKeys() ? () => setModalOpen(true) : undefined}
        />
      ) : (
        <div className="bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Project API Keys ({filteredKeys.length})</h3>
            <span className="text-xs text-neutral-400">Target Project: {activeProj?.name}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-300">
              <thead className="bg-black text-neutral-400 uppercase text-[10px] font-semibold border-b border-neutral-800">
                <tr>
                  <th className="py-3.5 px-6">Key Display Name & String</th>
                  <th className="py-3.5 px-6">Environment</th>
                  <th className="py-3.5 px-6">Requests Processed</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Last Used</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900">
                {filteredKeys.map((keyObj: ApiKey) => {
                  const isActive = keyObj.status === 'active';

                  return (
                    <tr key={keyObj.id} className="hover:bg-neutral-900/50 transition">
                      <td className="py-4 px-6 font-semibold text-white">
                        <div>
                          <p>{keyObj.displayName}</p>
                          <div className="flex items-center space-x-2 mt-1 font-mono text-[11px] text-neutral-400">
                            <span className="bg-black px-2 py-0.5 rounded border border-neutral-800 select-all">{keyObj.key}</span>
                            <button
                              onClick={() => handleCopy(keyObj.key, keyObj.id)}
                              className="p-1 hover:text-white"
                              title="Copy Key"
                            >
                              {copiedKeyId === keyObj.id ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                            </button>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                          keyObj.environment === 'production' 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : keyObj.environment === 'development'
                            ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {keyObj.environment}
                        </span>
                      </td>

                      <td className="py-4 px-6 font-mono font-medium text-white">
                        {(keyObj.requestCount || 0).toLocaleString()} reqs
                      </td>

                      <td className="py-4 px-6">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                          isActive 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          {keyObj.status}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-neutral-400">
                        {keyObj.lastUsedAt || 'Never'}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => handleCopy(keyObj.key, keyObj.id)}
                            className="p-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded-lg transition"
                            title="Copy Key String"
                          >
                            {copiedKeyId === keyObj.id ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                          </button>

                          {canManageKeys() && (
                            <>
                              <button
                                onClick={() => rotateApiKey(keyObj.id)}
                                className="p-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded-lg transition"
                                title="Rotate Key Token"
                              >
                                <RotateCw className="h-4 w-4" />
                              </button>

                              <button
                                onClick={() => toggleKeyStatus(keyObj.id)}
                                className="p-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded-lg transition"
                                title={isActive ? 'Disable API Key' : 'Enable API Key'}
                              >
                                <Power className="h-4 w-4" />
                              </button>

                              <button
                                onClick={() => deleteApiKey(keyObj.id)}
                                className="p-1.5 text-neutral-500 hover:text-red-400 hover:bg-neutral-900 rounded-lg transition"
                                title="Delete API Key"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* GENERATE API KEY MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-blue-500">
                  <Key className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-white">Generate API Key</h3>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-neutral-400 hover:text-white p-1 hover:bg-neutral-900 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleGenerateKey} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Key Display Name *</label>
                <input
                  type="text"
                  required
                  value={keyName}
                  onChange={e => setKeyName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-black border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. Production Web SDK Key"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Environment *</label>
                <select
                  value={environment}
                  onChange={e => setEnvironment(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-black border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="production">Production (if_live_...)</option>
                  <option value="development">Development (if_test_...)</option>
                  <option value="staging">Staging (if_test_...)</option>
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
                  Generate Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
