/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useMemo, useState } from 'react';
import {
  BrowserRouter,
  MemoryRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Footer } from './components/Footer';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Navbar } from './components/Navbar';
import { OfflineIndicator } from './components/OfflineIndicator';
import { useDalkaData } from './hooks/useDalkaData';
import { ThemeMode, useTheme } from './hooks/useTheme';
import { isAdminHost } from './lib/domainRouting';
import { useSiteFavicon } from './lib/siteHead';
import { resolveSiteTheme } from './lib/siteThemes';
import { AboutPage } from './pages/AboutPage';
import { AdminPage } from './pages/AdminPage';
import { BlogsPage } from './pages/BlogsPage';
import { ContactsPage } from './pages/ContactsPage';
import { HomePage } from './pages/HomePage';
import { JobsPage } from './pages/JobsPage';
import { MarketplacePage } from './pages/MarketplacePage';
import { TendersPage } from './pages/TendersPage';
import {
  BlogPost,
  JobListing,
  MarketplaceItem,
  SiteSettings,
  SiteThemeId,
  TenderNotice,
} from './types/dalka';

const VALID_PREVIEW_ROUTES = new Set([
  '/',
  '/jobs',
  '/tenders',
  '/marketplace',
  '/blogs',
  '/contacts',
  '/about',
]);

interface PublicShellProps {
  jobs: JobListing[];
  tenders: TenderNotice[];
  marketplaceItems: MarketplaceItem[];
  blogs: BlogPost[];
  siteSettings: SiteSettings;
  siteTheme: SiteThemeId;
}

function PublicShell({
  jobs,
  tenders,
  marketplaceItems,
  blogs,
  siteSettings,
  siteTheme,
}: PublicShellProps) {
  useSiteFavicon(siteSettings.siteFaviconUrl);

  const canvasClass =
    siteTheme === 'modern_bento'
      ? 'bg-[#F4F6FB] text-[#0F172A] dark:bg-[#090D16] dark:text-[#F1F5F9]'
      : siteTheme === 'swiss_editorial'
        ? 'bg-[#FAFAFA] text-[#0A0C10] dark:bg-[#0A0C10] dark:text-[#F1F5F9]'
        : 'bg-[#F8F9FF] text-[#0B1C30] dark:bg-[#0D1117] dark:text-[#F1F5F9]';

  return (
    <div className={`min-h-screen flex flex-col ${canvasClass} pb-16 lg:pb-0 transition-colors`}>
      <Navbar siteSettings={siteSettings} siteTheme={siteTheme} />
      <main className="flex-1">
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                jobs={jobs}
                tenders={tenders}
                marketplaceItems={marketplaceItems}
                blogs={blogs}
                siteSettings={siteSettings}
                siteTheme={siteTheme}
              />
            }
          />
          <Route path="/jobs" element={<JobsPage jobs={jobs} siteTheme={siteTheme} />} />
          <Route path="/tenders" element={<TendersPage tenders={tenders} siteTheme={siteTheme} />} />
          <Route
            path="/marketplace"
            element={<MarketplacePage items={marketplaceItems} siteTheme={siteTheme} />}
          />
          <Route path="/blogs" element={<BlogsPage blogs={blogs} siteTheme={siteTheme} />} />
          <Route
            path="/contacts"
            element={<ContactsPage siteSettings={siteSettings} siteTheme={siteTheme} />}
          />
          <Route
            path="/about"
            element={<AboutPage siteSettings={siteSettings} siteTheme={siteTheme} />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer siteSettings={siteSettings} siteTheme={siteTheme} />
      <MobileBottomNav siteTheme={siteTheme} />
    </div>
  );
}

function PublicLayout() {
  const { jobs, tenders, marketplaceItems, blogs, siteSettings } = useDalkaData();
  const siteTheme = resolveSiteTheme(siteSettings.siteTheme);

  return (
    <PublicShell
      jobs={jobs}
      tenders={tenders}
      marketplaceItems={marketplaceItems}
      blogs={blogs}
      siteSettings={siteSettings}
      siteTheme={siteTheme}
    />
  );
}

