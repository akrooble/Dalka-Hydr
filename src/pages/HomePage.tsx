import { ArrowRight, BookOpen, Briefcase, CheckCircle2, FileText, Gavel, Search } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { OrgLogo } from '../components/OrgLogo';
import { PWAInstallButton } from '../components/PWAInstallButton';
import { SafeImage } from '../components/SafeImage';
import { DEFAULT_SITE_SETTINGS } from '../lib/seedData';
import { resolveSiteTheme } from '../lib/siteThemes';
import { BlogPost, JobListing, MarketplaceItem, SiteSettings, SiteThemeId, TenderNotice } from '../types/dalka';
import { HomeModernBentoView, HomeSwissEditorialView } from './HomeThemeViews';

interface HomePageProps {
  jobs: JobListing[];
  tenders: TenderNotice[];
  marketplaceItems: MarketplaceItem[];
  blogs: BlogPost[];
  siteSettings?: SiteSettings;
  siteTheme?: SiteThemeId;
}

const MARKETPLACE_LABELS: Record<MarketplaceItem['category'], string> = {
  digital_good: 'Digital Good',
  book: 'Book',
  ecommerce: 'E-Commerce',
};

function TenderStatusLabel({ status }: { status: TenderNotice['status'] }) {
  if (status === 'open') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#006C49] dark:text-[#34D399] whitespace-nowrap shrink-0">
        <CheckCircle2 className="h-3.5 w-3.5" />
        <span>Open</span>
      </span>
    );
  }
  if (status === 'awarded') {
    return (
      <span className="text-xs font-semibold text-[#4648D4] dark:text-[#818CF8] whitespace-nowrap shrink-0">
        Awarded
      </span>
    );
  }
  return (
    <span className="text-xs font-medium text-[#64748B] dark:text-slate-400 whitespace-nowrap shrink-0">
      Closed
    </span>
  );
}

