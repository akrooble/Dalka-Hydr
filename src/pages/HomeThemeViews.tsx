import { ArrowRight, ArrowUpRight, BookOpen, Briefcase, CheckCircle2, FileText, Gavel, Search } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { OrgLogo } from '../components/OrgLogo';
import { PWAInstallButton } from '../components/PWAInstallButton';
import { SafeImage } from '../components/SafeImage';
import { DEFAULT_SITE_SETTINGS } from '../lib/seedData';
import { BlogPost, JobListing, MarketplaceItem, SiteSettings, TenderNotice } from '../types/dalka';

export interface HomeThemeProps {
  jobs: JobListing[];
  tenders: TenderNotice[];
  marketplaceItems: MarketplaceItem[];
  blogs: BlogPost[];
  siteSettings: SiteSettings;
}

const MARKETPLACE_LABELS: Record<MarketplaceItem['category'], string> = {
  digital_good: 'Digital Good',
  book: 'Book',
  ecommerce: 'E-Commerce',
};

function useHomeViewData({
  jobs,
  tenders,
  marketplaceItems,
  blogs,
  siteSettings,
}: HomeThemeProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchBoard, setSearchBoard] = useState<'jobs' | 'tenders'>('jobs');
  const navigate = useNavigate();

  const heroEyebrow =
    siteSettings.homeHeroEyebrow?.trim() || DEFAULT_SITE_SETTINGS.homeHeroEyebrow || '';
  const heroTitle =
    siteSettings.homeHeroTitle?.trim() || DEFAULT_SITE_SETTINGS.homeHeroTitle || '';
  const heroSubtitle =
    siteSettings.homeHeroSubtitle?.trim() || DEFAULT_SITE_SETTINGS.homeHeroSubtitle || '';
  const searchPlaceholder =
    siteSettings.homeSearchPlaceholder?.trim() ||
    DEFAULT_SITE_SETTINGS.homeSearchPlaceholder ||
    'Search role, company, tender, or city...';
  const heroImageUrl =
    siteSettings.homeHeroImageUrl?.trim() ||
    DEFAULT_SITE_SETTINGS.homeHeroImageUrl ||
    '/src/assets/images/hero_dalka_workspace_1795594060501.jpg';
  const heroOverlayTitle =
    siteSettings.homeHeroOverlayTitle?.trim() ||
    DEFAULT_SITE_SETTINGS.homeHeroOverlayTitle ||
    '';
  const heroOverlaySubtitle =
    siteSettings.homeHeroOverlaySubtitle?.trim() ||
    DEFAULT_SITE_SETTINGS.homeHeroOverlaySubtitle ||
    '';

  const activeJobs = jobs.filter((j) => j.status === 'active');
  const openTenders = tenders.filter((t) => t.status === 'open');
  const featuredJobs = [...activeJobs]
    .sort((a, b) => Number(b.featured) - Number(a.featured))
    .slice(0, 3);
  const featuredTenders = [...tenders]
    .sort((a, b) => Number(b.featured) - Number(a.featured))
    .slice(0, 3);
  const featuredMarket = marketplaceItems.slice(0, 3);
  const featuredBlogs = blogs.slice(0, 2);
  const popularCategories = Array.from(new Set(activeJobs.map((j) => j.category))).slice(0, 4);

  function handleSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = searchTerm.trim();
    const target = searchBoard === 'jobs' ? '/jobs' : '/tenders';
    navigate(q ? `${target}?q=${encodeURIComponent(q)}` : target);
  }

  return {
    searchTerm,
    setSearchTerm,
    searchBoard,
    setSearchBoard,
    handleSearch,
    heroEyebrow,
    heroTitle,
    heroSubtitle,
    searchPlaceholder,
    heroImageUrl,
    heroOverlayTitle,
    heroOverlaySubtitle,
    activeJobs,
    openTenders,
    featuredJobs,
    featuredTenders,
    featuredMarket,
    featuredBlogs,
    popularCategories,
  };
}

