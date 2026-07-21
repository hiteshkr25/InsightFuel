import { useState } from 'react';
import { useAuthStore, AuditLogEntry } from '../../../shared/stores/useAuthStore';
import { 
  ShieldCheck, 
  Search, 
  Clock
} from 'lucide-react';

export default function AdminAuditLogs() {
  const { auditLogs } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = auditLogs.filter(l => 
    l.actorEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2.5">
            <ShieldCheck className="h-6 w-6 text-rose-500" />
            <span>Platform Security Audit Logs</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Immutable chronological audit log tracking platform events, administrative actions, and security events.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="h-4 w-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search action, actor, details..."
            className="w-full pl-9 pr-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Security Audit Log Trajectory ({filteredLogs.length})</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-6">Timestamp</th>
                <th className="py-3.5 px-6">Actor Email</th>
                <th className="py-3.5 px-6">Action Event</th>
                <th className="py-3.5 px-6">Target Type</th>
                <th className="py-3.5 px-6">Details Description</th>
                <th className="py-3.5 px-6 text-right">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredLogs.map((log: AuditLogEntry) => (
                <tr key={log.id} className="hover:bg-slate-850/50 transition text-[11px]">
                  <td className="py-3.5 px-6 text-slate-400 flex items-center space-x-1.5">
                    <Clock className="h-3 w-3 text-slate-500" />
                    <span>{log.timestamp}</span>
                  </td>
                  <td className="py-3.5 px-6 text-blue-400 font-bold">
                    {log.actorEmail}
                  </td>
                  <td className="py-3.5 px-6">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                      log.action.toLowerCase().includes('admin') || log.action.toLowerCase().includes('suspend')
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-slate-400 uppercase">
                    {log.targetType}
                  </td>
                  <td className="py-3.5 px-6 text-slate-200 font-sans text-xs">
                    {log.details}
                  </td>
                  <td className="py-3.5 px-6 text-right text-slate-500">
                    {log.ipAddress}
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
