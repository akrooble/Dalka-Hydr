import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { FormEvent, ReactNode, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminPortalLink } from '../lib/domainRouting';
import { submitNewsletterEmail } from '../lib/firebase';
import { DEFAULT_SITE_SETTINGS } from '../lib/seedData';
import { resolveSiteTheme } from '../lib/siteThemes';
import { FooterLink, SiteSettings, SiteThemeId } from '../types/dalka';
import { ThemeToggle } from './ThemeToggle';

interface FooterProps {
  siteSettings: SiteSettings;
  siteTheme?: SiteThemeId;
}

function MailboxBadgeIcon({ className = 'h-7 w-7 text-white' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M22 17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9.5C2 7 4 5 6.5 5H18c2.2 0 4 1.8 4 4v8Z" />
      <polyline points="15,9 18,9 18,11" />
      <path d="M6.5 5C9 5 11 7 11 9.5V17a2 2 0 0 1-2 2" />
      <line x1="6" y1="10" x2="7" y2="10" />
    </svg>
  );
}

function LinkedInGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 shrink-0" aria-hidden="true">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77Z" />
    </svg>
  );
}

function TwitterGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 shrink-0" aria-hidden="true">
      <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23Z" />
    </svg>
  );
}

function FacebookGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 shrink-0" aria-hidden="true">
      <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7v-7h-2v-3h2V9.5A3.5 3.5 0 0 1 15.5 6H18v3h-2a1 1 0 0 0-1 1v1h3v3h-3v7h4a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Z" />
    </svg>
  );
}

function InstagramGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 shrink-0"
      aria-hidden="true"
    >
      <rect width="18" height="18" x="3" y="3" rx="4" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

function YoutubeGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 shrink-0" aria-hidden="true">
      <path d="M21.58 7.19a2.5 2.5 0 0 0-1.76-1.77C18.25 5 12 5 12 5s-6.25 0-7.82.42A2.5 2.5 0 0 0 2.42 7.2 26.2 26.2 0 0 0 2 12a26.2 26.2 0 0 0 .42 4.81 2.5 2.5 0 0 0 1.76 1.77C5.75 19 12 19 12 19s6.25 0 7.82-.42a2.5 2.5 0 0 0 1.76-1.77A26.2 26.2 0 0 0 22 12a26.2 26.2 0 0 0-.42-4.81ZM10 15V9l5.2 3L10 15Z" />
    </svg>
  );
}

