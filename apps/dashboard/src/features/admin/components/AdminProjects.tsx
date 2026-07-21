import { useState } from 'react';
import { useAuthStore, GlobalProject } from '../../../shared/stores/useAuthStore';
import { 
  FolderKanban, 
  Search, 
  ExternalLink
} from 'lucide-react';

export default function AdminProjects() {
  const { allProjectsList } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProjects = allProjectsList.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.ownerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.websiteUrl.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2.5">
            <FolderKanban className="h-6 w-6 text-rose-500" />
            <span>Cross-Tenant Projects Control</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Global view of every project space across all organization tenants.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="h-4 w-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by project, owner, URL..."
            className="w-full pl-9 pr-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">All Platform Projects ({filteredProjects.length})</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-6">Project Name</th>
                <th className="py-3.5 px-6">Tenant Organization</th>
                <th className="py-3.5 px-6">Project Owner</th>
                <th className="py-3.5 px-6">Website URL</th>
                <th className="py-3.5 px-6">Environment</th>
                <th className="py-3.5 px-6">Events Tracked</th>
                <th className="py-3.5 px-6 text-right">Last Activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredProjects.map((proj: GlobalProject) => (
                <tr key={proj.id} className="hover:bg-slate-850/50 transition">
                  <td className="py-4 px-6 font-semibold text-white">
                    <div className="flex items-center space-x-2">
                      <span className={`h-2 w-2 rounded-full ${proj.sdkConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                      <span>{proj.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-slate-300 font-medium">
                    {proj.orgName}
                  </td>
                  <td className="py-4 px-6 font-mono text-blue-400">
                    {proj.ownerEmail}
                  </td>
                  <td className="py-4 px-6 text-slate-400">
                    <a href={proj.websiteUrl} target="_blank" rel="noreferrer" className="hover:text-blue-400 flex items-center space-x-1">
                      <span className="truncate max-w-[150px]">{proj.websiteUrl}</span>
                      <ExternalLink className="h-3 w-3 text-slate-500" />
                    </a>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {proj.environment}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-mono font-bold text-white">
                    {proj.eventCount.toLocaleString()}
                  </td>
                  <td className="py-4 px-6 text-right text-slate-400">
                    {proj.lastActive}
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