export function HomeModernBentoView(props: HomeThemeProps) {
  const {
    searchTerm,
    setSearchTerm,
    searchBoard,
    setSearchBoard,
    handleSearch,
    heroEyebrow,
    heroTitle,
    heroSubtitle,
    searchPlaceholder,
    heroImageUrl,
    heroOverlayTitle,
    heroOverlaySubtitle,
    activeJobs,
    openTenders,
    featuredJobs,
    featuredTenders,
    featuredMarket,
    featuredBlogs,
    popularCategories,
  } = useHomeViewData(props);

  const leadJob = featuredJobs[0];
  const sideJobs = featuredJobs.slice(1, 3);
  const leadProduct = featuredMarket[0];
  const secondaryProducts = featuredMarket.slice(1, 3);

  return (
    <div className="bg-[radial-gradient(ellipse_at_top,rgba(70,72,212,0.08),transparent_55%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.12),transparent_55%)]">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 pt-8 sm:pt-14 pb-12 space-y-16">
        {/* Centered Spotlight Hero + Unified Panoramic Bento Banner */}
        <section className="space-y-10">
          <div className="mx-auto max-w-3xl text-center space-y-5">
            <p className="text-xs font-semibold tracking-wide text-[#4648D4] dark:text-[#818CF8]">
              {heroEyebrow}
            </p>
            <h1 className="font-bento text-[clamp(2.25rem,4.5vw,3.75rem)] font-bold tracking-[-0.03em] leading-[1.08] text-[#0F172A] dark:text-[#F8FAFC] text-balance">
              {heroTitle}
            </h1>
            <p className="mx-auto text-base sm:text-lg text-[#475569] dark:text-slate-300 leading-relaxed max-w-[60ch]">
              {heroSubtitle}
            </p>

            <form
              onSubmit={handleSearch}
              className="mt-6 bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-2 shadow-[0_12px_36px_-10px_rgba(15,23,42,0.08)] dark:shadow-none flex flex-col sm:flex-row gap-2"
            >
              <div className="relative flex-1">
                <Search className="h-4 w-4 text-[#64748B] dark:text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={searchPlaceholder}
                  aria-label="Search jobs or tenders"
                  className="w-full h-11 lg:h-11 pl-10 pr-3 rounded-xl bg-transparent text-sm text-[#0F172A] dark:text-[#F1F5F9] placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <select
                  value={searchBoard}
                  onChange={(e) => setSearchBoard(e.target.value as 'jobs' | 'tenders')}
                  aria-label="Select search board"
                  className="h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-[#F4F6FB] dark:bg-[#1F2937] text-sm font-medium text-[#0F172A] dark:text-[#F1F5F9] focus:outline-none focus:border-[#6366F1]"
                >
                  <option value="jobs">Jobs</option>
                  <option value="tenders">Tenders</option>
                </select>
                <button
                  type="submit"
                  className="h-11 px-6 rounded-xl bg-[#4648D4] dark:bg-[#6366F1] text-white text-sm font-semibold hover:bg-[#4F46E5] active:bg-[#4338CA] transition-colors whitespace-nowrap shrink-0"
                >
                  Search
                </button>
              </div>
            </form>

            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-[#64748B] dark:text-slate-400 pt-1">
              {popularCategories.map((cat) => (
                <Link
                  key={cat}
                  to={`/jobs?q=${encodeURIComponent(cat)}`}
                  className="font-medium text-[#4648D4] dark:text-[#818CF8] hover:underline"
                >
                  {cat}
                </Link>
              ))}
              <Link
                to="/tenders"
                className="font-semibold text-[#0F172A] dark:text-slate-200 hover:text-[#4648D4] dark:hover:text-[#818CF8] inline-flex items-center gap-1"
              >
                <span>Open Tenders</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <PWAInstallButton compact />
            </div>
          </div>

          {/* Panoramic Showcase + Floating Stat Bento Strip */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            <div className="lg:col-span-8 relative min-h-[260px] sm:min-h-[340px] rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 bg-[#EFF4FF] dark:bg-[#111827] shadow-[0_8px_30px_-8px_rgba(15,23,42,0.06)] dark:shadow-none">
              <SafeImage
                src={heroImageUrl}
                alt={`${props.siteSettings.brandName || 'Dalka Jobs'} workspace`}
                className="w-full h-full object-cover"
                fallbackIcon={<Briefcase className="h-10 w-10" />}
              />
              {(heroOverlayTitle || heroOverlaySubtitle) && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#090D16]/90 via-[#090D16]/50 to-transparent p-6 sm:p-7 text-white">
                  {heroOverlayTitle && (
                    <p className="text-xs font-semibold text-[#A5B4FC]">{heroOverlayTitle}</p>
                  )}
                  {heroOverlaySubtitle && (
                    <p className="mt-1 text-sm sm:text-base font-medium leading-snug max-w-xl">
                      {heroOverlaySubtitle}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="lg:col-span-4 grid grid-cols-2 gap-4">
              <Link
                to="/jobs"
                className="rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 p-5 flex flex-col justify-between hover:border-[#4648D4] dark:hover:border-[#6366F1] transition-colors shadow-[0_4px_20px_-6px_rgba(15,23,42,0.05)] dark:shadow-none"
              >
                <Briefcase className="h-5 w-5 text-[#4648D4] dark:text-[#818CF8]" />
                <div>
                  <div className="font-bento text-3xl font-bold text-[#0F172A] dark:text-[#F8FAFC] tabular-nums">
                    {activeJobs.length}
                  </div>
                  <div className="mt-1 text-xs font-medium text-[#64748B] dark:text-slate-400">
                    Active Roles
                  </div>
                </div>
              </Link>

              <Link
                to="/tenders"
                className="rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 p-5 flex flex-col justify-between hover:border-[#4648D4] dark:hover:border-[#6366F1] transition-colors shadow-[0_4px_20px_-6px_rgba(15,23,42,0.05)] dark:shadow-none"
              >
                <Gavel className="h-5 w-5 text-[#006C49] dark:text-[#34D399]" />
                <div>
                  <div className="font-bento text-3xl font-bold text-[#006C49] dark:text-[#34D399] tabular-nums">
                    {openTenders.length}
                  </div>
                  <div className="mt-1 text-xs font-medium text-[#64748B] dark:text-slate-400">
                    Open Tenders
                  </div>
                </div>
              </Link>

              <Link
                to="/marketplace"
                className="rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 p-5 flex flex-col justify-between hover:border-[#4648D4] dark:hover:border-[#6366F1] transition-colors shadow-[0_4px_20px_-6px_rgba(15,23,42,0.05)] dark:shadow-none"
              >
                <BookOpen className="h-5 w-5 text-[#4648D4] dark:text-[#818CF8]" />
                <div>
                  <div className="font-bento text-3xl font-bold text-[#0F172A] dark:text-[#F8FAFC] tabular-nums">
                    {props.marketplaceItems.length}
                  </div>
                  <div className="mt-1 text-xs font-medium text-[#64748B] dark:text-slate-400">
                    Books &amp; Kits
                  </div>
                </div>
              </Link>

              <Link
                to="/blogs"
                className="rounded-2xl bg-[#4648D4] dark:bg-[#4F46E5] text-white p-5 flex flex-col justify-between hover:bg-[#4F46E5] transition-colors"
              >
                <FileText className="h-5 w-5 text-white/90" />
                <div>
                  <div className="font-bento text-3xl font-bold tabular-nums">
                    {props.blogs.length}
                  </div>
                  <div className="mt-1 text-xs font-medium text-indigo-100">
                    Career Guides
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Bento Showcase: Featured Jobs */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="font-bento text-2xl sm:text-3xl font-semibold tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
                Featured Career Openings
              </h2>
              <p className="mt-1 text-sm text-[#475569] dark:text-slate-300">
                Direct employer listings with verified compensation and closing dates.
              </p>
            </div>
            <Link
              to="/jobs"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#4648D4] dark:text-[#818CF8] hover:underline whitespace-nowrap shrink-0"
            >
              <span>All {activeJobs.length} Roles</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {leadJob && (
              <Link
                to={`/jobs?selected=${encodeURIComponent(leadJob.id)}`}
                className="lg:col-span-7 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 flex flex-col justify-between hover:border-[#4648D4] dark:hover:border-[#6366F1] shadow-[0_6px_24px_-8px_rgba(15,23,42,0.06)] dark:shadow-none transition-all group"
              >
                <div className="space-y-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <OrgLogo name={leadJob.company} logoUrl={leadJob.logoUrl} sizeClass="h-14 w-14" />
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC] truncate">
                          {leadJob.company}
                        </div>
                        <div className="text-xs text-[#64748B] dark:text-slate-400">
                          {leadJob.location} · {leadJob.employmentType}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-[#4648D4] dark:text-[#818CF8] shrink-0">
                      Spotlight Role
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bento text-xl sm:text-2xl font-semibold text-[#0F172A] dark:text-[#F8FAFC] group-hover:text-[#4648D4] dark:group-hover:text-[#818CF8] transition-colors leading-snug">
                      {leadJob.title}
                    </h3>
                    <p className="mt-2.5 text-sm text-[#475569] dark:text-slate-300 leading-relaxed line-clamp-3">
                      {leadJob.description}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4 text-xs text-[#64748B] dark:text-slate-400">
                    <span className="font-mono text-base font-bold text-[#0F172A] dark:text-[#F8FAFC] tabular-nums">
                      {leadJob.salary}
                    </span>
                    <span>Due {leadJob.deadline}</span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#4648D4] dark:text-[#818CF8]">
                    <span>Inspect Role</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            )}

            <div className="lg:col-span-5 flex flex-col gap-5">
              {sideJobs.map((job) => (
                <Link
                  key={job.id}
                  to={`/jobs?selected=${encodeURIComponent(job.id)}`}
                  className="flex-1 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 flex flex-col justify-between hover:border-[#4648D4] dark:hover:border-[#6366F1] shadow-[0_4px_20px_-8px_rgba(15,23,42,0.05)] dark:shadow-none transition-all group"
                >
                  <div className="flex items-start gap-3.5">
                    <OrgLogo name={job.company} logoUrl={job.logoUrl} sizeClass="h-11 w-11 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs text-[#64748B] dark:text-slate-400">
                        {job.company} · {job.location}
                      </div>
                      <h3 className="mt-1 font-bento text-base sm:text-lg font-semibold text-[#0F172A] dark:text-[#F8FAFC] group-hover:text-[#4648D4] dark:group-hover:text-[#818CF8] transition-colors leading-snug">
                        {job.title}
                      </h3>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                    <span className="font-mono text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC] tabular-nums">
                      {job.salary}
                    </span>
                    <span className="text-xs font-semibold text-[#4648D4] dark:text-[#818CF8]">
                      Due {job.deadline} →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Institutional Tenders Horizon Deck */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="font-bento text-2xl sm:text-3xl font-semibold tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
                Institutional Tenders
              </h2>
              <p className="mt-1 text-sm text-[#475569] dark:text-slate-300">
                Active RFPs and supply contracts with transparent budgets and submission links.
              </p>
            </div>
            <Link
              to="/tenders"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#4648D4] dark:text-[#818CF8] hover:underline whitespace-nowrap shrink-0"
            >
              <span>All Tenders</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {featuredTenders.map((tender) => (
              <Link
                key={tender.id}
                to={`/tenders?selected=${encodeURIComponent(tender.id)}`}
                className="rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 p-6 flex flex-col justify-between hover:border-[#4648D4] dark:hover:border-[#6366F1] shadow-[0_4px_20px_-8px_rgba(15,23,42,0.05)] dark:shadow-none transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <OrgLogo name={tender.organization} logoUrl={tender.logoUrl} sizeClass="h-10 w-10" />
                    <span
                      className={`text-xs font-semibold capitalize ${
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
                  <p className="mt-4 text-xs font-mono text-[#64748B] dark:text-slate-400">
                    {tender.referenceNo} · {tender.location}
                  </p>
                  <h3 className="mt-1 font-bento text-lg font-semibold text-[#0F172A] dark:text-[#F8FAFC] group-hover:text-[#4648D4] dark:group-hover:text-[#818CF8] transition-colors leading-snug">
                    {tender.title}
                  </h3>
                  <p className="mt-2 text-sm text-[#475569] dark:text-slate-300 line-clamp-2">
                    {tender.description}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                  <span className="font-mono text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC] tabular-nums">
                    {tender.budget}
                  </span>
                  <span className="text-xs font-semibold text-[#4648D4] dark:text-[#818CF8]">
                    Due {tender.deadline} →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Marketplace Spotlight Bento */}
        {leadProduct && (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h2 className="font-bento text-2xl sm:text-3xl font-semibold tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
                  Career Toolkits &amp; Marketplace
                </h2>
                <p className="mt-1 text-sm text-[#475569] dark:text-slate-300">
                  Order digital templates, procurement playbooks, and work kits on demand.
                </p>
              </div>
              <Link
                to="/marketplace"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#4648D4] dark:text-[#818CF8] hover:underline whitespace-nowrap shrink-0"
              >
                <span>Open Marketplace</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
              <Link
                to={`/marketplace?item=${encodeURIComponent(leadProduct.id)}`}
                className="lg:col-span-7 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 overflow-hidden grid grid-cols-1 sm:grid-cols-12 hover:border-[#4648D4] dark:hover:border-[#6366F1] shadow-[0_6px_24px_-8px_rgba(15,23,42,0.06)] dark:shadow-none transition-all group"
              >
                <div className="sm:col-span-5 aspect-[4/3] sm:aspect-auto bg-[#EFF4FF] dark:bg-[#1E2430] overflow-hidden">
                  <SafeImage
                    src={leadProduct.imageUrl}
                    alt={leadProduct.title}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-200"
                    fallbackIcon={<BookOpen className="h-8 w-8" />}
                  />
                </div>
                <div className="sm:col-span-7 p-6 flex flex-col justify-between">
                  <div>
                    <div className="text-xs font-medium text-[#4648D4] dark:text-[#818CF8]">
                      Featured · {MARKETPLACE_LABELS[leadProduct.category]}
                    </div>
                    <h3 className="mt-1.5 font-bento text-xl font-semibold text-[#0F172A] dark:text-[#F8FAFC] leading-snug">
                      {leadProduct.title}
                    </h3>
                    <p className="mt-2 text-sm text-[#475569] dark:text-slate-300 line-clamp-3">
                      {leadProduct.description}
                    </p>
                  </div>
                  <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="font-mono text-lg font-bold text-[#0F172A] dark:text-[#F8FAFC] tabular-nums">
                      ${leadProduct.price} {leadProduct.currency}
                    </span>
                    <span className="text-xs font-semibold text-[#4648D4] dark:text-[#818CF8]">
                      Request Item →
                    </span>
                  </div>
                </div>
              </Link>

              <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-5">
                {secondaryProducts.map((item) => (
                  <Link
                    key={item.id}
                    to={`/marketplace?item=${encodeURIComponent(item.id)}`}
                    className="rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 p-4 flex items-center gap-4 hover:border-[#4648D4] dark:hover:border-[#6366F1] transition-all group"
                  >
                    <div className="h-20 w-24 rounded-xl bg-[#EFF4FF] dark:bg-[#1E2430] overflow-hidden shrink-0">
                      <SafeImage
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        fallbackIcon={<BookOpen className="h-6 w-6" />}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-medium text-[#64748B] dark:text-slate-400">
                        {MARKETPLACE_LABELS[item.category]}
                      </div>
                      <h3 className="mt-0.5 font-bento text-sm sm:text-base font-semibold text-[#0F172A] dark:text-[#F8FAFC] line-clamp-2 group-hover:text-[#4648D4] dark:group-hover:text-[#818CF8]">
                        {item.title}
                      </h3>
                      <div className="mt-1.5 font-mono text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC] tabular-nums">
                        ${item.price} {item.currency}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Editorial Guides & Direct Outreach Dock */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-8 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="font-bento text-xl font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                Career &amp; Procurement Guides
              </h2>
              <Link
                to="/blogs"
                className="text-sm font-semibold text-[#4648D4] dark:text-[#818CF8] hover:underline whitespace-nowrap"
              >
                Read All →
              </Link>
            </div>
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {featuredBlogs.map((post) => (
                <Link
                  key={post.id}
                  to={`/blogs?article=${encodeURIComponent(post.slug)}`}
                  className="group block"
                >
                  <div className="aspect-[16/10] rounded-xl overflow-hidden bg-[#EFF4FF] dark:bg-[#1E2430] border border-slate-100 dark:border-slate-800">
                    <SafeImage
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-200"
                      fallbackIcon={<FileText className="h-8 w-8" />}
                    />
                  </div>
                  <div className="mt-3 text-xs text-[#64748B] dark:text-slate-400">
                    {post.category} · {post.readTime}
                  </div>
                  <h3 className="mt-1 font-bento text-base font-semibold text-[#0F172A] dark:text-[#F8FAFC] group-hover:text-[#4648D4] dark:group-hover:text-[#818CF8] leading-snug">
                    {post.title}
                  </h3>
                </Link>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 rounded-2xl bg-[#0F172A] dark:bg-[#111827] dark:border dark:border-slate-800 text-white p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <p className="text-xs font-semibold text-[#A5B4FC]">Direct Outreach</p>
              <h2 className="mt-2 font-bento text-2xl font-semibold text-white leading-tight text-balance">
                Partner or connect with our hiring desk.
              </h2>
              <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                Leave your phone number and contact details so Dalka Jobs can match roles, tenders, or book orders directly.
              </p>
            </div>
            <div className="mt-6 space-y-2.5">
              <Link
                to="/contacts"
                className="w-full inline-flex items-center justify-center h-11 px-5 rounded-xl bg-[#4648D4] dark:bg-[#6366F1] text-white text-sm font-semibold hover:bg-[#4F46E5] transition-colors"
              >
                Leave Contact Details
              </Link>
              <Link
                to="/about"
                className="w-full inline-flex items-center justify-center h-11 px-5 rounded-xl border border-slate-700 text-sm font-medium text-slate-200 hover:bg-white/5 transition-colors"
              >
                How Dalka Works
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export function HomeSwissEditorialView(props: HomeThemeProps) {
  const {
    searchTerm,
    setSearchTerm,
    searchBoard,
    setSearchBoard,
    handleSearch,
    heroEyebrow,
    heroTitle,
    heroSubtitle,
    searchPlaceholder,
    heroImageUrl,
    heroOverlayTitle,
    heroOverlaySubtitle,
    activeJobs,
    openTenders,
    featuredJobs,
    featuredTenders,
    featuredMarket,
    featuredBlogs,
    popularCategories,
  } = useHomeViewData(props);

  return (
    <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 pb-14 space-y-16">
      {/* Editorial Front-Page Masthead & Split */}
      <section className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-300 dark:border-slate-700 text-xs font-mono uppercase tracking-[0.14em] text-[#475569] dark:text-slate-400">
          <span>{heroEyebrow}</span>
          <span>Direct Opportunities &amp; Procurement Ledger</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          <div className="lg:col-span-7 space-y-6">
            <h1 className="font-editorial text-[clamp(2.4rem,4.4vw,3.85rem)] font-bold tracking-[-0.02em] leading-[1.05] text-[#0A0C10] dark:text-[#F8FAFC] text-balance">
              {heroTitle}
            </h1>
            <p className="text-base sm:text-lg text-[#334155] dark:text-slate-300 leading-relaxed max-w-[56ch]">
              {heroSubtitle}
            </p>

            <form
              onSubmit={handleSearch}
              className="border-2 border-[#0A0C10] dark:border-slate-300 bg-white dark:bg-[#12151C] p-1.5 flex flex-col sm:flex-row gap-1.5"
            >
              <div className="relative flex-1">
                <Search className="h-4 w-4 text-[#64748B] dark:text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={searchPlaceholder}
                  aria-label="Search jobs or tenders"
                  className="w-full h-11 lg:h-10 pl-9 pr-3 rounded-none bg-transparent text-sm text-[#0A0C10] dark:text-[#F1F5F9] placeholder:text-slate-400 focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <select
                  value={searchBoard}
                  onChange={(e) => setSearchBoard(e.target.value as 'jobs' | 'tenders')}
                  aria-label="Select search board"
                  className="h-11 lg:h-10 px-3 rounded-none border border-slate-300 dark:border-slate-700 bg-[#FAFAFA] dark:bg-[#0A0C10] text-xs uppercase tracking-wider font-semibold text-[#0A0C10] dark:text-[#F1F5F9] focus:outline-none"
                >
                  <option value="jobs">Jobs</option>
                  <option value="tenders">Tenders</option>
                </select>
                <button
                  type="submit"
                  className="h-11 lg:h-10 px-5 rounded-none bg-[#4648D4] dark:bg-[#6366F1] text-white text-xs uppercase tracking-wider font-semibold hover:bg-[#4F46E5] transition-colors whitespace-nowrap shrink-0"
                >
                  Search
                </button>
              </div>
            </form>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-300 dark:border-slate-800">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
                <span className="font-mono uppercase tracking-wider text-[#64748B] dark:text-slate-400">
                  Index:
                </span>
                {popularCategories.map((cat) => (
                  <Link
                    key={cat}
                    to={`/jobs?q=${encodeURIComponent(cat)}`}
                    className="font-medium text-[#4648D4] dark:text-[#818CF8] hover:underline"
                  >
                    {cat}
                  </Link>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <PWAInstallButton compact />
              </div>
            </div>
          </div>

          <figure className="lg:col-span-5">
            <div className="aspect-[4/3] border border-slate-300 dark:border-slate-700 bg-[#F1F5F9] dark:bg-[#12151C] overflow-hidden">
              <SafeImage
                src={heroImageUrl}
                alt={`${props.siteSettings.brandName || 'Dalka Jobs'} editorial workspace`}
                className="w-full h-full object-cover"
                fallbackIcon={<Briefcase className="h-10 w-10" />}
              />
            </div>
            {(heroOverlayTitle || heroOverlaySubtitle) && (
              <figcaption className="mt-2.5 pt-2 border-t border-slate-300 dark:border-slate-800 text-xs text-[#475569] dark:text-slate-400">
                <span className="font-mono font-semibold text-[#0A0C10] dark:text-slate-200">
                  FIG. 01 — {heroOverlayTitle || 'Overview'}
                </span>
                {heroOverlaySubtitle && <span className="block mt-0.5">{heroOverlaySubtitle}</span>}
              </figcaption>
            )}
          </figure>
        </div>

        {/* 4-Column Ruled Index Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 border-y-2 border-[#0A0C10] dark:border-slate-200 divide-y lg:divide-y-0 lg:divide-x divide-slate-300 dark:divide-slate-800 bg-white dark:bg-[#12151C]">
          <Link to="/jobs" className="p-5 hover:bg-slate-50 dark:hover:bg-[#181C25] transition-colors">
            <div className="text-[11px] font-mono uppercase tracking-wider text-[#64748B] dark:text-slate-400">
              01 / Active Jobs
            </div>
            <div className="mt-2 font-editorial text-3xl font-bold text-[#0A0C10] dark:text-[#F8FAFC] tabular-nums">
              {activeJobs.length}
            </div>
          </Link>

          <Link to="/tenders" className="p-5 hover:bg-slate-50 dark:hover:bg-[#181C25] transition-colors">
            <div className="text-[11px] font-mono uppercase tracking-wider text-[#64748B] dark:text-slate-400">
              02 / Open Tenders
            </div>
            <div className="mt-2 font-editorial text-3xl font-bold text-[#006C49] dark:text-[#34D399] tabular-nums">
              {openTenders.length}
            </div>
          </Link>

          <Link to="/marketplace" className="p-5 hover:bg-slate-50 dark:hover:bg-[#181C25] transition-colors">
            <div className="text-[11px] font-mono uppercase tracking-wider text-[#64748B] dark:text-slate-400">
              03 / Toolkits &amp; Books
            </div>
            <div className="mt-2 font-editorial text-3xl font-bold text-[#0A0C10] dark:text-[#F8FAFC] tabular-nums">
              {props.marketplaceItems.length}
            </div>
          </Link>

          <Link to="/blogs" className="p-5 hover:bg-slate-50 dark:hover:bg-[#181C25] transition-colors">
            <div className="text-[11px] font-mono uppercase tracking-wider text-[#64748B] dark:text-slate-400">
              04 / Insights
            </div>
            <div className="mt-2 font-editorial text-3xl font-bold text-[#0A0C10] dark:text-[#F8FAFC] tabular-nums">
              {props.blogs.length}
            </div>
          </Link>
        </div>
      </section>

      {/* Architectural Ledger Table: Latest Jobs */}
      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-3 border-b-2 border-[#0A0C10] dark:border-slate-200">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#4648D4] dark:text-[#818CF8]">
              Section I · Employment Register
            </p>
            <h2 className="mt-1 font-editorial text-2xl sm:text-3xl font-semibold text-[#0A0C10] dark:text-[#F8FAFC]">
              Current Job Openings
            </h2>
          </div>
          <Link
            to="/jobs"
            className="text-xs uppercase tracking-wider font-semibold text-[#4648D4] dark:text-[#818CF8] hover:underline whitespace-nowrap"
          >
            Full Register →
          </Link>
        </div>

        <div className="bg-white dark:bg-[#12151C] border border-slate-300 dark:border-slate-800 divide-y divide-slate-300 dark:divide-slate-800">
          {featuredJobs.map((job, idx) => (
            <Link
              key={job.id}
              to={`/jobs?selected=${encodeURIComponent(job.id)}`}
              className="grid grid-cols-1 md:grid-cols-12 gap-4 p-5 sm:p-6 items-center hover:bg-slate-50 dark:hover:bg-[#181C25] transition-colors group"
            >
              <div className="md:col-span-5 flex items-start gap-3.5 min-w-0">
                <span className="font-mono text-xs font-semibold text-[#64748B] dark:text-slate-400 pt-1 shrink-0">
                  0{idx + 1}.
                </span>
                <OrgLogo name={job.company} logoUrl={job.logoUrl} sizeClass="h-10 w-10 mt-0.5" />
                <div className="min-w-0">
                  <h3 className="font-editorial text-lg font-semibold text-[#0A0C10] dark:text-[#F8FAFC] group-hover:text-[#4648D4] dark:group-hover:text-[#818CF8] leading-snug">
                    {job.title}
                  </h3>
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
                <span className="font-semibold uppercase tracking-wider text-[#4648D4] dark:text-[#818CF8]">
                  Inspect →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Ruled 3-Column Procurement Digest: Tenders */}
      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-3 border-b-2 border-[#0A0C10] dark:border-slate-200">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#4648D4] dark:text-[#818CF8]">
              Section II · Procurement Notices
            </p>
            <h2 className="mt-1 font-editorial text-2xl sm:text-3xl font-semibold text-[#0A0C10] dark:text-[#F8FAFC]">
              Institutional Tenders
            </h2>
          </div>
          <Link
            to="/tenders"
            className="text-xs uppercase tracking-wider font-semibold text-[#4648D4] dark:text-[#818CF8] hover:underline whitespace-nowrap"
          >
            All Notices →
          </Link>
        </div>

        <div className="bg-white dark:bg-[#12151C] border border-slate-300 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-300 dark:divide-slate-800">
          {featuredTenders.map((tender) => (
            <Link
              key={tender.id}
              to={`/tenders?selected=${encodeURIComponent(tender.id)}`}
              className="p-6 flex flex-col justify-between hover:bg-slate-50 dark:hover:bg-[#181C25] transition-colors group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 text-xs font-mono">
                  <span className="text-[#64748B] dark:text-slate-400">{tender.referenceNo}</span>
                  <span
                    className={`inline-flex items-center gap-1 uppercase font-semibold ${
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
                <h3 className="mt-3 font-editorial text-lg font-semibold text-[#0A0C10] dark:text-[#F8FAFC] group-hover:text-[#4648D4] dark:group-hover:text-[#818CF8] leading-snug">
                  {tender.title}
                </h3>
                <p className="mt-1.5 text-xs font-medium text-[#475569] dark:text-slate-300">
                  {tender.organization} · {tender.location}
                </p>
                <p className="mt-3 text-sm text-[#334155] dark:text-slate-300 line-clamp-2 leading-relaxed">
                  {tender.description}
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-[#0A0C10] dark:text-[#F8FAFC] tabular-nums">
                  {tender.budget}
                </span>
                <span className="text-[#4648D4] dark:text-[#818CF8]">Due {tender.deadline} →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Catalog Monograph: Marketplace */}
      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-3 border-b-2 border-[#0A0C10] dark:border-slate-200">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#4648D4] dark:text-[#818CF8]">
              Section III · Publications &amp; Kits
            </p>
            <h2 className="mt-1 font-editorial text-2xl sm:text-3xl font-semibold text-[#0A0C10] dark:text-[#F8FAFC]">
              Dalka Marketplace
            </h2>
          </div>
          <Link
            to="/marketplace"
            className="text-xs uppercase tracking-wider font-semibold text-[#4648D4] dark:text-[#818CF8] hover:underline whitespace-nowrap"
          >
            View Catalog →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredMarket.map((item, idx) => (
            <Link
              key={item.id}
              to={`/marketplace?item=${encodeURIComponent(item.id)}`}
              className="bg-white dark:bg-[#12151C] border border-slate-300 dark:border-slate-800 flex flex-col hover:border-[#0A0C10] dark:hover:border-slate-300 transition-colors group"
            >
              <div className="aspect-[4/3] bg-[#F1F5F9] dark:bg-[#181C25] border-b border-slate-300 dark:border-slate-800 overflow-hidden">
                <SafeImage
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-200"
                  fallbackIcon={<BookOpen className="h-8 w-8" />}
                />
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-wider text-[#64748B] dark:text-slate-400">
                    CAT. 0{idx + 1} · {MARKETPLACE_LABELS[item.category]}
                  </div>
                  <h3 className="mt-1.5 font-editorial text-lg font-semibold text-[#0A0C10] dark:text-[#F8FAFC] leading-snug">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-[#334155] dark:text-slate-300 line-clamp-2">
                    {item.description}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span className="font-mono text-base font-bold text-[#0A0C10] dark:text-[#F8FAFC] tabular-nums">
                    ${item.price} {item.currency}
                  </span>
                  <span className="text-xs uppercase tracking-wider font-semibold text-[#4648D4] dark:text-[#818CF8]">
                    Request →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Broadsheet Insights & Charter Outreach */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-8 bg-white dark:bg-[#12151C] border border-slate-300 dark:border-slate-800 p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4 pb-3 border-b-2 border-[#0A0C10] dark:border-slate-200">
            <h2 className="font-editorial text-xl sm:text-2xl font-semibold text-[#0A0C10] dark:text-[#F8FAFC]">
              Editorial Dispatch &amp; Guides
            </h2>
            <Link
              to="/blogs"
              className="text-xs uppercase tracking-wider font-semibold text-[#4648D4] dark:text-[#818CF8] hover:underline whitespace-nowrap"
            >
              Archive →
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {featuredBlogs.map((post) => (
              <Link
                key={post.id}
                to={`/blogs?article=${encodeURIComponent(post.slug)}`}
                className="group block"
              >
                <div className="aspect-[4/3] overflow-hidden bg-[#F1F5F9] dark:bg-[#181C25] border border-slate-300 dark:border-slate-800">
                  <SafeImage
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-full object-cover"
                    fallbackIcon={<FileText className="h-8 w-8" />}
                  />
                </div>
                <div className="mt-3 text-[11px] font-mono uppercase tracking-wider text-[#64748B] dark:text-slate-400">
                  {post.category} · {post.readTime}
                </div>
                <h3 className="mt-1.5 font-editorial text-lg font-semibold text-[#0A0C10] dark:text-[#F8FAFC] group-hover:text-[#4648D4] dark:group-hover:text-[#818CF8] leading-snug">
                  {post.title}
                </h3>
                <p className="mt-1.5 text-sm text-[#334155] dark:text-slate-300 line-clamp-2">
                  {post.excerpt}
                </p>
              </Link>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 bg-[#0A0C10] dark:bg-[#12151C] border border-[#0A0C10] dark:border-slate-700 text-white p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#A5B4FC]">
              Desk Inquiries
            </p>
            <h2 className="mt-3 font-editorial text-2xl font-semibold text-white leading-tight text-balance">
              Direct Employer &amp; Candidate Outreach
            </h2>
            <p className="mt-3 text-sm text-slate-300 leading-relaxed">
              Submit your phone number and inquiry on our Contacts ledger for personalized role, tender, or publication follow-up.
            </p>
          </div>
          <div className="mt-6 space-y-2.5">
            <Link
              to="/contacts"
              className="w-full inline-flex items-center justify-center h-11 px-4 rounded-none bg-[#4648D4] dark:bg-[#6366F1] text-white text-xs uppercase tracking-wider font-semibold hover:bg-[#4F46E5] transition-colors"
            >
              Open Contact Ledger
            </Link>
            <Link
              to="/about"
              className="w-full inline-flex items-center justify-center h-11 px-4 rounded-none border border-slate-600 text-xs uppercase tracking-wider font-medium text-slate-200 hover:bg-white/5 transition-colors"
            >
              Platform Charter
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
