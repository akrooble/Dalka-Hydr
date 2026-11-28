import { useEffect } from 'react';

const DEFAULT_FAVICON_URL = '/icon.svg';
const DEFAULT_APPLE_TOUCH_URL = '/apple-touch-icon.png';

function setLinkHref(selector: string, href: string, rel: string, type?: string) {
  let link = document.querySelector<HTMLLinkElement>(selector);
  if (!link) {
    link = document.createElement('link');
    link.rel = rel;
    if (type) link.type = type;
    document.head.appendChild(link);
  }
  link.href = href;
}

export function useSiteFavicon(siteFaviconUrl?: string) {
  useEffect(() => {
    const trimmed = siteFaviconUrl?.trim();
    const isCustom = Boolean(trimmed && trimmed !== DEFAULT_FAVICON_URL);

    if (isCustom && trimmed) {
      document.querySelectorAll<HTMLLinkElement>('link[rel="icon"]').forEach((el) => {
        el.href = trimmed;
        if (trimmed.startsWith('data:image/svg+xml')) {
          el.type = 'image/svg+xml';
        } else if (trimmed.startsWith('data:image/webp')) {
          el.type = 'image/webp';
        } else {
          el.removeAttribute('type');
        }
      });
      if (!document.querySelector('link[rel="icon"]')) {
        setLinkHref('link[rel="icon"]', trimmed, 'icon');
      }
      setLinkHref('link[rel="apple-touch-icon"]', trimmed, 'apple-touch-icon');
    } else {
      const iconLinks = document.querySelectorAll<HTMLLinkElement>('link[rel="icon"]');
      if (iconLinks.length >= 2) {
        iconLinks[0].href = DEFAULT_FAVICON_URL;
        iconLinks[0].type = 'image/svg+xml';
        iconLinks[1].href = '/pwa-192x192.png';
        iconLinks[1].type = 'image/png';
      } else {
        setLinkHref('link[rel="icon"]', DEFAULT_FAVICON_URL, 'icon', 'image/svg+xml');
      }
      setLinkHref('link[rel="apple-touch-icon"]', DEFAULT_APPLE_TOUCH_URL, 'apple-touch-icon');
    }
  }, [siteFaviconUrl]);
}
