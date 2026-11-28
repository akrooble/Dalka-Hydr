import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  Globe,
  Home,
  Image as ImageIcon,
  Link2,
  Mail,
  MapPin,
  Maximize2,
  MessageSquare,
  Palette,
  Phone,
  Plus,
  RotateCcw,
  Share2,
  Trash2,
} from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { BrandMark } from '../components/BrandMark';
import { SafeImage } from '../components/SafeImage';
import { saveSiteSettingsSection } from '../lib/adminFirestore';
import { DEFAULT_SITE_SETTINGS } from '../lib/seedData';
import { resolveSiteTheme, SITE_THEMES } from '../lib/siteThemes';
import {
  AdminPermission,
  FooterLink,
  SiteSettings,
  SiteSettingsSection,
  SiteThemeId,
} from '../types/dalka';
import { LogoPreset, LogoUploadField } from './LogoUploadField';
import { ThemePreviewPanel } from './ThemePreviewPanel';

interface AdminSettingsTabProps {
  siteSettings: SiteSettings;
  activeSection: SiteSettingsSection;
  onSelectSection: (section: SiteSettingsSection) => void;
  permissions: AdminPermission[];
}

type ColumnKey = 'footerCol2Links' | 'footerCol3Links' | 'footerCol4Links';

const HERO_IMAGE_PRESETS: LogoPreset[] = [
  { label: 'Default Workspace', url: '/src/assets/images/hero_dalka_workspace_1795594060501.jpg' },
  { label: 'Editorial Office', url: '/src/assets/images/blog_career_editorial_1795594060761.jpg' },
  { label: 'Career Kit', url: '/src/assets/images/marketplace_digital_kit_1795594059215.jpg' },
];

const SITE_LOGO_LIGHT_PRESETS: LogoPreset[] = [
  { label: 'Default Light Logo', url: '/assets/aistudio/PROFILES-03_b5c8cc84.png' },
  { label: 'Default Dark Logo', url: '/assets/aistudio/PROFILES-04_73f47e70.png' },
];

const SITE_LOGO_DARK_PRESETS: LogoPreset[] = [
  { label: 'Default Dark Logo', url: '/assets/aistudio/PROFILES-04_73f47e70.png' },
  { label: 'Default Light Logo', url: '/assets/aistudio/PROFILES-03_b5c8cc84.png' },
];

const FAVICON_PRESETS: LogoPreset[] = [
  { label: 'Default SVG Icon', url: '/icon.svg' },
  { label: 'App Badge (192px)', url: '/pwa-192x192.png' },
  { label: 'Light Brand Mark', url: '/assets/aistudio/PROFILES-03_b5c8cc84.png' },
];

const SECTION_META: Record<
  SiteSettingsSection,
  {
    title: string;
    tabLabel: string;
    description: string;
    requiredPerm: 'contacts' | 'footer';
    icon: typeof Mail;
  }
> = {
  home_header: {
    title: 'Home Page Text & Header Image',
    tabLabel: 'Home Page & Header',
    description: 'Edit the Home hero headline, eyebrow, subtitle, search placeholder, header image, and caption.',
    requiredPerm: 'contacts',
    icon: Home,
  },
  site_branding: {
    title: 'Website Main Logo & Tab Icon',
    tabLabel: 'Logos & Site Icon',
    description: 'Upload or link the website main logos (light & dark themes) and the browser tab favicon.',
    requiredPerm: 'contacts',
    icon: ImageIcon,
  },
  site_theme: {
    title: 'Website Design Theme',
    tabLabel: 'Website Theme',
    description:
      'Choose one of 3 distinct design architectures for the public website. Every theme supports both Light Mode and Dark Mode with your branding.',
    requiredPerm: 'contacts',
    icon: Palette,
  },
  contacts: {
    title: 'Brand & Direct Contacts',
    tabLabel: 'Contacts & Brand',
    description: 'Manage your public brand name, email, phone, WhatsApp, office address, and hours.',
    requiredPerm: 'contacts',
    icon: Phone,
  },
  about_settings: {
    title: 'About Page Content',
    tabLabel: 'About Page',
    description: 'Edit the mission statement and platform story displayed on the About page.',
    requiredPerm: 'contacts',
    icon: FileText,
  },
  footer_intro: {
    title: 'Footer Newsletter, About & Copyright',
    tabLabel: 'Newsletter & Intro',
    description: 'Customize the footer newsletter banner text, About column description, and copyright line.',
    requiredPerm: 'footer',
    icon: Mail,
  },
  footer_links: {
    title: 'Footer Directory Columns & Links',
    tabLabel: 'Directory Links',
    description: 'Edit the 3 directory column headings and up to 8 navigation links per column.',
    requiredPerm: 'footer',
    icon: Link2,
  },
  footer_social: {
    title: 'Social Media Links (Connect Column)',
    tabLabel: 'Social Media',
    description: 'Configure your Connect column title and social profile URLs. Blank URLs stay hidden.',
    requiredPerm: 'footer',
    icon: Share2,
  },
};

