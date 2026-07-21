import { useState } from 'react';
import { useAuthStore, AuditLogEntry } from '../../../shared/stores/useAuthStore';
import { 
  FileText, 
  Search
} from 'lucide-react';

export default function AdminAuditLogs() {
  const { auditLogs } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'warning' | 'error'>('all');

  const filteredLogs = auditLogs.filter((l: AuditLogEntry) => {
    const matchesSearch = 
      l.actorEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.details || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 font-sans text-neutral-100">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight flex items-center space-x-2">
            <FileText className="h-5 w-5 text-red-500" />
            <span>Platform Security Audit Logs</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Immutable audit record of administrative actions, key rotations, customer suspensions, and API gateway requests.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="h-3.5 w-3.5 text-neutral-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search audit logs..."
              className="pl-8 pr-3 py-1.5 bg-black border border-neutral-800 rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-black border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-neutral-300 font-medium focus:outline-none"
          >
            <option value="all">All Audit Statuses</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>
        </div>
      </div>

      {/* Logs Table Container */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
            Audit Trajectory Stream ({filteredLogs.length})
          </h3>
          <span className="text-[10px] font-mono text-neutral-500">Immutable Log Stream</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-300">
            <thead className="bg-black text-neutral-400 uppercase text-[10px] font-semibold border-b border-neutral-800">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Actor Email</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Target Resource</th>
                <th className="py-3 px-4">Details</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900">
              {filteredLogs.map((log: AuditLogEntry) => (
                <tr key={log.id} className="hover:bg-neutral-900/50 transition font-mono">
                  <td className="py-3 px-4 text-neutral-400 text-[11px] whitespace-nowrap">
                    {log.timestamp}
                  </td>

                  <td className="py-3 px-4 font-semibold text-white font-sans">
                    {log.actorEmail}
                  </td>

                  <td className="py-3 px-4 font-semibold text-neutral-200 font-sans">
                    {log.action}
                  </td>

                  <td className="py-3 px-4 text-blue-400">
                    {log.target} {log.targetType ? `(${log.targetType})` : ''}
                  </td>

                  <td className="py-3 px-4 text-neutral-400 font-sans text-[11px]">
                    {log.details || 'System event recorded.'}
                  </td>

                  <td className="py-3 px-4 text-neutral-500">
                    {log.ipAddress}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                      log.status === 'success' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : log.status === 'warning'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {log.status}
                    </span>
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
