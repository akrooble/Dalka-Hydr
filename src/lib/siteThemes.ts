import { SiteThemeId } from '../types/dalka';

export interface SiteThemeDefinition {
  id: SiteThemeId;
  name: string;
  subtitle: string;
  description: string;
  typography: string;
  layoutStyle: string;
  lightSwatch: { bg: string; card: string; ink: string; accent: string };
  darkSwatch: { bg: string; card: string; ink: string; accent: string };
  highlights: string[];
}

export const SITE_THEMES: SiteThemeDefinition[] = [
  {
    id: 'classic',
    name: 'Classic Editorial',
    subtitle: 'Original Dalka Jobs Design',
    description:
      'Balanced 7/5 hero split, clean hairline cards, crisp indigo accents, and focused left-sidebar split views for Jobs and Tenders.',
    typography: 'Plus Jakarta Sans + IBM Plex Mono',
    layoutStyle: 'Rounded-xl cards · 1px Hairline borders',
    lightSwatch: { bg: '#F8F9FF', card: '#FFFFFF', ink: '#0B1C30', accent: '#4648D4' },
    darkSwatch: { bg: '#0D1117', card: '#161B22', ink: '#F8FAFC', accent: '#6366F1' },
    highlights: [
      'Asymmetric 7/5 Hero + 4-column metric bar',
      'Organization banner cards on Home',
      'Compact sticky sidebar + split detail panel',
    ],
  },
  {
    id: 'modern_bento',
    name: 'Modern Horizon Bento',
    subtitle: 'Centered SaaS & Bento Grid',
    description:
      'Contemporary tech portal featuring a centered spotlight hero, framed search dock, soft elevated rounded-2xl bento modules, and wide visual showcases.',
    typography: 'Outfit + Plus Jakarta Sans + IBM Plex Mono',
    layoutStyle: 'Rounded-2xl elevated bento · Soft surfaces',
    lightSwatch: { bg: '#F4F6FB', card: '#FFFFFF', ink: '#0F172A', accent: '#4648D4' },
    darkSwatch: { bg: '#090D16', card: '#111827', ink: '#F8FAFC', accent: '#6366F1' },
    highlights: [
      'Centered command search hero & panoramic banner',
      '2-column featured bento cards & quick-stat tiles',
      'Floating framed header & elevated footer card',
    ],
  },
  {
    id: 'swiss_editorial',
    name: 'Swiss Broadsheet',
    subtitle: 'Executive Directory & Press Grid',
    description:
      'High-authority institutional design inspired by financial broadsheets and architectural monographs—sharp grid rules, editorial serif headlines, and tabular ledgers.',
    typography: 'Fraunces Serif + Plus Jakarta Sans + IBM Plex Mono',
    layoutStyle: 'Sharp 0px/2px corners · Architectural 1px/2px rules',
    lightSwatch: { bg: '#FAFAFA', card: '#FFFFFF', ink: '#0A0C10', accent: '#4648D4' },
    darkSwatch: { bg: '#0A0C10', card: '#12151C', ink: '#F8FAFC', accent: '#818CF8' },
    highlights: [
      'Masthead navigation & large Fraunces display type',
      'Scannable tabular directory ledger for Jobs & Tenders',
      'Double-ruled broadsheet Footer & article reader',
    ],
  },
];

export function resolveSiteTheme(theme?: string | null): SiteThemeId {
  if (theme === 'modern_bento' || theme === 'swiss_editorial' || theme === 'classic') {
    return theme;
  }
  return 'classic';
}

export function getSiteThemeDefinition(theme?: string | null): SiteThemeDefinition {
  const id = resolveSiteTheme(theme);
  return SITE_THEMES.find((t) => t.id === id) || SITE_THEMES[0];
}
