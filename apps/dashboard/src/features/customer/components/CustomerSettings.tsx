import { useState } from 'react';
import { useAuthStore, Organization } from '../../../shared/stores/useAuthStore';
import { useThemeStore } from '../../../shared/stores/useThemeStore';
import { 
  Settings, 
  Building2, 
  User, 
  Check, 
  Save, 
  Crown,
  Compass
} from 'lucide-react';

export default function CustomerSettings() {
  const { user, orgs, activeOrgId, reopenOnboarding } = useAuthStore();
  const { theme } = useThemeStore();

  const activeOrg = orgs.find((o: Organization) => o.id === activeOrgId) || orgs[0];

  const [orgName, setOrgName] = useState(activeOrg?.name || 'Acme E-Commerce Inc');
  const [userName, setUserName] = useState(user?.name || 'Hitesh Kumar');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const isDark = theme === 'dark';

  return (
    <div className={`space-y-6 font-sans antialiased max-w-4xl ${isDark ? 'text-neutral-100' : 'text-neutral-900'}`}>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight flex items-center space-x-2">
            <Settings className="h-5 w-5 text-blue-500" />
            <span>Account & Organization Settings</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Manage workspace profile details, theme preferences, and security settings.
          </p>
        </div>

        <button
          onClick={reopenOnboarding}
          className="px-3 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <Compass className="h-4 w-4 text-blue-400" />
          <span>Reopen Onboarding Wizard</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Organization Details */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center space-x-2 border-b border-neutral-900 pb-3">
            <Building2 className="h-4 w-4 text-blue-500" />
            <h2 className="text-sm font-semibold text-white">Organization Profile</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Organization Name</label>
              <input
                type="text"
                value={orgName}
                onChange={e => setOrgName(e.target.value)}
                className="w-full px-3.5 py-2 bg-black border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Subscription Plan</label>
              <div className="px-3.5 py-2 bg-black border border-neutral-800 rounded-xl text-xs text-neutral-300 flex items-center justify-between">
                <span className="font-semibold uppercase text-blue-400">{activeOrg?.plan || 'Pro Plan'}</span>
                <Crown className="h-3.5 w-3.5 text-amber-400" />
              </div>
            </div>
          </div>
        </div>

        {/* User Profile Details */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center space-x-2 border-b border-neutral-900 pb-3">
            <User className="h-4 w-4 text-blue-500" />
            <h2 className="text-sm font-semibold text-white">User Account Profile</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Display Name</label>
              <input
                type="text"
                value={userName}
                onChange={e => setUserName(e.target.value)}
                className="w-full px-3.5 py-2 bg-black border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email || 'hitesh@insightfuel.io'}
                className="w-full px-3.5 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-400 text-xs cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Save Controls */}
        <div className="flex items-center justify-end space-x-3">
          {savedSuccess && (
            <span className="text-xs font-semibold text-emerald-400 flex items-center space-x-1">
              <Check className="h-4 w-4" />
              <span>Settings saved successfully</span>
            </span>
          )}
          <button
            type="submit"
            className="px-5 py-2 bg-white text-black hover:bg-neutral-100 rounded-xl text-xs font-semibold shadow-sm transition flex items-center space-x-1.5"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Save Settings</span>
          </button>
        </div>

      </form>
    </div>
  );
}
