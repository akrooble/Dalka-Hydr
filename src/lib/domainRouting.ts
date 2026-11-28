function normalizeHost(raw?: string): string {
  if (!raw) return '';
  return raw
    .trim()
    .replace(/^https?:\/\//i, '')
    .split('/')[0]
    .split(':')[0]
    .toLowerCase();
}

export function getConfiguredAdminDomain(): string {
  return normalizeHost(import.meta.env.VITE_ADMIN_DOMAIN as string | undefined);
}

export function isAdminHost(hostname?: string): boolean {
  const host = normalizeHost(
    hostname ?? (typeof window !== 'undefined' ? window.location.hostname : ''),
  );
  if (!host) return false;

  const configured = getConfiguredAdminDomain();
  if (configured && host === configured) {
    return true;
  }

  return host.startsWith('admin.');
}

export function getPublicSiteHref(): string {
  const configuredPublic = (import.meta.env.VITE_PUBLIC_SITE_URL as string | undefined)?.trim();
  if (configuredPublic) {
    if (/^https?:\/\//i.test(configuredPublic)) {
      return configuredPublic;
    }
    return `https://${configuredPublic}`;
  }

  if (typeof window !== 'undefined' && isAdminHost(window.location.hostname)) {
    const rootHost = window.location.hostname.replace(/^admin\./i, '');
    if (rootHost && rootHost !== window.location.hostname) {
      const port = window.location.port ? `:${window.location.port}` : '';
      return `${window.location.protocol}//${rootHost}${port}`;
    }
  }

  return '/';
}

export function getAdminPortalLink(): { external: boolean; href: string } {
  const configuredAdmin = getConfiguredAdminDomain();
  if (typeof window !== 'undefined' && configuredAdmin) {
    const currentHost = normalizeHost(window.location.hostname);
    const isLocalOrPreview =
      currentHost === 'localhost' ||
      currentHost === '127.0.0.1' ||
      currentHost.endsWith('.run.app');

    if (!isLocalOrPreview && currentHost !== configuredAdmin) {
      return {
        external: true,
        href: `https://${configuredAdmin}`,
      };
    }
  }

  return {
    external: false,
    href: '/admin',
  };
}
