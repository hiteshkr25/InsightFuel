import { useState } from 'react';
import { useAuthStore, Project } from '../../../shared/stores/useAuthStore';
import { 
  CreditCard, 
  Check, 
  Download
} from 'lucide-react';

export default function CustomerBilling() {
  const { projects } = useAuthStore();
  const [selectedTier, setSelectedTier] = useState<'starter' | 'pro' | 'enterprise'>('pro');
  const [upgraded, setUpgraded] = useState(false);

  const totalEvents = projects.reduce((acc: number, p: Project) => acc + p.eventCount, 0);
  const monthlyLimit = 1000000;
  const usagePercentage = Math.min(Math.round((totalEvents / monthlyLimit) * 100), 100);

  const handleUpgrade = (tier: 'starter' | 'pro' | 'enterprise') => {
    setSelectedTier(tier);
    setUpgraded(true);
    setTimeout(() => setUpgraded(false), 3500);
  };

  return (
    <div className="space-y-8 font-sans">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2.5">
          <CreditCard className="h-6 w-6 text-blue-500" />
          <span>Billing & Plan Usage</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage your SaaS subscription plan, monthly event quotas, and payment invoices.
        </p>
      </div>

      {upgraded && (
        <div className="bg-emerald-950/40 border border-emerald-900/60 p-4 rounded-2xl text-emerald-300 text-xs font-semibold flex items-center space-x-2 animate-in fade-in duration-200">
          <Check className="h-5 w-5 text-emerald-400" />
          <span>Subscription plan updated to {selectedTier.toUpperCase()} plan successfully!</span>
        </div>
      )}

      {/* Usage Meter Card */}
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-white">Current Plan: Pro Tier</span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-extrabold uppercase">
                Active
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Billing cycle resets on 1st of next month.</p>
          </div>

          <div className="text-right">
            <span className="text-xl font-extrabold text-white">{totalEvents.toLocaleString()}</span>
            <span className="text-xs text-slate-400"> / 1,000,000 events used</span>
          </div>
        </div>

        {/* Usage Bar */}
        <div className="space-y-1.5">
          <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800 p-0.5">
            <div 
              className="bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-500" 
              style={{ width: `${usagePercentage}%` }} 
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>{usagePercentage}% Quota Consumed</span>
            <span>{(monthlyLimit - totalEvents).toLocaleString()} events remaining</span>
          </div>
        </div>
      </div>

      {/* Pricing Tiers Comparison */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4">Subscription Tiers</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* STARTER */}
          <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between space-y-6 shadow-xl">
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Starter</span>
                <div className="mt-2 flex items-baseline space-x-1">
                  <span className="text-3xl font-extrabold text-white">$0</span>
                  <span className="text-xs text-slate-400">/ month</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">Perfect for indie developers & personal side projects.</p>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-blue-400" />
                  <span>Up to 100,000 events / mo</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-blue-400" />
                  <span>1 Active Project</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-blue-400" />
                  <span>Standard Analytics Dashboards</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-blue-400" />
                  <span>Community Support</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleUpgrade('starter')}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
            >
              Downgrade to Starter
            </button>
          </div>

          {/* PRO (CURRENT) */}
          <div className="bg-slate-900 border-2 border-blue-500 rounded-2xl p-6 flex flex-col justify-between space-y-6 shadow-2xl relative">
            <div className="absolute top-0 right-0 bg-blue-600 text-white text-[9px] font-extrabold uppercase px-3 py-1 rounded-bl-xl tracking-wider">
              Current Plan
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Pro Tier</span>
                <div className="mt-2 flex items-baseline space-x-1">
                  <span className="text-3xl font-extrabold text-white">$49</span>
                  <span className="text-xs text-slate-400">/ month</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">Designed for growing SaaS companies & e-commerce brands.</p>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-200">
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span><strong>1,000,000 events / mo</strong></span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span><strong>Unlimited Projects & API Keys</strong></span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span>AI Recommendations & Feature Intel</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span>Conversion Funnels & User Retention</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span>Priority Email & Slack Support</span>
                </li>
              </ul>
            </div>

            <button
              disabled
              className="w-full py-2.5 rounded-xl bg-blue-600/30 text-blue-300 border border-blue-500/40 text-xs font-semibold cursor-default"
            >
              Current Active Subscription
            </button>
          </div>

          {/* ENTERPRISE */}
          <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between space-y-6 shadow-xl">
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Enterprise</span>
                <div className="mt-2 flex items-baseline space-x-1">
                  <span className="text-3xl font-extrabold text-white">Custom</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">For high-volume enterprise organizations requiring SLAs.</p>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-indigo-400" />
                  <span>Unlimited Events & Sessions</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-indigo-400" />
                  <span>Dedicated ClickHouse Analytical Cluster</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-indigo-400" />
                  <span>Custom Data Retention & HIPAA Compliance</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-indigo-400" />
                  <span>Dedicated Solutions Architect</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleUpgrade('enterprise')}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition"
            >
              Contact Enterprise Sales
            </button>
          </div>

        </div>
      </div>

      {/* Invoices History */}
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white tracking-tight">Recent Invoices</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Invoice ID</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">PDF Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              <tr className="hover:bg-slate-850/50">
                <td className="py-3 px-4 font-mono font-semibold text-white">INV-2026-003</td>
                <td className="py-3 px-4 text-slate-400">July 1, 2026</td>
                <td className="py-3 px-4 font-bold text-white">$49.00</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">Paid</span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button className="text-blue-400 hover:text-blue-300 font-semibold inline-flex items-center space-x-1">
                    <Download className="h-3.5 w-3.5" />
                    <span>Download</span>
                  </button>
                </td>
              </tr>
              <tr className="hover:bg-slate-850/50">
                <td className="py-3 px-4 font-mono font-semibold text-white">INV-2026-002</td>
                <td className="py-3 px-4 text-slate-400">June 1, 2026</td>
                <td className="py-3 px-4 font-bold text-white">$49.00</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">Paid</span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button className="text-blue-400 hover:text-blue-300 font-semibold inline-flex items-center space-x-1">
                    <Download className="h-3.5 w-3.5" />
                    <span>Download</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