interface PreviewBridgeProps {
  onReceiveState: (payload: {
    theme?: SiteThemeId;
    mode?: ThemeMode;
    route?: string;
    draftSettings?: Partial<SiteSettings>;
  }) => void;
}

function PreviewRouterBridge({ onReceiveState }: PreviewBridgeProps) {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0 });
    if (window.parent !== window) {
      window.parent.postMessage(
        { type: 'DALKA_PREVIEW_ROUTE_CHANGED', route: location.pathname },
        window.location.origin,
      );
    }
  }, [location.pathname]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      const data = event.data as {
        type?: string;
        theme?: SiteThemeId;
        mode?: ThemeMode;
        route?: string;
        draftSettings?: Partial<SiteSettings>;
      } | null;
      if (!data || data.type !== 'DALKA_PREVIEW_STATE') return;

      onReceiveState(data);
      if (data.route && VALID_PREVIEW_ROUTES.has(data.route) && data.route !== location.pathname) {
        navigate(data.route);
      }
    }

    window.addEventListener('message', handleMessage);
    if (window.parent !== window) {
      window.parent.postMessage({ type: 'DALKA_PREVIEW_READY' }, window.location.origin);
    }
    return () => window.removeEventListener('message', handleMessage);
  }, [location.pathname, navigate, onReceiveState]);

  return null;
}

function PreviewPublicShell() {
  const { setTheme } = useTheme();
  const { jobs, tenders, marketplaceItems, blogs, siteSettings } = useDalkaData();

  const initialParams = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const themeParam = params.get('theme');
    const routeParam = params.get('route') || '/';
    return {
      theme: themeParam ? resolveSiteTheme(themeParam) : null,
      route: VALID_PREVIEW_ROUTES.has(routeParam) ? routeParam : '/',
    };
  }, []);

  const [overrideTheme, setOverrideTheme] = useState<SiteThemeId | null>(initialParams.theme);
  const [draftSettings, setDraftSettings] = useState<Partial<SiteSettings> | null>(null);

  const handleReceiveState = useMemo(
    () =>
      (payload: {
        theme?: SiteThemeId;
        mode?: ThemeMode;
        draftSettings?: Partial<SiteSettings>;
      }) => {
        if (payload.theme) {
          setOverrideTheme(resolveSiteTheme(payload.theme));
        }
        if (payload.mode === 'light' || payload.mode === 'dark') {
          setTheme(payload.mode, false);
        }
        if (payload.draftSettings) {
          setDraftSettings(payload.draftSettings);
        }
      },
    [setTheme],
  );

  const mergedSettings: SiteSettings = useMemo(
    () => ({
      ...siteSettings,
      ...(draftSettings ?? {}),
    }),
    [siteSettings, draftSettings],
  );

  const effectiveTheme = resolveSiteTheme(overrideTheme ?? mergedSettings.siteTheme);

  return (
    <MemoryRouter initialEntries={[initialParams.route]}>
      <PreviewRouterBridge onReceiveState={handleReceiveState} />
      <PublicShell
        jobs={jobs}
        tenders={tenders}
        marketplaceItems={marketplaceItems}
        blogs={blogs}
        siteSettings={mergedSettings}
        siteTheme={effectiveTheme}
      />
    </MemoryRouter>
  );
}

export default function App() {
  useTheme();
  const adminHost = isAdminHost();
  const isPreviewFrame =
    typeof window !== 'undefined' && window.location.pathname.startsWith('/__preview');

  if (isPreviewFrame) {
    return (
      <ErrorBoundary>
        <PreviewPublicShell />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {adminHost ? (
            <Route path="*" element={<AdminPage />} />
          ) : (
            <>
              <Route path="/admin/*" element={<AdminPage />} />
              <Route path="*" element={<PublicLayout />} />
            </>
          )}
        </Routes>
        <OfflineIndicator />
      </BrowserRouter>
    </ErrorBoundary>
  );
}
