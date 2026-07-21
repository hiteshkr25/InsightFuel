import { useState } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { useThemeStore } from '../stores/useThemeStore';
import { 
  CheckCircle2, 
  Circle, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight,
  Compass
} from 'lucide-react';

interface OnboardingProgressChecklistProps {
  onLaunchWizard: () => void;
  onNavigate: (view: string) => void;
}

export default function OnboardingProgressChecklist({ onLaunchWizard, onNavigate }: OnboardingProgressChecklistProps) {
  const { onboardingChecklist, onboardingCompleted } = useAuthStore();
  const { theme } = useThemeStore();
  const [collapsed, setCollapsed] = useState(false);

  const checklistItems = [
    { key: 'orgCreated', label: 'Organization Created', view: 'settings' },
    { key: 'projectCreated', label: 'First Project Created', view: 'projects' },
    { key: 'keyGenerated', label: 'API Key Generated', view: 'api-keys' },
    { key: 'sdkInstalled', label: 'SDK Installed', view: 'integrations' },
    { key: 'firstEventReceived', label: 'First Event Received', view: 'integrations' },
    { key: 'dashboardExplored', label: 'Dashboard Explored', view: 'analytics' }
  ] as const;

  const completedCount = checklistItems.filter(item => onboardingChecklist[item.key]).length;
  const totalCount = checklistItems.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  // Auto-hide when 100% complete
  if (onboardingCompleted || completedCount === totalCount) {
    return null;
  }

  const isDark = theme === 'dark';

  return (
    <div className={`rounded-xl border p-5 shadow-xl transition space-y-4 font-sans ${
      isDark ? 'bg-neutral-950 border-neutral-800 text-neutral-100' : 'bg-white border-neutral-200 text-neutral-900'
    }`}>
      
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xs">
            {progressPercent}%
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-semibold text-white tracking-tight">Onboarding & Setup Progress</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400">
                {completedCount} of {totalCount} Steps Completed
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">Complete setting up your workspace telemetry pipeline.</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onLaunchWizard}
            className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white text-xs font-semibold rounded-lg transition flex items-center space-x-1"
          >
            <Compass className="h-3.5 w-3.5 text-blue-400" />
            <span>Launch Setup Wizard</span>
          </button>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-900 transition"
          >
            {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-neutral-900 h-2 rounded-full overflow-hidden border border-neutral-800">
        <div 
          className="bg-gradient-to-r from-blue-600 to-emerald-500 h-full rounded-full transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Checklist Items Grid */}
      {!collapsed && (
        <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {checklistItems.map((item) => {
            const isDone = onboardingChecklist[item.key];

            return (
              <div
                key={item.key}
                onClick={() => onNavigate(item.view)}
                className={`p-3 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition ${
                  isDone 
                    ? 'bg-neutral-900/50 border-neutral-800 text-neutral-400' 
                    : 'bg-black border-blue-500/30 text-white hover:border-blue-500/60'
                }`}
              >
                <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                  {isDone ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 text-neutral-500 flex-shrink-0" />
                  )}
                  <span className={`truncate ${isDone ? 'line-through text-neutral-500' : 'font-medium'}`}>
                    {item.label}
                  </span>
                </div>

                {!isDone && <ArrowRight className="h-3.5 w-3.5 text-blue-400 flex-shrink-0" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
