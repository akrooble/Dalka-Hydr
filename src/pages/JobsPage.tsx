import { ArrowLeft, ArrowRight, Check, CheckCircle2, Copy, ExternalLink, LayoutGrid, Mail, Search, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { OrgLogo } from '../components/OrgLogo';
import { resolveSiteTheme } from '../lib/siteThemes';
import { JobListing, SiteThemeId } from '../types/dalka';

interface JobsPageProps {
  jobs: JobListing[];
  siteTheme?: SiteThemeId;
}

export function JobsPage({ jobs, siteTheme }: JobsPageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [queryText, setQueryText] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const detailPanelRef = useRef<HTMLDivElement | null>(null);
  const theme = resolveSiteTheme(siteTheme);

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(jobs.map((j) => j.category)))],
    [jobs],
  );

  const filteredJobs = useMemo(() => {
    const q = queryText.trim().toLowerCase();
    return jobs.filter((job) => {
      const matchesQuery =
        !q ||
        job.title.toLowerCase().includes(q) ||
        job.company.toLowerCase().includes(q) ||
        job.location.toLowerCase().includes(q) ||
        job.category.toLowerCase().includes(q);
      const matchesCategory =
        selectedCategory === 'All' || job.category === selectedCategory;
      const matchesType =
        selectedType === 'All' || job.employmentType === selectedType;
      return matchesQuery && matchesCategory && matchesType;
    });
  }, [jobs, queryText, selectedCategory, selectedType]);

  const requestedSelectedId = searchParams.get('selected');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(requestedSelectedId);
  const [mobileSheetOpen, setMobileSheetOpen] = useState<boolean>(Boolean(requestedSelectedId));

  useEffect(() => {
    if (requestedSelectedId) {
      setSelectedJobId(requestedSelectedId);
      setMobileSheetOpen(true);
    } else {
      setSelectedJobId(null);
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

  const selectedJob = useMemo(() => {
    if (!selectedJobId || filteredJobs.length === 0) return null;
    return filteredJobs.find((j) => j.id === selectedJobId) || filteredJobs[0];
  }, [filteredJobs, selectedJobId]);

  function handleSelectJob(id: string) {
    setSelectedJobId(id);
    setMobileSheetOpen(true);
    const next = new URLSearchParams(searchParams);
    next.set('selected', id);
    setSearchParams(next, { replace: true });
    if (detailPanelRef.current && window.innerWidth >= 768) {
      detailPanelRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  function handleClearSelection() {
    setSelectedJobId(null);
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

  function renderJobInspection(job: JobListing, isMobileModal = false) {
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
            <OrgLogo name={job.company} logoUrl={job.logoUrl} sizeClass="h-12 w-12 sm:h-14 sm:w-14 mt-0.5" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#4648D4] dark:text-[#818CF8]">
                {job.category} · {job.employmentType}
              </p>
              <h2
                className={`mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-[#0B1C30] dark:text-[#F8FAFC] leading-tight ${
                  isSwiss ? 'font-editorial' : isBento ? 'font-bento' : ''
                }`}
              >
                {job.title}
              </h2>
              <p className="mt-1 text-base font-medium text-[#464554] dark:text-slate-300">{job.company}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <span
              className={`inline-flex items-center gap-1 text-xs font-semibold capitalize ${
                job.status === 'active'
                  ? 'text-[#4648D4] dark:text-[#818CF8]'
                  : 'text-[#64748B] dark:text-slate-400'
              }`}
            >
              {job.status === 'active' && <CheckCircle2 className="h-3.5 w-3.5" />}
              <span>{job.status}</span>
            </span>
            {isMobileModal ? (
              <button
                type="button"
                onClick={handleClearSelection}
                aria-label="Close job details"
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
                <span>{isSwiss ? 'Full Register' : 'All Jobs Grid'}</span>
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
            <div className="mt-0.5 text-sm font-medium text-[#0B1C30] dark:text-[#F1F5F9]">{job.location}</div>
          </div>
          <div className={isBento ? 'rounded-xl bg-[#F4F6FB] dark:bg-[#1F2937] p-3.5' : ''}>
            <div className="text-xs text-[#64748B] dark:text-slate-400">Salary</div>
            <div className="mt-0.5 text-sm font-mono font-medium text-[#0B1C30] dark:text-[#F1F5F9] tabular-nums">
              {job.salary}
            </div>
          </div>
          <div className={isBento ? 'rounded-xl bg-[#F4F6FB] dark:bg-[#1F2937] p-3.5' : ''}>
            <div className="text-xs text-[#64748B] dark:text-slate-400">Category</div>
            <div className="mt-0.5 text-sm font-medium text-[#0B1C30] dark:text-[#F1F5F9]">{job.category}</div>
          </div>
          <div className={isBento ? 'rounded-xl bg-[#F4F6FB] dark:bg-[#1F2937] p-3.5' : ''}>
            <div className="text-xs text-[#64748B] dark:text-slate-400">Deadline</div>
            <div className="mt-0.5 text-sm font-mono font-medium text-[#0B1C30] dark:text-[#F1F5F9] tabular-nums">
              {job.deadline}
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-[#0B1C30] dark:text-[#F8FAFC]">Role Overview</h3>
          <p className="mt-2.5 text-[15px] text-[#464554] dark:text-slate-300 leading-relaxed whitespace-pre-line">
            {job.description}
          </p>
        </div>

        <div
          className={`border border-slate-200 dark:border-slate-800 bg-[#F8F9FF] dark:bg-[#1E2430] p-5 sm:p-6 space-y-3 ${
            isSwiss ? 'rounded-none border-slate-300' : isBento ? 'rounded-2xl bg-[#EEF2FF]/70 dark:bg-[#1F2937]' : 'rounded-xl'
          }`}
        >
          <h3 className="text-sm font-semibold text-[#0B1C30] dark:text-[#F8FAFC]">How to Apply</h3>
          <p className="text-xs sm:text-sm text-[#464554] dark:text-slate-300">
            No on-site CV upload is required. Use the official hiring channel below provided by {job.company}.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            {job.externalUrl && (
              <a
                href={job.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 min-h-[44px] lg:min-h-[40px] lg:h-[40px] px-5 bg-[#4648D4] dark:bg-[#6366F1] text-white text-sm font-semibold hover:bg-[#4F46E5] transition-colors ${
                  isSwiss ? 'rounded-none' : isBento ? 'rounded-xl' : 'rounded-lg'
                }`}
              >
                <span>Apply on Company Website</span>
                <ExternalLink className="h-4 w-4" />
              </a>
            )}

            {job.applyEmail && (
              <div className="inline-flex items-center gap-2 max-w-full">
                <a
                  href={`mailto:${job.applyEmail}?subject=${encodeURIComponent(`Application: ${job.title}`)}`}
                  className={`inline-flex items-center gap-2 min-h-[44px] lg:min-h-[40px] lg:h-[40px] px-4 border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#161B22] text-sm font-semibold text-[#0B1C30] dark:text-[#F1F5F9] hover:bg-slate-50 dark:hover:bg-[#262E3D] transition-colors truncate ${
                    isSwiss ? 'rounded-none' : isBento ? 'rounded-xl' : 'rounded-lg'
                  }`}
                >
                  <Mail className="h-4 w-4 text-[#4648D4] dark:text-[#818CF8] shrink-0" />
                  <span className="truncate">Email: {job.applyEmail}</span>
                </a>
                <button
                  type="button"
                  onClick={() => handleCopyEmail(job.applyEmail!)}
                  aria-label="Copy hiring email"
                  className={`inline-flex items-center justify-center h-11 w-11 lg:h-[40px] lg:w-[40px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#161B22] text-[#464554] dark:text-slate-300 hover:text-[#0B1C30] dark:hover:text-white hover:bg-slate-50 dark:hover:bg-[#262E3D] transition-colors shrink-0 ${
                    isSwiss ? 'rounded-none' : isBento ? 'rounded-xl' : 'rounded-lg'
                  }`}
                >
                  {copiedEmail === job.applyEmail ? (
                    <Check className="h-4 w-4 text-[#006C49] dark:text-[#34D399]" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            )}

            {!job.externalUrl && !job.applyEmail && (
              <p className="text-sm text-[#64748B] dark:text-slate-400">
                Direct hiring link or email was not provided for this listing. Check the role overview above for instructions.
              </p>
            )}
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 pt-6 lg:pt-8 pb-12 space-y-6">
      {/* Header & Search Controls */}
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
                Section I · Employment Directory
              </p>
            )}
            <h1
              className={`text-2xl sm:text-3xl font-semibold tracking-tight text-[#0B1C30] dark:text-[#F8FAFC] ${
                isSwiss ? 'mt-1 font-editorial sm:text-4xl font-bold' : isBento ? 'font-bento sm:text-4xl font-bold' : ''
              }`}
            >
              Jobs Board
            </h1>
            <p className="mt-1 text-sm text-[#464554] dark:text-slate-300">
              Click any job to read the full opening while keeping other jobs accessible in the sidebar.
            </p>
          </div>
          <p className="text-xs font-mono font-medium text-[#64748B] dark:text-slate-400 tabular-nums">
            Showing {filteredJobs.length} of {jobs.length} listings
          </p>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-6 relative">
            <Search className="h-4 w-4 text-[#64748B] dark:text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              placeholder="Search job title, company, or city..."
              className={`w-full h-11 lg:h-[40px] pl-9 pr-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0D1117] text-sm text-[#0B1C30] dark:text-[#F1F5F9] placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[#6366F1] ${
                isSwiss ? 'rounded-none border-slate-300' : isBento ? 'rounded-xl bg-[#F4F6FB] dark:bg-[#090D16]' : 'rounded-lg'
              }`}
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              aria-label="Filter by category"
              className={`w-full h-11 lg:h-[40px] px-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0D1117] text-sm text-[#0B1C30] dark:text-[#F1F5F9] focus:outline-none focus:border-[#6366F1] ${
                isSwiss ? 'rounded-none border-slate-300' : isBento ? 'rounded-xl bg-[#F4F6FB] dark:bg-[#090D16]' : 'rounded-lg'
              }`}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              aria-label="Filter by employment type"
              className={`w-full h-11 lg:h-[40px] px-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0D1117] text-sm text-[#0B1C30] dark:text-[#F1F5F9] focus:outline-none focus:border-[#6366F1] ${
                isSwiss ? 'rounded-none border-slate-300' : isBento ? 'rounded-xl bg-[#F4F6FB] dark:bg-[#090D16]' : 'rounded-lg'
              }`}
            >
              <option value="All">All Employment Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Consultancy">Consultancy</option>
              <option value="Internship">Internship</option>
            </select>
          </div>
        </div>
      </div>

      {filteredJobs.length === 0 ? (
        <div
          className={`bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 p-10 text-center ${
            isSwiss ? 'rounded-none border-slate-300 dark:bg-[#12151C]' : isBento ? 'rounded-2xl dark:bg-[#111827]' : 'rounded-xl'
          }`}
        >
          <h2 className="text-lg font-semibold text-[#0B1C30] dark:text-[#F8FAFC]">No matching jobs found</h2>
          <p className="mt-1 text-sm text-[#464554] dark:text-slate-300">
            Try clearing your search filters to view all available job listings.
          </p>
          <button
            type="button"
            onClick={() => {
              setQueryText('');
              setSelectedCategory('All');
              setSelectedType('All');
            }}
            className={`mt-4 min-h-[44px] lg:min-h-[38px] lg:h-[38px] px-4 bg-[#4648D4] dark:bg-[#6366F1] text-white text-sm font-semibold hover:bg-[#4F46E5] transition-colors ${
              isSwiss ? 'rounded-none' : isBento ? 'rounded-xl' : 'rounded-lg'
            }`}
          >
            Reset Filters
          </button>
        </div>
      ) : !selectedJob ? (
        isSwiss ? (
          /* Swiss Broadsheet Ledger Directory Table */
          <div className="bg-white dark:bg-[#12151C] border border-slate-300 dark:border-slate-800 divide-y divide-slate-300 dark:divide-slate-800">
            {filteredJobs.map((job, idx) => (
              <button
                key={job.id}
                type="button"
                onClick={() => handleSelectJob(job.id)}
                className="w-full text-left grid grid-cols-1 md:grid-cols-12 gap-4 p-5 sm:p-6 items-center hover:bg-slate-50 dark:hover:bg-[#181C25] transition-colors group"
              >
                <div className="md:col-span-5 flex items-start gap-3.5 min-w-0">
                  <span className="font-mono text-xs text-[#64748B] dark:text-slate-400 pt-1 shrink-0">
                    {String(idx + 1).padStart(2, '0')}.
                  </span>
                  <OrgLogo name={job.company} logoUrl={job.logoUrl} sizeClass="h-10 w-10 mt-0.5" />
                  <div className="min-w-0">
                    <h2 className="font-editorial text-lg font-semibold text-[#0A0C10] dark:text-[#F8FAFC] group-hover:text-[#4648D4] dark:group-hover:text-[#818CF8]">
                      {job.title}
                    </h2>
                    <p className="mt-0.5 text-xs text-[#475569] dark:text-slate-300 truncate">
                      {job.company} · {job.category}
                    </p>
                  </div>
                </div>
                <div className="md:col-span-3 text-xs text-[#334155] dark:text-slate-300">
                  <div>{job.location}</div>
                  <div className="text-[#64748B] dark:text-slate-400">{job.employmentType}</div>
                </div>
                <div className="md:col-span-2 font-mono text-sm font-bold text-[#0A0C10] dark:text-[#F8FAFC] tabular-nums">
                  {job.salary}
                </div>
                <div className="md:col-span-2 flex md:flex-col md:items-end justify-between gap-1 text-xs">
                  <span className="font-mono text-[#64748B] dark:text-slate-400 tabular-nums">
                    Due {job.deadline}
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
            {filteredJobs.map((job, idx) => (
              <button
                key={job.id}
                type="button"
                onClick={() => handleSelectJob(job.id)}
                className={
                  isBento
                    ? `w-full text-left p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#111827] hover:border-[#4648D4] dark:hover:border-[#6366F1] shadow-[0_4px_20px_-8px_rgba(15,23,42,0.05)] dark:shadow-none transition-all flex flex-col justify-between gap-4 group ${
                        idx === 0 && filteredJobs.length > 2 ? 'lg:col-span-2' : ''
                      }`
                    : 'w-full text-left p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161B22] hover:border-[#4648D4] dark:hover:border-[#6366F1] hover:shadow-xs transition-all flex flex-col justify-between gap-3 group'
                }
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <OrgLogo name={job.company} logoUrl={job.logoUrl} sizeClass="h-11 w-11 mt-0.5" />
                      <div className="min-w-0">
                        <h2
                          className={`text-lg font-semibold text-[#0B1C30] dark:text-[#F8FAFC] group-hover:text-[#4648D4] dark:group-hover:text-[#818CF8] transition-colors leading-snug ${
                            isBento ? 'font-bento' : ''
                          }`}
                        >
                          {job.title}
                        </h2>
                        <p className="mt-0.5 text-sm font-medium text-[#464554] dark:text-slate-300">{job.company}</p>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-semibold capitalize shrink-0 ${
                        job.status === 'active'
                          ? 'text-[#4648D4] dark:text-[#818CF8]'
                          : 'text-[#64748B] dark:text-slate-400'
                      }`}
                    >
                      {job.status === 'active' && <CheckCircle2 className="h-3.5 w-3.5" />}
                      <span>{job.status}</span>
                    </span>
                  </div>
                  <p className="mt-2.5 text-xs text-[#64748B] dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {job.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 text-xs text-[#64748B] dark:text-slate-400">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 min-w-0">
                    <span>{job.location}</span>
                    <span aria-hidden="true">·</span>
                    <span>{job.employmentType}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono text-[#0B1C30] dark:text-slate-200 tabular-nums">{job.salary}</span>
                  </div>
                  <span className="inline-flex items-center gap-1 font-semibold text-[#4648D4] dark:text-[#818CF8] shrink-0">
                    <span>View</span>
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
            aria-label="Job listings sidebar"
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
                Other Jobs ({filteredJobs.length})
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
              {filteredJobs.map((job) => {
                const isSelected = selectedJob.id === job.id;
                return (
                  <button
                    key={job.id}
                    type="button"
                    onClick={() => handleSelectJob(job.id)}
                    className={`w-full text-left px-3.5 py-3 transition-colors ${
                      isSelected
                        ? 'bg-[#EFF4FF] dark:bg-[#1E2430]'
                        : 'hover:bg-[#F8FAFC] dark:hover:bg-[#1E2430]/60'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <OrgLogo name={job.company} logoUrl={job.logoUrl} sizeClass="h-9 w-9 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <h2
                          className={`text-sm font-semibold leading-snug line-clamp-2 ${
                            isSelected
                              ? 'text-[#4648D4] dark:text-[#818CF8]'
                              : 'text-[#0B1C30] dark:text-[#F8FAFC]'
                          }`}
                        >
                          {job.title}
                        </h2>
                        <p className="mt-0.5 text-xs font-medium text-[#464554] dark:text-slate-300 truncate">
                          {job.company} · {job.location}
                        </p>
                        <div className="mt-1 flex items-center justify-between gap-2 text-[11px] text-[#64748B] dark:text-slate-400">
                          <span className="font-mono text-[#0B1C30] dark:text-slate-200 tabular-nums truncate">
                            {job.salary}
                          </span>
                          <span className="tabular-nums shrink-0">Due {job.deadline}</span>
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
            {renderJobInspection(selectedJob, false)}
          </div>
        </div>
      )}

      {/* Mobile Slide-Up Job Inspection Sheet (< md) */}
      {mobileSheetOpen && selectedJob && (
        <div
          className="fixed inset-0 z-50 md:hidden flex items-end bg-[#0F172A]/60 dark:bg-black/75"
          role="dialog"
          aria-modal="true"
          aria-label={`Job details: ${selectedJob.title}`}
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
            {filteredJobs.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-100 dark:border-slate-800">
                {filteredJobs.map((job) => {
                  const isActive = job.id === selectedJob.id;
                  return (
                    <button
                      key={job.id}
                      type="button"
                      onClick={() => handleSelectJob(job.id)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                        isActive
                          ? 'bg-[#EFF4FF] dark:bg-[#1E2430] border-[#4648D4] dark:border-[#6366F1] text-[#4648D4] dark:text-[#818CF8]'
                          : 'bg-white dark:bg-[#0D1117] border-slate-200 dark:border-slate-700 text-[#464554] dark:text-slate-300'
                      }`}
                    >
                      {job.title}
                    </button>
                  );
                })}
              </div>
            )}
            {renderJobInspection(selectedJob, true)}
          </div>
        </div>
      )}
    </div>
  );
}
