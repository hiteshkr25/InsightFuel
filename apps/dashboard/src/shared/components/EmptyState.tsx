import { LucideIcon } from 'lucide-react';
import { useThemeStore } from '../stores/useThemeStore';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  secondaryText?: string;
  onSecondaryAction?: () => void;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
  secondaryText,
  onSecondaryAction
}: EmptyStateProps) {
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  return (
    <div className={`border rounded-2xl p-8 text-center max-w-xl mx-auto shadow-xl my-6 space-y-4 font-sans ${
      isDark ? 'bg-neutral-950 border-neutral-800 text-neutral-100' : 'bg-white border-neutral-200 text-neutral-900'
    }`}>
      <div className="h-12 w-12 rounded-2xl bg-neutral-900 border border-neutral-800 text-blue-500 flex items-center justify-center mx-auto">
        <Icon className="h-6 w-6" />
      </div>

      <div className="space-y-1">
        <h3 className="text-base font-semibold text-white tracking-tight">{title}</h3>
        <p className="text-xs text-neutral-400 leading-relaxed max-w-md mx-auto">
          {description}
        </p>
      </div>

      {(actionText || secondaryText) && (
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          {actionText && onAction && (
            <button
              onClick={onAction}
              className="px-5 py-2.5 bg-white text-black hover:bg-neutral-100 rounded-xl text-xs font-semibold shadow-sm transition w-full sm:w-auto"
            >
              {actionText}
            </button>
          )}
          {secondaryText && onSecondaryAction && (
            <button
              onClick={onSecondaryAction}
              className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded-xl text-xs font-semibold border border-neutral-800 transition w-full sm:w-auto"
            >
              {secondaryText}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
