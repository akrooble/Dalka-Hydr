import {
  AlertCircle,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Clock,
  Database,
  FileText,
  Gavel,
  Mail,
  ShoppingBag,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { seedStarterCatalogToFirestore } from '../lib/adminFirestore';
import {
  AdminPermission,
  AdminTab,
  BlogPost,
  JobListing,
  MarketplaceItem,
  TenderNotice,
  VisitorLead,
} from '../types/dalka';

interface AdminOverviewTabProps {
  jobs: JobListing[];
  tenders: TenderNotice[];
  marketplaceItems: MarketplaceItem[];
  blogs: BlogPost[];
  leads: VisitorLead[];
  newsletterCount: number;
  permissions: AdminPermission[];
  onNavigate: (tab: AdminTab) => void;
}

export function AdminOverviewTab({
  jobs,
  tenders,
  marketplaceItems,
  blogs,
  leads,
  newsletterCount,
  permissions,
  onNavigate,
}: AdminOverviewTabProps) {
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);
  const [seedError, setSeedError] = useState<string | null>(null);

  const permSet = new Set<AdminPermission>(permissions);
  const canJobs = permSet.has('jobs');
  const canTenders = permSet.has('tenders');
  const canMarket = permSet.has('marketplace');
  const canBlogs = permSet.has('blogs');
  const canLeads = permSet.has('leads');
  const canNewsletter = permSet.has('newsletter');
  const canContacts = permSet.has('contacts');
  const canSeed = canJobs && canTenders && canMarket && canBlogs && canContacts;

  const hasEmptyCatalog =
    canSeed &&
    (jobs.length === 0 ||
      tenders.length === 0 ||
      marketplaceItems.length === 0 ||
      blogs.length === 0);

  const activeJobs = jobs.filter((j) => j.status === 'active').length;
  const openTenders = tenders.filter((t) => t.status === 'open').length;
  const publishedProducts = marketplaceItems.filter((i) => i.status === 'published').length;
  const inStockProducts = marketplaceItems.filter((i) => i.inStock).length;
  const publishedBlogs = blogs.filter((b) => b.status === 'published').length;
  const newLeads = leads.filter((l) => l.status === 'new').length;
  const contactedLeads = leads.filter((l) => l.status === 'contacted').length;

  async function handleSeedCatalog() {
    setSeeding(true);
    setSeedMessage(null);
    setSeedError(null);
    try {
      await seedStarterCatalogToFirestore();
      setSeedMessage(
        'Starter jobs, tenders, marketplace items, blogs, and contact placeholders were imported into Firestore.',
      );
    } catch (err) {
      setSeedError(err instanceof Error ? err.message : 'Unable to import starter catalog.');
    } finally {
      setSeeding(false);
    }
  }

  const pipelineBars = [
    {
      label: 'Active Job Openings',
      current: activeJobs,
      total: jobs.length,
      tone: 'bg-[#4648D4] dark:bg-[#6366F1]',
    },
    {
      label: 'Open Institutional Tenders',
      current: openTenders,
      total: tenders.length,
      tone: 'bg-[#4648D4] dark:bg-[#6366F1]',
    },
    {
      label: 'In-Stock Marketplace Items',
      current: inStockProducts,
      total: marketplaceItems.length,
      tone: 'bg-[#4648D4] dark:bg-[#6366F1]',
    },
    ...(canLeads
      ? [
          {
            label: 'Visitor Leads Contacted',
            current: contactedLeads,
            total: leads.length,
            tone: 'bg-[#4648D4] dark:bg-[#6366F1]',
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      {/* Header + Quick Navigation Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#0B1C30] dark:text-[#F8FAFC]">
            Operations Overview
          </h1>
          <p className="mt-1 text-sm text-[#464554] dark:text-slate-300">
            Live catalog status, publishing activity, and inbound visitor requests across Dalka Jobs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {canJobs && (
            <button
              type="button"
              onClick={() => onNavigate('jobs')}
              className="h-9 px-3.5 rounded-lg bg-[#4648D4] dark:bg-[#6366F1] text-white text-xs font-semibold hover:bg-[#4F46E5] dark:hover:bg-[#818CF8] transition-colors whitespace-nowrap"
            >
              Manage Jobs
            </button>
          )}
          {canContacts && (
            <button
              type="button"
              onClick={() => onNavigate('contacts')}
              className="h-9 px-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E2430] text-xs font-semibold text-[#0B1C30] dark:text-[#F1F5F9] hover:bg-slate-50 dark:hover:bg-[#262E3D] transition-colors whitespace-nowrap"
            >
              Edit Contacts &amp; Brand
            </button>
          )}
          {canNewsletter && (
            <button
              type="button"
              onClick={() => onNavigate('newsletter')}
              className="h-9 px-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E2430] text-xs font-semibold text-[#0B1C30] dark:text-[#F1F5F9] hover:bg-slate-50 dark:hover:bg-[#262E3D] transition-colors whitespace-nowrap"
            >
              Newsletter ({newsletterCount})
            </button>
          )}
        </div>
      </div>

      {hasEmptyCatalog && (
        <div className="bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-lg bg-[#EFF4FF] dark:bg-[#1E2430] flex items-center justify-center shrink-0 text-[#4648D4] dark:text-[#818CF8]">
              <Database className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#0B1C30] dark:text-[#F8FAFC]">
                Firestore collections are ready for initial data
              </h2>
              <p className="mt-0.5 text-xs text-[#464554] dark:text-slate-300">
                Import the starter Dalka Jobs listings into Firestore so you can edit or delete them directly, or create new entries from each tab.
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={seeding}
            onClick={handleSeedCatalog}
            className="h-9 px-4 rounded-lg bg-[#4648D4] dark:bg-[#6366F1] text-white text-xs font-semibold hover:bg-[#4F46E5] dark:hover:bg-[#818CF8] disabled:opacity-60 transition-colors whitespace-nowrap shrink-0"
          >
            {seeding ? 'Importing...' : 'Import Starter Catalog'}
          </button>
        </div>
      )}

      {seedMessage && (
        <div className="flex items-center gap-2 rounded-lg border border-[#4648D4]/25 dark:border-[#6366F1]/40 bg-[#EFF4FF] dark:bg-[#1E2430] px-4 py-3 text-sm text-[#4648D4] dark:text-[#818CF8]">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{seedMessage}</span>
        </div>
      )}

      {seedError && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/50 px-4 py-3 text-sm text-[#93000A] dark:text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{seedError}</span>
        </div>
      )}

      {/* Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <button
          type="button"
          disabled={!canJobs}
          onClick={() => canJobs && onNavigate('jobs')}
          className="group text-left bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-slate-300 dark:hover:border-slate-700 disabled:opacity-80 disabled:cursor-default transition-colors"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-[#64748B] dark:text-slate-400">Jobs</span>
            <Briefcase className="h-4 w-4 text-[#4648D4] dark:text-[#818CF8]" />
          </div>
          <div className="mt-2 text-2xl font-bold text-[#0B1C30] dark:text-[#F8FAFC] tabular-nums">
            {jobs.length}
          </div>
          <div className="mt-1 text-xs text-[#64748B] dark:text-slate-400 tabular-nums">
            {activeJobs} active · {jobs.length - activeJobs} closed
          </div>
        </button>

        <button
          type="button"
          disabled={!canTenders}
          onClick={() => canTenders && onNavigate('tenders')}
          className="group text-left bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-slate-300 dark:hover:border-slate-700 disabled:opacity-80 disabled:cursor-default transition-colors"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-[#64748B] dark:text-slate-400">Tenders</span>
            <Gavel className="h-4 w-4 text-[#4648D4] dark:text-[#818CF8]" />
          </div>
          <div className="mt-2 text-2xl font-bold text-[#0B1C30] dark:text-[#F8FAFC] tabular-nums">
            {tenders.length}
          </div>
          <div className="mt-1 text-xs text-[#64748B] dark:text-slate-400 tabular-nums">
            {openTenders} open · {tenders.length - openTenders} archived
          </div>
        </button>

        <button
          type="button"
          disabled={!canMarket}
          onClick={() => canMarket && onNavigate('marketplace')}
          className="group text-left bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-slate-300 dark:hover:border-slate-700 disabled:opacity-80 disabled:cursor-default transition-colors"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-[#64748B] dark:text-slate-400">Marketplace</span>
            <ShoppingBag className="h-4 w-4 text-[#4648D4] dark:text-[#818CF8]" />
          </div>
          <div className="mt-2 text-2xl font-bold text-[#0B1C30] dark:text-[#F8FAFC] tabular-nums">
            {marketplaceItems.length}
          </div>
          <div className="mt-1 text-xs text-[#64748B] dark:text-slate-400 tabular-nums">
            {publishedProducts} published · {inStockProducts} in stock
          </div>
        </button>

        <button
          type="button"
          disabled={!canBlogs}
          onClick={() => canBlogs && onNavigate('blogs')}
          className="group text-left bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-slate-300 dark:hover:border-slate-700 disabled:opacity-80 disabled:cursor-default transition-colors"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-[#64748B] dark:text-slate-400">Articles</span>
            <FileText className="h-4 w-4 text-[#4648D4] dark:text-[#818CF8]" />
          </div>
          <div className="mt-2 text-2xl font-bold text-[#0B1C30] dark:text-[#F8FAFC] tabular-nums">
            {blogs.length}
          </div>
          <div className="mt-1 text-xs text-[#64748B] dark:text-slate-400 tabular-nums">
            {publishedBlogs} published · {blogs.length - publishedBlogs} drafts
          </div>
        </button>

        {canLeads ? (
          <button
            type="button"
            onClick={() => onNavigate('leads')}
            className="group text-left bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-[#64748B] dark:text-slate-400">Visitor Leads</span>
              <Users className="h-4 w-4 text-[#4648D4] dark:text-[#818CF8]" />
            </div>
            <div className="mt-2 text-2xl font-bold text-[#4648D4] dark:text-[#818CF8] tabular-nums">
              {leads.length}
            </div>
            <div className="mt-1 text-xs text-[#64748B] dark:text-slate-400 tabular-nums">
              {newLeads} awaiting reply · {contactedLeads} contacted
            </div>
          </button>
        ) : (
          <button
            type="button"
            disabled={!canNewsletter}
            onClick={() => canNewsletter && onNavigate('newsletter')}
            className="group text-left bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-slate-300 dark:hover:border-slate-700 disabled:opacity-80 disabled:cursor-default transition-colors"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-[#64748B] dark:text-slate-400">Newsletter</span>
              <Mail className="h-4 w-4 text-[#4648D4] dark:text-[#818CF8]" />
            </div>
            <div className="mt-2 text-2xl font-bold text-[#4648D4] dark:text-[#818CF8] tabular-nums">
              {newsletterCount}
            </div>
            <div className="mt-1 text-xs text-[#64748B] dark:text-slate-400">
              Footer subscribers
            </div>
          </button>
        )}
      </div>

      {/* Operational Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-[#0B1C30] dark:text-[#F8FAFC]">
                Recent Visitor Leads
              </h2>
              <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">
                Latest inquiries submitted from Contacts and Marketplace
              </p>
            </div>
            {canLeads && (
              <button
                type="button"
                onClick={() => onNavigate('leads')}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#4648D4] dark:text-[#818CF8] hover:text-[#4F46E5] dark:hover:text-indigo-300 whitespace-nowrap shrink-0"
              >
                <span>View All</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {!canLeads ? (
            <div className="p-8 text-center text-sm text-[#64748B] dark:text-slate-400">
              Visitor leads are restricted to team members with the Visitor Leads permission.
            </div>
          ) : leads.length === 0 ? (
            <div className="p-8 text-center text-sm text-[#64748B] dark:text-slate-400">
              No visitor leads submitted yet. Submissions from Contacts and Marketplace appear here automatically.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F8FAFC] dark:bg-[#1E2430] border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-[#64748B] dark:text-slate-400">
                    <th className="py-3 px-4">Full Name</th>
                    <th className="py-3 px-4">Phone</th>
                    <th className="py-3 px-4">Source</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                  {leads.slice(0, 6).map((lead) => (
                    <tr key={lead.id} className="hover:bg-[#F8FAFC] dark:hover:bg-[#1E2430]">
                      <td className="py-3 px-4">
                        <div className="font-medium text-[#0B1C30] dark:text-[#F8FAFC]">{lead.fullName}</div>
                        <div className="text-xs text-[#64748B] dark:text-slate-400">
                          {lead.location || 'Location not specified'}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs tabular-nums text-[#0B1C30] dark:text-slate-200 whitespace-nowrap">
                        {lead.phone}
                      </td>
                      <td className="py-3 px-4 text-xs capitalize text-[#464554] dark:text-slate-300">
                        {lead.source}
                        {lead.itemTitle ? ` · ${lead.itemTitle}` : ''}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {lead.status === 'new' ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4648D4] dark:text-[#818CF8]">
                            <Clock className="h-3.5 w-3.5" />
                            <span>New</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#006C49] dark:text-[#34D399]">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Contacted</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="lg:col-span-4 bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-5">
          <div>
            <h2 className="text-base font-semibold text-[#0B1C30] dark:text-[#F8FAFC]">
              Catalog &amp; Pipeline Health
            </h2>
            <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">
              Live ratios computed directly from Firestore collections
            </p>
          </div>

          <div className="space-y-4">
            {pipelineBars.map((bar) => {
              const pct = bar.total > 0 ? Math.round((bar.current / bar.total) * 100) : 0;
              return (
                <div key={bar.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[#464554] dark:text-slate-300">{bar.label}</span>
                    <span className="font-mono tabular-nums text-[#0B1C30] dark:text-[#F8FAFC]">
                      {bar.current}/{bar.total}
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-sm bg-slate-100 dark:bg-[#1E2430] overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${bar.tone}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2.5">
            {canTenders && (
              <button
                type="button"
                onClick={() => onNavigate('tenders')}
                className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-[#F8F9FF] dark:bg-[#1E2430] text-xs font-medium text-[#0B1C30] dark:text-[#F1F5F9] hover:bg-slate-100 dark:hover:bg-[#262E3D] transition-colors"
              >
                Open Tenders
              </button>
            )}
            {canMarket && (
              <button
                type="button"
                onClick={() => onNavigate('marketplace')}
                className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-[#F8F9FF] dark:bg-[#1E2430] text-xs font-medium text-[#0B1C30] dark:text-[#F1F5F9] hover:bg-slate-100 dark:hover:bg-[#262E3D] transition-colors"
              >
                Marketplace
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
