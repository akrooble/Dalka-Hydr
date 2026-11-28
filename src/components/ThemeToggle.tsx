import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

interface ThemeToggleProps {
  compact?: boolean;
  iconOnly?: boolean;
  className?: string;
}

export function ThemeToggle({
  compact = false,
  iconOnly = false,
  className = '',
}: ThemeToggleProps) {
  const { isDark, toggleTheme } = useTheme();
  const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';

  if (iconOnly) {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={label}
        title={label}
        className={`inline-flex items-center justify-center min-h-[44px] min-w-[44px] lg:min-h-[38px] lg:h-[38px] lg:w-[38px] rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E2430] text-[#0B1C30] dark:text-[#F1F5F9] hover:bg-slate-50 dark:hover:bg-[#262E3D] transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1] ${className}`}
      >
        {isDark ? (
          <Sun className="h-4 w-4 text-amber-400 shrink-0" />
        ) : (
          <Moon className="h-4 w-4 text-[#4648D4] shrink-0" />
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      className={`inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E2430] text-[#0B1C30] dark:text-[#F1F5F9] hover:bg-slate-50 dark:hover:bg-[#262E3D] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1] ${
        compact
          ? 'min-h-[44px] lg:min-h-[36px] lg:h-9 px-3 text-xs font-semibold'
          : 'min-h-[44px] lg:min-h-[38px] lg:h-[38px] px-3.5 text-sm font-medium'
      } ${className}`}
    >
      {isDark ? (
        <>
          <Sun className="h-4 w-4 text-amber-400 shrink-0" />
          <span>Light Mode</span>
        </>
      ) : (
        <>
          <Moon className="h-4 w-4 text-[#4648D4] shrink-0" />
          <span>Dark Mode</span>
        </>
      )}
    </button>
  );
}
