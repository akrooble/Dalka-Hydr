import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import { LeadForm } from '../components/LeadForm';
import { resolveSiteTheme } from '../lib/siteThemes';
import { SiteSettings, SiteThemeId } from '../types/dalka';

interface ContactsPageProps {
  siteSettings: SiteSettings;
  siteTheme?: SiteThemeId;
}

export function ContactsPage({ siteSettings, siteTheme }: ContactsPageProps) {
  const theme = resolveSiteTheme(siteTheme ?? siteSettings.siteTheme);

  if (theme === 'modern_bento') {
    return (
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 pt-8 pb-14 space-y-8">
        <div className="mx-auto max-w-2xl text-center space-y-2">
          <p className="text-xs font-semibold text-[#4648D4] dark:text-[#818CF8]">Direct Channels</p>
          <h1 className="font-bento text-3xl sm:text-4xl font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
            Contacts &amp; Inquiries
          </h1>
          <p className="text-sm sm:text-base text-[#475569] dark:text-slate-300">
            Reach our team for employer listings, procurement tenders, marketplace orders, or career inquiries.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            <div className="rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 p-5 shadow-[0_4px_20px_-8px_rgba(15,23,42,0.05)] dark:shadow-none flex items-start gap-3.5">
              <div className="h-10 w-10 rounded-xl bg-[#EEF2FF] dark:bg-[#1E2430] flex items-center justify-center shrink-0">
                <Phone className="h-4 w-4 text-[#4648D4] dark:text-[#818CF8]" />
              </div>
              <div>
                <div className="text-xs font-medium text-[#64748B] dark:text-slate-400">Phone</div>
                <div className="mt-0.5 text-sm font-mono font-semibold text-[#0F172A] dark:text-[#F8FAFC] tabular-nums">
                  {siteSettings.phone}
                </div>
                {siteSettings.whatsapp && (
                  <div className="mt-1 text-xs font-mono text-[#006C49] dark:text-[#34D399] tabular-nums">
                    WhatsApp: {siteSettings.whatsapp}
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 p-5 shadow-[0_4px_20px_-8px_rgba(15,23,42,0.05)] dark:shadow-none flex items-start gap-3.5">
              <div className="h-10 w-10 rounded-xl bg-[#EEF2FF] dark:bg-[#1E2430] flex items-center justify-center shrink-0">
                <Mail className="h-4 w-4 text-[#4648D4] dark:text-[#818CF8]" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-medium text-[#64748B] dark:text-slate-400">Email</div>
                <a
                  href={`mailto:${siteSettings.email}`}
                  className="mt-0.5 block text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC] hover:text-[#4648D4] break-all"
                >
                  {siteSettings.email}
                </a>
              </div>
            </div>

            <div className="rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 p-5 shadow-[0_4px_20px_-8px_rgba(15,23,42,0.05)] dark:shadow-none flex items-start gap-3.5">
              <div className="h-10 w-10 rounded-xl bg-[#EEF2FF] dark:bg-[#1E2430] flex items-center justify-center shrink-0">
                <MapPin className="h-4 w-4 text-[#4648D4] dark:text-[#818CF8]" />
              </div>
              <div>
                <div className="text-xs font-medium text-[#64748B] dark:text-slate-400">Office Location</div>
                <div className="mt-0.5 text-sm text-[#475569] dark:text-slate-300 leading-relaxed">
                  {siteSettings.address}
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 p-5 shadow-[0_4px_20px_-8px_rgba(15,23,42,0.05)] dark:shadow-none flex items-start gap-3.5">
              <div className="h-10 w-10 rounded-xl bg-[#EEF2FF] dark:bg-[#1E2430] flex items-center justify-center shrink-0">
                <Clock className="h-4 w-4 text-[#4648D4] dark:text-[#818CF8]" />
              </div>
              <div>
                <div className="text-xs font-medium text-[#64748B] dark:text-slate-400">Office Hours</div>
                <div className="mt-0.5 text-sm text-[#475569] dark:text-slate-300">
                  {siteSettings.officeHours}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-[0_6px_28px_-8px_rgba(15,23,42,0.06)] dark:shadow-none">
            <LeadForm
              source="contacts"
              heading="Send Your Contact Details"
              subheading="Name and phone number are required. Location, email, and higher education are optional."
              submitLabel="Submit Contact Form"
            />
          </div>
        </div>
      </div>
    );
  }

  if (theme === 'swiss_editorial') {
    return (
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 pt-8 pb-14 space-y-8">
        <div className="pb-4 border-b-2 border-[#0A0C10] dark:border-slate-200">
          <p className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#4648D4] dark:text-[#818CF8]">
            Desk Directory · Inquiries
          </p>
          <h1 className="mt-1 font-editorial text-3xl sm:text-4xl font-bold tracking-tight text-[#0A0C10] dark:text-[#F8FAFC]">
            Contacts &amp; Inquiries
          </h1>
          <p className="mt-2 text-sm text-[#334155] dark:text-slate-300 max-w-2xl">
            Reach out to Dalka Jobs for employer postings, tender notices, marketplace orders, or career support.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 bg-white dark:bg-[#12151C] border border-slate-300 dark:border-slate-800 p-6 sm:p-8 space-y-6">
            <div className="pb-3 border-b border-slate-300 dark:border-slate-800">
              <h2 className="font-editorial text-xl font-semibold text-[#0A0C10] dark:text-[#F8FAFC]">
                Direct Office Ledger
              </h2>
              <p className="mt-1 text-xs text-[#64748B] dark:text-slate-400">
                Official public communication channels
              </p>
            </div>

            <dl className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
              <div className="py-3.5 first:pt-0">
                <dt className="text-[11px] font-mono uppercase tracking-wider text-[#64748B] dark:text-slate-400">
                  Phone
                </dt>
                <dd className="mt-1 font-mono font-semibold text-[#0A0C10] dark:text-[#F1F5F9] tabular-nums">
                  {siteSettings.phone}
                </dd>
              </div>
              {siteSettings.whatsapp && (
                <div className="py-3.5">
                  <dt className="text-[11px] font-mono uppercase tracking-wider text-[#64748B] dark:text-slate-400">
                    WhatsApp
                  </dt>
                  <dd className="mt-1 font-mono font-semibold text-[#006C49] dark:text-[#34D399] tabular-nums">
                    {siteSettings.whatsapp}
                  </dd>
                </div>
              )}
              <div className="py-3.5">
                <dt className="text-[11px] font-mono uppercase tracking-wider text-[#64748B] dark:text-slate-400">
                  Email
                </dt>
                <dd className="mt-1 font-semibold text-[#0A0C10] dark:text-[#F1F5F9] break-all">
                  {siteSettings.email}
                </dd>
              </div>
              <div className="py-3.5">
                <dt className="text-[11px] font-mono uppercase tracking-wider text-[#64748B] dark:text-slate-400">
                  Office Address
                </dt>
                <dd className="mt-1 text-[#334155] dark:text-slate-300">{siteSettings.address}</dd>
              </div>
              <div className="pt-3.5">
                <dt className="text-[11px] font-mono uppercase tracking-wider text-[#64748B] dark:text-slate-400">
                  Office Hours
                </dt>
                <dd className="mt-1 text-[#334155] dark:text-slate-300">{siteSettings.officeHours}</dd>
              </div>
            </dl>
          </div>

          <div className="lg:col-span-7 bg-white dark:bg-[#12151C] border border-slate-300 dark:border-slate-800 p-6 sm:p-8">
            <LeadForm
              source="contacts"
              heading="Submit Contact Ledger"
              subheading="Name and phone number are required. Location, email, and higher education are optional."
              submitLabel="Submit Contact Form"
            />
          </div>
        </div>
      </div>
    );
  }

  // Classic Editorial (Theme 1 — Default)
  return (
    <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 pt-6 lg:pt-8 pb-12 space-y-8">
      <div className="bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#0B1C30] dark:text-[#F8FAFC] text-balance">
          Contacts &amp; Inquiries
        </h1>
        <p className="mt-2 text-sm text-[#464554] dark:text-slate-300 max-w-2xl">
          Reach out to Dalka Jobs for employer postings, tender listings, marketplace orders, or career support. Leave your name and phone number below so our team can contact you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5 bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-[#0B1C30] dark:text-[#F8FAFC]">Direct Contact Information</h2>
            <p className="mt-1 text-xs text-[#64748B] dark:text-slate-400">
              Contact details are synced from site settings and editable in the Admin Panel.
            </p>
          </div>

          <dl className="space-y-4">
            <div className="flex items-start gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <Phone className="h-4 w-4 text-[#4648D4] dark:text-[#818CF8] mt-1 shrink-0" />
              <div>
                <dt className="text-xs font-medium text-[#64748B] dark:text-slate-400">Phone</dt>
                <dd className="mt-0.5 text-sm font-semibold text-[#0B1C30] dark:text-[#F1F5F9] tabular-nums">
                  {siteSettings.phone}
                </dd>
              </div>
            </div>

            {siteSettings.whatsapp && (
              <div className="flex items-start gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                <Phone className="h-4 w-4 text-[#006C49] dark:text-[#34D399] mt-1 shrink-0" />
                <div>
                  <dt className="text-xs font-medium text-[#64748B] dark:text-slate-400">WhatsApp</dt>
                  <dd className="mt-0.5 text-sm font-semibold text-[#0B1C30] dark:text-[#F1F5F9] tabular-nums">
                    {siteSettings.whatsapp}
                  </dd>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <Mail className="h-4 w-4 text-[#4648D4] dark:text-[#818CF8] mt-1 shrink-0" />
              <div>
                <dt className="text-xs font-medium text-[#64748B] dark:text-slate-400">Email</dt>
                <dd className="mt-0.5 text-sm font-semibold text-[#0B1C30] dark:text-[#F1F5F9]">
                  {siteSettings.email}
                </dd>
              </div>
            </div>

            <div className="flex items-start gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <MapPin className="h-4 w-4 text-[#4648D4] dark:text-[#818CF8] mt-1 shrink-0" />
              <div>
                <dt className="text-xs font-medium text-[#64748B] dark:text-slate-400">Office Address</dt>
                <dd className="mt-0.5 text-sm text-[#464554] dark:text-slate-300">{siteSettings.address}</dd>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="h-4 w-4 text-[#4648D4] dark:text-[#818CF8] mt-1 shrink-0" />
              <div>
                <dt className="text-xs font-medium text-[#64748B] dark:text-slate-400">Office Hours</dt>
                <dd className="mt-0.5 text-sm text-[#464554] dark:text-slate-300">{siteSettings.officeHours}</dd>
              </div>
            </div>
          </dl>
        </div>

        <div className="lg:col-span-7 bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8">
          <LeadForm
            source="contacts"
            heading="Send Your Contact Details"
            subheading="Name and phone number are required. Location, email, and higher education are optional."
            submitLabel="Submit Contact Form"
          />
        </div>
      </div>
    </div>
  );
}
