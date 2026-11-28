import { Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PWAInstallButton } from '../components/PWAInstallButton';
import { SafeImage } from '../components/SafeImage';
import { resolveSiteTheme } from '../lib/siteThemes';
import { SiteSettings, SiteThemeId } from '../types/dalka';

interface AboutPageProps {
  siteSettings: SiteSettings;
  siteTheme?: SiteThemeId;
}

export function AboutPage({ siteSettings, siteTheme }: AboutPageProps) {
  const theme = resolveSiteTheme(siteTheme ?? siteSettings.siteTheme);
  const heroImageUrl =
    siteSettings.homeHeroImageUrl?.trim() ||
    '/src/assets/images/hero_dalka_workspace_1795594060501.jpg';

  if (theme === 'modern_bento') {
    return (
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 pt-8 pb-14 space-y-10">
        <section className="mx-auto max-w-3xl text-center space-y-4">
          <p className="text-xs font-semibold text-[#4648D4] dark:text-[#818CF8]">
            About {siteSettings.brandName || 'Dalka Jobs'}
          </p>
          <h1 className="font-bento text-3xl sm:text-5xl font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC] leading-tight text-balance">
            Built for clear hiring, transparent tenders, and practical growth.
          </h1>
          <p className="text-base sm:text-lg text-[#475569] dark:text-slate-300 leading-relaxed">
            {siteSettings.aboutMission}
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/jobs"
              className="inline-flex items-center justify-center h-11 px-6 rounded-xl bg-[#4648D4] dark:bg-[#6366F1] text-white text-sm font-semibold hover:bg-[#4F46E5] transition-colors"
            >
              Browse Open Jobs
            </Link>
            <Link
              to="/contacts"
              className="inline-flex items-center justify-center h-11 px-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111827] text-sm font-semibold text-[#0F172A] dark:text-[#F1F5F9] hover:bg-slate-50 dark:hover:bg-[#1F2937] transition-colors"
            >
              Contact Our Team
            </Link>
            <PWAInstallButton />
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-7 rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 bg-[#EFF4FF] dark:bg-[#111827] min-h-[280px] shadow-[0_6px_28px_-8px_rgba(15,23,42,0.06)] dark:shadow-none">
            <SafeImage
              src={heroImageUrl}
              alt="Dalka Jobs workspace"
              className="w-full h-full object-cover"
              fallbackIcon={<Briefcase className="h-10 w-10" />}
            />
          </div>
          <div className="lg:col-span-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 flex flex-col justify-center shadow-[0_6px_28px_-8px_rgba(15,23,42,0.06)] dark:shadow-none">
            <h2 className="font-bento text-xl font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
              Our Platform Story
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#475569] dark:text-slate-300 leading-relaxed">
              {siteSettings.aboutStory}
            </p>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 p-6 shadow-[0_4px_20px_-8px_rgba(15,23,42,0.05)] dark:shadow-none">
            <div className="text-xs font-mono font-semibold text-[#4648D4] dark:text-[#818CF8]">01</div>
            <h2 className="mt-2 font-bento text-lg font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
              Direct Job Applications
            </h2>
            <p className="mt-2 text-sm text-[#475569] dark:text-slate-300 leading-relaxed">
              Every listing highlights company, location, salary, category, and deadline—routing candidates straight to the hiring organization&apos;s website or email.
            </p>
          </div>

          <div className="rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 p-6 shadow-[0_4px_20px_-8px_rgba(15,23,42,0.05)] dark:shadow-none">
            <div className="text-xs font-mono font-semibold text-[#4648D4] dark:text-[#818CF8]">02</div>
            <h2 className="mt-2 font-bento text-lg font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
              Institutional Tenders
            </h2>
            <p className="mt-2 text-sm text-[#475569] dark:text-slate-300 leading-relaxed">
              Structured RFP, ITB, and vendor contracts with reference numbers, estimated budgets, and status tracking so suppliers never miss a deadline.
            </p>
          </div>

          <div className="rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 p-6 shadow-[0_4px_20px_-8px_rgba(15,23,42,0.05)] dark:shadow-none">
            <div className="text-xs font-mono font-semibold text-[#4648D4] dark:text-[#818CF8]">03</div>
            <h2 className="mt-2 font-bento text-lg font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
              Curated Marketplace
            </h2>
            <p className="mt-2 text-sm text-[#475569] dark:text-slate-300 leading-relaxed">
              Digital toolkits, career books, and field essentials available to request immediately with direct team follow-up.
            </p>
          </div>
        </section>
      </div>
    );
  }

  if (theme === 'swiss_editorial') {
    return (
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 pt-8 pb-14 space-y-12">
        <section className="pb-6 border-b-2 border-[#0A0C10] dark:border-slate-200 space-y-4">
          <p className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#4648D4] dark:text-[#818CF8]">
            Institutional Charter · {siteSettings.brandName || 'Dalka Jobs'}
          </p>
          <h1 className="font-editorial text-3xl sm:text-5xl font-bold tracking-tight text-[#0A0C10] dark:text-[#F8FAFC] leading-[1.08] max-w-4xl text-balance">
            Built for clear hiring, transparent tenders, and practical growth.
          </h1>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-7 space-y-6">
            <p className="font-editorial text-xl sm:text-2xl text-[#0A0C10] dark:text-[#F1F5F9] leading-snug">
              {siteSettings.aboutMission}
            </p>
            <div className="border-t border-slate-300 dark:border-slate-800 pt-6">
              <p className="text-base text-[#334155] dark:text-slate-300 leading-relaxed first-letter:text-5xl first-letter:font-editorial first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:leading-none">
                {siteSettings.aboutStory}
              </p>
            </div>
            <div className="pt-4 flex flex-wrap gap-3">
              <Link
                to="/jobs"
                className="inline-flex items-center justify-center h-11 px-5 rounded-none bg-[#4648D4] dark:bg-[#6366F1] text-white text-xs uppercase tracking-wider font-semibold hover:bg-[#4F46E5] transition-colors"
              >
                Browse Open Jobs
              </Link>
              <Link
                to="/contacts"
                className="inline-flex items-center justify-center h-11 px-5 rounded-none border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#12151C] text-xs uppercase tracking-wider font-semibold text-[#0A0C10] dark:text-[#F1F5F9] hover:bg-slate-50 dark:hover:bg-[#181C25] transition-colors"
              >
                Contact Our Team
              </Link>
              <PWAInstallButton />
            </div>
          </div>

          <figure className="lg:col-span-5">
            <div className="aspect-[4/3] border border-slate-300 dark:border-slate-700 overflow-hidden bg-[#F1F5F9] dark:bg-[#12151C]">
              <SafeImage
                src={heroImageUrl}
                alt="Dalka Jobs editorial and operations team workspace"
                className="w-full h-full object-cover"
                fallbackIcon={<Briefcase className="h-10 w-10" />}
              />
            </div>
            <figcaption className="mt-2 pt-2 border-t border-slate-300 dark:border-slate-800 text-xs font-mono text-[#64748B] dark:text-slate-400">
              FIG. 01 — Editorial &amp; Verification Operations
            </figcaption>
          </figure>
        </section>

        <section className="bg-white dark:bg-[#12151C] border border-slate-300 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-300 dark:divide-slate-800">
          <div className="p-6">
            <div className="text-xs font-mono text-[#64748B] dark:text-slate-400">01 / HIRING</div>
            <h2 className="mt-2 font-editorial text-xl font-semibold text-[#0A0C10] dark:text-[#F8FAFC]">
              Direct Job Applications
            </h2>
            <p className="mt-2 text-sm text-[#334155] dark:text-slate-300 leading-relaxed">
              Every listing highlights company, location, salary, category, and deadline—routing candidates straight to the hiring organization&apos;s website or email.
            </p>
          </div>

          <div className="p-6">
            <div className="text-xs font-mono text-[#64748B] dark:text-slate-400">02 / TENDERS</div>
            <h2 className="mt-2 font-editorial text-xl font-semibold text-[#0A0C10] dark:text-[#F8FAFC]">
              Institutional Tenders
            </h2>
            <p className="mt-2 text-sm text-[#334155] dark:text-slate-300 leading-relaxed">
              Structured RFP, ITB, and vendor contracts with reference numbers, estimated budgets, and status tracking so suppliers never miss a deadline.
            </p>
          </div>

          <div className="p-6">
            <div className="text-xs font-mono text-[#64748B] dark:text-slate-400">03 / CATALOG</div>
            <h2 className="mt-2 font-editorial text-xl font-semibold text-[#0A0C10] dark:text-[#F8FAFC]">
              Curated Marketplace
            </h2>
            <p className="mt-2 text-sm text-[#334155] dark:text-slate-300 leading-relaxed">
              Digital toolkits, career books, and field essentials available to request immediately with direct team follow-up.
            </p>
          </div>
        </section>
      </div>
    );
  }

  // Classic Editorial (Theme 1 — Default)
  return (
    <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 pt-6 lg:pt-8 pb-12 space-y-10">
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-7 bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-10 flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold text-[#4648D4] dark:text-[#818CF8]">
              About Dalka Jobs
            </p>
            <h1 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-[#0B1C30] dark:text-[#F8FAFC] leading-tight text-balance">
              Built for clear hiring, transparent tenders, and practical growth.
            </h1>
            <p className="mt-4 text-base text-[#464554] dark:text-slate-300 leading-relaxed">
              {siteSettings.aboutMission}
            </p>
            <p className="mt-4 text-sm text-[#464554] dark:text-slate-300 leading-relaxed">
              {siteSettings.aboutStory}
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/jobs"
              className="inline-flex items-center justify-center min-h-[44px] lg:min-h-[38px] lg:h-[38px] px-5 rounded bg-[#4648D4] dark:bg-[#6366F1] text-white text-sm font-semibold hover:bg-[#4F46E5] transition-colors"
            >
              Browse Open Jobs
            </Link>
            <Link
              to="/contacts"
              className="inline-flex items-center justify-center min-h-[44px] lg:min-h-[38px] lg:h-[38px] px-5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E2430] text-sm font-medium text-[#0B1C30] dark:text-[#F1F5F9] hover:bg-slate-50 dark:hover:bg-[#262E3D] transition-colors"
            >
              Contact Our Team
            </Link>
            <PWAInstallButton />
          </div>
        </div>

        <div className="lg:col-span-5 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-[#EFF4FF] dark:bg-[#161B22] min-h-[260px]">
          <SafeImage
            src="/src/assets/images/hero_dalka_workspace_1795594060501.jpg"
            alt="Dalka Jobs editorial and operations team workspace"
            className="w-full h-full lg:h-full object-cover"
            fallbackIcon={<Briefcase className="h-10 w-10" />}
          />
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-[#0B1C30] dark:text-[#F8FAFC]">01. Direct Job Applications</h2>
          <p className="mt-2 text-sm text-[#464554] dark:text-slate-300 leading-relaxed">
            Every listing highlights company, location, salary, category, and deadline—routing candidates straight to the hiring organization&apos;s website or email.
          </p>
        </div>

        <div className="bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-[#0B1C30] dark:text-[#F8FAFC]">02. Institutional Tenders</h2>
          <p className="mt-2 text-sm text-[#464554] dark:text-slate-300 leading-relaxed">
            Structured RFP, ITB, and vendor contracts with reference numbers, estimated budgets, and status tracking so suppliers never miss a deadline.
          </p>
        </div>

        <div className="bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-[#0B1C30] dark:text-[#F8FAFC]">03. Curated Marketplace</h2>
          <p className="mt-2 text-sm text-[#464554] dark:text-slate-300 leading-relaxed">
            Digital toolkits, career books, and field essentials available to request immediately with phone follow-up—expanding into online checkout in later phases.
          </p>
        </div>
      </section>
    </div>
  );
}
