import { LucideIcon } from 'lucide-react';

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
  return (
    <div className="bg-slate-900/80 border border-slate-800/80 rounded-3xl p-8 text-center max-w-xl mx-auto shadow-xl my-6 space-y-4 font-sans">
      <div className="h-14 w-14 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto shadow-inner">
        <Icon className="h-7 w-7" />
      </div>

      <div className="space-y-1.5">
        <h3 className="text-lg font-bold text-white tracking-tight">{title}</h3>
        <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
          {description}
        </p>
      </div>

      {(actionText || secondaryText) && (
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          {actionText && onAction && (
            <button
              onClick={onAction}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/30 transition w-full sm:w-auto"
            >
              {actionText}
            </button>
          )}
          {secondaryText && onSecondaryAction && (
            <button
              onClick={onSecondaryAction}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700 transition w-full sm:w-auto"
            >
              {secondaryText}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
