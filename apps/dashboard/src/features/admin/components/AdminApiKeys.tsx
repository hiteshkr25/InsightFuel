import { useState } from 'react';
import { useAuthStore, GlobalApiKey } from '../../../shared/stores/useAuthStore';
import { 
  Key, 
  Search, 
  ShieldAlert, 
  Power, 
  AlertTriangle, 
  Copy, 
  Check
} from 'lucide-react';

export default function AdminApiKeys() {
  const { allApiKeysList, revokeApiKey, flagApiKeyAbuse } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  const filteredKeys = allApiKeysList.filter(k => 
    k.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    k.ownerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    k.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    k.key.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2500);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2.5">
            <Key className="h-6 w-6 text-rose-500" />
            <span>Platform API Keys Security Control</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            System-wide audit of all public SDK write keys, request volumes, and abuse flags.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="h-4 w-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search key, owner, project..."
            className="w-full pl-9 pr-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>
      </div>

      {/* Security Banner */}
      <div className="bg-rose-950/30 border border-rose-800/50 rounded-2xl p-4 flex items-start space-x-3 text-xs text-rose-200">
        <ShieldAlert className="h-5 w-5 text-rose-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-white">Superadmin Security Control Notice</p>
          <p className="text-slate-400 mt-0.5">
            Revoking an API key will immediately reject incoming telemetry HTTP requests from that client. Flagging a key as <code className="text-amber-300">Flagged Abuse</code> will trigger automated rate limiting across API Gateway nodes.
          </p>
        </div>
      </div>

      {/* Keys Table */}
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Global API Keys ({filteredKeys.length})</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-6">Key Name & String</th>
                <th className="py-3.5 px-6">Owner</th>
                <th className="py-3.5 px-6">Project Space</th>
                <th className="py-3.5 px-6">Total Requests</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6">Created Date</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredKeys.map((keyObj: GlobalApiKey) => (
                <tr key={keyObj.id} className="hover:bg-slate-850/50 transition">
                  <td className="py-4 px-6 font-semibold text-white">
                    <div>
                      <p>{keyObj.displayName}</p>
                      <div className="flex items-center space-x-1.5 mt-0.5 font-mono text-[11px] text-slate-400">
                        <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 select-all">{keyObj.key}</span>
                        <button
                          onClick={() => handleCopy(keyObj.key, keyObj.id)}
                          className="p-1 hover:text-white"
                        >
                          {copiedKeyId === keyObj.id ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 font-mono text-blue-400 font-medium">
                    {keyObj.ownerEmail}
                  </td>
                  <td className="py-4 px-6 font-semibold text-slate-200">
                    {keyObj.projectName}
                  </td>
                  <td className="py-4 px-6 font-mono font-bold text-white">
                    {keyObj.requestCount.toLocaleString()}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      keyObj.status === 'active' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : keyObj.status === 'flagged'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {keyObj.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-slate-400">
                    {keyObj.createdAt}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {keyObj.status === 'active' && (
                        <button
                          onClick={() => flagApiKeyAbuse(keyObj.id)}
                          className="px-2.5 py-1 bg-amber-950/50 hover:bg-amber-900 text-amber-300 rounded-lg text-[11px] font-semibold border border-amber-800/50 transition flex items-center space-x-1"
                          title="Flag for Rate Limit Abuse"
                        >
                          <AlertTriangle className="h-3 w-3" />
                          <span>Flag Abuse</span>
                        </button>
                      )}

                      <button
                        onClick={() => revokeApiKey(keyObj.id)}
                        className="px-2.5 py-1 bg-red-950/50 hover:bg-red-900 text-red-400 rounded-lg text-[11px] font-semibold border border-red-900/50 transition flex items-center space-x-1"
                        title="Revoke API Key"
                      >
                        <Power className="h-3 w-3" />
                        <span>Revoke</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
