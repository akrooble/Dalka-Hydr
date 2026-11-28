import { signOut } from 'firebase/auth';
import { useEffect, useState } from 'react';
import {
  AdminAccessNoticeView,
  AdminAuthView,
  AdminVerifyEmailView,
} from '../admin/AdminAuthScreens';
import { AdminBlogsTab } from '../admin/AdminBlogsTab';
import { AdminJobsTab } from '../admin/AdminJobsTab';
import { AdminLayout } from '../admin/AdminLayout';
import { AdminLeadsTab } from '../admin/AdminLeadsTab';
import { AdminMarketplaceTab } from '../admin/AdminMarketplaceTab';
import { AdminNewsletterTab } from '../admin/AdminNewsletterTab';
import { AdminOverviewTab } from '../admin/AdminOverviewTab';
import { AdminSettingsTab } from '../admin/AdminSettingsTab';
import { AdminTeamTab } from '../admin/AdminTeamTab';
import { AdminTendersTab } from '../admin/AdminTendersTab';
import { BrandMark } from '../components/BrandMark';
import { useAdminData } from '../hooks/useAdminData';
import { ADMIN_EMAIL } from '../lib/adminFirestore';
import { auth } from '../lib/firebase';
import { TAB_REQUIRED_PERMISSION } from '../lib/permissions';
import { useSiteFavicon } from '../lib/siteHead';
import { AdminTab, SiteSettingsSection } from '../types/dalka';

const SETTINGS_SECTIONS: Set<AdminTab> = new Set<AdminTab>([
  'home_header',
  'site_branding',
  'site_theme',
  'contacts',
  'about_settings',
  'footer_intro',
  'footer_links',
  'footer_social',
]);

export function AdminPage() {
  const {
    user,
    authReady,
    accessStatus,
    isAuthorizedAdmin,
    adminRole,
    permissions,
    jobs,
    tenders,
    marketplaceItems,
    blogs,
    leads,
    newsletterSubscribers,
    teamMembers,
    teamInvites,
    accessRequests,
    siteSettings,
    dataLoading,
    refreshUser,
  } = useAdminData();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  useSiteFavicon(siteSettings.siteFaviconUrl);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'dalkajobs Admin — Operations Console';
    return () => {
      document.title = previousTitle;
    };
  }, []);

  // Ensure activeTab stays within user's granted permissions
  useEffect(() => {
    if (!isAuthorizedAdmin) return;
    const reqPerm = TAB_REQUIRED_PERMISSION[activeTab];
    if (!permissions.includes(reqPerm)) {
      setActiveTab('overview');
    }
  }, [isAuthorizedAdmin, activeTab, permissions]);

  async function handleSignOut() {
    await signOut(auth);
  }

  if (!authReady || accessStatus === 'checking') {
    return (
      <div className="min-h-screen bg-[#F8F9FF] dark:bg-[#0D1117] flex items-center justify-center px-4">
        <div className="bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-xl p-8 w-full max-w-md space-y-4">
          <BrandMark label="dalkajobs Admin" size="md" />
          <div className="space-y-2 pt-2">
            <div className="h-3 w-40 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
            <div className="h-3 w-64 rounded bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
          </div>
          <p className="text-xs text-[#64748B] dark:text-slate-400">
            Verifying administrator session &amp; role permissions...
          </p>
        </div>
      </div>
    );
  }

  if (!user || accessStatus === 'unauthenticated') {
    return <AdminAuthView />;
  }

  if (accessStatus === 'unverified') {
    return (
      <AdminVerifyEmailView
        user={user}
        onRefreshStatus={refreshUser}
        onSignOut={handleSignOut}
      />
    );
  }

  if (
    accessStatus === 'pending_approval' ||
    accessStatus === 'rejected' ||
    accessStatus === 'suspended'
  ) {
    return (
      <AdminAccessNoticeView
        user={user}
        variant={accessStatus}
        onSignOut={handleSignOut}
      />
    );
  }

  const newLeadsCount = leads.filter((l) => l.status === 'new').length;
  const pendingRequestsCount = accessRequests.filter((r) => r.status === 'pending').length;
  const isSettingsTab = SETTINGS_SECTIONS.has(activeTab);

  return (
    <AdminLayout
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      adminEmail={user.email || ADMIN_EMAIL}
      adminRole={adminRole}
      permissions={permissions}
      onSignOut={handleSignOut}
      counts={{
        jobs: jobs.length,
        tenders: tenders.length,
        marketplace: marketplaceItems.length,
        blogs: blogs.length,
        newLeads: newLeadsCount,
        newsletter: newsletterSubscribers.length,
        pendingRequests: pendingRequestsCount,
      }}
      siteSettings={siteSettings}
    >
      {dataLoading ? (
        <div className="space-y-6">
          <div className="h-8 w-56 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-24 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161B22] animate-pulse"
              />
            ))}
          </div>
          <div className="h-64 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161B22] animate-pulse" />
        </div>
      ) : (
        <>
          {activeTab === 'overview' && (
            <AdminOverviewTab
              jobs={jobs}
              tenders={tenders}
              marketplaceItems={marketplaceItems}
              blogs={blogs}
              leads={leads}
              newsletterCount={newsletterSubscribers.length}
              permissions={permissions}
              onNavigate={setActiveTab}
            />
          )}
          {activeTab === 'jobs' && permissions.includes('jobs') && <AdminJobsTab jobs={jobs} />}
          {activeTab === 'tenders' && permissions.includes('tenders') && (
            <AdminTendersTab tenders={tenders} />
          )}
          {activeTab === 'marketplace' && permissions.includes('marketplace') && (
            <AdminMarketplaceTab items={marketplaceItems} />
          )}
          {activeTab === 'blogs' && permissions.includes('blogs') && (
            <AdminBlogsTab blogs={blogs} />
          )}
          {activeTab === 'leads' && permissions.includes('leads') && (
            <AdminLeadsTab leads={leads} />
          )}
          {activeTab === 'newsletter' && permissions.includes('newsletter') && (
            <AdminNewsletterTab subscribers={newsletterSubscribers} />
          )}
          {isSettingsTab && (
            <AdminSettingsTab
              siteSettings={siteSettings}
              activeSection={activeTab as SiteSettingsSection}
              onSelectSection={(sec) => setActiveTab(sec)}
              permissions={permissions}
            />
          )}
          {activeTab === 'team' && permissions.includes('team') && (
            <AdminTeamTab
              currentEmail={user.email || ADMIN_EMAIL}
              teamMembers={teamMembers}
              teamInvites={teamInvites}
              accessRequests={accessRequests}
            />
          )}
        </>
      )}
    </AdminLayout>
  );
}
