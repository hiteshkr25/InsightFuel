import { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Users, 
  TrendingUp, 
  ChevronDown, 
  ChevronUp, 
  BookOpen, 
  Code2, 
  Menu,
  X,
  Boxes
} from 'lucide-react';
import { useThemeStore } from '../../../shared/stores/useThemeStore';

interface LandingPageProps {
  onNavigateDocs: () => void;
  onNavigateIntegrations: () => void;
  onNavigateAuth: () => void;
}

export default function LandingPage({ onNavigateDocs, onNavigateIntegrations, onNavigateAuth }: LandingPageProps) {
  const { theme } = useThemeStore();
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

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen font-sans antialiased selection:bg-neutral-800 ${
      isDark ? 'bg-black text-neutral-100' : 'bg-white text-neutral-900'
    }`}>
      
      {/* PUBLIC HEADER NAVIGATION */}
      <header className={`sticky top-0 z-50 border-b ${
        isDark ? 'bg-black/90 border-neutral-800' : 'bg-white/90 border-neutral-200'
      }`}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          
          {/* Brand Logo */}
          <div 
            className="flex items-center space-x-2.5 cursor-pointer select-none" 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="h-7 w-7 rounded-lg bg-neutral-900 border border-neutral-700 flex items-center justify-center text-white">
              <Sparkles className="h-4 w-4 text-blue-500" />
            </div>
            <span className="font-semibold text-base tracking-tight text-white">
              Insight<span className="text-blue-500">Fuel</span>
            </span>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-8 text-xs font-medium text-neutral-400">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-white transition">Home</button>
            <button onClick={onNavigateDocs} className="hover:text-white transition flex items-center space-x-1.5">
              <BookOpen className="h-3.5 w-3.5" />
              <span>Docs</span>
            </button>
            <button onClick={onNavigateIntegrations} className="hover:text-white transition flex items-center space-x-1.5">
              <Boxes className="h-3.5 w-3.5" />
              <span>Integrations</span>
            </button>
            <a href="#faq" className="hover:text-white transition">FAQ</a>
          </nav>

          {/* Header Action Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <button
              onClick={onNavigateAuth}
              className="px-3 py-1.5 text-xs font-medium text-neutral-400 hover:text-white transition"
            >
              Sign In
            </button>
            <button
              onClick={onNavigateAuth}
              className="px-4 py-2 bg-neutral-100 hover:bg-white text-black rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 shadow-sm"
            >
              <span>Get Started</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden text-neutral-400" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-neutral-950 border-b border-neutral-800 p-6 space-y-4 text-xs font-medium">
            <button onClick={onNavigateDocs} className="block w-full text-left text-neutral-300 hover:text-white">Documentation</button>
            <button onClick={onNavigateIntegrations} className="block w-full text-left text-neutral-300 hover:text-white">SDK Integrations</button>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="block text-neutral-300 hover:text-white">FAQ</a>
            <div className="pt-4 border-t border-neutral-800 flex flex-col space-y-2">
              <button onClick={onNavigateAuth} className="w-full py-2 bg-neutral-900 text-white rounded-lg">Sign In</button>
              <button onClick={onNavigateAuth} className="w-full py-2 bg-white text-black rounded-lg font-semibold">Get Started</button>
            </div>
          </div>
        )}
      </header>

      {/* HERO SECTION */}
      <section className="pt-24 pb-20 border-b border-neutral-900">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300 text-xs font-medium">
            <Sparkles className="h-3.5 w-3.5 text-blue-500" />
            <span>Commercial SaaS Customer & Product Analytics</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-semibold text-white tracking-tight leading-tight">
            Customer intelligence built for <br className="hidden sm:inline" />
            high-growth software teams.
          </h1>

          <p className="text-base text-neutral-400 max-w-xl mx-auto leading-relaxed">
            Real-time visitor tracking, conversion funnel diagnostics, feature engagement telemetry, and ML recommendation insights.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button
              onClick={onNavigateAuth}
              className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-neutral-100 text-black rounded-lg text-xs font-semibold transition flex items-center justify-center space-x-2 shadow-sm"
            >
              <span>Get Started</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              onClick={onNavigateDocs}
              className="w-full sm:w-auto px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 rounded-lg text-xs font-medium transition flex items-center justify-center space-x-2"
            >
              <Code2 className="h-4 w-4 text-neutral-400" />
              <span>Explore Documentation</span>
            </button>
          </div>

          {/* Social Proof */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-neutral-500 font-medium">
            <span className="flex items-center space-x-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> <span>5-minute setup</span></span>
            <span className="flex items-center space-x-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> <span>Sub-second event latency</span></span>
            <span className="flex items-center space-x-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> <span>Multi-tenant isolation</span></span>
          </div>
        </div>
      </section>

      {/* FEATURE HIGHLIGHTS */}
      <section className="py-20 border-b border-neutral-900 bg-neutral-950/40">
        <div className="max-w-6xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl font-semibold text-white tracking-tight">Core Product Capabilities</h2>
            <p className="text-xs text-neutral-400">Everything you need to monitor visitor traffic and conversion funnels.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-neutral-950 p-6 rounded-xl border border-neutral-800 space-y-3">
              <div className="h-9 w-9 rounded-lg bg-neutral-900 border border-neutral-800 text-blue-500 flex items-center justify-center">
                <Users className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-semibold text-white">Real-Time Visitor Tracking</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Monitor active online users, session durations, geographic origins, and page engagement live with sub-second latency.
              </p>
            </div>

            <div className="bg-neutral-950 p-6 rounded-xl border border-neutral-800 space-y-3">
              <div className="h-9 w-9 rounded-lg bg-neutral-900 border border-neutral-800 text-indigo-400 flex items-center justify-center">
                <TrendingUp className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-semibold text-white">Conversion Funnel Optimization</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Identify drop-off points in signup and checkout flows to maximize conversion rates and revenue retention.
              </p>
            </div>

            <div className="bg-neutral-950 p-6 rounded-xl border border-neutral-800 space-y-3">
              <div className="h-9 w-9 rounded-lg bg-neutral-900 border border-neutral-800 text-emerald-400 flex items-center justify-center">
                <Sparkles className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-semibold text-white">AI Growth Engine</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Automated ML models analyze user behavioral patterns and surface high-impact product growth recommendations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 border-b border-neutral-900">
        <div className="max-w-5xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Workflow</span>
            <h2 className="text-2xl font-semibold text-white tracking-tight">How InsightFuel Operates</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2 text-left">
              <span className="text-xs font-mono font-semibold text-neutral-500">01</span>
              <h4 className="text-sm font-semibold text-white">Create Project & API Key</h4>
              <p className="text-xs text-neutral-400">Register your organization workspace and generate production write keys in 1 click.</p>
            </div>

            <div className="p-6 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2 text-left">
              <span className="text-xs font-mono font-semibold text-neutral-500">02</span>
              <h4 className="text-sm font-semibold text-white">Embed Lightweight SDK</h4>
              <p className="text-xs text-neutral-400">Add our React provider, Next.js wrapper, or script tag to your web storefront.</p>
            </div>

            <div className="p-6 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2 text-left">
              <span className="text-xs font-mono font-semibold text-neutral-500">03</span>
              <h4 className="text-sm font-semibold text-white">View Business Telemetry</h4>
              <p className="text-xs text-neutral-400">Watch live visitor traffic and analytics stream into your customer portal.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ ACCORDION */}
      <section id="faq" className="py-20 border-b border-neutral-900 bg-neutral-950/40">
        <div className="max-w-3xl mx-auto px-6 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold text-white tracking-tight">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-3">
            {faqList.map((item, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div key={idx} className="bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden text-xs">
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full p-4 flex items-center justify-between font-medium text-white text-left hover:text-blue-400 transition"
                  >
                    <span>{item.q}</span>
                    {isOpen ? <ChevronUp className="h-4 w-4 text-neutral-400" /> : <ChevronDown className="h-4 w-4 text-neutral-600" />}
                  </button>
                  {isOpen && (
                    <div className="p-4 pt-0 text-neutral-400 leading-relaxed border-t border-neutral-900 bg-neutral-950/60">
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
      <footer className="py-12 bg-black text-neutral-500 text-xs">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-2.5">
            <div className="h-6 w-6 rounded-md bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white">
              <Sparkles className="h-3.5 w-3.5 text-blue-500" />
            </div>
            <span className="font-semibold text-white">InsightFuel</span>
            <span>© 2026 InsightFuel Inc. All rights reserved.</span>
          </div>

          <div className="flex items-center space-x-6 font-medium">
            <button onClick={onNavigateDocs} className="hover:text-neutral-300">Docs</button>
            <button onClick={onNavigateIntegrations} className="hover:text-neutral-300">Integrations</button>
            <button onClick={onNavigateAuth} className="hover:text-neutral-300">Sign In</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