function renderFooterNavItem(item: FooterLink) {
  const adminLink = getAdminPortalLink();
  const linkClass =
    'text-[#464554] dark:text-slate-300 hover:text-[#4648D4] dark:hover:text-[#818CF8] transition-colors inline-block leading-snug';

  if (item.href === '/admin') {
    if (adminLink.external) {
      return (
        <a href={adminLink.href} className={linkClass}>
          {item.label}
        </a>
      );
    }
    return (
      <Link to={adminLink.href} className={linkClass}>
        {item.label}
      </Link>
    );
  }

  if (item.href.startsWith('/')) {
    return (
      <Link to={item.href} className={linkClass}>
        {item.label}
      </Link>
    );
  }

  return (
    <a href={item.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
      {item.label}
    </a>
  );
}

export function Footer({ siteSettings, siteTheme }: FooterProps) {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [subscribedEmail, setSubscribedEmail] = useState<string | null>(null);
  const [subscribeError, setSubscribeError] = useState<string | null>(null);

  const theme = resolveSiteTheme(siteTheme ?? siteSettings.siteTheme);

  const newsletterTitle =
    siteSettings.footerNewsletterTitle || DEFAULT_SITE_SETTINGS.footerNewsletterTitle || 'Subscribe to our newsletter';
  const newsletterSubtitle =
    siteSettings.footerNewsletterSubtitle ||
    DEFAULT_SITE_SETTINGS.footerNewsletterSubtitle ||
    "We'll keep you updated with the best new jobs.";
  const aboutTitle = siteSettings.footerAboutTitle || DEFAULT_SITE_SETTINGS.footerAboutTitle || 'About Us';
  const aboutText = siteSettings.footerAboutText || siteSettings.tagline;

  const col2Title = siteSettings.footerCol2Title || DEFAULT_SITE_SETTINGS.footerCol2Title || 'Company';
  const col2Links =
    siteSettings.footerCol2Links && siteSettings.footerCol2Links.length > 0
      ? siteSettings.footerCol2Links
      : DEFAULT_SITE_SETTINGS.footerCol2Links || [];

  const col3Title = siteSettings.footerCol3Title || DEFAULT_SITE_SETTINGS.footerCol3Title || 'Services';
  const col3Links =
    siteSettings.footerCol3Links && siteSettings.footerCol3Links.length > 0
      ? siteSettings.footerCol3Links
      : DEFAULT_SITE_SETTINGS.footerCol3Links || [];

  const col4Title = siteSettings.footerCol4Title || DEFAULT_SITE_SETTINGS.footerCol4Title || 'Support';
  const col4Links =
    siteSettings.footerCol4Links && siteSettings.footerCol4Links.length > 0
      ? siteSettings.footerCol4Links
      : DEFAULT_SITE_SETTINGS.footerCol4Links || [];

  const connectTitle = siteSettings.footerConnectTitle || DEFAULT_SITE_SETTINGS.footerConnectTitle || 'Connect';
  const copyrightText =
    siteSettings.footerCopyright ||
    `© ${new Date().getFullYear()} ${siteSettings.brandName || 'Dalka Jobs'}. All Right Reserved.`;

  const socialItems: { label: string; url?: string; icon: ReactNode }[] = [
    { label: 'Linkedin', url: siteSettings.socialLinkedin, icon: <LinkedInGlyph /> },
    { label: 'Twitter', url: siteSettings.socialTwitter, icon: <TwitterGlyph /> },
    { label: 'Facebook', url: siteSettings.socialFacebook, icon: <FacebookGlyph /> },
    { label: 'Instagram', url: siteSettings.socialInstagram, icon: <InstagramGlyph /> },
    { label: 'Youtube', url: siteSettings.socialYoutube, icon: <YoutubeGlyph /> },
  ].filter((item) => Boolean(item.url && item.url.trim().length > 0));

  async function handleNewsletterSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubscribeError(null);
    setSubscribedEmail(null);

    const trimmed = newsletterEmail.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setSubscribeError('Please enter a valid email address.');
      return;
    }

    setSubmitting(true);
    try {
      await submitNewsletterEmail(trimmed);
      setSubscribedEmail(trimmed);
      setNewsletterEmail('');
    } catch (err) {
      setSubscribeError(err instanceof Error ? err.message : 'Unable to subscribe right now.');
    } finally {
      setSubmitting(false);
    }
  }

  if (theme === 'modern_bento') {
    return (
      <footer className="mt-20 px-4 sm:px-6 lg:px-8 pb-8">
        <div className="mx-auto max-w-[1280px] space-y-6">
          {/* Elevated Bento Newsletter Card */}
          <div className="rounded-2xl bg-[#EEF2FF] dark:bg-[#111827] border border-[#DCE4FF] dark:border-slate-800 p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-[#4648D4] dark:bg-[#6366F1] flex items-center justify-center shrink-0">
                <MailboxBadgeIcon />
              </div>
              <div>
                <h2 className="font-bento text-xl sm:text-2xl font-semibold tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
                  {newsletterTitle}
                </h2>
                <p className="mt-0.5 text-sm text-[#475569] dark:text-slate-400">
                  {newsletterSubtitle}
                </p>
              </div>
            </div>

            <div className="w-full lg:w-auto lg:min-w-[390px]">
              {subscribedEmail ? (
                <div className="inline-flex items-center gap-2 rounded-xl border border-[#4648D4]/25 dark:border-[#6366F1]/40 bg-white dark:bg-[#1E2430] px-4 py-3 text-xs font-medium text-[#4648D4] dark:text-[#818CF8]">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>Subscribed ({subscribedEmail}) for updates.</span>
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2.5" noValidate>
                  <input
                    type="email"
                    required
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter your email address"
                    aria-label="Newsletter email address"
                    className="flex-1 h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#090D16] text-sm text-[#0F172A] dark:text-[#F1F5F9] placeholder:text-slate-400 focus:outline-none focus:border-[#4648D4] focus:ring-2 focus:ring-[#4648D4]/20"
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="h-11 px-6 rounded-xl bg-[#4648D4] dark:bg-[#6366F1] text-white text-sm font-semibold hover:bg-[#4F46E5] dark:hover:bg-[#818CF8] disabled:opacity-60 transition-colors whitespace-nowrap shrink-0"
                  >
                    {submitting ? 'Subscribing...' : 'Subscribe'}
                  </button>
                </form>
              )}
              {subscribeError && (
                <p className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-[#93000A] dark:text-red-400">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{subscribeError}</span>
                </p>
              )}
            </div>
          </div>

          {/* Bento Directory Surface */}
          <div className="rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 lg:p-10 shadow-[0_4px_24px_-8px_rgba(15,23,42,0.05)] dark:shadow-none">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-12 gap-8 lg:gap-10">
              <div className="col-span-2 sm:col-span-3 lg:col-span-4 space-y-4">
                <h3 className="font-bento text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                  {aboutTitle}
                </h3>
                <p className="text-sm text-[#475569] dark:text-slate-300 leading-relaxed max-w-xs">
                  {aboutText}
                </p>
                <div className="space-y-1.5 text-sm text-[#0F172A] dark:text-slate-200 pt-1">
                  <div className="tabular-nums">
                    <span className="font-medium text-[#64748B] dark:text-slate-400">T.</span>{' '}
                    <span>{siteSettings.phone}</span>
                  </div>
                  <div>
                    <span className="font-medium text-[#64748B] dark:text-slate-400">E.</span>{' '}
                    <a
                      href={`mailto:${siteSettings.email}`}
                      className="hover:text-[#4648D4] dark:hover:text-[#818CF8] transition-colors break-all"
                    >
                      {siteSettings.email}
                    </a>
                  </div>
                </div>
              </div>

              <div className="col-span-1 lg:col-span-2">
                <h3 className="font-bento text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                  {col2Title}
                </h3>
                <ul className="mt-4 space-y-2.5 text-sm">
                  {col2Links.map((item, idx) => (
                    <li key={`${item.label}-${idx}`}>{renderFooterNavItem(item)}</li>
                  ))}
                </ul>
              </div>

              <div className="col-span-1 lg:col-span-2">
                <h3 className="font-bento text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                  {col3Title}
                </h3>
                <ul className="mt-4 space-y-2.5 text-sm">
                  {col3Links.map((item, idx) => (
                    <li key={`${item.label}-${idx}`}>{renderFooterNavItem(item)}</li>
                  ))}
                </ul>
              </div>

              <div className="col-span-1 lg:col-span-2">
                <h3 className="font-bento text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                  {col4Title}
                </h3>
                <ul className="mt-4 space-y-2.5 text-sm">
                  {col4Links.map((item, idx) => (
                    <li key={`${item.label}-${idx}`}>{renderFooterNavItem(item)}</li>
                  ))}
                </ul>
              </div>

              <div className="col-span-1 lg:col-span-2">
                <h3 className="font-bento text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                  {connectTitle}
                </h3>
                <ul className="mt-4 space-y-2.5 text-sm">
                  {socialItems.map((social) => (
                    <li key={social.label}>
                      <a
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2.5 text-[#475569] dark:text-slate-300 hover:text-[#4648D4] dark:hover:text-[#818CF8] transition-colors"
                      >
                        <span className="text-[#94A3B8] dark:text-slate-500">{social.icon}</span>
                        <span>{social.label}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#64748B] dark:text-slate-400">
              <p>{copyrightText}</p>
              <ThemeToggle compact className="rounded-xl" />
            </div>
          </div>
        </div>
      </footer>
    );
  }

  if (theme === 'swiss_editorial') {
    return (
      <footer className="border-t-2 border-[#0A0C10] dark:border-slate-200 bg-white dark:bg-[#12151C] mt-20 transition-colors">
        <div className="border-b border-slate-300 dark:border-slate-800">
          <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-9 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-4">
              <div className="h-12 w-12 bg-[#4648D4] dark:bg-[#6366F1] flex items-center justify-center shrink-0">
                <MailboxBadgeIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="font-editorial text-xl sm:text-2xl font-semibold tracking-tight text-[#0A0C10] dark:text-[#F8FAFC]">
                  {newsletterTitle}
                </h2>
                <p className="mt-0.5 text-sm text-[#475569] dark:text-slate-400">
                  {newsletterSubtitle}
                </p>
              </div>
            </div>

            <div className="w-full lg:w-auto lg:min-w-[380px]">
              {subscribedEmail ? (
                <div className="inline-flex items-center gap-2 border border-[#4648D4] dark:border-[#818CF8] bg-[#EFF4FF] dark:bg-[#1E2430] px-4 py-2.5 text-xs font-medium text-[#4648D4] dark:text-[#818CF8]">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>Subscribed ({subscribedEmail}).</span>
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2" noValidate>
                  <input
                    type="email"
                    required
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter your email address"
                    aria-label="Newsletter email address"
                    className="flex-1 h-11 lg:h-10 px-3.5 rounded-none border border-slate-300 dark:border-slate-700 bg-[#FAFAFA] dark:bg-[#0A0C10] text-sm text-[#0A0C10] dark:text-[#F1F5F9] placeholder:text-slate-400 focus:outline-none focus:border-[#4648D4]"
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="h-11 lg:h-10 px-5 rounded-none bg-[#4648D4] dark:bg-[#6366F1] text-white text-xs uppercase tracking-wider font-semibold hover:bg-[#4F46E5] disabled:opacity-60 transition-colors whitespace-nowrap shrink-0"
                  >
                    {submitting ? 'Subscribing...' : 'Subscribe'}
                  </button>
                </form>
              )}
              {subscribeError && (
                <p className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-[#93000A] dark:text-red-400">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{subscribeError}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-12 gap-8 lg:gap-10">
            <div className="col-span-2 sm:col-span-3 lg:col-span-4 space-y-4">
              <h3 className="text-xs uppercase tracking-[0.14em] font-semibold text-[#0A0C10] dark:text-[#F8FAFC]">
                {aboutTitle}
              </h3>
              <p className="text-sm text-[#334155] dark:text-slate-300 leading-relaxed max-w-xs">
                {aboutText}
              </p>
              <div className="space-y-1.5 text-sm font-mono text-[#0A0C10] dark:text-slate-200 pt-1">
                <div className="tabular-nums">
                  <span className="text-[#64748B] dark:text-slate-400">T.</span> {siteSettings.phone}
                </div>
                <div>
                  <span className="text-[#64748B] dark:text-slate-400">E.</span>{' '}
                  <a
                    href={`mailto:${siteSettings.email}`}
                    className="hover:text-[#4648D4] dark:hover:text-[#818CF8] transition-colors break-all"
                  >
                    {siteSettings.email}
                  </a>
                </div>
              </div>
            </div>

            <div className="col-span-1 lg:col-span-2">
              <h3 className="text-xs uppercase tracking-[0.14em] font-semibold text-[#0A0C10] dark:text-[#F8FAFC]">
                {col2Title}
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                {col2Links.map((item, idx) => (
                  <li key={`${item.label}-${idx}`}>{renderFooterNavItem(item)}</li>
                ))}
              </ul>
            </div>

            <div className="col-span-1 lg:col-span-2">
              <h3 className="text-xs uppercase tracking-[0.14em] font-semibold text-[#0A0C10] dark:text-[#F8FAFC]">
                {col3Title}
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                {col3Links.map((item, idx) => (
                  <li key={`${item.label}-${idx}`}>{renderFooterNavItem(item)}</li>
                ))}
              </ul>
            </div>

            <div className="col-span-1 lg:col-span-2">
              <h3 className="text-xs uppercase tracking-[0.14em] font-semibold text-[#0A0C10] dark:text-[#F8FAFC]">
                {col4Title}
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                {col4Links.map((item, idx) => (
                  <li key={`${item.label}-${idx}`}>{renderFooterNavItem(item)}</li>
                ))}
              </ul>
            </div>

            <div className="col-span-1 lg:col-span-2">
              <h3 className="text-xs uppercase tracking-[0.14em] font-semibold text-[#0A0C10] dark:text-[#F8FAFC]">
                {connectTitle}
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                {socialItems.map((social) => (
                  <li key={social.label}>
                    <a
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2.5 text-[#334155] dark:text-slate-300 hover:text-[#4648D4] dark:hover:text-[#818CF8] transition-colors"
                    >
                      <span className="text-[#64748B] dark:text-slate-400">{social.icon}</span>
                      <span>{social.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-300 dark:border-slate-800">
          <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-mono text-[#64748B] dark:text-slate-400">
            <p>{copyrightText}</p>
            <ThemeToggle compact className="rounded-none border-slate-300 dark:border-slate-700" />
          </div>
        </div>
      </footer>
    );
  }

  // Classic Editorial (Theme 1 — Default)
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161B22] mt-20 transition-colors">
      {/* 1. Newsletter Strip */}
      <div className="border-b border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-9 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-[#4648D4] dark:bg-[#6366F1] flex items-center justify-center shrink-0">
              <MailboxBadgeIcon />
            </div>
            <div>
              <h2 className="text-xl sm:text-[22px] font-semibold tracking-tight text-[#0B1C30] dark:text-[#F8FAFC] leading-snug">
                {newsletterTitle}
              </h2>
              <p className="mt-0.5 text-sm text-[#64748B] dark:text-slate-400">
                {newsletterSubtitle}
              </p>
            </div>
          </div>

          <div className="w-full lg:w-auto lg:min-w-[380px]">
            {subscribedEmail ? (
              <div className="inline-flex items-center gap-2 rounded-lg border border-[#4648D4]/25 dark:border-[#6366F1]/40 bg-[#EFF4FF] dark:bg-[#1E2430] px-4 py-2.5 text-xs font-medium text-[#4648D4] dark:text-[#818CF8]">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>Subscribed ({subscribedEmail}) for job &amp; tender updates.</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2" noValidate>
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email address"
                  aria-label="Newsletter email address"
                  className="flex-1 h-11 lg:h-10 px-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-[#F8F9FF] dark:bg-[#0D1117] text-sm text-[#0B1C30] dark:text-[#F1F5F9] placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[#4648D4] focus:ring-2 focus:ring-[#4648D4]/20"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="h-11 lg:h-10 px-5 rounded-lg bg-[#4648D4] dark:bg-[#6366F1] text-white text-sm font-semibold hover:bg-[#4F46E5] dark:hover:bg-[#818CF8] disabled:opacity-60 transition-colors whitespace-nowrap shrink-0"
                >
                  {submitting ? 'Subscribing...' : 'Subscribe'}
                </button>
              </form>
            )}
            {subscribeError && (
              <p className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-[#93000A] dark:text-red-400">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{subscribeError}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 2. Main 5-Column Directory */}
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Column 1: About Us & Direct Contact */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-4 space-y-4">
            <h3 className="text-sm font-semibold text-[#0B1C30] dark:text-[#F8FAFC]">
              {aboutTitle}
            </h3>
            <p className="text-sm text-[#464554] dark:text-slate-300 leading-relaxed max-w-xs">
              {aboutText}
            </p>
            <div className="space-y-1.5 text-sm text-[#0B1C30] dark:text-slate-200 pt-1">
              <div className="tabular-nums">
                <span className="font-medium text-[#64748B] dark:text-slate-400">T.</span>{' '}
                <span>{siteSettings.phone}</span>
              </div>
              <div>
                <span className="font-medium text-[#64748B] dark:text-slate-400">E.</span>{' '}
                <a
                  href={`mailto:${siteSettings.email}`}
                  className="hover:text-[#4648D4] dark:hover:text-[#818CF8] transition-colors break-all"
                >
                  {siteSettings.email}
                </a>
              </div>
            </div>
          </div>

          {/* Column 2 */}
          <div className="col-span-1 lg:col-span-2">
            <h3 className="text-sm font-semibold text-[#0B1C30] dark:text-[#F8FAFC]">
              {col2Title}
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {col2Links.map((item, idx) => (
                <li key={`${item.label}-${idx}`}>{renderFooterNavItem(item)}</li>
              ))}
            </ul>
          </div>

          {/* Column 3 */}
          <div className="col-span-1 lg:col-span-2">
            <h3 className="text-sm font-semibold text-[#0B1C30] dark:text-[#F8FAFC]">
              {col3Title}
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {col3Links.map((item, idx) => (
                <li key={`${item.label}-${idx}`}>{renderFooterNavItem(item)}</li>
              ))}
            </ul>
          </div>

          {/* Column 4 */}
          <div className="col-span-1 lg:col-span-2">
            <h3 className="text-sm font-semibold text-[#0B1C30] dark:text-[#F8FAFC]">
              {col4Title}
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {col4Links.map((item, idx) => (
                <li key={`${item.label}-${idx}`}>{renderFooterNavItem(item)}</li>
              ))}
            </ul>
          </div>

          {/* Column 5: Connect (Social Media Links) */}
          <div className="col-span-1 lg:col-span-2">
            <h3 className="text-sm font-semibold text-[#0B1C30] dark:text-[#F8FAFC]">
              {connectTitle}
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {socialItems.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2.5 text-[#464554] dark:text-slate-300 hover:text-[#4648D4] dark:hover:text-[#818CF8] transition-colors group"
                  >
                    <span className="text-[#94A3B8] dark:text-slate-500 group-hover:text-[#4648D4] dark:group-hover:text-[#818CF8] transition-colors">
                      {social.icon}
                    </span>
                    <span>{social.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 3. Bottom Copyright & Theme Bar */}
      <div className="border-t border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#64748B] dark:text-slate-400">
          <p>{copyrightText}</p>
          <ThemeToggle compact />
        </div>
      </div>
    </footer>
  );
}
