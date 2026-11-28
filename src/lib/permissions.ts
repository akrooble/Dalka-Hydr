import { AdminPermission, AdminRole, AdminTab } from '../types/dalka';

export const ALL_PERMISSIONS: AdminPermission[] = [
  'overview',
  'jobs',
  'tenders',
  'marketplace',
  'blogs',
  'leads',
  'newsletter',
  'contacts',
  'footer',
  'team',
];

export interface PermissionDefinition {
  id: AdminPermission;
  label: string;
  description: string;
  group: 'Workspace' | 'Content' | 'Outreach' | 'Brand & Access';
}

export const PERMISSION_DEFINITIONS: PermissionDefinition[] = [
  {
    id: 'overview',
    label: 'Dashboard Overview',
    description: 'View workspace stats and catalog overview.',
    group: 'Workspace',
  },
  {
    id: 'jobs',
    label: 'Manage Jobs',
    description: 'Create, edit, feature, and delete job postings.',
    group: 'Content',
  },
  {
    id: 'tenders',
    label: 'Manage Tenders',
    description: 'Create, edit, award, and delete institutional tenders.',
    group: 'Content',
  },
  {
    id: 'marketplace',
    label: 'Manage Marketplace',
    description: 'Publish digital goods, books, and pricing updates.',
    group: 'Content',
  },
  {
    id: 'blogs',
    label: 'Manage Blogs',
    description: 'Write, publish, and remove career & insight articles.',
    group: 'Content',
  },
  {
    id: 'leads',
    label: 'Visitor Leads',
    description: 'View, mark contacted, export CSV, and delete leads.',
    group: 'Outreach',
  },
  {
    id: 'newsletter',
    label: 'Newsletter Subscribers',
    description: 'View, search, export CSV, and remove email subscribers.',
    group: 'Outreach',
  },
  {
    id: 'contacts',
    label: 'Home, Branding, Contacts & About',
    description: 'Edit Home header copy/image, website logo & favicon, contacts, and About page.',
    group: 'Brand & Access',
  },
  {
    id: 'footer',
    label: 'Footer & Social Links',
    description: 'Edit newsletter strip, footer columns, social links, and copyright.',
    group: 'Brand & Access',
  },
  {
    id: 'team',
    label: 'Team & Roles',
    description: 'Invite staff, assign roles & permissions, and manage access.',
    group: 'Brand & Access',
  },
];

export interface RoleDefinition {
  id: AdminRole;
  label: string;
  summary: string;
  defaultPermissions: AdminPermission[];
}

export const ADMIN_ROLES: RoleDefinition[] = [
  {
    id: 'super_admin',
    label: 'Super Admin',
    summary: 'Full access to all listings, leads, newsletter, settings, and team roles.',
    defaultPermissions: [...ALL_PERMISSIONS],
  },
  {
    id: 'editor',
    label: 'Content Editor',
    summary: 'Create and update jobs, tenders, marketplace items, and blog posts.',
    defaultPermissions: ['overview', 'jobs', 'tenders', 'marketplace', 'blogs'],
  },
  {
    id: 'recruiter',
    label: 'Recruiter & Leads',
    summary: 'Manage jobs, tenders, visitor leads, and newsletter subscribers.',
    defaultPermissions: ['overview', 'jobs', 'tenders', 'leads', 'newsletter'],
  },
  {
    id: 'moderator',
    label: 'Outreach Coordinator',
    summary: 'Handle visitor leads and newsletter subscriber lists.',
    defaultPermissions: ['overview', 'leads', 'newsletter'],
  },
  {
    id: 'custom',
    label: 'Custom Role',
    summary: 'Pick specific module permissions tailored to this staff member.',
    defaultPermissions: ['overview'],
  },
];

export function getRoleLabel(role: AdminRole | 'admin' | string | undefined): string {
  if (role === 'admin' || role === 'super_admin') return 'Super Admin';
  const match = ADMIN_ROLES.find((r) => r.id === role);
  return match ? match.label : 'Team Member';
}

export function getPermissionsForRole(role: AdminRole | 'admin'): AdminPermission[] {
  if (role === 'admin') return [...ALL_PERMISSIONS];
  const found = ADMIN_ROLES.find((r) => r.id === role);
  return found ? [...found.defaultPermissions] : ['overview'];
}

export function normalizePermissions(
  permissions: string[] | undefined,
  role?: AdminRole | 'admin',
): AdminPermission[] {
  if (role === 'super_admin' || role === 'admin') {
    return [...ALL_PERMISSIONS];
  }
  const allowSet = new Set<AdminPermission>(ALL_PERMISSIONS);
  const filtered = (permissions || []).filter((p): p is AdminPermission =>
    allowSet.has(p as AdminPermission),
  );
  if (!filtered.includes('overview')) {
    filtered.unshift('overview');
  }
  return Array.from(new Set(filtered));
}

export function hasAdminPermission(
  permissions: AdminPermission[],
  required: AdminPermission,
): boolean {
  return permissions.includes('team') && permissions.length === ALL_PERMISSIONS.length
    ? true
    : permissions.includes(required);
}

export const TAB_REQUIRED_PERMISSION: Record<AdminTab, AdminPermission> = {
  overview: 'overview',
  jobs: 'jobs',
  tenders: 'tenders',
  marketplace: 'marketplace',
  blogs: 'blogs',
  leads: 'leads',
  newsletter: 'newsletter',
  home_header: 'contacts',
  site_branding: 'contacts',
  site_theme: 'contacts',
  contacts: 'contacts',
  about_settings: 'contacts',
  footer_intro: 'footer',
  footer_links: 'footer',
  footer_social: 'footer',
  team: 'team',
};

export async function emailToInviteId(email: string): Promise<string> {
  const normalized = email.trim().toLowerCase();
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const data = new TextEncoder().encode(normalized);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hex = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    return `inv-${hex.slice(0, 40)}`;
  }
  // Fallback deterministic alphanumeric ID if crypto.subtle unavailable
  let h1 = 0x811c9dc5;
  for (let i = 0; i < normalized.length; i += 1) {
    h1 ^= normalized.charCodeAt(i);
    h1 = Math.imul(h1, 0x01000193);
  }
  return `inv-${(h1 >>> 0).toString(16)}`;
}
