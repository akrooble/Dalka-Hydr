import { Briefcase, Gavel, Home, Phone, ShoppingBag } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { resolveSiteTheme } from '../lib/siteThemes';
import { SiteThemeId } from '../types/dalka';

const MOBILE_TABS = [
  { label: 'Home', to: '/', icon: Home },
  { label: 'Jobs', to: '/jobs', icon: Briefcase },
  { label: 'Tenders', to: '/tenders', icon: Gavel },
  { label: 'Market', to: '/marketplace', icon: ShoppingBag },
  { label: 'Contacts', to: '/contacts', icon: Phone },
];

interface MobileBottomNavProps {
  siteTheme?: SiteThemeId;
}

export function MobileBottomNav({ siteTheme }: MobileBottomNavProps) {
  const theme = resolveSiteTheme(siteTheme);

  const navClass =
    theme === 'modern_bento'
      ? 'lg:hidden fixed bottom-2 inset-x-3 z-40 rounded-2xl bg-white/95 dark:bg-[#111827]/95 backdrop-blur-lg border border-slate-200/80 dark:border-slate-800 shadow-lg'
      : theme === 'swiss_editorial'
        ? 'lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[#FAFAFA] dark:bg-[#0A0C10] border-t-2 border-[#0A0C10] dark:border-slate-200'
        : 'lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/90 dark:bg-[#161B22]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800';

  return (
    <nav aria-label="Mobile bottom navigation" className={navClass}>
      <div className="grid grid-cols-5 h-14">
        {MOBILE_TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.to === '/'}
              className={({ isActive }) =>
                `min-h-[44px] flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors ${
                  isActive
                    ? 'text-[#4648D4] dark:text-[#818CF8]'
                    : 'text-[#64748B] dark:text-slate-400 hover:text-[#0B1C30] dark:hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`h-5 w-5 ${
                      isActive
                        ? 'text-[#4648D4] dark:text-[#818CF8]'
                        : 'text-[#64748B] dark:text-slate-400'
                    }`}
                    strokeWidth={isActive ? 2.25 : 1.75}
                  />
                  <span className="leading-none">{tab.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
