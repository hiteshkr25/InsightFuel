import { useState } from 'react';
import { useAuthStore } from '../../../shared/stores/useAuthStore';
import { useThemeStore } from '../../../shared/stores/useThemeStore';
import { 
  Sparkles, 
  ArrowRight, 
  Mail, 
  Lock, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface LoginProps {
  onSuccess: () => void;
}

export default function Login({ onSuccess }: LoginProps) {
  const { login } = useAuthStore();
  const { theme } = useThemeStore();
  const [email, setEmail] = useState('hitesh@insightfuel.io');
  const [password, setPassword] = useState('password123');
  const [isSuperAdminRole, setIsSuperAdminRole] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    login(email, isSuperAdminRole);
    onSuccess();
  };

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 font-sans antialiased ${
      isDark ? 'bg-black text-neutral-100' : 'bg-white text-neutral-900'
    }`}>
      <div className={`w-full max-w-md border rounded-2xl p-8 shadow-2xl space-y-6 ${
        isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-white border-neutral-200'
      }`}>
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="h-10 w-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-blue-500 mx-auto">
            <Sparkles className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Sign in to InsightFuel</h1>
          <p className="text-xs text-neutral-400">Enter your credentials to access your organization workspace.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">Email Address *</label>
            <div className="relative">
              <Mail className="h-4 w-4 text-neutral-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="name@company.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">Password *</label>
            <div className="relative">
              <Lock className="h-4 w-4 text-neutral-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* SuperAdmin Checkbox */}
          <div className="pt-2 flex items-center justify-between">
            <label className="flex items-center space-x-2 text-xs text-neutral-400 cursor-pointer">
              <input
                type="checkbox"
                checked={isSuperAdminRole}
                onChange={e => setIsSuperAdminRole(e.target.checked)}
                className="rounded border-neutral-800 bg-neutral-900 text-blue-500 focus:ring-0"
              />
              <span className="flex items-center space-x-1">
                <ShieldCheck className="h-3.5 w-3.5 text-red-500" />
                <span>SuperAdmin Platform Operator Mode</span>
              </span>
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-white text-black hover:bg-neutral-100 rounded-xl text-xs font-semibold shadow-sm transition flex items-center justify-center space-x-2"
          >
            <span>Sign In</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-neutral-900 text-center text-xs text-neutral-500">
          <p className="flex items-center justify-center space-x-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            <span>Multi-tenant encrypted SSO architecture</span>
          </p>
        </div>

      </div>
    </div>
  );
}
