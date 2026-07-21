import { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Users, 
  TrendingUp, 
  Boxes, 
  ChevronDown, 
  ChevronUp, 
  BookOpen, 
  CreditCard, 
  Code2, 
  Menu,
  X
} from 'lucide-react';

interface LandingPageProps {
  onNavigateDocs: () => void;
  onNavigateIntegrations: () => void;
  onNavigateAuth: () => void;
}

export default function LandingPage({ onNavigateDocs, onNavigateIntegrations, onNavigateAuth }: LandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const faqList = [
    {
      q: 'How quickly can I integrate InsightFuel into my application?',
      a: 'Integration takes under 5 minutes. Simply copy our lightweight SDK snippet or React provider component, initialize with your write key, and start tracking events immediately.'
    },
    {
      q: 'Does InsightFuel impact website page load performance?',
      a: 'No. Our SDK is under 4KB gzipped, executes asynchronously inside a Web Worker thread, and queues telemetry payloads to ensure zero main-thread blocking.'
    },
    {
      q: 'How does multi-tenant customer isolation work?',
      a: 'Each customer owns an isolated Organization Workspace. API keys and analytics payloads are scoped strictly by organization ID and verified at the API Gateway.'
    },
    {
      q: 'Can I track custom events and e-commerce transactions?',
      a: 'Yes! You can track custom events, user identification properties, checkout transaction amounts, and feature button engagements using our SDK API.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased overflow-x-hidden">
      
      {/* PUBLIC HEADER NAVIGATION */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* Brand Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white">
              Insight<span className="text-blue-500">Fuel</span>
            </span>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-8 text-xs font-semibold text-slate-300">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-white transition">Home</button>
            <button onClick={onNavigateDocs} className="hover:text-white transition flex items-center space-x-1">
              <BookOpen className="h-3.5 w-3.5 text-blue-400" />
              <span>Docs</span>
            </button>
            <button onClick={onNavigateIntegrations} className="hover:text-white transition flex items-center space-x-1">
              <Boxes className="h-3.5 w-3.5 text-indigo-400" />
              <span>Integrations</span>
            </button>
            <a href="#pricing" className="hover:text-white transition flex items-center space-x-1">
              <CreditCard className="h-3.5 w-3.5 text-emerald-400" />
              <span>Pricing</span>
            </a>
            <a href="#faq" className="hover:text-white transition">FAQ</a>
          </nav>

          {/* Header Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={onNavigateAuth}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white transition"
            >
              Sign In
            </button>
            <button
              onClick={onNavigateAuth}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/30 transition flex items-center space-x-2"
            >
              <span>Get Started Free</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden text-slate-300" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-900 border-b border-slate-800 p-6 space-y-4 text-sm font-semibold">
            <button onClick={onNavigateDocs} className="block w-full text-left text-slate-300 hover:text-white">Documentation</button>
            <button onClick={onNavigateIntegrations} className="block w-full text-left text-slate-300 hover:text-white">SDK Integrations</button>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="block text-slate-300 hover:text-white">Pricing Tiers</a>
            <div className="pt-4 border-t border-slate-800 flex flex-col space-y-2">
              <button onClick={onNavigateAuth} className="w-full py-2.5 bg-slate-800 text-white rounded-xl">Sign In</button>
              <button onClick={onNavigateAuth} className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-bold">Get Started Free</button>
            </div>
          </div>
        )}
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-20 pb-24 overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none" />
        
        <div className="max-w-5xl mx-auto px-6 text-center space-y-6 relative z-10">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
            <Sparkles className="h-4 w-4 text-blue-400" />
            <span>Next-Generation Customer & Product Analytics SaaS</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
            Turn Customer Signals into <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
              Actionable Growth Engines
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Real-time visitor tracking, conversion funnel optimization, feature engagement intelligence, and automated AI business recommendations—built for modern software teams.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={onNavigateAuth}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl text-sm font-bold shadow-xl shadow-blue-600/30 transition flex items-center justify-center space-x-2"
            >
              <span>Start Free 14-Day Trial</span>
              <ArrowRight className="h-5 w-5" />
            </button>

            <button
              onClick={onNavigateDocs}
              className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-2xl text-sm font-semibold transition flex items-center justify-center space-x-2"
            >
              <Code2 className="h-5 w-5 text-blue-400" />
              <span>Explore Developer Docs</span>
            </button>
          </div>

          {/* Social Proof */}
          <div className="pt-10 flex flex-wrap items-center justify-center gap-8 text-xs text-slate-500 font-medium">
            <span className="flex items-center space-x-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> <span>No credit card required</span></span>
            <span className="flex items-center space-x-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> <span>5-minute setup</span></span>
            <span className="flex items-center space-x-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> <span>99.99% Uptime SLA</span></span>
          </div>
        </div>
      </section>

      {/* FEATURE HIGHLIGHTS */}
      <section className="py-20 bg-slate-900/60 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Everything You Need to Scale Customer Intelligence</h2>
            <p className="text-xs sm:text-sm text-slate-400">Comprehensive product analytics, real-time event processing, and automated growth diagnostics.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-950 p-8 rounded-3xl border border-slate-800/80 space-y-4 hover:border-blue-500/40 transition">
              <div className="h-12 w-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Real-Time Visitor Tracking</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Monitor active online users, session durations, geographic origins, and page engagement live with sub-second latency.
              </p>
            </div>

            <div className="bg-slate-950 p-8 rounded-3xl border border-slate-800/80 space-y-4 hover:border-indigo-500/40 transition">
              <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Conversion Funnel Optimization</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Identify drop-off points in signup and checkout flows to maximize conversion rates and revenue retention.
              </p>
            </div>

            <div className="bg-slate-950 p-8 rounded-3xl border border-slate-800/80 space-y-4 hover:border-cyan-500/40 transition">
              <div className="h-12 w-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">AI Business Recommendations</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Automated ML models analyze user behavioral patterns and surface high-impact product growth recommendations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">3 Simple Steps</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">How InsightFuel Operates</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 text-center">
              <div className="h-10 w-10 rounded-full bg-blue-600 text-white font-black flex items-center justify-center mx-auto text-sm">1</div>
              <h4 className="text-base font-bold text-white">Create Project & Write Key</h4>
              <p className="text-xs text-slate-400">Register your organization workspace and generate production SDK keys in 1 click.</p>
            </div>

            <div className="relative p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 text-center">
              <div className="h-10 w-10 rounded-full bg-indigo-600 text-white font-black flex items-center justify-center mx-auto text-sm">2</div>
              <h4 className="text-base font-bold text-white">Embed Lightweight SDK</h4>
              <p className="text-xs text-slate-400">Add our React provider, Next.js wrapper, or script tag to your web application.</p>
            </div>

            <div className="relative p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 text-center">
              <div className="h-10 w-10 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center mx-auto text-sm">3</div>
              <h4 className="text-base font-bold text-white">Unlock Executive Insights</h4>
              <p className="text-xs text-slate-400">Watch live visitor traffic stream into your executive analytics dashboard.</p>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="py-20 bg-slate-900/60 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Transparent Pricing</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Flexible Tiers for Growing SaaS Products</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Developer Tier */}
            <div className="bg-slate-950 p-8 rounded-3xl border border-slate-800 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white">Developer Starter</h3>
                <div className="flex items-baseline space-x-1">
                  <span className="text-3xl font-black text-white">$0</span>
                  <span className="text-xs text-slate-400">/ forever free</span>
                </div>
                <p className="text-xs text-slate-400">Ideal for side projects and early prototypes.</p>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-center space-x-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> <span>1 Project & 100,000 monthly events</span></li>
                  <li className="flex items-center space-x-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> <span>React, Next.js & JS SDKs</span></li>
                  <li className="flex items-center space-x-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> <span>Community Support</span></li>
                </ul>
              </div>
              <button onClick={onNavigateAuth} className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold border border-slate-700 transition">
                Start Free
              </button>
            </div>

            {/* Growth Pro Tier */}
            <div className="bg-gradient-to-b from-blue-950/60 to-slate-950 p-8 rounded-3xl border-2 border-blue-500 space-y-6 flex flex-col justify-between relative shadow-2xl">
              <div className="absolute top-0 right-8 -translate-y-1/2 bg-blue-600 text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-full tracking-wider">
                Most Popular
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white">Growth Pro</h3>
                <div className="flex items-baseline space-x-1">
                  <span className="text-3xl font-black text-white">$49</span>
                  <span className="text-xs text-slate-400">/ month</span>
                </div>
                <p className="text-xs text-slate-300">Designed for scaling SaaS platforms.</p>
                <ul className="space-y-2 text-xs text-slate-200">
                  <li className="flex items-center space-x-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> <span>Unlimited Projects & 2,500,000 events</span></li>
                  <li className="flex items-center space-x-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> <span>AI Business Recommendation Engine</span></li>
                  <li className="flex items-center space-x-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> <span>4-Tier Team RBAC & Invitations</span></li>
                  <li className="flex items-center space-x-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> <span>Webhooks & Slack Connector</span></li>
                </ul>
              </div>
              <button onClick={onNavigateAuth} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/30 transition">
                Start 14-Day Free Trial
              </button>
            </div>

            {/* Enterprise Tier */}
            <div className="bg-slate-950 p-8 rounded-3xl border border-slate-800 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white">Enterprise Scale</h3>
                <div className="flex items-baseline space-x-1">
                  <span className="text-3xl font-black text-white">$199</span>
                  <span className="text-xs text-slate-400">/ month</span>
                </div>
                <p className="text-xs text-slate-400">For high-volume enterprise organizations.</p>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-center space-x-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> <span>Unlimited Events & Dedicated Ingestion</span></li>
                  <li className="flex items-center space-x-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> <span>Custom SLA & Dedicated Account Engineer</span></li>
                  <li className="flex items-center space-x-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> <span>SSO & Custom Domain White-labeling</span></li>
                </ul>
              </div>
              <button onClick={onNavigateAuth} className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold border border-slate-700 transition">
                Contact Enterprise Sales
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* FAQ ACCORDION */}
      <section id="faq" className="py-20">
        <div className="max-w-4xl mx-auto px-6 space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-3">
            {faqList.map((item, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden text-xs">
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full p-4 flex items-center justify-between font-bold text-white text-left hover:text-blue-400 transition"
                  >
                    <span>{item.q}</span>
                    {isOpen ? <ChevronUp className="h-4 w-4 text-blue-400" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
                  </button>
                  {isOpen && (
                    <div className="p-4 pt-0 text-slate-400 leading-relaxed border-t border-slate-950 bg-slate-950/60">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 border-t border-slate-800/80 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-500">
          <div className="flex items-center space-x-3">
            <div className="h-7 w-7 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-bold text-white text-sm">InsightFuel</span>
            <span>© 2026 InsightFuel Inc. All rights reserved.</span>
          </div>

          <div className="flex items-center space-x-6">
            <button onClick={onNavigateDocs} className="hover:text-slate-300">Docs</button>
            <button onClick={onNavigateIntegrations} className="hover:text-slate-300">Integrations</button>
            <a href="#pricing" className="hover:text-slate-300">Pricing</a>
            <button onClick={onNavigateAuth} className="hover:text-slate-300">Sign In</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
