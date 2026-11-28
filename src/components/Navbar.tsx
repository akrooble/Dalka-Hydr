import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { resolveSiteTheme } from '../lib/siteThemes';
import { SiteSettings, SiteThemeId } from '../types/dalka';
import { BrandMark } from './BrandMark';
import { PWAInstallButton } from './PWAInstallButton';
import { ThemeToggle } from './ThemeToggle';

const NAV_ITEMS = [
  { label: 'Home', to: '/' },
  { label: 'Jobs', to: '/jobs' },
  { label: 'Tenders', to: '/tenders' },
  { label: 'Marketplace', to: '/marketplace' },
  { label: 'Blogs', to: '/blogs' },
  { label: 'Contacts', to: '/contacts' },
  { label: 'About', to: '/about' },
];

interface NavbarProps {
  siteSettings?: SiteSettings;
  siteTheme?: SiteThemeId;
}

export function Navbar({ siteSettings, siteTheme }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = resolveSiteTheme(siteTheme ?? siteSettings?.siteTheme);

  if (theme === 'modern_bento') {
    return (
      <header className="sticky top-0 z-40 w-full px-3 sm:px-6 lg:px-8 pt-3 pointer-events-none">
        <div className="mx-auto max-w-[1280px] pointer-events-auto rounded-2xl bg-white/90 dark:bg-[#111827]/90 backdrop-blur-lg border border-slate-200/80 dark:border-slate-800 shadow-[0_6px_28px_-8px_rgba(15,23,42,0.08)] dark:shadow-none px-4 sm:px-5 h-14 lg:h-16 flex items-center justify-between gap-4 transition-colors">
          <Link
            to="/"
            onClick={() => setMobileOpen(false)}
            className="flex items-center whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1] rounded-lg"
          >
            <BrandMark
              label={siteSettings?.brandName || 'dalkajobs'}
              lightLogoUrl={siteSettings?.siteLogoLightUrl}
              darkLogoUrl={siteSettings?.siteLogoDarkUrl}
            />
          </Link>

          <nav aria-label="Primary navigation" className="hidden lg:flex items-center gap-1 bg-[#F4F6FB] dark:bg-[#090D16] p-1 rounded-xl border border-slate-200/70 dark:border-slate-800">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1] ${
                    isActive
                      ? 'bg-white dark:bg-[#1F2937] text-[#4648D4] dark:text-[#818CF8] font-semibold shadow-xs dark:shadow-none'
                      : 'text-[#464554] dark:text-slate-300 hover:text-[#0B1C30] dark:hover:text-white'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <div className="lg:hidden">
              <PWAInstallButton compact />
            </div>

            <Link
              to="/jobs"
              className="hidden lg:inline-flex items-center justify-center h-[38px] px-4 rounded-xl bg-[#4648D4] dark:bg-[#6366F1] text-white text-sm font-semibold hover:bg-[#4F46E5] active:bg-[#4338CA] transition-colors whitespace-nowrap shrink-0"
            >
              Explore Roles
            </Link>

            <ThemeToggle iconOnly className="rounded-xl" />

            <button
              type="button"
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((prev) => !prev)}
              className="lg:hidden inline-flex items-center justify-center h-11 w-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E2430] text-[#0B1C30] dark:text-[#F1F5F9]"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <nav
            aria-label="Mobile navigation"
            className="lg:hidden mx-auto max-w-[1280px] mt-2 pointer-events-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-lg px-4 py-3 space-y-1"
          >
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center min-h-[44px] px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#EFF4FF] dark:bg-[#1E2430] text-[#4648D4] dark:text-[#818CF8]'
                      : 'text-[#464554] dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1E2430]'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800">
              <ThemeToggle className="w-full rounded-xl" />
            </div>
          </nav>
        )}
      </header>
    );
  }

  if (theme === 'swiss_editorial') {
    return (
      <header className="sticky top-0 z-40 w-full bg-[#FAFAFA] dark:bg-[#0A0C10] border-b-2 border-[#0A0C10] dark:border-slate-200 transition-colors">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 h-16 lg:h-[68px] flex items-center justify-between gap-4 lg:gap-8">
          <Link
            to="/"
            onClick={() => setMobileOpen(false)}
            className="flex items-center whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4648D4]"
          >
            <BrandMark
              label={siteSettings?.brandName || 'dalkajobs'}
              lightLogoUrl={siteSettings?.siteLogoLightUrl}
              darkLogoUrl={siteSettings?.siteLogoDarkUrl}
            />
          </Link>

          <nav aria-label="Primary navigation" className="hidden lg:flex items-center gap-7">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `relative py-1 text-xs uppercase tracking-[0.12em] font-semibold whitespace-nowrap shrink-0 transition-colors ${
                    isActive
                      ? 'text-[#4648D4] dark:text-[#818CF8]'
                      : 'text-[#334155] dark:text-slate-300 hover:text-[#0A0C10] dark:hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span>{item.label}</span>
                    {isActive && (
                      <span
                        aria-hidden="true"
                        className="absolute inset-x-0 -bottom-[22px] h-[3px] bg-[#4648D4] dark:bg-[#818CF8]"
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <div className="lg:hidden">
              <PWAInstallButton compact />
            </div>

            <Link
              to="/jobs"
              className="hidden lg:inline-flex items-center justify-center h-[38px] px-4 rounded-none bg-[#0A0C10] dark:bg-[#F8FAFC] text-white dark:text-[#0A0C10] text-xs uppercase tracking-wider font-semibold hover:bg-[#4648D4] dark:hover:bg-[#818CF8] dark:hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Open Directory
            </Link>

            <ThemeToggle iconOnly className="rounded-none border-slate-300 dark:border-slate-700" />

            <button
              type="button"
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((prev) => !prev)}
              className="lg:hidden inline-flex items-center justify-center h-11 w-11 rounded-none border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#12151C] text-[#0A0C10] dark:text-[#F1F5F9]"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <nav
            aria-label="Mobile navigation"
            className="lg:hidden border-t border-slate-300 dark:border-slate-800 bg-white dark:bg-[#12151C] px-4 py-3 space-y-1"
          >
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center min-h-[44px] px-3 py-2 text-xs uppercase tracking-wider font-semibold transition-colors ${
                    isActive
                      ? 'bg-[#0A0C10] text-white dark:bg-[#F8FAFC] dark:text-[#0A0C10]'
                      : 'text-[#334155] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1E2430]'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <div className="pt-2 mt-2 border-t border-slate-200 dark:border-slate-800">
              <ThemeToggle className="w-full rounded-none" />
            </div>
          </nav>
        )}
      </header>
    );
  }

  // Classic Editorial (Theme 1 — Default)
  return (
    <header className="sticky top-0 z-40 w-full bg-white/85 dark:bg-[#161B22]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 h-14 lg:h-16 flex items-center justify-between gap-4 lg:gap-8">
        <Link
          to="/"
          onClick={() => setMobileOpen(false)}
          className="flex items-center whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1] rounded"
        >
          <BrandMark
            label={siteSettings?.brandName || 'dalkajobs'}
            lightLogoUrl={siteSettings?.siteLogoLightUrl}
            darkLogoUrl={siteSettings?.siteLogoDarkUrl}
          />
        </Link>

        <nav aria-label="Primary navigation" className="hidden lg:flex items-center gap-6">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `relative py-1 text-sm font-medium whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1] rounded ${
                  isActive
                    ? 'text-[#4648D4] dark:text-[#818CF8]'
                    : 'text-[#464554] dark:text-slate-300 hover:text-[#0B1C30] dark:hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span>{item.label}</span>
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-0 -bottom-[21px] h-[2px] bg-[#4648D4] dark:bg-[#818CF8]"
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          <div className="lg:hidden">
            <PWAInstallButton compact />
          </div>

          <Link
            to="/jobs"
            className="hidden lg:inline-flex items-center justify-center h-[38px] px-4 rounded-lg bg-[#4648D4] dark:bg-[#6366F1] text-white text-sm font-semibold hover:bg-[#4F46E5] active:bg-[#4338CA] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#161B22]"
          >
            Browse Jobs
          </Link>

          <ThemeToggle iconOnly />

          <button
            type="button"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((prev) => !prev)}
            className="lg:hidden inline-flex items-center justify-center h-11 w-11 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E2430] text-[#0B1C30] dark:text-[#F1F5F9] hover:bg-slate-50 dark:hover:bg-[#262E3D] transition-colors"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav
          aria-label="Mobile navigation"
          className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161B22] px-4 py-3 space-y-1"
        >
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center min-h-[44px] px-3 py-2 rounded text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#EFF4FF] dark:bg-[#1E2430] text-[#4648D4] dark:text-[#818CF8]'
                    : 'text-[#464554] dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1E2430] hover:text-[#0B1C30] dark:hover:text-white'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800">
            <ThemeToggle className="w-full" />
          </div>
        </nav>
      )}
    </header>
  );
}