function buildFormState(s: SiteSettings) {
  return {
    brandName: s.brandName,
    tagline: s.tagline,
    email: s.email,
    phone: s.phone,
    whatsapp: s.whatsapp || '',
    address: s.address,
    officeHours: s.officeHours,
    aboutMission: s.aboutMission,
    aboutStory: s.aboutStory,
    footerNewsletterTitle:
      s.footerNewsletterTitle ?? DEFAULT_SITE_SETTINGS.footerNewsletterTitle ?? '',
    footerNewsletterSubtitle:
      s.footerNewsletterSubtitle ?? DEFAULT_SITE_SETTINGS.footerNewsletterSubtitle ?? '',
    footerAboutTitle: s.footerAboutTitle ?? DEFAULT_SITE_SETTINGS.footerAboutTitle ?? '',
    footerAboutText: s.footerAboutText ?? DEFAULT_SITE_SETTINGS.footerAboutText ?? '',
    footerCol2Title: s.footerCol2Title ?? DEFAULT_SITE_SETTINGS.footerCol2Title ?? 'Company',
    footerCol2Links: (s.footerCol2Links && s.footerCol2Links.length > 0
      ? s.footerCol2Links
      : DEFAULT_SITE_SETTINGS.footerCol2Links || []
    ).map((l) => ({ ...l })),
    footerCol3Title: s.footerCol3Title ?? DEFAULT_SITE_SETTINGS.footerCol3Title ?? 'Services',
    footerCol3Links: (s.footerCol3Links && s.footerCol3Links.length > 0
      ? s.footerCol3Links
      : DEFAULT_SITE_SETTINGS.footerCol3Links || []
    ).map((l) => ({ ...l })),
    footerCol4Title: s.footerCol4Title ?? DEFAULT_SITE_SETTINGS.footerCol4Title ?? 'Support',
    footerCol4Links: (s.footerCol4Links && s.footerCol4Links.length > 0
      ? s.footerCol4Links
      : DEFAULT_SITE_SETTINGS.footerCol4Links || []
    ).map((l) => ({ ...l })),
    footerConnectTitle: s.footerConnectTitle ?? DEFAULT_SITE_SETTINGS.footerConnectTitle ?? 'Connect',
    socialLinkedin: s.socialLinkedin ?? '',
    socialTwitter: s.socialTwitter ?? '',
    socialFacebook: s.socialFacebook ?? '',
    socialInstagram: s.socialInstagram ?? '',
    socialYoutube: s.socialYoutube ?? '',
    footerCopyright: s.footerCopyright ?? DEFAULT_SITE_SETTINGS.footerCopyright ?? '',
    homeHeroEyebrow: s.homeHeroEyebrow ?? DEFAULT_SITE_SETTINGS.homeHeroEyebrow ?? '',
    homeHeroTitle: s.homeHeroTitle ?? DEFAULT_SITE_SETTINGS.homeHeroTitle ?? '',
    homeHeroSubtitle: s.homeHeroSubtitle ?? DEFAULT_SITE_SETTINGS.homeHeroSubtitle ?? '',
    homeSearchPlaceholder:
      s.homeSearchPlaceholder ?? DEFAULT_SITE_SETTINGS.homeSearchPlaceholder ?? '',
    homeHeroImageUrl: s.homeHeroImageUrl ?? DEFAULT_SITE_SETTINGS.homeHeroImageUrl ?? '',
    homeHeroOverlayTitle:
      s.homeHeroOverlayTitle ?? DEFAULT_SITE_SETTINGS.homeHeroOverlayTitle ?? '',
    homeHeroOverlaySubtitle:
      s.homeHeroOverlaySubtitle ?? DEFAULT_SITE_SETTINGS.homeHeroOverlaySubtitle ?? '',
    siteLogoLightUrl: s.siteLogoLightUrl ?? DEFAULT_SITE_SETTINGS.siteLogoLightUrl ?? '',
    siteLogoDarkUrl: s.siteLogoDarkUrl ?? DEFAULT_SITE_SETTINGS.siteLogoDarkUrl ?? '',
    siteFaviconUrl: s.siteFaviconUrl ?? DEFAULT_SITE_SETTINGS.siteFaviconUrl ?? '',
    siteTheme: resolveSiteTheme(s.siteTheme ?? DEFAULT_SITE_SETTINGS.siteTheme),
  };
}

