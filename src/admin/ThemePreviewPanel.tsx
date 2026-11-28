import {
  CheckCircle2,
  ExternalLink,
  Maximize2,
  Minimize2,
  Monitor,
  Moon,
  RefreshCw,
  Smartphone,
  Sun,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ThemeMode } from '../hooks/useTheme';
import { SITE_THEMES } from '../lib/siteThemes';
import { SiteSettings, SiteThemeId } from '../types/dalka';

const PREVIEW_PAGES = [
  { label: 'Home', path: '/' },
  { label: 'Jobs', path: '/jobs' },
  { label: 'Tenders', path: '/tenders' },
  { label: 'Marketplace', path: '/marketplace' },
  { label: 'Blogs', path: '/blogs' },
  { label: 'Contacts', path: '/contacts' },
  { label: 'About', path: '/about' },
];

interface ThemePreviewPanelProps {
  previewTheme: SiteThemeId;
  liveSavedTheme: SiteThemeId;
  draftSettings: SiteSettings;
  onSelectTheme: (theme: SiteThemeId) => void;
  onMakeLive?: (theme: SiteThemeId) => void;
  savingLive?: boolean;
  fullscreen: boolean;
  onToggleFullscreen: (next: boolean) => void;
  embedded?: boolean;
}

export function ThemePreviewPanel({
  previewTheme,
  liveSavedTheme,
  draftSettings,
  onSelectTheme,
  onMakeLive,
  savingLive = false,
  fullscreen,
  onToggleFullscreen,
  embedded = true,
}: ThemePreviewPanelProps) {
  const [previewMode, setPreviewMode] = useState<ThemeMode>('light');
  const [previewRoute, setPreviewRoute] = useState<string>('/');
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [reloadNonce, setReloadNonce] = useState(0);

  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [stageWidth, setStageWidth] = useState(1040);

  // Keep initial iframe src stable across state updates; updates flow via postMessage
  const initialSrc = useMemo(() => {
    const params = new URLSearchParams({
      theme: previewTheme,
      mode: previewMode,
      route: previewRoute,
      v: String(reloadNonce),
    });
    return `/__preview?${params.toString()}`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadNonce]);

  function pushStateToIframe() {
    const frameWindow = iframeRef.current?.contentWindow;
    if (!frameWindow) return;
    frameWindow.postMessage(
      {
        type: 'DALKA_PREVIEW_STATE',
        theme: previewTheme,
        mode: previewMode,
        route: previewRoute,
        draftSettings,
      },
      window.location.origin,
    );
  }

  useEffect(() => {
    if (!iframeLoaded) return;
    pushStateToIframe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [iframeLoaded, previewTheme, previewMode, previewRoute, draftSettings]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      const data = event.data as {
        type?: string;
        route?: string;
        mode?: ThemeMode;
      } | null;
      if (!data) return;

      if (data.type === 'DALKA_PREVIEW_READY') {
        setIframeLoaded(true);
        pushStateToIframe();
      } else if (data.type === 'DALKA_PREVIEW_ROUTE_CHANGED' && data.route) {
        setPreviewRoute(data.route);
      } else if (
        data.type === 'DALKA_PREVIEW_MODE_CHANGED' &&
        (data.mode === 'light' || data.mode === 'dark')
      ) {
        setPreviewMode(data.mode);
      }
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewTheme, previewMode, previewRoute, draftSettings]);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const updateWidth = () => {
      const next = el.clientWidth;
      if (next > 0) setStageWidth(next);
    };
    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(el);
    return () => observer.disconnect();
  }, [fullscreen, device]);

  useEffect(() => {
    if (!fullscreen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onToggleFullscreen(false);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [fullscreen, onToggleFullscreen]);

  if (!embedded && !fullscreen) {
    return null;
  }

  const activeThemeDef =
    SITE_THEMES.find((t) => t.id === previewTheme) || SITE_THEMES[0];
  const isCurrentlyLive = previewTheme === liveSavedTheme;

  const desktopVirtualWidth = 1280;
  const desktopScale =
    device === 'desktop' ? Math.min(1, Math.max(0.35, (stageWidth - 24) / desktopVirtualWidth)) : 1;
  const targetStageHeight = fullscreen ? Math.max(540, window.innerHeight - 190) : 620;
  const scaledIframeHeight = Math.round(targetStageHeight / desktopScale);

  return (
    <>
      {fullscreen && (
        <div
          aria-hidden="true"
          onClick={() => onToggleFullscreen(false)}
          className="fixed inset-0 z-50 bg-[#0B1C30]/65 dark:bg-black/75 backdrop-blur-xs"
        />
      )}

      <section
        aria-label="Live Website Theme Preview Panel"
        className={
          fullscreen
            ? 'fixed inset-3 sm:inset-5 z-50 flex flex-col rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#161B22] shadow-2xl overflow-hidden'
            : 'rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161B22] overflow-hidden'
        }
      >
        {/* Top Studio Bar */}
        <div className="px-4 sm:px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-[#F8F9FF] dark:bg-[#0D1117] flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold text-[#0B1C30] dark:text-[#F8FAFC]">
                Live Website Preview
              </span>
              <span aria-hidden="true" className="text-slate-400">
                ·
              </span>
              <span className="font-semibold text-[#4648D4] dark:text-[#818CF8]">
                {activeThemeDef.name}
              </span>
              <span aria-hidden="true" className="text-slate-400">
                ·
              </span>
              {isCurrentlyLive ? (
                <span className="text-[#006C49] dark:text-[#34D399] font-medium">
                  Currently Live on Site
                </span>
              ) : (
                <span className="text-amber-700 dark:text-amber-400 font-medium">
                  Previewing Only (Not Live Yet)
                </span>
              )}
            </div>
            <p className="mt-0.5 text-[11px] text-[#64748B] dark:text-slate-400">
              Navigate any page, switch Light/Dark modes, and inspect Desktop or Mobile before publishing live.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                setIframeLoaded(false);
                setReloadNonce((n) => n + 1);
              }}
              title="Reload preview"
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#161B22] text-xs font-medium text-[#464554] dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1E2430] transition-colors whitespace-nowrap shrink-0"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Reload</span>
            </button>

            <a
              href={`/__preview?theme=${encodeURIComponent(previewTheme)}&mode=${encodeURIComponent(previewMode)}&route=${encodeURIComponent(previewRoute)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#161B22] text-xs font-medium text-[#464554] dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1E2430] transition-colors whitespace-nowrap shrink-0"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">New Tab</span>
            </a>

            <button
              type="button"
              onClick={() => onToggleFullscreen(!fullscreen)}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#161B22] text-xs font-semibold text-[#0B1C30] dark:text-[#F8FAFC] hover:bg-slate-50 dark:hover:bg-[#1E2430] transition-colors whitespace-nowrap shrink-0"
            >
              {fullscreen ? (
                <>
                  <Minimize2 className="h-3.5 w-3.5" />
                  <span>Exit Fullscreen</span>
                </>
              ) : (
                <>
                  <Maximize2 className="h-3.5 w-3.5" />
                  <span>Fullscreen</span>
                </>
              )}
            </button>

            {onMakeLive && (
              <button
                type="button"
                disabled={savingLive || isCurrentlyLive}
                onClick={() => onMakeLive(previewTheme)}
                className={`inline-flex items-center gap-1.5 h-9 px-4 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  isCurrentlyLive
                    ? 'border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/30 text-[#006C49] dark:text-[#34D399] cursor-default'
                    : 'bg-[#4648D4] dark:bg-[#6366F1] text-white hover:bg-[#4F46E5] dark:hover:bg-[#818CF8] disabled:opacity-60'
                }`}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>
                  {savingLive
                    ? 'Publishing...'
                    : isCurrentlyLive
                      ? 'Theme is Live'
                      : 'Publish Theme Live'}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Interactive Switcher Toolbar */}
        <div className="px-4 sm:px-5 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161B22] flex flex-wrap items-center justify-between gap-3">
          {/* Theme Quick-Tabs */}
          <div
            role="tablist"
            aria-label="Preview design theme"
            className="inline-flex flex-wrap items-center gap-1 p-1 rounded-lg bg-[#F8F9FF] dark:bg-[#0D1117] border border-slate-200 dark:border-slate-800"
          >
            {SITE_THEMES.map((t) => {
              const active = previewTheme === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => onSelectTheme(t.id)}
                  className={`h-8 px-3 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-[#4648D4] dark:bg-[#6366F1] text-white'
                      : 'text-[#464554] dark:text-slate-300 hover:text-[#0B1C30] dark:hover:text-white'
                  }`}
                >
                  {t.name}
                  {liveSavedTheme === t.id ? ' (Live)' : ''}
                </button>
              );
            })}
          </div>

          {/* Page Route Switcher */}
          <div
            role="tablist"
            aria-label="Preview website page"
            className="inline-flex flex-wrap items-center gap-1 p-1 rounded-lg bg-[#F8F9FF] dark:bg-[#0D1117] border border-slate-200 dark:border-slate-800"
          >
            {PREVIEW_PAGES.map((pg) => {
              const active = previewRoute === pg.path;
              return (
                <button
                  key={pg.path}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setPreviewRoute(pg.path)}
                  className={`h-8 px-2.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-white dark:bg-[#1E2430] text-[#4648D4] dark:text-[#818CF8] font-semibold border border-slate-200 dark:border-slate-700'
                      : 'text-[#64748B] dark:text-slate-400 hover:text-[#0B1C30] dark:hover:text-white'
                  }`}
                >
                  {pg.label}
                </button>
              );
            })}
          </div>

          {/* Light/Dark & Device Toggles */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="inline-flex items-center p-1 rounded-lg bg-[#F8F9FF] dark:bg-[#0D1117] border border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setPreviewMode('light')}
                className={`inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  previewMode === 'light'
                    ? 'bg-white dark:bg-[#1E2430] text-[#0B1C30] dark:text-white border border-slate-200 dark:border-slate-700'
                    : 'text-[#64748B] dark:text-slate-400'
                }`}
              >
                <Sun className="h-3.5 w-3.5 text-amber-500" />
                <span>Light</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode('dark')}
                className={`inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  previewMode === 'dark'
                    ? 'bg-[#0B1C30] text-white'
                    : 'text-[#64748B] dark:text-slate-400'
                }`}
              >
                <Moon className="h-3.5 w-3.5 text-[#818CF8]" />
                <span>Dark</span>
              </button>
            </div>

            <div className="inline-flex items-center p-1 rounded-lg bg-[#F8F9FF] dark:bg-[#0D1117] border border-slate-200 dark:border-slate-800">
              <button
                type="button"
                aria-label="Desktop viewport preview"
                onClick={() => setDevice('desktop')}
                className={`inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  device === 'desktop'
                    ? 'bg-white dark:bg-[#1E2430] text-[#4648D4] dark:text-[#818CF8] border border-slate-200 dark:border-slate-700'
                    : 'text-[#64748B] dark:text-slate-400'
                }`}
              >
                <Monitor className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Desktop</span>
              </button>
              <button
                type="button"
                aria-label="Mobile viewport preview"
                onClick={() => setDevice('mobile')}
                className={`inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  device === 'mobile'
                    ? 'bg-white dark:bg-[#1E2430] text-[#4648D4] dark:text-[#818CF8] border border-slate-200 dark:border-slate-700'
                    : 'text-[#64748B] dark:text-slate-400'
                }`}
              >
                <Smartphone className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Mobile</span>
              </button>
            </div>
          </div>
        </div>

        {/* Interactive Iframe Preview Stage */}
        <div
          ref={stageRef}
          className={`relative bg-slate-100 dark:bg-[#090D16] flex justify-center overflow-hidden ${
            fullscreen ? 'flex-1 p-3 sm:p-4' : 'p-3'
          }`}
        >
          {!iframeLoaded && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-100/90 dark:bg-[#090D16]/90">
              <div className="text-xs font-medium text-[#64748B] dark:text-slate-400">
                Loading live website preview...
              </div>
            </div>
          )}

          {device === 'desktop' ? (
            <div
              className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1117] overflow-hidden shadow-sm shrink-0"
              style={{
                width: `${Math.round(desktopVirtualWidth * desktopScale)}px`,
                height: `${targetStageHeight}px`,
              }}
            >
              <iframe
                ref={iframeRef}
                src={initialSrc}
                title="Dalka Jobs Website Live Theme Preview"
                onLoad={() => {
                  setIframeLoaded(true);
                  pushStateToIframe();
                }}
                style={{
                  width: `${desktopVirtualWidth}px`,
                  height: `${scaledIframeHeight}px`,
                  transform: `scale(${desktopScale})`,
                  transformOrigin: 'top left',
                  border: 0,
                }}
              />
            </div>
          ) : (
            <div
              className="rounded-[28px] border-[6px] border-[#0B1C30] dark:border-slate-700 bg-white dark:bg-[#0D1117] overflow-hidden shadow-lg shrink-0"
              style={{
                width: '390px',
                height: `${Math.min(720, targetStageHeight)}px`,
              }}
            >
              <iframe
                ref={iframeRef}
                src={initialSrc}
                title="Dalka Jobs Mobile Website Live Theme Preview"
                onLoad={() => {
                  setIframeLoaded(true);
                  pushStateToIframe();
                }}
                className="w-full h-full border-0"
              />
            </div>
          )}
        </div>
      </section>
    </>
  );
}
