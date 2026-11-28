import { Download, Smartphone, X } from 'lucide-react';
import { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  compact?: boolean;
}

export function PWAInstallButton({ compact = false }: PWAInstallButtonProps) {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={() => void install()}
        className={`inline-flex items-center justify-center gap-2 rounded bg-white dark:bg-[#1E2430] border border-slate-200 dark:border-slate-700 text-[#0B1C30] dark:text-[#F1F5F9] hover:bg-slate-50 dark:hover:bg-[#262E3D] transition-colors whitespace-nowrap shrink-0 ${
          compact
            ? 'min-h-[44px] lg:min-h-[36px] lg:h-9 px-3 text-xs font-semibold'
            : 'min-h-[44px] lg:min-h-[38px] lg:h-[38px] px-4 text-sm font-semibold'
        }`}
      >
        <Download className="h-4 w-4 text-[#4648D4] dark:text-[#818CF8]" />
        <span>Install App</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className={`inline-flex items-center justify-center gap-1.5 rounded bg-white dark:bg-[#1E2430] border border-slate-200 dark:border-slate-700 text-[#0B1C30] dark:text-[#F1F5F9] hover:bg-slate-50 dark:hover:bg-[#262E3D] transition-colors whitespace-nowrap shrink-0 ${
            compact
              ? 'min-h-[44px] lg:min-h-[36px] lg:h-9 px-3 text-xs font-semibold'
              : 'min-h-[44px] lg:min-h-[38px] lg:h-[38px] px-3.5 text-xs font-semibold'
          }`}
        >
          <Smartphone className="h-3.5 w-3.5 text-[#4648D4] dark:text-[#818CF8]" />
          <span>Install App</span>
        </button>

        {showIOSGuide && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/60 dark:bg-black/75 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ios-install-title"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowIOSGuide(false);
            }}
          >
            <div className="w-full max-w-sm rounded-xl bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 p-6 shadow-xl">
              <div className="flex items-start justify-between gap-3">
                <h2 id="ios-install-title" className="text-lg font-semibold text-[#0B1C30] dark:text-[#F8FAFC]">
                  Install Dalka Jobs on iOS
                </h2>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  aria-label="Close iOS install guide"
                  className="min-h-[44px] min-w-[44px] lg:min-h-0 lg:min-w-0 lg:h-8 lg:w-8 inline-flex items-center justify-center rounded border border-slate-200 dark:border-slate-700 text-[#464554] dark:text-slate-300"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <ol className="mt-3 space-y-2 text-sm text-[#464554] dark:text-slate-300 list-decimal list-inside">
                <li>
                  Tap the <span className="font-semibold text-[#0B1C30] dark:text-white">Share</span> button in Safari.
                </li>
                <li>
                  Scroll down and tap{' '}
                  <span className="font-semibold text-[#0B1C30] dark:text-white">Add to Home Screen</span>.
                </li>
                <li>
                  Tap <span className="font-semibold text-[#0B1C30] dark:text-white">Add</span> to launch Dalka Jobs like a native app.
                </li>
              </ol>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full min-h-[44px] lg:min-h-[38px] lg:h-[38px] rounded bg-[#4648D4] dark:bg-[#6366F1] text-white text-sm font-semibold hover:bg-[#4F46E5]"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
}
