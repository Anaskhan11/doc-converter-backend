import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

/**
 * The one palette for every notification in the app. `severity` owns colour, icon and
 * wording; `floating` only decides placement (transient stack vs the inline card the
 * tool page keeps on screen).
 */
const SEVERITIES = {
  error: {
    Icon: AlertCircle,
    panel: 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950 dark:text-rose-200 dark:border-rose-800',
    icon: 'text-rose-600 dark:text-rose-400',
    close: 'text-rose-700 hover:text-rose-900 dark:text-rose-400 dark:hover:text-rose-200',
    dismissLabel: 'Dismiss error'
  },
  success: {
    Icon: CheckCircle2,
    panel: 'bg-slate-900 text-[#0bff03] border-[#0bff03]/40',
    icon: 'text-[#0bff03]',
    close: 'text-slate-400 hover:text-white',
    dismissLabel: 'Dismiss notification'
  },
  info: {
    Icon: Info,
    panel: 'bg-slate-900 text-slate-100 border-slate-700',
    icon: 'text-indigo-400',
    close: 'text-slate-400 hover:text-white',
    dismissLabel: 'Dismiss notification'
  }
};

export const Notification = ({ severity = 'info', message, onDismiss, floating = false }) => {
  const theme = SEVERITIES[severity] ?? SEVERITIES.info;
  const { Icon } = theme;

  return (
    <div
      {...(floating
        ? null
        : { role: 'alert', 'aria-live': 'assertive', 'aria-atomic': 'true' })}
      className={`flex items-start justify-between gap-3 p-4 rounded-xl border text-sm font-medium ${theme.panel} ${
        floating ? 'shadow-xl animate-bounce-short' : 'w-full mb-6 shadow-xs'
      }`}
    >
      <div className="flex items-start space-x-3">
        <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${theme.icon}`} aria-hidden="true" />
        <span>{message}</span>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label={theme.dismissLabel}
          className={`p-1 rounded-md transition-colors ${theme.close}`}
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
};
