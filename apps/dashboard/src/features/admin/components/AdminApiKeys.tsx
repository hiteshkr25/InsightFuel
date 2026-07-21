import { useState } from 'react';
import { useAuthStore, GlobalApiKey } from '../../../shared/stores/useAuthStore';
import { 
  Key, 
  Search, 
  RotateCw, 
  ShieldAlert, 
  Check, 
  Copy, 
  Lock 
} from 'lucide-react';

export default function AdminApiKeys() {
  const { allApiKeysList, rotateApiKey, deleteApiKey, flagApiKeyAbuse } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [envFilter, setEnvFilter] = useState<'all' | 'production' | 'development'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredKeys = allApiKeysList.filter((k: GlobalApiKey) => {
    const matchesSearch = 
      k.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.ownerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.projectName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesEnv = envFilter === 'all' || k.environment === envFilter;
    return matchesSearch && matchesEnv;
  });

  const handleCopy = (keyStr: string, id: string) => {
    navigator.clipboard.writeText(keyStr);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-6 font-sans text-neutral-100">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight flex items-center space-x-2">
            <Key className="h-5 w-5 text-red-500" />
            <span>Platform API Key Governance</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            SuperAdmin global oversight over every API key generated across all customer projects.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="h-3.5 w-3.5 text-neutral-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search key, owner, project..."
              className="pl-8 pr-3 py-1.5 bg-black border border-neutral-800 rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>

          {/* Environment Filter */}
          <select
            value={envFilter}
            onChange={(e) => setEnvFilter(e.target.value as any)}
            className="bg-black border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-neutral-300 font-medium focus:outline-none"
          >
            <option value="all">All Environments</option>
            <option value="production">Production Only</option>
            <option value="development">Development Only</option>
          </select>
        </div>
      </div>

      {/* Keys Table Container */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
            Registered Global Keys ({filteredKeys.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-300">
            <thead className="bg-black text-neutral-400 uppercase text-[10px] font-semibold border-b border-neutral-800">
              <tr>
                <th className="py-3 px-4">API Key & Name</th>
                <th className="py-3 px-4">Project & Owner</th>
                <th className="py-3 px-4">Environment</th>
                <th className="py-3 px-4">Requests</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Last Used</th>
                <th className="py-3 px-4 text-right">SuperAdmin Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900">
              {filteredKeys.map((keyObj: GlobalApiKey) => {
                const isActive = keyObj.status === 'active';

                return (
                  <tr key={keyObj.id} className="hover:bg-neutral-900/50 transition">
                    <td className="py-3 px-4 font-semibold text-white">
                      <div>
                        <p>{keyObj.displayName}</p>
                        <div className="flex items-center space-x-1.5 mt-0.5 font-mono text-[11px] text-neutral-400">
                          <span className="bg-black px-1.5 py-0.5 rounded border border-neutral-800 select-all">{keyObj.key}</span>
                          <button
                            onClick={() => handleCopy(keyObj.key, keyObj.id)}
                            className="p-1 hover:text-white"
                          >
                            {copiedId === keyObj.id ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                          </button>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div>
                        <p className="font-semibold text-white">{keyObj.projectName}</p>
                        <p className="text-[10px] text-neutral-500 font-mono">{keyObj.ownerEmail}</p>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                        keyObj.environment === 'production' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                      }`}>
                        {keyObj.environment}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono font-medium text-white">
                      {(keyObj.requestCount || 0).toLocaleString()}
                    </td>

                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                        isActive
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {keyObj.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-neutral-400">
                      {keyObj.lastUsedAt || 'Never'}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => rotateApiKey(keyObj.id)}
                          className="p-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded transition"
                          title="Force Key Rotation"
                        >
                          <RotateCw className="h-3.5 w-3.5" />
                        </button>

                        <button
                          onClick={() => flagApiKeyAbuse(keyObj.id)}
                          className="p-1.5 bg-neutral-900 hover:bg-neutral-800 text-amber-400 rounded transition"
                          title="Flag Abuse / Disable Key"
                        >
                          <ShieldAlert className="h-3.5 w-3.5" />
                        </button>

                        <button
                          onClick={() => deleteApiKey(keyObj.id)}
                          className="p-1.5 text-neutral-500 hover:text-red-400 rounded transition"
                          title="Revoke Key"
                        >
                          <Lock className="h-3.5 w-3.5" />
                        </button>
                      </div>
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
