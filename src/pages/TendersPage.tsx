import { ArrowLeft, ArrowRight, Check, CheckCircle2, Copy, ExternalLink, LayoutGrid, Mail, Search, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { OrgLogo } from '../components/OrgLogo';
import { resolveSiteTheme } from '../lib/siteThemes';
import { SiteThemeId, TenderNotice, TenderStatus } from '../types/dalka';

interface TendersPageProps {
  tenders: TenderNotice[];
  siteTheme?: SiteThemeId;
}

export function TendersPage({ tenders, siteTheme }: TendersPageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [queryText, setQueryText] = useState(searchParams.get('q') || '');
  const [statusFilter, setStatusFilter] = useState<'all' | TenderStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const detailPanelRef = useRef<HTMLDivElement | null>(null);
  const theme = resolveSiteTheme(siteTheme);

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(tenders.map((t) => t.category)))],
    [tenders],
  );

  const filteredTenders = useMemo(() => {
    const q = queryText.trim().toLowerCase();
    return tenders.filter((tender) => {
      const matchesQuery =
        !q ||
        tender.title.toLowerCase().includes(q) ||
        tender.organization.toLowerCase().includes(q) ||
        tender.referenceNo.toLowerCase().includes(q) ||
        tender.location.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all' || tender.status === statusFilter;
      const matchesCategory = categoryFilter === 'All' || tender.category === categoryFilter;
      return matchesQuery && matchesStatus && matchesCategory;
    });
  }, [tenders, queryText, statusFilter, categoryFilter]);

  const requestedSelectedId = searchParams.get('selected');
  const [selectedId, setSelectedId] = useState<string | null>(requestedSelectedId);
  const [mobileSheetOpen, setMobileSheetOpen] = useState<boolean>(Boolean(requestedSelectedId));

  useEffect(() => {
    if (requestedSelectedId) {
      setSelectedId(requestedSelectedId);
      setMobileSheetOpen(true);
    } else {
      setSelectedId(null);
      setMobileSheetOpen(false);
    }
  }, [requestedSelectedId]);

  useEffect(() => {
    if (!mobileSheetOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        handleClearSelection();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileSheetOpen]);

  const selectedTender = useMemo(() => {
    if (!selectedId || filteredTenders.length === 0) return null;
    return filteredTenders.find((t) => t.id === selectedId) || filteredTenders[0];
  }, [filteredTenders, selectedId]);

  function handleSelect(id: string) {
    setSelectedId(id);
    setMobileSheetOpen(true);
    const next = new URLSearchParams(searchParams);
    next.set('selected', id);
    setSearchParams(next, { replace: true });
    if (detailPanelRef.current && window.innerWidth >= 768) {
      detailPanelRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  function handleClearSelection() {
    setSelectedId(null);
    setMobileSheetOpen(false);
    const next = new URLSearchParams(searchParams);
    next.delete('selected');
    setSearchParams(next, { replace: true });
  }

  async function handleCopyEmail(email: string) {
    try {
      await navigator.clipboard.writeText(email);
      setCopiedEmail(email);
      window.setTimeout(() => setCopiedEmail(null), 2000);
    } catch {
      setCopiedEmail(null);
    }
  }

  const isBento = theme === 'modern_bento';
  const isSwiss = theme === 'swiss_editorial';

  function renderTenderInspection(tender: TenderNotice, isMobileModal = false) {
    return (
      <>
        <div
          className={`flex items-start justify-between gap-4 pb-5 ${
            isSwiss
              ? 'border-b-2 border-[#0A0C10] dark:border-slate-200'
              : 'border-b border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex items-start gap-3.5 min-w-0">
            <OrgLogo name={tender.organization} logoUrl={tender.logoUrl} sizeClass="h-12 w-12 sm:h-14 sm:w-14 mt-0.5" />
            <div className="min-w-0">
              <p className="text-xs font-mono font-medium text-[#64748B] dark:text-slate-400 tabular-nums">
                REF: {tender.referenceNo} · {tender.category}
              </p>
              <h2
                className={`mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-[#0B1C30] dark:text-[#F8FAFC] leading-tight ${
                  isSwiss ? 'font-editorial' : isBento ? 'font-bento' : ''
                }`}
              >
                {tender.title}
              </h2>
              <p className="mt-1 text-base font-medium text-[#464554] dark:text-slate-300">
                {tender.organization}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <span
              className={`inline-flex items-center gap-1 text-xs font-semibold capitalize ${
                tender.status === 'open'
                  ? 'text-[#006C49] dark:text-[#34D399]'
                  : tender.status === 'awarded'
                    ? 'text-[#4648D4] dark:text-[#818CF8]'
                    : 'text-[#64748B] dark:text-slate-400'
              }`}
            >
              {tender.status === 'open' && <CheckCircle2 className="h-3.5 w-3.5" />}
              <span>{tender.status}</span>
            </span>
            {isMobileModal ? (
              <button
                type="button"
                onClick={handleClearSelection}
                aria-label="Close tender details"
                className={`h-11 w-11 inline-flex items-center justify-center border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E2430] text-[#464554] dark:text-slate-300 hover:text-[#0B1C30] dark:hover:text-white ${
                  isSwiss ? 'rounded-none' : isBento ? 'rounded-xl' : 'rounded-lg'
                }`}
              >
                <X className="h-5 w-5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleClearSelection}
                className={`inline-flex items-center gap-1.5 h-9 px-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E2430] text-xs font-semibold text-[#464554] dark:text-slate-200 hover:text-[#0B1C30] dark:hover:text-white hover:bg-slate-50 dark:hover:bg-[#262E3D] transition-colors whitespace-nowrap ${
                  isSwiss ? 'rounded-none border-slate-300' : isBento ? 'rounded-xl' : 'rounded-lg'
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span>{isSwiss ? 'Full Register' : 'All Tenders Grid'}</span>
              </button>
            )}
          </div>
        </div>

        <div
          className={
            isBento
              ? 'grid grid-cols-2 sm:grid-cols-4 gap-3'
              : 'grid grid-cols-2 sm:grid-cols-4 gap-4 pb-5 border-b border-slate-100 dark:border-slate-800'
          }
        >
          <div className={isBento ? 'rounded-xl bg-[#F4F6FB] dark:bg-[#1F2937] p-3.5' : ''}>
            <div className="text-xs text-[#64748B] dark:text-slate-400">Location</div>
            <div className="mt-0.5 text-sm font-medium text-[#0B1C30] dark:text-[#F1F5F9]">{tender.location}</div>
          </div>
          <div className={isBento ? 'rounded-xl bg-[#F4F6FB] dark:bg-[#1F2937] p-3.5' : ''}>
            <div className="text-xs text-[#64748B] dark:text-slate-400">Estimated Budget</div>
            <div className="mt-0.5 text-sm font-mono font-medium text-[#0B1C30] dark:text-[#F1F5F9] tabular-nums">
              {tender.budget}
            </div>
          </div>
          <div className={isBento ? 'rounded-xl bg-[#F4F6FB] dark:bg-[#1F2937] p-3.5' : ''}>
            <div className="text-xs text-[#64748B] dark:text-slate-400">Category</div>
            <div className="mt-0.5 text-sm font-medium text-[#0B1C30] dark:text-[#F1F5F9]">{tender.category}</div>
          </div>
          <div className={isBento ? 'rounded-xl bg-[#F4F6FB] dark:bg-[#1F2937] p-3.5' : ''}>
            <div className="text-xs text-[#64748B] dark:text-slate-400">Submission Deadline</div>
            <div className="mt-0.5 text-sm font-mono font-medium text-[#0B1C30] dark:text-[#F1F5F9] tabular-nums">
              {tender.deadline}
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-[#0B1C30] dark:text-[#F8FAFC]">Scope &amp; Requirements</h3>
          <p className="mt-2.5 text-[15px] text-[#464554] dark:text-slate-300 leading-relaxed whitespace-pre-line">
            {tender.description}
          </p>
        </div>

        <div
          className={`border border-slate-200 dark:border-slate-800 bg-[#F8F9FF] dark:bg-[#1E2430] p-5 sm:p-6 space-y-3 ${
            isSwiss ? 'rounded-none border-slate-300' : isBento ? 'rounded-2xl bg-[#EEF2FF]/70 dark:bg-[#1F2937]' : 'rounded-xl'
          }`}
        >
          <h3 className="text-sm font-semibold text-[#0B1C30] dark:text-[#F8FAFC]">Submission Channels</h3>
          <p className="text-xs sm:text-sm text-[#464554] dark:text-slate-300">
            Submit bids directly via the procuring entity&apos;s official link or procurement email below.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            {tender.externalUrl && (
              <a
                href={tender.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 min-h-[44px] lg:min-h-[40px] lg:h-[40px] px-5 bg-[#4648D4] dark:bg-[#6366F1] text-white text-sm font-semibold hover:bg-[#4F46E5] transition-colors ${
                  isSwiss ? 'rounded-none' : isBento ? 'rounded-xl' : 'rounded-lg'
                }`}
              >
                <span>Open Tender Portal</span>
                <ExternalLink className="h-4 w-4" />
              </a>
            )}

            {tender.applyEmail && (
              <div className="inline-flex items-center gap-2 max-w-full">
                <a
                  href={`mailto:${tender.applyEmail}?subject=${encodeURIComponent(`Tender Inquiry: ${tender.referenceNo}`)}`}
                  className={`inline-flex items-center gap-2 min-h-[44px] lg:min-h-[40px] lg:h-[40px] px-4 border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#161B22] text-sm font-semibold text-[#0B1C30] dark:text-[#F1F5F9] hover:bg-slate-50 dark:hover:bg-[#262E3D] transition-colors truncate ${
                    isSwiss ? 'rounded-none' : isBento ? 'rounded-xl' : 'rounded-lg'
                  }`}
                >
                  <Mail className="h-4 w-4 text-[#4648D4] dark:text-[#818CF8] shrink-0" />
                  <span className="truncate">Email: {tender.applyEmail}</span>
                </a>
                <button
                  type="button"
                  onClick={() => handleCopyEmail(tender.applyEmail!)}
                  aria-label="Copy procurement email"
                  className={`inline-flex items-center justify-center h-11 w-11 lg:h-[40px] lg:w-[40px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#161B22] text-[#464554] dark:text-slate-300 hover:text-[#0B1C30] dark:hover:text-white hover:bg-slate-50 dark:hover:bg-[#262E3D] transition-colors shrink-0 ${
                    isSwiss ? 'rounded-none' : isBento ? 'rounded-xl' : 'rounded-lg'
                  }`}
                >
                  {copiedEmail === tender.applyEmail ? (
                    <Check className="h-4 w-4 text-[#006C49] dark:text-[#34D399]" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            )}

            {!tender.externalUrl && !tender.applyEmail && (
              <p className="text-sm text-[#64748B] dark:text-slate-400">
                This notice does not include an external link or email; follow instructions in the scope description.
              </p>
            )}
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 pt-6 lg:pt-8 pb-12 space-y-6">
      <div
        className={
          isSwiss
            ? 'pb-5 border-b-2 border-[#0A0C10] dark:border-slate-200'
            : isBento
              ? 'bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 sm:p-7 shadow-[0_6px_24px_-8px_rgba(15,23,42,0.06)] dark:shadow-none'
              : 'bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6'
        }
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            {isSwiss && (
              <p className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#4648D4] dark:text-[#818CF8]">
                Section II · Procurement Ledger
              </p>
            )}
            <h1
              className={`text-2xl sm:text-3xl font-semibold tracking-tight text-[#0B1C30] dark:text-[#F8FAFC] ${
                isSwiss ? 'mt-1 font-editorial sm:text-4xl font-bold' : isBento ? 'font-bento sm:text-4xl font-bold' : ''
              }`}
            >
              Institutional Tenders
            </h1>
            <p className="mt-1 text-sm text-[#464554] dark:text-slate-300">
              Click any tender to inspect the full notice while keeping other tenders available in the sidebar.
            </p>
          </div>
          <div
            className={`inline-flex items-center gap-1 p-1 border border-slate-200 dark:border-slate-700 self-start overflow-x-auto max-w-full ${
              isSwiss
                ? 'rounded-none border-slate-300 bg-white dark:bg-[#12151C]'
                : isBento
                  ? 'rounded-xl bg-[#F4F6FB] dark:bg-[#090D16]'
                  : 'rounded-lg bg-[#EFF4FF] dark:bg-[#1E2430]'
            }`}
          >
            {(['all', 'open', 'awarded', 'closed'] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`min-h-[38px] px-3 py-1.5 text-xs font-semibold capitalize transition-colors whitespace-nowrap ${
                  isSwiss ? 'rounded-none uppercase tracking-wider' : isBento ? 'rounded-lg' : 'rounded'
                } ${
                  statusFilter === status
                    ? isSwiss
                      ? 'bg-[#0A0C10] dark:bg-[#F8FAFC] text-white dark:text-[#0A0C10]'
                      : isBento
                        ? 'bg-[#4648D4] dark:bg-[#6366F1] text-white'
                        : 'bg-white dark:bg-[#161B22] text-[#0B1C30] dark:text-[#F8FAFC] shadow-xs'
                    : 'text-[#464554] dark:text-slate-400 hover:text-[#0B1C30] dark:hover:text-white'
                }`}
              >
                {status === 'all' ? 'All Notices' : status}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-8 relative">
            <Search className="h-4 w-4 text-[#64748B] dark:text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              placeholder="Search tender title, organization, or reference number..."
              className={`w-full h-11 lg:h-[40px] pl-9 pr-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0D1117] text-sm text-[#0B1C30] dark:text-[#F1F5F9] placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[#6366F1] ${
                isSwiss ? 'rounded-none border-slate-300' : isBento ? 'rounded-xl bg-[#F4F6FB] dark:bg-[#090D16]' : 'rounded-lg'
              }`}
            />
          </div>
          <div className="md:col-span-4">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label="Filter tender category"
              className={`w-full h-11 lg:h-[40px] px-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0D1117] text-sm text-[#0B1C30] dark:text-[#F1F5F9] focus:outline-none focus:border-[#6366F1] ${
                isSwiss ? 'rounded-none border-slate-300' : isBento ? 'rounded-xl bg-[#F4F6FB] dark:bg-[#090D16]' : 'rounded-lg'
              }`}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'All Tender Categories' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filteredTenders.length === 0 ? (
        <div
          className={`bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 p-10 text-center ${
            isSwiss ? 'rounded-none border-slate-300 dark:bg-[#12151C]' : isBento ? 'rounded-2xl dark:bg-[#111827]' : 'rounded-xl'
          }`}
        >
          <h2 className="text-lg font-semibold text-[#0B1C30] dark:text-[#F8FAFC]">No tenders match these filters</h2>
          <button
            type="button"
            onClick={() => {
              setQueryText('');
              setStatusFilter('all');
              setCategoryFilter('All');
            }}
            className={`mt-4 min-h-[44px] lg:min-h-[38px] lg:h-[38px] px-4 bg-[#4648D4] dark:bg-[#6366F1] text-white text-sm font-semibold hover:bg-[#4F46E5] transition-colors ${
              isSwiss ? 'rounded-none' : isBento ? 'rounded-xl' : 'rounded-lg'
            }`}
          >
            Reset Filters
          </button>
        </div>
      ) : !selectedTender ? (
        isSwiss ? (
          /* Swiss Broadsheet Procurement Table */
          <div className="bg-white dark:bg-[#12151C] border border-slate-300 dark:border-slate-800 divide-y divide-slate-300 dark:divide-slate-800">
            {filteredTenders.map((tender) => (
              <button
                key={tender.id}
                type="button"
                onClick={() => handleSelect(tender.id)}
                className="w-full text-left grid grid-cols-1 md:grid-cols-12 gap-4 p-5 sm:p-6 items-center hover:bg-slate-50 dark:hover:bg-[#181C25] transition-colors group"
              >
                <div className="md:col-span-5 flex items-start gap-3.5 min-w-0">
                  <OrgLogo name={tender.organization} logoUrl={tender.logoUrl} sizeClass="h-10 w-10 mt-0.5" />
                  <div className="min-w-0">
                    <div className="text-[11px] font-mono text-[#64748B] dark:text-slate-400">
                      {tender.referenceNo}
                    </div>
                    <h2 className="mt-0.5 font-editorial text-lg font-semibold text-[#0A0C10] dark:text-[#F8FAFC] group-hover:text-[#4648D4] dark:group-hover:text-[#818CF8]">
                      {tender.title}
                    </h2>
                    <p className="mt-0.5 text-xs text-[#475569] dark:text-slate-300 truncate">
                      {tender.organization} · {tender.location}
                    </p>
                  </div>
                </div>
                <div className="md:col-span-2 text-xs font-mono uppercase">
                  <span
                    className={`inline-flex items-center gap-1 font-semibold ${
                      tender.status === 'open'
                        ? 'text-[#006C49] dark:text-[#34D399]'
                        : tender.status === 'awarded'
                          ? 'text-[#4648D4] dark:text-[#818CF8]'
                          : 'text-[#64748B] dark:text-slate-400'
                    }`}
                  >
                    {tender.status === 'open' && <CheckCircle2 className="h-3.5 w-3.5" />}
                    <span>{tender.status}</span>
                  </span>
                </div>
                <div className="md:col-span-3 font-mono text-sm font-bold text-[#0A0C10] dark:text-[#F8FAFC] tabular-nums">
                  {tender.budget}
                </div>
                <div className="md:col-span-2 flex md:flex-col md:items-end justify-between gap-1 text-xs">
                  <span className="font-mono text-[#64748B] dark:text-slate-400 tabular-nums">
                    Due {tender.deadline}
                  </span>
                  <span className="uppercase tracking-wider font-semibold text-[#4648D4] dark:text-[#818CF8]">
                    Inspect →
                  </span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          /* Classic & Bento Browse Grid */
          <div className={isBento ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5' : 'grid grid-cols-1 md:grid-cols-2 gap-4'}>
            {filteredTenders.map((tender) => (
              <button
                key={tender.id}
                type="button"
                onClick={() => handleSelect(tender.id)}
                className={
                  isBento
                    ? 'w-full text-left p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#111827] hover:border-[#4648D4] dark:hover:border-[#6366F1] shadow-[0_4px_20px_-8px_rgba(15,23,42,0.05)] dark:shadow-none transition-all flex flex-col justify-between gap-4 group'
                    : 'w-full text-left p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161B22] hover:border-[#4648D4] dark:hover:border-[#6366F1] hover:shadow-xs transition-all flex flex-col justify-between gap-3 group'
                }
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <OrgLogo name={tender.organization} logoUrl={tender.logoUrl} sizeClass="h-11 w-11 mt-0.5" />
                      <div className="min-w-0">
                        <span className="text-xs font-mono text-[#64748B] dark:text-slate-400 tabular-nums">
                          {tender.referenceNo}
                        </span>
                        <h2
                          className={`mt-0.5 text-lg font-semibold text-[#0B1C30] dark:text-[#F8FAFC] group-hover:text-[#4648D4] dark:group-hover:text-[#818CF8] transition-colors leading-snug ${
                            isBento ? 'font-bento' : ''
                          }`}
                        >
                          {tender.title}
                        </h2>
                        <p className="mt-0.5 text-sm font-medium text-[#464554] dark:text-slate-300">
                          {tender.organization}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-semibold capitalize shrink-0 ${
                        tender.status === 'open'
                          ? 'text-[#006C49] dark:text-[#34D399]'
                          : tender.status === 'awarded'
                            ? 'text-[#4648D4] dark:text-[#818CF8]'
                            : 'text-[#64748B] dark:text-slate-400'
                      }`}
                    >
                      {tender.status === 'open' && <CheckCircle2 className="h-3.5 w-3.5" />}
                      <span>{tender.status}</span>
                    </span>
                  </div>
                  <p className="mt-2.5 text-xs text-[#64748B] dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {tender.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 text-xs text-[#64748B] dark:text-slate-400">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 min-w-0">
                    <span>{tender.location}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono text-[#0B1C30] dark:text-slate-200 tabular-nums">{tender.budget}</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">Due {tender.deadline}</span>
                  </div>
                  <span className="inline-flex items-center gap-1 font-semibold text-[#4648D4] dark:text-[#818CF8] shrink-0">
                    <span>Inspect</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </button>
            ))}
          </div>
        )
      ) : (
        /* Focused Split Mode */
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <aside
            aria-label="Tender notices sidebar"
            className={`w-full md:w-[270px] lg:w-[310px] shrink-0 md:sticky md:top-20 bg-white border border-slate-200 dark:border-slate-800 overflow-hidden ${
              isSwiss
                ? 'rounded-none border-slate-300 dark:bg-[#12151C]'
                : isBento
                  ? 'rounded-2xl dark:bg-[#111827]'
                  : 'rounded-xl dark:bg-[#161B22]'
            }`}
          >
            <div className="px-3.5 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-[#F8FAFC] dark:bg-[#1E2430] flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-[#0B1C30] dark:text-[#F8FAFC] tabular-nums">
                Other Tenders ({filteredTenders.length})
              </span>
              <button
                type="button"
                onClick={handleClearSelection}
                className="inline-flex items-center gap-1 text-xs font-medium text-[#4648D4] dark:text-[#818CF8] hover:underline"
              >
                <ArrowLeft className="h-3 w-3" />
                <span>All</span>
              </button>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 md:max-h-[calc(100vh-11rem)] md:overflow-y-auto">
              {filteredTenders.map((tender) => {
                const isSelected = selectedTender.id === tender.id;
                return (
                  <button
                    key={tender.id}
                    type="button"
                    onClick={() => handleSelect(tender.id)}
                    className={`w-full text-left px-3.5 py-3 transition-colors ${
                      isSelected
                        ? 'bg-[#EFF4FF] dark:bg-[#1E2430]'
                        : 'hover:bg-[#F8FAFC] dark:hover:bg-[#1E2430]/60'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <OrgLogo name={tender.organization} logoUrl={tender.logoUrl} sizeClass="h-9 w-9 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2 text-[11px]">
                          <span className="font-mono text-[#64748B] dark:text-slate-400 tabular-nums truncate">
                            {tender.referenceNo}
                          </span>
                          <span
                            className={`font-semibold capitalize shrink-0 ${
                              tender.status === 'open'
                                ? 'text-[#006C49] dark:text-[#34D399]'
                                : tender.status === 'awarded'
                                  ? 'text-[#4648D4] dark:text-[#818CF8]'
                                  : 'text-[#64748B] dark:text-slate-400'
                            }`}
                          >
                            {tender.status}
                          </span>
                        </div>
                        <h2
                          className={`mt-0.5 text-sm font-semibold leading-snug line-clamp-2 ${
                            isSelected
                              ? 'text-[#4648D4] dark:text-[#818CF8]'
                              : 'text-[#0B1C30] dark:text-[#F8FAFC]'
                          }`}
                        >
                          {tender.title}
                        </h2>
                        <p className="mt-0.5 text-xs font-medium text-[#464554] dark:text-slate-300 truncate">
                          {tender.organization} · {tender.location}
                        </p>
                        <div className="mt-1 flex items-center justify-between gap-2 text-[11px] text-[#64748B] dark:text-slate-400">
                          <span className="font-mono text-[#0B1C30] dark:text-slate-200 tabular-nums truncate">
                            {tender.budget}
                          </span>
                          <span className="tabular-nums shrink-0">Due {tender.deadline}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          <div
            ref={detailPanelRef}
            className={`hidden md:block flex-1 min-w-0 bg-white border border-slate-200 dark:border-slate-800 p-6 lg:p-10 space-y-6 ${
              isSwiss
                ? 'rounded-none border-slate-300 dark:bg-[#12151C]'
                : isBento
                  ? 'rounded-2xl dark:bg-[#111827] shadow-[0_6px_28px_-8px_rgba(15,23,42,0.06)] dark:shadow-none'
                  : 'rounded-xl dark:bg-[#161B22]'
            }`}
          >
            {renderTenderInspection(selectedTender, false)}
          </div>
        </div>
      )}

      {/* Mobile Slide-Up Tender Inspection Sheet (< md) */}
      {mobileSheetOpen && selectedTender && (
        <div
          className="fixed inset-0 z-50 md:hidden flex items-end bg-[#0F172A]/60 dark:bg-black/75"
          role="dialog"
          aria-modal="true"
          aria-label={`Tender details: ${selectedTender.title}`}
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClearSelection();
          }}
        >
          <div
            className={`w-full max-h-[92vh] overflow-y-auto bg-white dark:bg-[#161B22] border-t border-slate-200 dark:border-slate-800 p-5 pb-8 space-y-5 shadow-2xl ${
              isSwiss ? 'rounded-none dark:bg-[#12151C]' : 'rounded-t-2xl'
            }`}
          >
            <div className="mx-auto h-1.5 w-10 rounded-full bg-slate-300 dark:bg-slate-700" aria-hidden="true" />
            {filteredTenders.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-100 dark:border-slate-800">
                {filteredTenders.map((tender) => {
                  const isActive = tender.id === selectedTender.id;
                  return (
                    <button
                      key={tender.id}
                      type="button"
                      onClick={() => handleSelect(tender.id)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                        isActive
                          ? 'bg-[#EFF4FF] dark:bg-[#1E2430] border-[#4648D4] dark:border-[#6366F1] text-[#4648D4] dark:text-[#818CF8]'
                          : 'bg-white dark:bg-[#0D1117] border-slate-200 dark:border-slate-700 text-[#464554] dark:text-slate-300'
                      }`}
                    >
                      {tender.title}
                    </button>
                  );
                })}
              </div>
            )}
            {renderTenderInspection(selectedTender, true)}
          </div>
        </div>
      )}
    </div>
  );
}
