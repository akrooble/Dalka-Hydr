export type JobEmploymentType =
  | 'Full-time'
  | 'Part-time'
  | 'Contract'
  | 'Internship'
  | 'Consultancy';

export type JobStatus = 'active' | 'closed';

export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  deadline: string;
  category: string;
  salary: string;
  employmentType: JobEmploymentType;
  description: string;
  externalUrl?: string;
  applyEmail?: string;
  logoUrl?: string;
  status: JobStatus;
  featured: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export type TenderStatus = 'open' | 'awarded' | 'closed';

export interface TenderNotice {
  id: string;
  title: string;
  organization: string;
  location: string;
  deadline: string;
  category: string;
  budget: string;
  referenceNo: string;
  description: string;
  externalUrl?: string;
  applyEmail?: string;
  logoUrl?: string;
  status: TenderStatus;
  featured: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export type MarketplaceCategory = 'digital_good' | 'book' | 'ecommerce';

export interface MarketplaceItem {
  id: string;
  title: string;
  category: MarketplaceCategory;
  price: number;
  currency: string;
  description: string;
  imageUrl?: string;
  deliveryNote?: string;
  inStock: boolean;
  featured: boolean;
  status: 'published' | 'draft';
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category: string;
  author: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  readTime: string;
  status: 'published' | 'draft';
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface FooterLink {
  label: string;
  href: string;
}

export type SiteThemeId = 'classic' | 'modern_bento' | 'swiss_editorial';

export interface SiteSettings {
  brandName: string;
  tagline: string;
  email: string;
  phone: string;
  whatsapp?: string;
  address: string;
  officeHours: string;
  aboutMission: string;
  aboutStory: string;
  footerNewsletterTitle?: string;
  footerNewsletterSubtitle?: string;
  footerAboutTitle?: string;
  footerAboutText?: string;
  footerCol2Title?: string;
  footerCol2Links?: FooterLink[];
  footerCol3Title?: string;
  footerCol3Links?: FooterLink[];
  footerCol4Title?: string;
  footerCol4Links?: FooterLink[];
  footerConnectTitle?: string;
  socialLinkedin?: string;
  socialTwitter?: string;
  socialFacebook?: string;
  socialInstagram?: string;
  socialYoutube?: string;
  footerCopyright?: string;
  homeHeroEyebrow?: string;
  homeHeroTitle?: string;
  homeHeroSubtitle?: string;
  homeSearchPlaceholder?: string;
  homeHeroImageUrl?: string;
  homeHeroOverlayTitle?: string;
  homeHeroOverlaySubtitle?: string;
  siteLogoLightUrl?: string;
  siteLogoDarkUrl?: string;
  siteFaviconUrl?: string;
  siteTheme?: SiteThemeId;
  updatedAt?: unknown;
}

export type LeadSource = 'contacts' | 'marketplace';

export interface VisitorLeadInput {
  fullName: string;
  phone: string;
  location?: string;
  email?: string;
  higherEducation?: string;
  source: LeadSource;
  itemId?: string;
  itemTitle?: string;
  message?: string;
}

export type VisitorLeadStatus = 'new' | 'contacted';

export interface VisitorLead extends VisitorLeadInput {
  id: string;
  status: VisitorLeadStatus;
  createdAt?: unknown;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  source: 'footer';
  createdAt?: unknown;
}

export type AdminPermission =
  | 'overview'
  | 'jobs'
  | 'tenders'
  | 'marketplace'
  | 'blogs'
  | 'leads'
  | 'newsletter'
  | 'contacts'
  | 'footer'
  | 'team';

export type AdminRole =
  | 'super_admin'
  | 'editor'
  | 'recruiter'
  | 'moderator'
  | 'custom';

export type AdminMemberStatus = 'active' | 'suspended';

export interface AdminMember {
  id: string;
  email: string;
  displayName?: string;
  role: AdminRole | 'admin';
  permissions: AdminPermission[];
  status: AdminMemberStatus;
  inviteId?: string;
  invitedBy?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export type TeamInviteStatus = 'pending' | 'claimed' | 'revoked';

export interface TeamInvite {
  id: string;
  email: string;
  displayName?: string;
  role: AdminRole;
  permissions: AdminPermission[];
  status: TeamInviteStatus;
  invitedBy: string;
  claimedUid?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export type AccessRequestStatus = 'pending' | 'approved' | 'rejected';

export interface AccessRequest {
  id: string;
  email: string;
  displayName?: string;
  status: AccessRequestStatus;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export type AdminAccessStatus =
  | 'unauthenticated'
  | 'unverified'
  | 'checking'
  | 'active'
  | 'pending_approval'
  | 'rejected'
  | 'suspended';

export type SiteSettingsSection =
  | 'home_header'
  | 'site_branding'
  | 'site_theme'
  | 'contacts'
  | 'about_settings'
  | 'footer_intro'
  | 'footer_links'
  | 'footer_social';

export type AdminTab =
  | 'overview'
  | 'jobs'
  | 'tenders'
  | 'marketplace'
  | 'blogs'
  | 'leads'
  | 'newsletter'
  | SiteSettingsSection
  | 'team';
