import { useAuthStore } from '../../../shared/stores/useAuthStore';
import { 
  CreditCard, 
  Check 
} from 'lucide-react';

export default function CustomerBilling() {
  const { orgs, activeOrgId, projects } = useAuthStore();
  const activeOrg = orgs.find((o) => o.id === activeOrgId) || orgs[0];

  const totalMonthlyEvents = projects
    .filter((p) => p.orgId === activeOrgId)
    .reduce((acc, p) => acc + (p.eventCount || 0), 0);

  const plans = [
    {
      id: 'free',
      name: 'Developer Free',
      price: '$0',
      period: 'forever',
      eventsIncluded: '100,000 events/mo',
      features: ['1 Project included', 'Community Discord support', '7-day telemetry retention']
    },
    {
      id: 'pro',
      name: 'Growth Pro',
      price: '$49',
      period: 'per month',
      eventsIncluded: '2,500,000 events/mo',
      popular: true,
      features: ['Unlimited Projects', 'AI Business Recommendation Engine', '4-Tier Team RBAC', '30-day telemetry retention', 'Priority Email Support']
    },
    {
      id: 'enterprise',
      name: 'Enterprise Scale',
      price: '$199',
      period: 'per month',
      eventsIncluded: 'Unlimited events',
      features: ['Dedicated Ingestion Microservice', 'Custom SLA Uptime Guarantee', 'SSO & Audit Logs', 'Dedicated Account Engineer']
    }
  ];

  return (
    <div className="space-y-6 font-sans antialiased text-neutral-100 max-w-5xl">
      
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-white tracking-tight flex items-center space-x-2">
          <CreditCard className="h-5 w-5 text-blue-500" />
          <span>Subscription & Billing Control</span>
        </h1>
        <p className="text-xs text-neutral-400 mt-1">
          Manage workspace plan tiers, monthly event consumption, and billing invoices for <strong className="text-white">{activeOrg?.name}</strong>.
        </p>
      </div>

      {/* Usage Progress Overview */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-white">Monthly Event Consumption</span>
          <span className="font-mono text-neutral-400">{totalMonthlyEvents.toLocaleString()} / 2,500,000 events</span>
        </div>

        <div className="w-full bg-neutral-900 rounded-full h-2 overflow-hidden border border-neutral-800">
          <div 
            className="bg-blue-500 h-full rounded-full transition-all"
            style={{ width: `${Math.min(100, (totalMonthlyEvents / 2500000) * 100)}%` }}
          />
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((p) => {
          const isCurrent = activeOrg?.plan === p.id;

          return (
            <div 
              key={p.id}
              className={`bg-neutral-950 border rounded-2xl p-6 shadow-xl space-y-4 flex flex-col justify-between relative ${
                p.popular ? 'border-blue-500/60 ring-1 ring-blue-500/30' : 'border-neutral-800'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-white">{p.name}</h3>
                  {isCurrent && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold uppercase">
                      Current
                    </span>
                  )}
                </div>

                <div className="flex items-baseline space-x-1">
                  <span className="text-3xl font-semibold text-white">{p.price}</span>
                  <span className="text-xs text-neutral-400">/{p.period}</span>
                </div>

                <p className="text-xs font-semibold text-blue-400">{p.eventsIncluded}</p>

                <ul className="space-y-2 text-xs text-neutral-300 pt-2 border-t border-neutral-900">
                  {p.features.map((feat, idx) => (
                    <li key={idx} className="flex items-center space-x-2">
                      <Check className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                disabled={isCurrent}
                className={`w-full py-2.5 rounded-xl text-xs font-semibold transition ${
                  isCurrent 
                    ? 'bg-neutral-900 text-neutral-500 cursor-default' 
                    : 'bg-white text-black hover:bg-neutral-100 shadow-sm'
                }`}
              >
                {isCurrent ? 'Active Plan' : 'Switch Plan'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