export function HomePage({
  jobs,
  tenders,
  marketplaceItems,
  blogs,
  siteSettings = DEFAULT_SITE_SETTINGS,
  siteTheme,
}: HomePageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchBoard, setSearchBoard] = useState<'jobs' | 'tenders'>('jobs');
  const navigate = useNavigate();

  const theme = resolveSiteTheme(siteTheme ?? siteSettings.siteTheme);
  if (theme === 'modern_bento') {
    return (
      <HomeModernBentoView
        jobs={jobs}
        tenders={tenders}
        marketplaceItems={marketplaceItems}
        blogs={blogs}
        siteSettings={siteSettings}
      />
    );
  }
  if (theme === 'swiss_editorial') {
    return (
      <HomeSwissEditorialView
        jobs={jobs}
        tenders={tenders}
        marketplaceItems={marketplaceItems}
        blogs={blogs}
        siteSettings={siteSettings}
      />
    );
  }

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

  return (
    <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-12 space-y-16">
      {/* Hero Section: Asymmetric Editorial Split + Full-Width Metric Strip */}
      <section className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          <div className="lg:col-span-7 flex flex-col justify-between py-2">
            <div>
              <p className="text-xs font-semibold tracking-wide text-[#4648D4] dark:text-[#818CF8]">
                {heroEyebrow}
              </p>
              <h1 className="mt-3 text-[clamp(2.25rem,3.8vw,3.5rem)] font-bold tracking-[-0.025em] leading-[1.1] text-[#0B1C30] dark:text-[#F8FAFC] text-balance max-w-[18ch]">
                {heroTitle}
              </h1>
              <p className="mt-4 text-base text-[#464554] dark:text-slate-300 leading-relaxed max-w-[58ch]">
                {heroSubtitle}
              </p>

              <form
                onSubmit={handleSearch}
                className="mt-7 bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-lg p-1.5 shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] flex flex-col sm:flex-row gap-2"
              >
                <div className="relative flex-1">
                  <Search className="h-4 w-4 text-[#64748B] dark:text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={searchPlaceholder}
                    aria-label="Search jobs or tenders"
                    className="w-full h-11 lg:h-[40px] pl-9 pr-3 rounded bg-transparent text-sm text-[#0B1C30] dark:text-[#F1F5F9] placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={searchBoard}
                    onChange={(e) => setSearchBoard(e.target.value as 'jobs' | 'tenders')}
                    aria-label="Select search board"
                    className="h-11 lg:h-[40px] px-3 rounded border border-slate-200 dark:border-slate-700 bg-[#F8F9FF] dark:bg-[#1E2430] text-sm font-medium text-[#0B1C30] dark:text-[#F1F5F9] focus:outline-none focus:border-[#6366F1]"
                  >
                    <option value="jobs">Jobs</option>
                    <option value="tenders">Tenders</option>
                  </select>
                  <button
                    type="submit"
                    className="h-11 lg:h-[40px] px-5 rounded bg-[#4648D4] dark:bg-[#6366F1] text-white text-sm font-semibold hover:bg-[#4F46E5] active:bg-[#4338CA] transition-colors whitespace-nowrap shrink-0"
                  >
                    Search
                  </button>
                </div>
              </form>

              {popularCategories.length > 0 && (
                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[#64748B] dark:text-slate-400">
                  <span className="font-medium text-[#464554] dark:text-slate-300">Quick filters:</span>
                  {popularCategories.map((cat) => (
                    <Link
                      key={cat}
                      to={`/jobs?q=${encodeURIComponent(cat)}`}
                      className="text-[#4648D4] dark:text-[#818CF8] hover:text-[#4F46E5] dark:hover:text-[#A5B4FC] hover:underline font-medium whitespace-nowrap"
                    >
                      {cat}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-7 pt-5 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-3">
              <Link
                to="/tenders"
                className="inline-flex items-center gap-1.5 min-h-[44px] lg:min-h-[38px] lg:h-[38px] px-4 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E2430] text-sm font-semibold text-[#0B1C30] dark:text-[#F1F5F9] hover:bg-slate-50 dark:hover:bg-[#262E3D] transition-colors whitespace-nowrap"
              >
                <span>View Open Tenders</span>
                <ArrowRight className="h-4 w-4 text-[#4648D4] dark:text-[#818CF8]" />
              </Link>
              <PWAInstallButton />
            </div>
          </div>

          <div className="lg:col-span-5 relative min-h-[280px] lg:min-h-[400px] rounded-xl border border-slate-200 dark:border-slate-800 bg-[#EFF4FF] dark:bg-[#161B22] overflow-hidden">
            <SafeImage
              src={heroImageUrl}
              alt={`${siteSettings.brandName || 'Dalka Jobs'} featured workspace`}
              className="w-full h-full lg:h-full object-cover"
              fallbackIcon={<Briefcase className="h-10 w-10" />}
            />
            {(heroOverlayTitle || heroOverlaySubtitle) && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0B1C30]/90 via-[#0B1C30]/50 to-transparent p-6 text-white">
                {heroOverlayTitle && (
                  <p className="text-xs font-medium text-white/80">{heroOverlayTitle}</p>
                )}
                {heroOverlaySubtitle && (
                  <p className="mt-1 text-sm font-semibold leading-snug">
                    {heroOverlaySubtitle}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Full-Width 4-Column Platform Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-xl divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800 overflow-hidden">
          <Link to="/jobs" className="p-5 hover:bg-[#F8F9FF] dark:hover:bg-[#1E2430] transition-colors flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-medium text-[#64748B] dark:text-slate-400">Active Job Openings</div>
              <div className="mt-1 text-2xl font-bold text-[#0B1C30] dark:text-[#F8FAFC] tabular-nums">{activeJobs.length}</div>
            </div>
            <Briefcase className="h-4 w-4 text-[#4648D4] dark:text-[#818CF8] mt-0.5 shrink-0" />
          </Link>

          <Link to="/tenders" className="p-5 hover:bg-[#F8F9FF] dark:hover:bg-[#1E2430] transition-colors flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-medium text-[#64748B] dark:text-slate-400">Open Institutional Tenders</div>
              <div className="mt-1 text-2xl font-bold text-[#006C49] dark:text-[#34D399] tabular-nums">{openTenders.length}</div>
            </div>
            <Gavel className="h-4 w-4 text-[#006C49] dark:text-[#34D399] mt-0.5 shrink-0" />
          </Link>

          <Link to="/marketplace" className="p-5 hover:bg-[#F8F9FF] dark:hover:bg-[#1E2430] transition-colors flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-medium text-[#64748B] dark:text-slate-400">Books &amp; Digital Kits</div>
              <div className="mt-1 text-2xl font-bold text-[#0B1C30] dark:text-[#F8FAFC] tabular-nums">{marketplaceItems.length}</div>
            </div>
            <BookOpen className="h-4 w-4 text-[#4648D4] dark:text-[#818CF8] mt-0.5 shrink-0" />
          </Link>

          <Link to="/blogs" className="p-5 hover:bg-[#F8F9FF] dark:hover:bg-[#1E2430] transition-colors flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-medium text-[#64748B] dark:text-slate-400">Career &amp; Bid Guides</div>
              <div className="mt-1 text-2xl font-bold text-[#0B1C30] dark:text-[#F8FAFC] tabular-nums">{blogs.length}</div>
            </div>
            <FileText className="h-4 w-4 text-[#4648D4] dark:text-[#818CF8] mt-0.5 shrink-0" />
          </Link>
        </div>
      </section>

      {/* 1. Latest Job Openings (with Company Logo Featured Cards) */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-[#0B1C30] dark:text-[#F8FAFC]">
              Latest Job Openings
            </h2>
            <p className="mt-1 text-sm text-[#464554] dark:text-slate-300">
              Verified roles with hiring company logos, salary ranges, and direct application links.
            </p>
          </div>
          <Link
            to="/jobs"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#4648D4] dark:text-[#818CF8] hover:text-[#4F46E5] dark:hover:text-[#A5B4FC] whitespace-nowrap shrink-0"
          >
            <span>All Jobs</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredJobs.map((job) => (
            <Link
              key={job.id}
              to={`/jobs?selected=${encodeURIComponent(job.id)}`}
              className="group bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden hover:border-slate-300 dark:hover:border-slate-700 hover:-translate-y-0.5 transition-all duration-200 flex flex-col"
            >
              <OrgLogo
                variant="banner"
                name={job.company}
                logoUrl={job.logoUrl}
                subtitle={`${job.location} · ${job.employmentType}`}
              />
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 text-xs font-medium text-[#64748B] dark:text-slate-400">
                    <span className="truncate">{job.category}</span>
                    <span className="tabular-nums shrink-0">Due {job.deadline}</span>
                  </div>
                  <h3 className="mt-1.5 text-base font-semibold text-[#0B1C30] dark:text-[#F8FAFC] group-hover:text-[#4648D4] dark:group-hover:text-[#818CF8] transition-colors leading-snug">
                    {job.title}
                  </h3>
                  <p className="mt-2 text-sm text-[#464554] dark:text-slate-300 line-clamp-2">
                    {job.description}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                  <span className="text-sm font-mono font-bold text-[#0B1C30] dark:text-[#F8FAFC] tabular-nums truncate">
                    {job.salary}
                  </span>
                  <span className="text-xs font-semibold text-[#4648D4] dark:text-[#818CF8] whitespace-nowrap shrink-0">
                    View Job →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 2. Institutional Tenders (with Organization Logo Featured Cards) */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-[#0B1C30] dark:text-[#F8FAFC]">
              Institutional Tenders
            </h2>
            <p className="mt-1 text-sm text-[#464554] dark:text-slate-300">
              Procurement RFPs, ITBs, and vendor contracts from regional authorities and organizations.
            </p>
          </div>
          <Link
            to="/tenders"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#4648D4] dark:text-[#818CF8] hover:text-[#4F46E5] dark:hover:text-[#A5B4FC] whitespace-nowrap shrink-0"
          >
            <span>All Tenders</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredTenders.map((tender) => (
            <Link
              key={tender.id}
              to={`/tenders?selected=${encodeURIComponent(tender.id)}`}
              className="group bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden hover:border-slate-300 dark:hover:border-slate-700 hover:-translate-y-0.5 transition-all duration-200 flex flex-col"
            >
              <OrgLogo
                variant="banner"
                name={tender.organization}
                logoUrl={tender.logoUrl}
                subtitle={`${tender.location} · ${tender.referenceNo}`}
              />
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 text-xs font-medium text-[#64748B] dark:text-slate-400">
                    <span className="truncate">{tender.category}</span>
                    <TenderStatusLabel status={tender.status} />
                  </div>
                  <h3 className="mt-1.5 text-base font-semibold text-[#0B1C30] dark:text-[#F8FAFC] group-hover:text-[#4648D4] dark:group-hover:text-[#818CF8] transition-colors leading-snug">
                    {tender.title}
                  </h3>
                  <p className="mt-2 text-sm text-[#464554] dark:text-slate-300 line-clamp-2">
                    {tender.description}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                  <span className="text-sm font-mono font-bold text-[#0B1C30] dark:text-[#F8FAFC] tabular-nums truncate">
                    {tender.budget}
                  </span>
                  <span className="text-xs font-semibold text-[#4648D4] dark:text-[#818CF8] whitespace-nowrap shrink-0">
                    Inspect Tender →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Marketplace Preview */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-[#0B1C30] dark:text-[#F8FAFC]">
              Dalka Marketplace
            </h2>
            <p className="mt-1 text-sm text-[#464554] dark:text-slate-300">
              Digital toolkits, career books, and work essentials. Reserve any item without online payment.
            </p>
          </div>
          <Link
            to="/marketplace"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#4648D4] dark:text-[#818CF8] hover:text-[#4F46E5] dark:hover:text-[#A5B4FC] whitespace-nowrap shrink-0"
          >
            <span>Visit Marketplace</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredMarket.map((item) => (
            <Link
              key={item.id}
              to={`/marketplace?item=${encodeURIComponent(item.id)}`}
              className="group bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden hover:border-slate-300 dark:hover:border-slate-700 hover:-translate-y-0.5 transition-all duration-200 flex flex-col"
            >
              <div className="aspect-[4/3] bg-[#EFF4FF] dark:bg-[#1E2430] overflow-hidden border-b border-slate-100 dark:border-slate-800">
                <SafeImage
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-200"
                  fallbackIcon={<Briefcase className="h-8 w-8" />}
                />
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-medium text-[#64748B] dark:text-slate-400">
                    {MARKETPLACE_LABELS[item.category]}
                  </div>
                  <h3 className="mt-1 text-base font-semibold text-[#0B1C30] dark:text-[#F8FAFC] leading-snug">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-[#464554] dark:text-slate-300 line-clamp-2">{item.description}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-base font-bold text-[#0B1C30] dark:text-[#F8FAFC] tabular-nums">
                    ${item.price} {item.currency}
                  </span>
                  <span className="text-xs font-semibold text-[#4648D4] dark:text-[#818CF8]">Request Item →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Editorial Insights & Obsidian Brand Conversion Card */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-8 bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-semibold text-[#0B1C30] dark:text-[#F8FAFC]">Career &amp; Tender Guides</h2>
            <Link
              to="/blogs"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#4648D4] dark:text-[#818CF8] hover:text-[#4F46E5] dark:hover:text-[#A5B4FC] whitespace-nowrap shrink-0"
            >
              <span>Read All</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {featuredBlogs.map((post) => (
              <Link
                key={post.id}
                to={`/blogs?article=${encodeURIComponent(post.slug)}`}
                className="group block"
              >
                <div className="aspect-[4/3] rounded-lg overflow-hidden bg-[#EFF4FF] dark:bg-[#1E2430] border border-slate-200 dark:border-slate-800">
                  <SafeImage
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-200"
                    fallbackIcon={<FileText className="h-8 w-8" />}
                  />
                </div>
                <div className="mt-3 text-xs text-[#64748B] dark:text-slate-400">
                  {post.category} · {post.readTime}
                </div>
                <h3 className="mt-1 text-base font-semibold text-[#0B1C30] dark:text-[#F8FAFC] group-hover:text-[#4648D4] dark:group-hover:text-[#818CF8] transition-colors leading-snug">
                  {post.title}
                </h3>
                <p className="mt-1.5 text-sm text-[#464554] dark:text-slate-300 line-clamp-2">{post.excerpt}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 bg-[#1B2029] dark:bg-[#161B22] dark:border dark:border-slate-800 text-white rounded-xl p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold text-[#A5B4FC]">
              Direct Outreach
            </p>
            <h2 className="mt-2.5 text-2xl font-semibold text-white leading-tight text-balance">
              Looking for tailored roles, tenders, or employer postings?
            </h2>
            <p className="mt-3 text-sm text-slate-300 leading-relaxed">
              Share your name, phone number, and optional location or higher education background on our Contacts page so our team can reach out directly.
            </p>
          </div>
          <div className="mt-6 space-y-3">
            <Link
              to="/contacts"
              className="w-full inline-flex items-center justify-center min-h-[44px] lg:min-h-[38px] lg:h-[38px] px-4 rounded bg-[#6366F1] text-white text-sm font-semibold hover:bg-[#4F46E5] transition-colors"
            >
              Leave Your Contact Details
            </Link>
            <Link
              to="/about"
              className="w-full inline-flex items-center justify-center min-h-[44px] lg:min-h-[38px] lg:h-[38px] px-4 rounded border border-slate-700 bg-transparent text-sm font-medium text-slate-100 hover:bg-white/5 transition-colors"
            >
              Learn About Dalka Jobs
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
