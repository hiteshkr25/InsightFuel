import { useState } from 'react';
import { useAuthStore } from '../../../shared/stores/useAuthStore';

interface LoginProps {
  onSuccess: () => void;
}

export default function Login({ onSuccess }: LoginProps) {
  const login = useAuthStore(state => state.login);
  const [email, setEmail] = useState('demo@insightfuel.io');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const success = await login(email, password);
    setLoading(false);
    if (success) {
      onSuccess();
    } else {
      setError('Invalid login details.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-25%] w-[80%] h-[80%] bg-blue-900/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-25%] w-[80%] h-[80%] bg-indigo-950/20 rounded-full blur-[140px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex items-center justify-center space-x-2">
          <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
            <span className="text-white font-bold text-xl">IF</span>
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">Insight<span className="text-blue-500">Fuel</span></span>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          Access your intelligence portal
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Universal analytics & behaviour platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-slate-900 py-8 px-4 border border-slate-800 shadow-xl rounded-xl sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-md bg-red-950/30 border border-red-900/50 p-4">
                <div className="text-sm font-medium text-red-400">{error}</div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-800 rounded bg-slate-950"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-400">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-blue-500 hover:text-blue-400">
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-slate-900 transition duration-150 ease-in-out disabled:opacity-50"
              >
                {loading ? 'Entering portal...' : 'Login to workspace'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
