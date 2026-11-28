import { useEffect, useState } from 'react';

interface OrgLogoProps {
  name: string;
  logoUrl?: string;
  subtitle?: string;
  variant?: 'compact' | 'banner';
  sizeClass?: string;
}

const PALETTES = [
  'bg-[#EFF4FF] text-[#4648D4] border-[#DCE4FF] dark:bg-[#1E2540] dark:text-[#A5B4FC] dark:border-indigo-900/60',
  'bg-emerald-50 text-[#006C49] border-emerald-200 dark:bg-emerald-950/60 dark:text-[#34D399] dark:border-emerald-900/60',
  'bg-slate-100 text-[#0B1C30] border-slate-200 dark:bg-[#1E2430] dark:text-slate-200 dark:border-slate-700',
  'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900/50',
];

function getInitials(name: string): string {
  const words = name
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0);
  if (words.length === 0) return 'DJ';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

function getPaletteClass(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return PALETTES[hash % PALETTES.length];
}

export function OrgLogo({
  name,
  logoUrl,
  subtitle,
  variant = 'compact',
  sizeClass = 'h-10 w-10',
}: OrgLogoProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [logoUrl]);

  const hasValidLogo = Boolean(logoUrl && logoUrl.trim().length > 0 && !failed);
  const initials = getInitials(name);
  const palette = getPaletteClass(name);

  if (variant === 'banner') {
    return (
      <div className="relative aspect-[16/10] bg-[#EFF4FF]/70 dark:bg-[#161E2E] border-b border-slate-100 dark:border-slate-800 flex flex-col p-2 sm:p-2.5 gap-2 overflow-hidden">
        <div className="flex-1 w-full min-h-0 rounded-lg bg-white dark:bg-[#0D1117] border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center p-1.5 sm:p-2 overflow-hidden group-hover:scale-[1.015] transition-transform duration-200">
          {hasValidLogo ? (
            <img
              src={logoUrl}
              alt={`${name} logo`}
              referrerPolicy="no-referrer"
              onError={() => setFailed(true)}
              className="w-full h-full object-contain"
            />
          ) : (
            <span
              className={`w-full h-full rounded-md border flex items-center justify-center text-3xl sm:text-4xl font-bold tracking-tight ${palette}`}
            >
              {initials}
            </span>
          )}
        </div>

        <div className="px-1 text-center max-w-full shrink-0">
          <div className="text-xs font-semibold text-[#0B1C30] dark:text-[#F8FAFC] truncate">
            {name}
          </div>
          {subtitle && (
            <div className="text-[11px] font-medium text-[#64748B] dark:text-slate-400 truncate">
              {subtitle}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (hasValidLogo) {
    return (
      <div
        className={`${sizeClass} rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0D1117] p-1 flex items-center justify-center shrink-0 overflow-hidden`}
      >
        <img
          src={logoUrl}
          alt={`${name} logo`}
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className="w-full h-full object-contain"
        />
      </div>
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-lg border flex items-center justify-center text-xs font-bold tracking-tight shrink-0 ${palette}`}
      aria-label={`${name} emblem`}
    >
      {initials}
    </div>
  );
}