export function AdminSettingsTab({
  siteSettings,
  activeSection,
  onSelectSection,
  permissions,
}: AdminSettingsTabProps) {
  const [form, setForm] = useState(() => buildFormState(siteSettings));
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewFullscreen, setPreviewFullscreen] = useState(false);

  useEffect(() => {
    setForm(buildFormState(siteSettings));
  }, [siteSettings]);

  useEffect(() => {
    setSavedNotice(null);
    setError(null);
  }, [activeSection]);

  async function handlePublishThemeLive(themeId: SiteThemeId) {
    setError(null);
    setSavedNotice(null);
    setSaving(true);
    try {
      const nextForm = { ...form, siteTheme: themeId };
      setForm(nextForm);
      await saveSiteSettingsSection('site_theme', nextForm);
      const themeName = SITE_THEMES.find((t) => t.id === themeId)?.name || themeId;
      setSavedNotice(`Website theme switched to ${themeName} and published live.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to publish theme.');
    } finally {
      setSaving(false);
    }
  }

  function updateLinkRow(colKey: ColumnKey, index: number, field: keyof FooterLink, value: string) {
    setForm((prev) => {
      const nextList = [...prev[colKey]];
      nextList[index] = { ...nextList[index], [field]: value };
      return { ...prev, [colKey]: nextList };
    });
  }

  function addLinkRow(colKey: ColumnKey) {
    setForm((prev) => {
      if (prev[colKey].length >= 8) return prev;
      return {
        ...prev,
        [colKey]: [...prev[colKey], { label: 'New Link', href: '/contacts' }],
      };
    });
  }

  function removeLinkRow(colKey: ColumnKey, index: number) {
    setForm((prev) => ({
      ...prev,
      [colKey]: prev[colKey].filter((_, i) => i !== index),
    }));
  }

  function handleRestoreSectionDefaults() {
    if (activeSection === 'home_header') {
      setForm((prev) => ({
        ...prev,
        homeHeroEyebrow: DEFAULT_SITE_SETTINGS.homeHeroEyebrow || '',
        homeHeroTitle: DEFAULT_SITE_SETTINGS.homeHeroTitle || '',
        homeHeroSubtitle: DEFAULT_SITE_SETTINGS.homeHeroSubtitle || '',
        homeSearchPlaceholder: DEFAULT_SITE_SETTINGS.homeSearchPlaceholder || '',
        homeHeroImageUrl: DEFAULT_SITE_SETTINGS.homeHeroImageUrl || '',
        homeHeroOverlayTitle: DEFAULT_SITE_SETTINGS.homeHeroOverlayTitle || '',
        homeHeroOverlaySubtitle: DEFAULT_SITE_SETTINGS.homeHeroOverlaySubtitle || '',
      }));
    } else if (activeSection === 'site_branding') {
      setForm((prev) => ({
        ...prev,
        brandName: DEFAULT_SITE_SETTINGS.brandName,
        siteLogoLightUrl: DEFAULT_SITE_SETTINGS.siteLogoLightUrl || '',
        siteLogoDarkUrl: DEFAULT_SITE_SETTINGS.siteLogoDarkUrl || '',
        siteFaviconUrl: DEFAULT_SITE_SETTINGS.siteFaviconUrl || '',
      }));
    } else if (activeSection === 'site_theme') {
      setForm((prev) => ({
        ...prev,
        siteTheme: 'classic',
      }));
    } else if (activeSection === 'footer_intro') {
      setForm((prev) => ({
        ...prev,
        footerNewsletterTitle: DEFAULT_SITE_SETTINGS.footerNewsletterTitle || '',
        footerNewsletterSubtitle: DEFAULT_SITE_SETTINGS.footerNewsletterSubtitle || '',
        footerAboutTitle: DEFAULT_SITE_SETTINGS.footerAboutTitle || '',
        footerAboutText: DEFAULT_SITE_SETTINGS.footerAboutText || '',
        footerCopyright: DEFAULT_SITE_SETTINGS.footerCopyright || '',
      }));
    } else if (activeSection === 'footer_links') {
      setForm((prev) => ({
        ...prev,
        footerCol2Title: DEFAULT_SITE_SETTINGS.footerCol2Title || 'Company',
        footerCol2Links: (DEFAULT_SITE_SETTINGS.footerCol2Links || []).map((l) => ({ ...l })),
        footerCol3Title: DEFAULT_SITE_SETTINGS.footerCol3Title || 'Services',
        footerCol3Links: (DEFAULT_SITE_SETTINGS.footerCol3Links || []).map((l) => ({ ...l })),
        footerCol4Title: DEFAULT_SITE_SETTINGS.footerCol4Title || 'Support',
        footerCol4Links: (DEFAULT_SITE_SETTINGS.footerCol4Links || []).map((l) => ({ ...l })),
      }));
    } else if (activeSection === 'footer_social') {
      setForm((prev) => ({
        ...prev,
        footerConnectTitle: DEFAULT_SITE_SETTINGS.footerConnectTitle || 'Connect',
        socialLinkedin: DEFAULT_SITE_SETTINGS.socialLinkedin || '',
        socialTwitter: DEFAULT_SITE_SETTINGS.socialTwitter || '',
        socialFacebook: DEFAULT_SITE_SETTINGS.socialFacebook || '',
        socialInstagram: DEFAULT_SITE_SETTINGS.socialInstagram || '',
        socialYoutube: DEFAULT_SITE_SETTINGS.socialYoutube || '',
      }));
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSavedNotice(null);

    if (activeSection === 'home_header') {
      if (form.homeHeroTitle.trim().length < 4) {
        setError('Main Hero Headline must be at least 4 characters.');
        return;
      }
    }

    if (activeSection === 'site_branding') {
      if (form.brandName.trim().length < 2) {
        setError('Website Brand Name must be at least 2 characters.');
        return;
      }
    }

    if (activeSection === 'contacts') {
      if (form.email.trim().length < 5 || form.phone.trim().length < 5 || form.address.trim().length < 4) {
        setError('Email, phone, and office address are required.');
        return;
      }
    }

    if (activeSection === 'about_settings') {
      if (form.aboutMission.trim().length < 10 || form.aboutStory.trim().length < 10) {
        setError('About mission and story must each be at least 10 characters.');
        return;
      }
    }

    setSaving(true);
    try {
      await saveSiteSettingsSection(activeSection, form);
      setSavedNotice(`${SECTION_META[activeSection].title} saved to Firestore.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save settings.');
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    'w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0D1117] text-sm text-[#0B1C30] dark:text-[#F1F5F9] placeholder:text-[#64748B] dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#4648D4]/30 focus:border-[#4648D4]';

  const footerColumnsConfig: {
    label: string;
    titleKey: 'footerCol2Title' | 'footerCol3Title' | 'footerCol4Title';
    linksKey: ColumnKey;
  }[] = [
    { label: 'Footer Column 2', titleKey: 'footerCol2Title', linksKey: 'footerCol2Links' },
    { label: 'Footer Column 3', titleKey: 'footerCol3Title', linksKey: 'footerCol3Links' },
    { label: 'Footer Column 4', titleKey: 'footerCol4Title', linksKey: 'footerCol4Links' },
  ];

  const activeSocialCount = [
    form.socialLinkedin,
    form.socialTwitter,
    form.socialFacebook,
    form.socialInstagram,
    form.socialYoutube,
  ].filter((v) => v.trim().length > 0).length;

  const currentMeta = SECTION_META[activeSection];
  const visibleSections = (Object.keys(SECTION_META) as SiteSettingsSection[]).filter((sec) =>
    permissions.includes(SECTION_META[sec].requiredPerm),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[#0B1C30] dark:text-[#F8FAFC]">
          {currentMeta.title}
        </h1>
        <p className="mt-1 text-sm text-[#464554] dark:text-slate-300">
          {currentMeta.description}
        </p>
      </div>

      {/* Dedicated Section Tabs */}
      {visibleSections.length > 1 && (
        <div
          role="tablist"
          aria-label="Contacts and footer sections"
          className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800"
        >
          {visibleSections.map((secKey) => {
            const meta = SECTION_META[secKey];
            const Icon = meta.icon;
            const isActive = activeSection === secKey;
            return (
              <button
                key={secKey}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onSelectSection(secKey)}
                className={`inline-flex items-center gap-2 h-9 px-3.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-[#4648D4] dark:bg-[#6366F1] text-white'
                    : 'text-[#464554] dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1E2430] hover:text-[#0B1C30] dark:hover:text-[#F8FAFC]'
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span>{meta.tabLabel}</span>
              </button>
            );
          })}
        </div>
      )}

      {savedNotice && (
        <div className="flex items-center gap-2 rounded-lg border border-[#4648D4]/25 dark:border-[#6366F1]/40 bg-[#EFF4FF] dark:bg-[#1E2430] px-4 py-3 text-sm text-[#4648D4] dark:text-[#818CF8]">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{savedNotice}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/50 px-4 py-3 text-sm text-[#93000A] dark:text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {(() => {
        const draftSiteSettings: SiteSettings = {
          ...siteSettings,
          ...form,
        };
        const liveSavedTheme = resolveSiteTheme(siteSettings.siteTheme);

        if (activeSection === 'site_theme') {
          return (
            <div className="space-y-6">
              <div className="bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-[#0B1C30] dark:text-[#F8FAFC]">
                      Select &amp; Preview a Website Theme
                    </h2>
                    <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">
                      Click any theme card to inspect your live website below before publishing it to visitors.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleRestoreSectionDefaults}
                      className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-[#464554] dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1E2430] transition-colors"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>Reset to Classic</span>
                    </button>
                    <button
                      type="button"
                      disabled={saving || form.siteTheme === liveSavedTheme}
                      onClick={() => handlePublishThemeLive(form.siteTheme)}
                      className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-[#4648D4] dark:bg-[#6366F1] text-white text-xs font-semibold hover:bg-[#4F46E5] dark:hover:bg-[#818CF8] disabled:opacity-50 transition-colors"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>
                        {saving
                          ? 'Publishing...'
                          : form.siteTheme === liveSavedTheme
                            ? 'Selected Theme is Live'
                            : 'Publish Selected Theme Live'}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {SITE_THEMES.map((theme) => {
                    const isSelected = form.siteTheme === theme.id;
                    const isLiveSaved = liveSavedTheme === theme.id;

                    return (
                      <div
                        key={theme.id}
                        className={`rounded-xl border p-4 flex flex-col justify-between gap-4 transition-all ${
                          isSelected
                            ? 'border-[#4648D4] dark:border-[#6366F1] bg-[#EFF4FF]/60 dark:bg-[#1E2430] ring-2 ring-[#4648D4]/20'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1117] hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="space-y-3">
                          {/* Mini Light + Dark Split Schematic */}
                          <div className="w-full rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden grid grid-cols-2 min-h-[108px]">
                            <div
                              className="p-2.5 flex flex-col justify-between"
                              style={{ backgroundColor: theme.lightSwatch.bg }}
                            >
                              <div className="flex items-center justify-between gap-1">
                                <div
                                  className="h-1.5 w-8 rounded-xs"
                                  style={{ backgroundColor: theme.lightSwatch.ink }}
                                />
                                <div
                                  className="h-2 w-4"
                                  style={{
                                    backgroundColor: theme.lightSwatch.accent,
                                    borderRadius:
                                      theme.id === 'modern_bento'
                                        ? '9999px'
                                        : theme.id === 'swiss_editorial'
                                          ? '0px'
                                          : '3px',
                                  }}
                                />
                              </div>
                              {theme.id === 'classic' && (
                                <div className="grid grid-cols-12 gap-1 my-1.5">
                                  <div className="col-span-7 space-y-1">
                                    <div className="h-2 w-full bg-slate-800/80 rounded-xs" />
                                    <div className="h-1.5 w-4/5 bg-slate-400/70 rounded-xs" />
                                  </div>
                                  <div
                                    className="col-span-5 h-7 border border-slate-200 rounded-xs"
                                    style={{ backgroundColor: theme.lightSwatch.card }}
                                  />
                                </div>
                              )}
                              {theme.id === 'modern_bento' && (
                                <div className="space-y-1.5 my-1.5 flex flex-col items-center">
                                  <div className="h-2 w-4/5 bg-slate-900/80 rounded-full" />
                                  <div
                                    className="h-6 w-full border border-slate-200 rounded-md"
                                    style={{ backgroundColor: theme.lightSwatch.card }}
                                  />
                                </div>
                              )}
                              {theme.id === 'swiss_editorial' && (
                                <div className="space-y-1 my-1.5 border-y border-slate-300 py-1">
                                  <div className="h-2.5 w-11/12 bg-slate-900" />
                                  <div className="grid grid-cols-3 gap-0.5 pt-0.5">
                                    <div className="h-2.5 border border-slate-300 bg-white" />
                                    <div className="h-2.5 border border-slate-300 bg-white" />
                                    <div className="h-2.5 border border-slate-300 bg-white" />
                                  </div>
                                </div>
                              )}
                              <div className="text-[9px] font-mono text-slate-500">Light</div>
                            </div>

                            <div
                              className="p-2.5 flex flex-col justify-between border-l border-slate-300/40 dark:border-slate-700"
                              style={{ backgroundColor: theme.darkSwatch.bg }}
                            >
                              <div className="flex items-center justify-between gap-1">
                                <div
                                  className="h-1.5 w-8 rounded-xs"
                                  style={{ backgroundColor: theme.darkSwatch.ink }}
                                />
                                <div
                                  className="h-2 w-4"
                                  style={{
                                    backgroundColor: theme.darkSwatch.accent,
                                    borderRadius:
                                      theme.id === 'modern_bento'
                                        ? '9999px'
                                        : theme.id === 'swiss_editorial'
                                          ? '0px'
                                          : '3px',
                                  }}
                                />
                              </div>
                              {theme.id === 'classic' && (
                                <div className="grid grid-cols-12 gap-1 my-1.5">
                                  <div className="col-span-7 space-y-1">
                                    <div className="h-2 w-full bg-slate-100/85 rounded-xs" />
                                    <div className="h-1.5 w-4/5 bg-slate-500 rounded-xs" />
                                  </div>
                                  <div
                                    className="col-span-5 h-7 border border-slate-700 rounded-xs"
                                    style={{ backgroundColor: theme.darkSwatch.card }}
                                  />
                                </div>
                              )}
                              {theme.id === 'modern_bento' && (
                                <div className="space-y-1.5 my-1.5 flex flex-col items-center">
                                  <div className="h-2 w-4/5 bg-slate-100/85 rounded-full" />
                                  <div
                                    className="h-6 w-full border border-slate-700 rounded-md"
                                    style={{ backgroundColor: theme.darkSwatch.card }}
                                  />
                                </div>
                              )}
                              {theme.id === 'swiss_editorial' && (
                                <div className="space-y-1 my-1.5 border-y border-slate-700 py-1">
                                  <div className="h-2.5 w-11/12 bg-slate-100" />
                                  <div className="grid grid-cols-3 gap-0.5 pt-0.5">
                                    <div className="h-2.5 border border-slate-700 bg-[#12151C]" />
                                    <div className="h-2.5 border border-slate-700 bg-[#12151C]" />
                                    <div className="h-2.5 border border-slate-700 bg-[#12151C]" />
                                  </div>
                                </div>
                              )}
                              <div className="text-[9px] font-mono text-slate-400">Dark</div>
                            </div>
                          </div>

                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="text-sm font-semibold text-[#0B1C30] dark:text-[#F8FAFC]">
                                {theme.name}
                              </div>
                              <div className="text-[11px] font-medium text-[#4648D4] dark:text-[#818CF8]">
                                {theme.subtitle}
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-0.5 text-[11px] font-semibold shrink-0">
                              {isLiveSaved && (
                                <span className="text-[#006C49] dark:text-[#34D399]">Live</span>
                              )}
                              {isSelected && (
                                <span className="text-[#4648D4] dark:text-[#818CF8]">
                                  Previewing
                                </span>
                              )}
                            </div>
                          </div>

                          <p className="text-xs text-[#464554] dark:text-slate-300 leading-relaxed">
                            {theme.description}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-slate-200/70 dark:border-slate-800 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setForm({ ...form, siteTheme: theme.id as SiteThemeId })}
                            className={`flex-1 inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                              isSelected
                                ? 'bg-[#4648D4] dark:bg-[#6366F1] text-white'
                                : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#161B22] text-[#0B1C30] dark:text-[#F8FAFC] hover:bg-slate-50 dark:hover:bg-[#1E2430]'
                            }`}
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>{isSelected ? 'Previewing Below' : 'Preview Theme'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setForm({ ...form, siteTheme: theme.id as SiteThemeId });
                              setPreviewFullscreen(true);
                            }}
                            title={`Open ${theme.name} fullscreen preview`}
                            className="inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#161B22] text-xs font-medium text-[#464554] dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1E2430] transition-colors whitespace-nowrap shrink-0"
                          >
                            <Maximize2 className="h-3.5 w-3.5" />
                            <span>Full</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <ThemePreviewPanel
                previewTheme={form.siteTheme}
                liveSavedTheme={liveSavedTheme}
                draftSettings={draftSiteSettings}
                onSelectTheme={(nextTheme) => setForm({ ...form, siteTheme: nextTheme })}
                onMakeLive={handlePublishThemeLive}
                savingLive={saving}
                fullscreen={previewFullscreen}
                onToggleFullscreen={setPreviewFullscreen}
                embedded={true}
              />
            </div>
          );
        }

        return (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <form
                onSubmit={handleSubmit}
                className="lg:col-span-8 bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8 space-y-6"
              >
          {/* TAB 0A: Home Page Text & Header Image */}
          {activeSection === 'home_header' && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-medium text-[#64748B] dark:text-slate-400">
                  Updates the top hero headline, subtitle, search bar, and hero image on the Home page.
                </span>
                <button
                  type="button"
                  onClick={handleRestoreSectionDefaults}
                  className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md border border-slate-200 dark:border-slate-700 text-xs font-medium text-[#464554] dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1E2430] transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Restore Defaults</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#0B1C30] dark:text-[#F8FAFC] mb-1.5">
                    Header Eyebrow / Kicker
                  </label>
                  <input
                    type="text"
                    maxLength={120}
                    value={form.homeHeroEyebrow}
                    onChange={(e) => setForm({ ...form, homeHeroEyebrow: e.target.value })}
                    placeholder="Dalka Jobs — Careers, Tenders & Marketplace"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0B1C30] dark:text-[#F8FAFC] mb-1.5">
                    Hero Search Placeholder
                  </label>
                  <input
                    type="text"
                    maxLength={120}
                    value={form.homeSearchPlaceholder}
                    onChange={(e) => setForm({ ...form, homeSearchPlaceholder: e.target.value })}
                    placeholder="Search role, company, tender, or city..."
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0B1C30] dark:text-[#F8FAFC] mb-1.5">
                  Main Hero Headline *
                </label>
                <input
                  type="text"
                  required
                  maxLength={200}
                  value={form.homeHeroTitle}
                  onChange={(e) => setForm({ ...form, homeHeroTitle: e.target.value })}
                  placeholder="Direct hiring, open tenders, and practical career tools."
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0B1C30] dark:text-[#F8FAFC] mb-1.5">
                  Hero Subtitle / Description
                </label>
                <textarea
                  rows={3}
                  maxLength={500}
                  value={form.homeHeroSubtitle}
                  onChange={(e) => setForm({ ...form, homeHeroSubtitle: e.target.value })}
                  placeholder="Apply directly through each hiring organization's official website or email..."
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0D1117] text-sm text-[#0B1C30] dark:text-[#F1F5F9] focus:outline-none focus:ring-2 focus:ring-[#4648D4]/30 focus:border-[#4648D4]"
                />
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-4">
                <LogoUploadField
                  label="Header Hero Image (Right Panel)"
                  orgName={form.brandName || 'Dalka Jobs'}
                  value={form.homeHeroImageUrl}
                  onChange={(val) => setForm({ ...form, homeHeroImageUrl: val })}
                  presets={HERO_IMAGE_PRESETS}
                  variant="banner"
                  maxDataUriLength={230000}
                  dimensionSteps={[960, 760, 600, 440]}
                  removeLabel="Clear Image"
                  urlPlaceholder="Or paste hero image URL (https://...)"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#0B1C30] dark:text-[#F8FAFC] mb-1.5">
                      Image Caption Title
                    </label>
                    <input
                      type="text"
                      maxLength={120}
                      value={form.homeHeroOverlayTitle}
                      onChange={(e) => setForm({ ...form, homeHeroOverlayTitle: e.target.value })}
                      placeholder="Direct Employer & Procurement Routing"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#0B1C30] dark:text-[#F8FAFC] mb-1.5">
                      Image Caption Subtitle
                    </label>
                    <input
                      type="text"
                      maxLength={260}
                      value={form.homeHeroOverlaySubtitle}
                      onChange={(e) => setForm({ ...form, homeHeroOverlaySubtitle: e.target.value })}
                      placeholder="Every job and tender includes transparent details..."
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 0B: Website Main Logos & Favicon */}
          {activeSection === 'site_branding' && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-medium text-[#64748B] dark:text-slate-400">
                  Applies immediately across the public header, admin console, and browser tab icon.
                </span>
                <button
                  type="button"
                  onClick={handleRestoreSectionDefaults}
                  className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md border border-slate-200 dark:border-slate-700 text-xs font-medium text-[#464554] dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1E2430] transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Restore Defaults</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0B1C30] dark:text-[#F8FAFC] mb-1.5">
                  Website Main Wordmark / Brand Name *
                </label>
                <input
                  type="text"
                  required
                  maxLength={80}
                  value={form.brandName}
                  onChange={(e) => setForm({ ...form, brandName: e.target.value })}
                  placeholder="dalkajobs"
                  className={inputClass}
                />
              </div>

              <div className="space-y-4 pt-1 border-t border-slate-200 dark:border-slate-800">
                <LogoUploadField
                  label="Website Main Logo (Light Mode)"
                  orgName={form.brandName || 'dalkajobs'}
                  value={form.siteLogoLightUrl}
                  onChange={(val) => setForm({ ...form, siteLogoLightUrl: val })}
                  presets={SITE_LOGO_LIGHT_PRESETS}
                  removeLabel="Reset to Default"
                  urlPlaceholder="Or paste light logo URL (https://... or /assets/...)"
                />

                <LogoUploadField
                  label="Website Main Logo (Dark Mode)"
                  orgName={form.brandName || 'dalkajobs'}
                  value={form.siteLogoDarkUrl}
                  onChange={(val) => setForm({ ...form, siteLogoDarkUrl: val })}
                  presets={SITE_LOGO_DARK_PRESETS}
                  darkPreview
                  removeLabel="Use Light Logo"
                  urlPlaceholder="Or paste dark logo URL (optional — falls back to light logo)"
                />

                <LogoUploadField
                  label="Website Browser Tab Icon (Favicon)"
                  orgName={form.brandName || 'dalkajobs'}
                  value={form.siteFaviconUrl}
                  onChange={(val) => setForm({ ...form, siteFaviconUrl: val })}
                  presets={FAVICON_PRESETS}
                  removeLabel="Reset to Default"
                  urlPlaceholder="Or paste favicon URL (https://... or /icon.svg)"
                />
              </div>
            </div>
          )}

          {/* TAB 1: Brand Identity & Direct Contacts */}
          {activeSection === 'contacts' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#0B1C30] dark:text-[#F8FAFC] mb-1.5">
                    Brand Name *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={80}
                    value={form.brandName}
                    onChange={(e) => setForm({ ...form, brandName: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0B1C30] dark:text-[#F8FAFC] mb-1.5">
                    Public Email (Shown as E. in Footer) *
                  </label>
                  <input
                    type="email"
                    required
                    maxLength={160}
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#0B1C30] dark:text-[#F8FAFC] mb-1.5">
                    Phone Number (Shown as T. in Footer) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={40}
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className={`${inputClass} font-mono tabular-nums`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0B1C30] dark:text-[#F8FAFC] mb-1.5">
                    WhatsApp Number (Optional)
                  </label>
                  <input
                    type="text"
                    maxLength={40}
                    value={form.whatsapp}
                    onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                    className={`${inputClass} font-mono tabular-nums`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#0B1C30] dark:text-[#F8FAFC] mb-1.5">
                    Office Address *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={240}
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0B1C30] dark:text-[#F8FAFC] mb-1.5">
                    Office Hours *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={120}
                    value={form.officeHours}
                    onChange={(e) => setForm({ ...form, officeHours: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0B1C30] dark:text-[#F8FAFC] mb-1.5">
                  Platform Tagline *
                </label>
                <input
                  type="text"
                  required
                  maxLength={240}
                  value={form.tagline}
                  onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>
          )}

          {/* TAB 2: About Page Content */}
          {activeSection === 'about_settings' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#0B1C30] dark:text-[#F8FAFC] mb-1.5">
                  About Mission *
                </label>
                <textarea
                  required
                  rows={4}
                  maxLength={2000}
                  value={form.aboutMission}
                  onChange={(e) => setForm({ ...form, aboutMission: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0D1117] text-sm text-[#0B1C30] dark:text-[#F1F5F9] focus:outline-none focus:ring-2 focus:ring-[#4648D4]/30 focus:border-[#4648D4]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0B1C30] dark:text-[#F8FAFC] mb-1.5">
                  About Story *
                </label>
                <textarea
                  required
                  rows={6}
                  maxLength={4000}
                  value={form.aboutStory}
                  onChange={(e) => setForm({ ...form, aboutStory: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0D1117] text-sm text-[#0B1C30] dark:text-[#F1F5F9] focus:outline-none focus:ring-2 focus:ring-[#4648D4]/30 focus:border-[#4648D4]"
                />
              </div>
            </div>
          )}

          {/* TAB 3: Footer Newsletter, About & Copyright */}
          {activeSection === 'footer_intro' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-medium text-[#64748B] dark:text-slate-400">
                  Displayed in the top newsletter strip, Column 1, and bottom copyright bar.
                </span>
                <button
                  type="button"
                  onClick={handleRestoreSectionDefaults}
                  className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md border border-slate-200 dark:border-slate-700 text-xs font-medium text-[#464554] dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1E2430] transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Restore Defaults</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#0B1C30] dark:text-[#F8FAFC] mb-1.5">
                    Newsletter Heading
                  </label>
                  <input
                    type="text"
                    maxLength={120}
                    value={form.footerNewsletterTitle}
                    onChange={(e) => setForm({ ...form, footerNewsletterTitle: e.target.value })}
                    placeholder="Subscribe to our newsletter"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0B1C30] dark:text-[#F8FAFC] mb-1.5">
                    Newsletter Subtitle
                  </label>
                  <input
                    type="text"
                    maxLength={240}
                    value={form.footerNewsletterSubtitle}
                    onChange={(e) => setForm({ ...form, footerNewsletterSubtitle: e.target.value })}
                    placeholder="We'll keep you updated with the best new jobs."
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#0B1C30] dark:text-[#F8FAFC] mb-1.5">
                    Footer About Column Heading
                  </label>
                  <input
                    type="text"
                    maxLength={80}
                    value={form.footerAboutTitle}
                    onChange={(e) => setForm({ ...form, footerAboutTitle: e.target.value })}
                    placeholder="About Us"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0B1C30] dark:text-[#F8FAFC] mb-1.5">
                    Bottom Copyright Line
                  </label>
                  <input
                    type="text"
                    maxLength={200}
                    value={form.footerCopyright}
                    onChange={(e) => setForm({ ...form, footerCopyright: e.target.value })}
                    placeholder="© 2026 Dalka Jobs. All Right Reserved."
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0B1C30] dark:text-[#F8FAFC] mb-1.5">
                  Footer About Description
                </label>
                <textarea
                  rows={3}
                  maxLength={500}
                  value={form.footerAboutText}
                  onChange={(e) => setForm({ ...form, footerAboutText: e.target.value })}
                  placeholder="Short paragraph shown under About Us in the footer..."
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0D1117] text-sm text-[#0B1C30] dark:text-[#F1F5F9] focus:outline-none focus:ring-2 focus:ring-[#4648D4]/30 focus:border-[#4648D4]"
                />
              </div>
            </div>
          )}

          {/* TAB 4: Footer Directory Columns & Links */}
          {activeSection === 'footer_links' && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-[#64748B] dark:text-slate-400">
                  Use internal paths like <span className="font-mono">/jobs</span> or external <span className="font-mono">https://...</span> URLs.
                </p>
                <button
                  type="button"
                  onClick={handleRestoreSectionDefaults}
                  className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md border border-slate-200 dark:border-slate-700 text-xs font-medium text-[#464554] dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1E2430] transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Restore Default Columns</span>
                </button>
              </div>

              {footerColumnsConfig.map((col) => {
                const links = form[col.linksKey];
                return (
                  <div
                    key={col.linksKey}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 bg-[#F8F9FF] dark:bg-[#0D1117] p-4 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex-1 max-w-xs">
                        <label className="block text-[11px] font-semibold text-[#64748B] dark:text-slate-400 mb-1">
                          {col.label} Heading
                        </label>
                        <input
                          type="text"
                          maxLength={60}
                          value={form[col.titleKey]}
                          onChange={(e) => setForm({ ...form, [col.titleKey]: e.target.value })}
                          className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#161B22] text-sm font-semibold text-[#0B1C30] dark:text-[#F8FAFC] focus:outline-none focus:border-[#4648D4]"
                        />
                      </div>
                      <button
                        type="button"
                        disabled={links.length >= 8}
                        onClick={() => addLinkRow(col.linksKey)}
                        className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#161B22] text-xs font-semibold text-[#4648D4] dark:text-[#818CF8] hover:bg-slate-50 dark:hover:bg-[#1E2430] disabled:opacity-50 self-start sm:self-end"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add Link</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {links.map((row, idx) => (
                        <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                          <input
                            type="text"
                            maxLength={60}
                            value={row.label}
                            onChange={(e) => updateLinkRow(col.linksKey, idx, 'label', e.target.value)}
                            placeholder="Label"
                            aria-label={`${col.label} link ${idx + 1} label`}
                            className="col-span-5 h-9 px-2.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#161B22] text-xs text-[#0B1C30] dark:text-[#F1F5F9] focus:outline-none focus:border-[#4648D4]"
                          />
                          <input
                            type="text"
                            maxLength={300}
                            value={row.href}
                            onChange={(e) => updateLinkRow(col.linksKey, idx, 'href', e.target.value)}
                            placeholder="/jobs or https://..."
                            aria-label={`${col.label} link ${idx + 1} URL`}
                            className="col-span-6 h-9 px-2.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#161B22] text-xs font-mono text-[#0B1C30] dark:text-[#F1F5F9] focus:outline-none focus:border-[#4648D4]"
                          />
                          <button
                            type="button"
                            onClick={() => removeLinkRow(col.linksKey, idx)}
                            aria-label={`Remove ${row.label || 'link'}`}
                            className="col-span-1 h-9 inline-flex items-center justify-center rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#161B22] text-[#64748B] hover:text-[#93000A] dark:hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 5: Social Media Links */}
          {activeSection === 'footer_social' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                <div className="w-full sm:w-56">
                  <label className="block text-xs font-semibold text-[#0B1C30] dark:text-[#F8FAFC] mb-1.5">
                    Column Heading
                  </label>
                  <input
                    type="text"
                    maxLength={60}
                    value={form.footerConnectTitle}
                    onChange={(e) => setForm({ ...form, footerConnectTitle: e.target.value })}
                    placeholder="Connect"
                    className={inputClass}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleRestoreSectionDefaults}
                  className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-[#464554] dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1E2430] self-start sm:self-auto"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Restore Defaults</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#0B1C30] dark:text-[#F8FAFC] mb-1.5">
                    LinkedIn URL
                  </label>
                  <input
                    type="url"
                    maxLength={300}
                    value={form.socialLinkedin}
                    onChange={(e) => setForm({ ...form, socialLinkedin: e.target.value })}
                    placeholder="https://linkedin.com/company/dalkajobs"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0B1C30] dark:text-[#F8FAFC] mb-1.5">
                    Twitter / X URL
                  </label>
                  <input
                    type="url"
                    maxLength={300}
                    value={form.socialTwitter}
                    onChange={(e) => setForm({ ...form, socialTwitter: e.target.value })}
                    placeholder="https://x.com/dalkajobs"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0B1C30] dark:text-[#F8FAFC] mb-1.5">
                    Facebook URL
                  </label>
                  <input
                    type="url"
                    maxLength={300}
                    value={form.socialFacebook}
                    onChange={(e) => setForm({ ...form, socialFacebook: e.target.value })}
                    placeholder="https://facebook.com/dalkajobs"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0B1C30] dark:text-[#F8FAFC] mb-1.5">
                    Instagram URL
                  </label>
                  <input
                    type="url"
                    maxLength={300}
                    value={form.socialInstagram}
                    onChange={(e) => setForm({ ...form, socialInstagram: e.target.value })}
                    placeholder="https://instagram.com/dalkajobs"
                    className={inputClass}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#0B1C30] dark:text-[#F8FAFC] mb-1.5">
                    YouTube URL
                  </label>
                  <input
                    type="url"
                    maxLength={300}
                    value={form.socialYoutube}
                    onChange={(e) => setForm({ ...form, socialYoutube: e.target.value })}
                    placeholder="https://youtube.com/@dalkajobs"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end">
            <button
              type="submit"
              disabled={saving}
              className="h-10 px-5 rounded-lg bg-[#4648D4] dark:bg-[#6366F1] text-white text-sm font-semibold hover:bg-[#4F46E5] dark:hover:bg-[#818CF8] disabled:opacity-60"
            >
              {saving ? 'Saving...' : `Save ${currentMeta.tabLabel}`}
            </button>
          </div>
        </form>

        {/* Live Public & Footer Summary Preview */}
        <aside className="lg:col-span-4 lg:sticky lg:top-20 space-y-4">
          <div className="bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-5">
            <div>
              <p className="text-xs font-semibold text-[#4648D4] dark:text-[#818CF8]">
                Live Summary Preview
              </p>
              <div className="mt-2">
                <BrandMark
                  label={form.brandName || 'dalkajobs'}
                  lightLogoUrl={form.siteLogoLightUrl}
                  darkLogoUrl={form.siteLogoDarkUrl}
                />
              </div>
              <p className="mt-2 text-xs text-[#64748B] dark:text-slate-400 leading-relaxed">
                {form.footerAboutText || form.tagline}
              </p>
            </div>

            {(activeSection === 'home_header' || activeSection === 'site_branding') && (
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-[#F8F9FF] dark:bg-[#0D1117] px-3 py-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Palette className="h-3.5 w-3.5 text-[#4648D4] dark:text-[#818CF8] shrink-0" />
                    <span className="text-[11px] font-medium text-[#0B1C30] dark:text-[#F8FAFC] truncate">
                      {SITE_THEMES.find((t) => t.id === form.siteTheme)?.name || 'Classic Editorial'}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#64748B] dark:text-slate-400 shrink-0">
                    Light &amp; Dark
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-[#F8F9FF] dark:bg-[#0D1117] px-3 py-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <SafeImage
                      src={form.siteFaviconUrl || '/icon.svg'}
                      alt="Browser tab icon"
                      className="h-4 w-4 rounded-xs object-contain shrink-0"
                      fallbackIcon={<Globe className="h-3.5 w-3.5" />}
                    />
                    <span className="text-[11px] font-medium text-[#0B1C30] dark:text-[#F8FAFC] truncate">
                      {form.brandName || 'Dalka Jobs'} — Browser Tab
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#64748B] dark:text-slate-400 shrink-0">
                    Favicon
                  </span>
                </div>

                <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden bg-[#F8F9FF] dark:bg-[#0D1117]">
                  <div className="aspect-[16/9] bg-[#EFF4FF] dark:bg-[#1E2430] relative overflow-hidden">
                    <SafeImage
                      src={form.homeHeroImageUrl || DEFAULT_SITE_SETTINGS.homeHeroImageUrl}
                      alt="Home header preview"
                      className="w-full h-full object-cover"
                      fallbackIcon={<ImageIcon className="h-6 w-6" />}
                    />
                    {form.homeHeroOverlayTitle && (
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0B1C30]/90 to-transparent px-3 py-2 text-white">
                        <div className="text-[10px] font-medium text-white/85 truncate">
                          {form.homeHeroOverlayTitle}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-3 space-y-1">
                    <div className="text-[10px] font-semibold text-[#4648D4] dark:text-[#818CF8] truncate">
                      {form.homeHeroEyebrow}
                    </div>
                    <div className="text-xs font-bold text-[#0B1C30] dark:text-[#F8FAFC] leading-snug line-clamp-2">
                      {form.homeHeroTitle}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800 text-sm">
              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 text-[#4648D4] dark:text-[#818CF8] mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs font-medium text-[#64748B] dark:text-slate-400">Phone (T.)</div>
                  <div className="font-mono text-xs font-semibold text-[#0B1C30] dark:text-[#F8FAFC] tabular-nums">
                    {form.phone || '—'}
                  </div>
                </div>
              </div>

              {form.whatsapp.trim() && (
                <div className="flex items-start gap-3">
                  <MessageSquare className="h-4 w-4 text-[#4648D4] dark:text-[#818CF8] mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs font-medium text-[#64748B] dark:text-slate-400">WhatsApp</div>
                    <div className="font-mono text-xs font-semibold text-[#0B1C30] dark:text-[#F8FAFC] tabular-nums">
                      {form.whatsapp}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-[#4648D4] dark:text-[#818CF8] mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs font-medium text-[#64748B] dark:text-slate-400">Email (E.)</div>
                  <div className="text-xs font-semibold text-[#0B1C30] dark:text-[#F8FAFC] break-all">
                    {form.email || '—'}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-[#4648D4] dark:text-[#818CF8] mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs font-medium text-[#64748B] dark:text-slate-400">Office Address</div>
                  <div className="text-xs text-[#0B1C30] dark:text-slate-200 leading-relaxed">
                    {form.address || '—'}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 text-[#4648D4] dark:text-[#818CF8] mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs font-medium text-[#64748B] dark:text-slate-400">Office Hours</div>
                  <div className="text-xs text-[#0B1C30] dark:text-slate-200">
                    {form.officeHours || '—'}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#0B1C30] dark:text-[#F8FAFC]">
                <Globe className="h-3.5 w-3.5 text-[#4648D4] dark:text-[#818CF8]" />
                <span>Footer Configuration</span>
              </div>
              <div className="text-xs text-[#464554] dark:text-slate-300 space-y-1">
                <div>
                  Columns: <span className="font-medium text-[#0B1C30] dark:text-[#F8FAFC]">{form.footerAboutTitle || 'About Us'}</span> ·{' '}
                  <span className="font-medium text-[#0B1C30] dark:text-[#F8FAFC]">{form.footerCol2Title}</span> ({form.footerCol2Links.length}) ·{' '}
                  <span className="font-medium text-[#0B1C30] dark:text-[#F8FAFC]">{form.footerCol3Title}</span> ({form.footerCol3Links.length}) ·{' '}
                  <span className="font-medium text-[#0B1C30] dark:text-[#F8FAFC]">{form.footerCol4Title}</span> ({form.footerCol4Links.length})
                </div>
                <div>
                  Social Profiles Active: <span className="font-mono font-semibold">{activeSocialCount}</span> / 5
                </div>
                <div className="text-[11px] text-[#64748B] dark:text-slate-400 truncate">
                  {form.footerCopyright}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setPreviewFullscreen(true)}
                className="w-full inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-[#F8F9FF] dark:bg-[#0D1117] text-xs font-semibold text-[#4648D4] dark:text-[#818CF8] hover:bg-[#EFF4FF] dark:hover:bg-[#1E2430] transition-colors"
              >
                <Eye className="h-4 w-4" />
                <span>Open Live Website Preview</span>
              </button>
            </div>
          </div>
        </aside>
      </div>

      {previewFullscreen && (
        <ThemePreviewPanel
          previewTheme={form.siteTheme}
          liveSavedTheme={liveSavedTheme}
          draftSettings={draftSiteSettings}
          onSelectTheme={(nextTheme) => setForm({ ...form, siteTheme: nextTheme })}
          onMakeLive={handlePublishThemeLive}
          savingLive={saving}
          fullscreen={true}
          onToggleFullscreen={setPreviewFullscreen}
          embedded={false}
        />
      )}
    </>
  );
})()}
    </div>
  );
}
