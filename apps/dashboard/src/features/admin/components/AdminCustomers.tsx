import { useState } from 'react';
import { useAuthStore, CustomerTenant } from '../../../shared/stores/useAuthStore';
import { 
  Users, 
  Search, 
  Power, 
  KeyRound, 
  Trash2, 
  Check, 
  X, 
  Eye, 
  FolderKanban
} from 'lucide-react';

export default function AdminCustomers() {
  const { 
    allCustomers, 
    suspendCustomer, 
    reactivateCustomer, 
    deleteCustomer, 
    triggerPasswordReset,
    allProjectsList
  } = useAuthStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerTenant | null>(null);
  const [resetTokenMsg, setResetTokenMsg] = useState<string | null>(null);

  const filteredCustomers = allCustomers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.companyName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePasswordReset = (cust: CustomerTenant) => {
    const token = triggerPasswordReset(cust.id);
    setResetTokenMsg(`Password reset token generated for ${cust.email}: ${token}`);
    setTimeout(() => setResetTokenMsg(null), 5000);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2.5">
            <Users className="h-6 w-6 text-rose-500" />
            <span>Customer Tenant Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Search, inspect, suspend, or reset customer accounts across all platform organizations.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="h-4 w-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, company..."
            className="w-full pl-9 pr-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>
      </div>

      {resetTokenMsg && (
        <div className="bg-amber-950/40 border border-amber-900/60 p-4 rounded-2xl text-amber-200 text-xs font-semibold flex items-center justify-between animate-in fade-in duration-150">
          <span>{resetTokenMsg}</span>
          <button onClick={() => setResetTokenMsg(null)} className="text-slate-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Customers Table */}
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Registered Customer Tenants ({filteredCustomers.length})</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-6">Customer Name & Email</th>
                <th className="py-3.5 px-6">Organization</th>
                <th className="py-3.5 px-6">Registered Date</th>
                <th className="py-3.5 px-6">Projects</th>
                <th className="py-3.5 px-6">Event Volume</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredCustomers.map((cust) => (
                <tr key={cust.id} className="hover:bg-slate-850/50 transition">
                  <td className="py-4 px-6 font-semibold text-white">
                    <div>
                      <p>{cust.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{cust.email}</p>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-slate-300 font-medium">
                    {cust.companyName}
                  </td>
                  <td className="py-4 px-6 text-slate-400">
                    {cust.registeredAt}
                  </td>
                  <td className="py-4 px-6 font-bold text-slate-200">
                    {cust.projectsCount}
                  </td>
                  <td className="py-4 px-6 font-mono text-blue-400 font-bold">
                    {cust.eventVolume.toLocaleString()}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      cust.status === 'active' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {cust.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end space-x-1.5">
                      <button
                        onClick={() => setSelectedCustomer(cust)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
                        title="Inspect Customer Profile"
                      >
                        <Eye className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => handlePasswordReset(cust)}
                        className="p-1.5 bg-amber-950/50 hover:bg-amber-900 text-amber-300 rounded-lg border border-amber-800/50 transition"
                        title="Trigger Password Reset Token"
                      >
                        <KeyRound className="h-4 w-4" />
                      </button>

                      {cust.status === 'active' ? (
                        <button
                          onClick={() => suspendCustomer(cust.id)}
                          className="p-1.5 bg-red-950/50 hover:bg-red-900 text-red-400 rounded-lg border border-red-900/50 transition"
                          title="Suspend Customer Account"
                        >
                          <Power className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => reactivateCustomer(cust.id)}
                          className="p-1.5 bg-emerald-950/50 hover:bg-emerald-900 text-emerald-400 rounded-lg border border-emerald-900/50 transition"
                          title="Reactivate Customer Account"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}

                      <button
                        onClick={() => deleteCustomer(cust.id)}
                        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition"
                        title="Delete Customer Account"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* INSPECT PROFILE MODAL */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                  <Users className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Customer Profile Inspector</h3>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Customer Name:</span>
                  <span className="font-bold text-white">{selectedCustomer.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Email:</span>
                  <span className="font-mono text-blue-400">{selectedCustomer.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Organization:</span>
                  <span className="font-semibold text-white">{selectedCustomer.companyName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Status:</span>
                  <span className="font-bold uppercase text-emerald-400">{selectedCustomer.status}</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-white mb-2 flex items-center space-x-1">
                  <FolderKanban className="h-4 w-4 text-indigo-400" />
                  <span>Configured Projects</span>
                </h4>
                <div className="space-y-2">
                  {allProjectsList.filter(p => p.ownerEmail === selectedCustomer.email).map(proj => (
                    <div key={proj.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-white">{proj.name}</p>
                        <p className="text-[10px] text-slate-400">{proj.websiteUrl}</p>
                      </div>
                      <span className="font-mono text-blue-400 font-bold">{proj.eventCount.toLocaleString()} events</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
