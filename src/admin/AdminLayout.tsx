import {
  Briefcase,
  Download,
  ExternalLink,
  FileText,
  Gavel,
  Home,
  Image as ImageIcon,
  LayoutDashboard,
  Link2,
  LogOut,
  Mail,
  Menu,
  Palette,
  Phone,
  Share2,
  Shield,
  ShoppingBag,
  Type,
  Users,
  X,
} from 'lucide-react';
import { ReactNode, useState } from 'react';
import { Link } from 'react-router-dom';
import { BrandMark } from '../components/BrandMark';
import { PWAInstallButton } from '../components/PWAInstallButton';
import { ThemeToggle } from '../components/ThemeToggle';
import { getPublicSiteHref } from '../lib/domainRouting';
import { getRoleLabel } from '../lib/permissions';
import { AdminPermission, AdminRole, AdminTab, SiteSettings } from '../types/dalka';

interface AdminCounts {
  jobs: number;
  tenders: number;
  marketplace: number;
  blogs: number;
  newLeads: number;
  newsletter: number;
  pendingRequests: number;
}

interface AdminLayoutProps {
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  adminEmail: string;
  adminRole: AdminRole;
  permissions: AdminPermission[];
  onSignOut: () => void;
  counts: AdminCounts;
  siteSettings?: SiteSettings;
  children: ReactNode;
}

interface NavGroup {
  label: string;
  items: {
    id: AdminTab;
    label: string;
    icon: typeof LayoutDashboard;
    requiredPerm: AdminPermission;
    countKey?: keyof AdminCounts;
    highlightCount?: boolean;
  }[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Workspace',
    items: [
      { id: 'overview', label: 'Overview', icon: LayoutDashboard, requiredPerm: 'overview' },
    ],
  },
  {
    label: 'Listings & Content',
    items: [
      { id: 'jobs', label: 'Jobs', icon: Briefcase, requiredPerm: 'jobs', countKey: 'jobs' },
      { id: 'tenders', label: 'Tenders', icon: Gavel, requiredPerm: 'tenders', countKey: 'tenders' },
      {
        id: 'marketplace',
        label: 'Marketplace',
        icon: ShoppingBag,
        requiredPerm: 'marketplace',
        countKey: 'marketplace',
      },
      { id: 'blogs', label: 'Blogs', icon: FileText, requiredPerm: 'blogs', countKey: 'blogs' },
    ],
  },
  {
    label: 'Outreach',
    items: [
      {
        id: 'leads',
        label: 'Visitor Leads',
        icon: Users,
        requiredPerm: 'leads',
        countKey: 'newLeads',
        highlightCount: true,
      },
      {
        id: 'newsletter',
        label: 'Newsletter',
        icon: Mail,
        requiredPerm: 'newsletter',
        countKey: 'newsletter',
      },
    ],
  },
  {
    label: 'Home & Branding',
    items: [
      { id: 'home_header', label: 'Home Page & Header', icon: Home, requiredPerm: 'contacts' },
      { id: 'site_branding', label: 'Logos & Site Icon', icon: ImageIcon, requiredPerm: 'contacts' },
      { id: 'site_theme', label: 'Website Theme', icon: Palette, requiredPerm: 'contacts' },
    ],
  },
  {
    label: 'Contacts & About',
    items: [
      { id: 'contacts', label: 'Contacts & Brand', icon: Phone, requiredPerm: 'contacts' },
      { id: 'about_settings', label: 'About Page', icon: FileText, requiredPerm: 'contacts' },
    ],
  },
  {
    label: 'Footer Sections',
    items: [
      { id: 'footer_intro', label: 'Newsletter & Intro', icon: Type, requiredPerm: 'footer' },
      { id: 'footer_links', label: 'Directory Links', icon: Link2, requiredPerm: 'footer' },
      { id: 'footer_social', label: 'Social Media', icon: Share2, requiredPerm: 'footer' },
    ],
  },
  {
    label: 'Access Control',
    items: [
      {
        id: 'team',
        label: 'Team & Roles',
        icon: Shield,
        requiredPerm: 'team',
        countKey: 'pendingRequests',
        highlightCount: true,
      },
    ],
  },
];

function getEmailInitials(email: string): string {
  const handle = email.split('@')[0] || 'AD';
  return handle.slice(0, 2).toUpperCase();
}

