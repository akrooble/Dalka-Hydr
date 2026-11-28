const DEFAULT_LIGHT_LOGO = '/assets/aistudio/PROFILES-03_b5c8cc84.png';
const DEFAULT_DARK_LOGO = '/assets/aistudio/PROFILES-04_73f47e70.png';

interface BrandMarkProps {
  label?: string;
  size?: 'sm' | 'md';
  lightLogoUrl?: string;
  darkLogoUrl?: string;
  forceDark?: boolean;
}

export function BrandMark({
  label = 'dalkajobs',
  size = 'sm',
  lightLogoUrl,
  darkLogoUrl,
  forceDark = false,
}: BrandMarkProps) {
  const boxClass = size === 'md' ? 'h-8 w-8' : 'h-7 w-7';
  const textClass = forceDark
    ? size === 'md'
      ? 'text-xl font-bold tracking-tight text-white'
      : 'text-[19px] font-bold tracking-tight text-white'
    : size === 'md'
      ? 'text-xl font-bold tracking-tight text-[#0B1C30] dark:text-[#F8FAFC]'
      : 'text-[19px] font-bold tracking-tight text-[#0B1C30] dark:text-[#F8FAFC]';

  const resolvedLight = lightLogoUrl?.trim() || DEFAULT_LIGHT_LOGO;
  const hasCustomLight = Boolean(lightLogoUrl?.trim() && lightLogoUrl.trim() !== DEFAULT_LIGHT_LOGO);
  const resolvedDark =
    darkLogoUrl?.trim() || (hasCustomLight ? resolvedLight : DEFAULT_DARK_LOGO);

  const lightIsDefault = resolvedLight === DEFAULT_LIGHT_LOGO;
  const darkIsDefault = resolvedDark === DEFAULT_DARK_LOGO;

  if (forceDark) {
    return (
      <span className="inline-flex items-center gap-2 whitespace-nowrap shrink-0">
        <span
          className={`inline-flex ${boxClass} items-center justify-center overflow-hidden rounded bg-[#161B22] border border-slate-700`}
        >
          <img
            src={resolvedDark}
            alt={`${label} icon`}
            referrerPolicy="no-referrer"
            className={`h-full w-full object-contain ${darkIsDefault ? 'scale-[1.85]' : ''}`}
          />
        </span>
        <span className={textClass}>{label}</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap shrink-0">
      <span className={`inline-flex ${boxClass} items-center justify-center overflow-hidden rounded`}>
        <img
          src={resolvedLight}
          alt={`${label} icon`}
          referrerPolicy="no-referrer"
          className={`h-full w-full object-contain dark:hidden ${
            lightIsDefault ? 'scale-[2.15]' : ''
          }`}
        />
        <img
          src={resolvedDark}
          alt={`${label} icon`}
          referrerPolicy="no-referrer"
          className={`hidden h-full w-full object-contain dark:block ${
            darkIsDefault ? 'scale-[1.85]' : ''
          }`}
        />
      </span>
      <span className={textClass}>{label}</span>
    </span>
  );
}
