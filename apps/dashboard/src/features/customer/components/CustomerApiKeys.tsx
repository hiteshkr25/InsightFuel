import { useState } from 'react';
import { useAuthStore, ApiKey, Project } from '../../../shared/stores/useAuthStore';
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

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2.5">
            <Key className="h-6 w-6 text-blue-500" />
            <span>API Keys Control Center</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage Development & Production write keys, inspect request counts, rotate or revoke tokens.
          </p>
        </div>

        <div className="flex items-center space-x-3 self-start sm:self-auto">
          {/* Project Selector */}
          <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5">
            <FolderGit2 className="h-4 w-4 text-blue-400" />
            <select
              value={activeProjectId}
              onChange={(e) => switchProject(e.target.value)}
              className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer"
            >
              {projects.map((proj: Project) => (
                <option key={proj.id} value={proj.id} className="bg-slate-900">{proj.name}</option>
              ))}
            </select>
          </div>

          {canManageKeys() && (
            <button
              onClick={() => setModalOpen(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/30 transition flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Generate New Key</span>
            </button>
          )}
        </div>
      </div>

      {/* Development vs Production Environment Tabs */}
      <div className="flex space-x-2 border-b border-slate-800 pb-3">
        {(['all', 'production', 'development', 'staging'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition ${
              activeTab === tab 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
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
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Project API Keys ({filteredKeys.length})</h3>
            <span className="text-xs text-slate-400">Target Project: {activeProj?.name}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-6">Key Display Name & String</th>
                  <th className="py-3.5 px-6">Environment</th>
                  <th className="py-3.5 px-6">Requests Processed</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Last Used</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredKeys.map((keyObj: ApiKey) => {
                  const isActive = keyObj.status === 'active';

                  return (
                    <tr key={keyObj.id} className="hover:bg-slate-850/50 transition">
                      <td className="py-4 px-6 font-semibold text-white">
                        <div>
                          <p>{keyObj.displayName}</p>
                          <div className="flex items-center space-x-2 mt-1 font-mono text-[11px] text-slate-400">
                            <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 select-all">{keyObj.key}</span>
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
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          keyObj.environment === 'production' 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : keyObj.environment === 'development'
                            ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {keyObj.environment}
                        </span>
                      </td>

                      <td className="py-4 px-6 font-mono font-bold text-white">
                        {(keyObj.requestCount || 0).toLocaleString()} reqs
                      </td>

                      <td className="py-4 px-6">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          isActive 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          {keyObj.status}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-slate-400">
                        {keyObj.lastUsedAt || 'Never'}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => handleCopy(keyObj.key, keyObj.id)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
                            title="Copy Key String"
                          >
                            {copiedKeyId === keyObj.id ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                          </button>

                          {canManageKeys() && (
                            <>
                              <button
                                onClick={() => rotateApiKey(keyObj.id)}
                                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
                                title="Rotate Key Token"
                              >
                                <RotateCw className="h-4 w-4" />
                              </button>

                              <button
                                onClick={() => toggleKeyStatus(keyObj.id)}
                                className={`p-1.5 rounded-lg border transition ${
                                  isActive 
                                    ? 'bg-amber-950/50 hover:bg-amber-900 text-amber-300 border-amber-800/50' 
                                    : 'bg-emerald-950/50 hover:bg-emerald-900 text-emerald-400 border-emerald-900/50'
                                }`}
                                title={isActive ? 'Disable API Key' : 'Enable API Key'}
                              >
                                <Power className="h-4 w-4" />
                              </button>

                              <button
                                onClick={() => deleteApiKey(keyObj.id)}
                                className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition"
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
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  <Key className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Generate API Key</h3>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleGenerateKey} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Key Display Name *</label>
                <input
                  type="text"
                  required
                  value={keyName}
                  onChange={e => setKeyName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Production Web SDK Key"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Environment *</label>
                <select
                  value={environment}
                  onChange={e => setEnvironment(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="production">Production (if_live_...)</option>
                  <option value="development">Development (if_test_...)</option>
                  <option value="staging">Staging (if_test_...)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/30 transition"
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
