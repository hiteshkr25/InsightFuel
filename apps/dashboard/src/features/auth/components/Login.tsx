import { useState } from 'react';
import { useAuthStore } from '../../../shared/stores/useAuthStore';
import { 
  Sparkles, 
  Mail, 
  Lock, 
  User, 
  Building2, 
  ArrowRight, 
  CheckCircle2
} from 'lucide-react';

interface LoginProps {
  onSuccess?: () => void;
}

export default function Login({ onSuccess }: LoginProps) {
  const { login, register, forgotPassword } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot'>('login');

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedbackMsg(null);

    if (activeTab === 'forgot') {
      const res = await forgotPassword(email);
      setFeedbackMsg(res.message);
      setLoading(false);
      return;
    }

    let success = false;
    if (activeTab === 'register') {
      success = await register(name, email, password, companyName);
    } else {
      success = await login(email, password);
    }

    setLoading(false);
    if (success && onSuccess) {
      onSuccess();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans antialiased relative overflow-hidden">
      
      {/* Glow background elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full bg-slate-900/90 border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative z-10">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Insight<span className="text-blue-500">Fuel</span>
          </h1>
          <p className="text-xs text-slate-400">
            Customer Analytics & Business Intelligence SaaS Platform
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setActiveTab('login'); setFeedbackMsg(null); }}
            className={`py-2 rounded-xl transition ${activeTab === 'login' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('register'); setFeedbackMsg(null); }}
            className={`py-2 rounded-xl transition ${activeTab === 'register' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            Register
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('forgot'); setFeedbackMsg(null); }}
            className={`py-2 rounded-xl transition ${activeTab === 'forgot' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            Reset
          </button>
        </div>

        {/* Feedback Message */}
        {feedbackMsg && (
          <div className="bg-blue-950/40 border border-blue-900/60 p-3.5 rounded-xl text-xs text-blue-200 font-medium flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* REGISTER EXTRA FIELDS */}
          {activeTab === 'register' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name *</label>
                <div className="relative">
                  <User className="h-4 w-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Sarah Connor"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Company / Organization *</label>
                <div className="relative">
                  <Building2 className="h-4 w-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Acme Corp Inc"
                  />
                </div>
              </div>
            </>
          )}

          {/* EMAIL FIELD */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Work Email Address *</label>
            <div className="relative">
              <Mail className="h-4 w-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="sarah@acme.com"
              />
            </div>
          </div>

          {/* PASSWORD FIELD (Login & Register) */}
          {activeTab !== 'forgot' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password *</label>
              <div className="relative">
                <Lock className="h-4 w-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••••••"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/30 transition flex items-center justify-center space-x-2 disabled:opacity-50 mt-2"
          >
            <span>
              {loading 
                ? 'Processing...' 
                : activeTab === 'register' 
                ? 'Create Account & Organization' 
                : activeTab === 'forgot'
                ? 'Send Reset Link'
                : 'Sign In to Customer SaaS'
              }
            </span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Quick Demo Operator Accounts */}
        <div className="pt-4 border-t border-slate-800/80 space-y-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Quick One-Click Sign In</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => { setEmail('hitesh@acme.com'); setPassword('password'); login('hitesh@acme.com'); if (onSuccess) onSuccess(); }}
              className="px-3 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-medium text-slate-300 transition text-left"
            >
              <p className="font-bold text-white text-[11px]">Customer Owner</p>
              <p className="text-[10px] text-slate-400 truncate">hitesh@acme.com</p>
            </button>
            <button
              onClick={() => { setEmail('admin@insightfuel.io'); setPassword('password'); login('admin@insightfuel.io'); if (onSuccess) onSuccess(); }}
              className="px-3 py-2 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-900/50 rounded-xl text-xs font-medium text-rose-200 transition text-left"
            >
              <p className="font-bold text-white text-[11px]">Platform Admin</p>
              <p className="text-[10px] text-rose-400 truncate">admin@insightfuel.io</p>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
