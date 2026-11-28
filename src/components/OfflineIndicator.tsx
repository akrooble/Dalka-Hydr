import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      className="fixed bottom-16 lg:bottom-4 left-4 z-50 inline-flex items-center gap-2 rounded-lg border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/90 px-3.5 py-2 text-xs font-semibold text-amber-900 dark:text-amber-200 shadow-sm"
    >
      <WifiOff className="h-3.5 w-3.5 text-amber-700 dark:text-amber-400 shrink-0" />
      <span>Offline Mode — Cached listings are available</span>
    </div>
  );
}