export function AdminLayout({
  activeTab,
  onSelectTab,
  adminEmail,
  adminRole,
  permissions,
  onSignOut,
  counts,
  siteSettings,
  children,
}: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const publicSiteHref = getPublicSiteHref();
  const permSet = new Set<AdminPermission>(permissions);

  const visibleGroups = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => permSet.has(item.requiredPerm)),
  })).filter((group) => group.items.length > 0);

  const currentLabel =
    NAV_GROUPS.flatMap((g) => g.items).find((i) => i.id === activeTab)?.label || 'Overview';

  function handleNavClick(tab: AdminTab) {
    onSelectTab(tab);
    setSidebarOpen(false);
  }

  function renderNavGroups() {
    return (
      <div className="space-y-4">
        {visibleGroups.map((group) => (
          <div key={group.label}>
            <div className="px-3 mb-1 text-[11px] font-semibold text-[#64748B] dark:text-slate-500">
              {group.label}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                const countVal = item.countKey ? counts[item.countKey] : undefined;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-3 min-h-[36px] rounded-lg text-sm transition-colors ${
                      active
                        ? 'bg-[#EFF4FF] dark:bg-[#1E2430] text-[#4648D4] dark:text-[#818CF8] font-semibold'
                        : 'text-[#464554] dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-[#1E2430]/70 hover:text-[#0B1C30] dark:hover:text-[#F8FAFC]'
                    }`}
                  >
                    <span className="flex items-center gap-2.5 whitespace-nowrap">
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{item.label}</span>
                    </span>
                    {typeof countVal === 'number' && countVal > 0 && (
                      <span
                        className={`text-xs font-mono tabular-nums ${
                          item.highlightCount
                            ? 'font-semibold text-[#4648D4] dark:text-[#818CF8]'
                            : 'text-[#64748B] dark:text-slate-400'
                        }`}
                      >
                        {countVal}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  }

  function renderSidebarFooter() {
    return (
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-lg bg-[#EFF4FF] dark:bg-[#1E2430] border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs font-bold text-[#4648D4] dark:text-[#818CF8] shrink-0">
            {getEmailInitials(adminEmail)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-[#0B1C30] dark:text-[#F8FAFC]">
              {getRoleLabel(adminRole)}
            </div>
            <div className="text-[11px] text-[#64748B] dark:text-slate-400 truncate" title={adminEmail}>
              {adminEmail}
            </div>
          </div>
        </div>

        <a
          href="/Dalka-Jobs-QA-Guide.pdf"
          download="Dalka-Jobs-QA-Guide.pdf"
          className="w-full inline-flex items-center justify-center gap-2 min-h-[36px] px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-[#F8F9FF] dark:bg-[#0D1117] text-xs font-semibold text-[#4648D4] dark:text-[#818CF8] hover:bg-[#EFF4FF] dark:hover:bg-[#1E2430] transition-colors"
        >
          <Download className="h-3.5 w-3.5 shrink-0" />
          <span>Download QA Guide (PDF)</span>
        </a>

        <button
          type="button"
          onClick={onSignOut}
          className="w-full inline-flex items-center justify-center gap-2 min-h-[36px] px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E2430] text-xs font-semibold text-[#464554] dark:text-slate-200 hover:text-[#0B1C30] dark:hover:text-[#F8FAFC] hover:bg-slate-50 dark:hover:bg-[#262E3D] transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FF] dark:bg-[#0D1117] text-[#0B1C30] dark:text-[#F1F5F9] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-[256px] lg:flex-col lg:fixed lg:inset-y-0 bg-white dark:bg-[#161B22] border-r border-slate-200 dark:border-slate-800">
        <div className="h-16 px-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <BrandMark
            label={siteSettings?.brandName || 'dalkajobs'}
            lightLogoUrl={siteSettings?.siteLogoLightUrl}
            darkLogoUrl={siteSettings?.siteLogoDarkUrl}
          />
          <span className="text-[11px] font-medium text-[#64748B] dark:text-slate-400">Admin</span>
        </div>

        <nav aria-label="Admin navigation" className="flex-1 px-3 py-4 overflow-y-auto">
          {renderNavGroups()}
        </nav>

        {renderSidebarFooter()}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden bg-[#0F172A]/60 dark:bg-black/75 flex">
          <div className="w-[272px] bg-white dark:bg-[#161B22] h-full border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <div className="flex-1 overflow-y-auto">
              <div className="h-16 px-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <BrandMark
                  label={`${siteSettings?.brandName || 'dalkajobs'} Admin`}
                  lightLogoUrl={siteSettings?.siteLogoLightUrl}
                  darkLogoUrl={siteSettings?.siteLogoDarkUrl}
                />
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  aria-label="Close admin menu"
                  className="h-10 w-10 inline-flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-[#464554] dark:text-slate-300"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <nav aria-label="Mobile admin navigation" className="px-3 py-4">
                {renderNavGroups()}
              </nav>
            </div>
            {renderSidebarFooter()}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 lg:pl-[256px] flex flex-col min-w-0">
        <header className="sticky top-0 z-30 h-14 lg:h-16 bg-white/85 dark:bg-[#161B22]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open admin menu"
              className="lg:hidden h-11 w-11 inline-flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-[#0B1C30] dark:text-[#F1F5F9]"
            >
              <Menu className="h-4 w-4" />
            </button>
            <div className="text-sm text-[#64748B] dark:text-slate-400 truncate">
              <span>Dalka Jobs Admin</span>
              <span className="mx-2">/</span>
              <span className="font-semibold text-[#0B1C30] dark:text-[#F8FAFC]">{currentLabel}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <PWAInstallButton compact />
            {publicSiteHref !== '/' ? (
              <a
                href={publicSiteHref}
                className="inline-flex items-center justify-center gap-1.5 min-h-[44px] lg:min-h-[38px] lg:h-[38px] px-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E2430] text-xs font-semibold text-[#0B1C30] dark:text-[#F1F5F9] hover:bg-slate-50 dark:hover:bg-[#262E3D] transition-colors whitespace-nowrap shrink-0"
              >
                <span>View Public Site</span>
                <ExternalLink className="h-3.5 w-3.5 text-[#64748B] dark:text-slate-400" />
              </a>
            ) : (
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-1.5 min-h-[44px] lg:min-h-[38px] lg:h-[38px] px-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E2430] text-xs font-semibold text-[#0B1C30] dark:text-[#F1F5F9] hover:bg-slate-50 dark:hover:bg-[#262E3D] transition-colors whitespace-nowrap shrink-0"
              >
                <span>View Public Site</span>
                <ExternalLink className="h-3.5 w-3.5 text-[#64748B] dark:text-slate-400" />
              </Link>
            )}
            <ThemeToggle iconOnly />
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1280px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
