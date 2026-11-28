import {
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import {
  AccessRequest,
  AdminMemberStatus,
  AdminPermission,
  AdminRole,
  BlogPost,
  FooterLink,
  JobListing,
  MarketplaceItem,
  SiteSettings,
  SiteSettingsSection,
  SiteThemeId,
  TeamInvite,
  TenderNotice,
  VisitorLeadStatus,
} from '../types/dalka';
import { db, handleFirestoreError, OperationType } from './firebase';
import { emailToInviteId, normalizePermissions } from './permissions';
import {
  DEFAULT_SITE_SETTINGS,
  STARTER_BLOGS,
  STARTER_JOBS,
  STARTER_MARKETPLACE,
  STARTER_TENDERS,
} from './seedData';

export const ADMIN_EMAIL = 'akrooble@gmail.com';

export function makeSafeDocId(prefix: string, title: string): string {
  const clean = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  const rand = Math.random().toString(36).slice(2, 6);
  const base = clean || 'item';
  return `${prefix}-${base}-${rand}`.slice(0, 120);
}

export function normalizeSlug(value: string): string {
  const clean = value
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 140);
  return clean.length >= 2 ? clean : `post-${Date.now()}`;
}

function clampRequired(value: string, maxLen: number): string {
  return value.trim().slice(0, maxLen);
}

function clampOptional(value: string | undefined, maxLen: number): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, maxLen);
}

function clampLogoUrl(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (trimmed.length > 65536) {
    throw new Error('Company/organization logo image is too large. Please upload a smaller image or use a URL.');
  }
  return trimmed;
}

export async function saveJob(
  data: Omit<JobListing, 'id' | 'createdAt' | 'updatedAt'>,
  existingId?: string,
): Promise<string> {
  const jobId = existingId || makeSafeDocId('job', data.title);
  const docPath = `jobs/${jobId}`;
  const docRef = doc(db, 'jobs', jobId);

  const externalUrl = clampOptional(data.externalUrl, 500);
  const applyEmail = clampOptional(data.applyEmail, 160);
  const logoUrl = clampLogoUrl(data.logoUrl);

  const baseFields = {
    title: clampRequired(data.title, 160),
    company: clampRequired(data.company, 120),
    location: clampRequired(data.location, 120),
    deadline: clampRequired(data.deadline, 40),
    category: clampRequired(data.category, 80),
    salary: clampRequired(data.salary, 80),
    employmentType: data.employmentType,
    description: clampRequired(data.description, 6000),
    status: data.status,
    featured: Boolean(data.featured),
    updatedAt: serverTimestamp(),
  };

  try {
    if (existingId) {
      await updateDoc(docRef, {
        ...baseFields,
        externalUrl: externalUrl ?? deleteField(),
        applyEmail: applyEmail ?? deleteField(),
        logoUrl: logoUrl ?? deleteField(),
      });
    } else {
      const payload: Record<string, unknown> = {
        ...baseFields,
        createdAt: serverTimestamp(),
      };
      if (externalUrl) payload.externalUrl = externalUrl;
      if (applyEmail) payload.applyEmail = applyEmail;
      if (logoUrl) payload.logoUrl = logoUrl;
      await setDoc(docRef, payload);
    }
    return jobId;
  } catch (error) {
    handleFirestoreError(error, existingId ? OperationType.UPDATE : OperationType.CREATE, docPath);
  }
}

export async function deleteJob(jobId: string): Promise<void> {
  const docPath = `jobs/${jobId}`;
  try {
    await deleteDoc(doc(db, 'jobs', jobId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

export async function saveTender(
  data: Omit<TenderNotice, 'id' | 'createdAt' | 'updatedAt'>,
  existingId?: string,
): Promise<string> {
  const tenderId = existingId || makeSafeDocId('tender', data.title);
  const docPath = `tenders/${tenderId}`;
  const docRef = doc(db, 'tenders', tenderId);

  const externalUrl = clampOptional(data.externalUrl, 500);
  const applyEmail = clampOptional(data.applyEmail, 160);
  const logoUrl = clampLogoUrl(data.logoUrl);

  const baseFields = {
    title: clampRequired(data.title, 180),
    organization: clampRequired(data.organization, 140),
    location: clampRequired(data.location, 120),
    deadline: clampRequired(data.deadline, 40),
    category: clampRequired(data.category, 80),
    budget: clampRequired(data.budget, 80),
    referenceNo: clampRequired(data.referenceNo, 60),
    description: clampRequired(data.description, 6000),
    status: data.status,
    featured: Boolean(data.featured),
    updatedAt: serverTimestamp(),
  };

  try {
    if (existingId) {
      await updateDoc(docRef, {
        ...baseFields,
        externalUrl: externalUrl ?? deleteField(),
        applyEmail: applyEmail ?? deleteField(),
        logoUrl: logoUrl ?? deleteField(),
      });
    } else {
      const payload: Record<string, unknown> = {
        ...baseFields,
        createdAt: serverTimestamp(),
      };
      if (externalUrl) payload.externalUrl = externalUrl;
      if (applyEmail) payload.applyEmail = applyEmail;
      if (logoUrl) payload.logoUrl = logoUrl;
      await setDoc(docRef, payload);
    }
    return tenderId;
  } catch (error) {
    handleFirestoreError(error, existingId ? OperationType.UPDATE : OperationType.CREATE, docPath);
  }
}

export async function deleteTender(tenderId: string): Promise<void> {
  const docPath = `tenders/${tenderId}`;
  try {
    await deleteDoc(doc(db, 'tenders', tenderId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

export async function saveMarketplaceItem(
  data: Omit<MarketplaceItem, 'id' | 'createdAt' | 'updatedAt'>,
  existingId?: string,
): Promise<string> {
  const itemId = existingId || makeSafeDocId('item', data.title);
  const docPath = `marketplaceItems/${itemId}`;
  const docRef = doc(db, 'marketplaceItems', itemId);

  const imageUrl = clampOptional(data.imageUrl, 500);
  const deliveryNote = clampOptional(data.deliveryNote, 200);
  const priceNum = Number.isFinite(data.price) ? Math.max(0, Math.min(1000000, Number(data.price))) : 0;

  const baseFields = {
    title: clampRequired(data.title, 140),
    category: data.category,
    price: priceNum,
    currency: clampRequired(data.currency || 'USD', 6).toUpperCase(),
    description: clampRequired(data.description, 4000),
    inStock: Boolean(data.inStock),
    featured: Boolean(data.featured),
    status: data.status,
    updatedAt: serverTimestamp(),
  };

  try {
    if (existingId) {
      await updateDoc(docRef, {
        ...baseFields,
        imageUrl: imageUrl ?? deleteField(),
        deliveryNote: deliveryNote ?? deleteField(),
      });
    } else {
      const payload: Record<string, unknown> = {
        ...baseFields,
        createdAt: serverTimestamp(),
      };
      if (imageUrl) payload.imageUrl = imageUrl;
      if (deliveryNote) payload.deliveryNote = deliveryNote;
      await setDoc(docRef, payload);
    }
    return itemId;
  } catch (error) {
    handleFirestoreError(error, existingId ? OperationType.UPDATE : OperationType.CREATE, docPath);
  }
}

export async function deleteMarketplaceItem(itemId: string): Promise<void> {
  const docPath = `marketplaceItems/${itemId}`;
  try {
    await deleteDoc(doc(db, 'marketplaceItems', itemId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

export async function saveBlogPost(
  data: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>,
  existingId?: string,
): Promise<string> {
  const blogId = existingId || makeSafeDocId('blog', data.title);
  const docPath = `blogs/${blogId}`;
  const docRef = doc(db, 'blogs', blogId);

  const coverImage = clampOptional(data.coverImage, 500);
  const slug = normalizeSlug(data.slug || data.title);

  const baseFields = {
    title: clampRequired(data.title, 180),
    slug,
    category: clampRequired(data.category, 80),
    author: clampRequired(data.author, 100),
    excerpt: clampRequired(data.excerpt, 400),
    content: clampRequired(data.content, 15000),
    readTime: clampRequired(data.readTime, 30),
    status: data.status,
    updatedAt: serverTimestamp(),
  };

  try {
    if (existingId) {
      await updateDoc(docRef, {
        ...baseFields,
        coverImage: coverImage ?? deleteField(),
      });
    } else {
      const payload: Record<string, unknown> = {
        ...baseFields,
        createdAt: serverTimestamp(),
      };
      if (coverImage) payload.coverImage = coverImage;
      await setDoc(docRef, payload);
    }
    return blogId;
  } catch (error) {
    handleFirestoreError(error, existingId ? OperationType.UPDATE : OperationType.CREATE, docPath);
  }
}

export async function deleteBlogPost(blogId: string): Promise<void> {
  const docPath = `blogs/${blogId}`;
  try {
    await deleteDoc(doc(db, 'blogs', blogId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

function clampFooterLinks(links: FooterLink[] | undefined): FooterLink[] {
  if (!Array.isArray(links)) return [];
  return links
    .map((item) => ({
      label: clampRequired(item.label || '', 60),
      href: clampRequired(item.href || '', 300),
    }))
    .filter((item) => item.label.length > 0 && item.href.length > 0)
    .slice(0, 8);
}

function clampOptionalStrictLength(
  value: string | undefined,
  maxLen: number,
  label: string,
): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (trimmed.length > maxLen) {
    throw new Error(`${label} is too large. Please upload a smaller image or use a shorter URL.`);
  }
  return trimmed;
}

function normalizeSiteTheme(value: unknown): SiteThemeId {
  if (value === 'modern_bento' || value === 'swiss_editorial' || value === 'classic') {
    return value;
  }
  return 'classic';
}

function buildNormalizedSitePayload(data: Omit<SiteSettings, 'updatedAt'>) {
  const whatsapp = clampOptional(data.whatsapp, 40);
  const footerNewsletterTitle = clampOptional(data.footerNewsletterTitle, 120);
  const footerNewsletterSubtitle = clampOptional(data.footerNewsletterSubtitle, 240);
  const footerAboutTitle = clampOptional(data.footerAboutTitle, 80);
  const footerAboutText = clampOptional(data.footerAboutText, 500);
  const footerCol2Title = clampOptional(data.footerCol2Title, 60);
  const footerCol3Title = clampOptional(data.footerCol3Title, 60);
  const footerCol4Title = clampOptional(data.footerCol4Title, 60);
  const footerConnectTitle = clampOptional(data.footerConnectTitle, 60);
  const socialLinkedin = clampOptional(data.socialLinkedin, 300);
  const socialTwitter = clampOptional(data.socialTwitter, 300);
  const socialFacebook = clampOptional(data.socialFacebook, 300);
  const socialInstagram = clampOptional(data.socialInstagram, 300);
  const socialYoutube = clampOptional(data.socialYoutube, 300);
  const footerCopyright = clampOptional(data.footerCopyright, 200);
  const homeHeroEyebrow = clampOptional(data.homeHeroEyebrow, 120);
  const homeHeroTitle = clampOptional(data.homeHeroTitle, 200);
  const homeHeroSubtitle = clampOptional(data.homeHeroSubtitle, 500);
  const homeSearchPlaceholder = clampOptional(data.homeSearchPlaceholder, 120);
  const homeHeroImageUrl = clampOptionalStrictLength(data.homeHeroImageUrl, 262144, 'Header hero image');
  const homeHeroOverlayTitle = clampOptional(data.homeHeroOverlayTitle, 120);
  const homeHeroOverlaySubtitle = clampOptional(data.homeHeroOverlaySubtitle, 260);
  const siteLogoLightUrl = clampOptionalStrictLength(data.siteLogoLightUrl, 65536, 'Light mode logo');
  const siteLogoDarkUrl = clampOptionalStrictLength(data.siteLogoDarkUrl, 65536, 'Dark mode logo');
  const siteFaviconUrl = clampOptionalStrictLength(data.siteFaviconUrl, 65536, 'Website favicon');

  const footerCol2Links = clampFooterLinks(data.footerCol2Links);
  const footerCol3Links = clampFooterLinks(data.footerCol3Links);
  const footerCol4Links = clampFooterLinks(data.footerCol4Links);

  const payload: Record<string, unknown> = {
    brandName: clampRequired(data.brandName, 80),
    tagline: clampRequired(data.tagline, 240),
    email: clampRequired(data.email, 160),
    phone: clampRequired(data.phone, 40),
    address: clampRequired(data.address, 240),
    officeHours: clampRequired(data.officeHours, 120),
    aboutMission: clampRequired(data.aboutMission, 2000),
    aboutStory: clampRequired(data.aboutStory, 4000),
    footerCol2Links,
    footerCol3Links,
    footerCol4Links,
    updatedAt: serverTimestamp(),
  };

  if (whatsapp) payload.whatsapp = whatsapp;
  if (footerNewsletterTitle) payload.footerNewsletterTitle = footerNewsletterTitle;
  if (footerNewsletterSubtitle) payload.footerNewsletterSubtitle = footerNewsletterSubtitle;
  if (footerAboutTitle) payload.footerAboutTitle = footerAboutTitle;
  if (footerAboutText) payload.footerAboutText = footerAboutText;
  if (footerCol2Title) payload.footerCol2Title = footerCol2Title;
  if (footerCol3Title) payload.footerCol3Title = footerCol3Title;
  if (footerCol4Title) payload.footerCol4Title = footerCol4Title;
  if (footerConnectTitle) payload.footerConnectTitle = footerConnectTitle;
  if (socialLinkedin) payload.socialLinkedin = socialLinkedin;
  if (socialTwitter) payload.socialTwitter = socialTwitter;
  if (socialFacebook) payload.socialFacebook = socialFacebook;
  if (socialInstagram) payload.socialInstagram = socialInstagram;
  if (socialYoutube) payload.socialYoutube = socialYoutube;
  if (footerCopyright) payload.footerCopyright = footerCopyright;
  if (homeHeroEyebrow) payload.homeHeroEyebrow = homeHeroEyebrow;
  if (homeHeroTitle) payload.homeHeroTitle = homeHeroTitle;
  if (homeHeroSubtitle) payload.homeHeroSubtitle = homeHeroSubtitle;
  if (homeSearchPlaceholder) payload.homeSearchPlaceholder = homeSearchPlaceholder;
  if (homeHeroImageUrl) payload.homeHeroImageUrl = homeHeroImageUrl;
  if (homeHeroOverlayTitle) payload.homeHeroOverlayTitle = homeHeroOverlayTitle;
  if (homeHeroOverlaySubtitle) payload.homeHeroOverlaySubtitle = homeHeroOverlaySubtitle;
  if (siteLogoLightUrl) payload.siteLogoLightUrl = siteLogoLightUrl;
  if (siteLogoDarkUrl) payload.siteLogoDarkUrl = siteLogoDarkUrl;
  if (siteFaviconUrl) payload.siteFaviconUrl = siteFaviconUrl;
  payload.siteTheme = normalizeSiteTheme(data.siteTheme);

  return payload;
}

export async function saveSiteSettings(
  data: Omit<SiteSettings, 'updatedAt'>,
): Promise<void> {
  const docPath = 'siteSettings/public';
  const docRef = doc(db, 'siteSettings', 'public');

  const whatsapp = clampOptional(data.whatsapp, 40);
  const footerNewsletterTitle = clampOptional(data.footerNewsletterTitle, 120);
  const footerNewsletterSubtitle = clampOptional(data.footerNewsletterSubtitle, 240);
  const footerAboutTitle = clampOptional(data.footerAboutTitle, 80);
  const footerAboutText = clampOptional(data.footerAboutText, 500);
  const footerCol2Title = clampOptional(data.footerCol2Title, 60);
  const footerCol3Title = clampOptional(data.footerCol3Title, 60);
  const footerCol4Title = clampOptional(data.footerCol4Title, 60);
  const footerConnectTitle = clampOptional(data.footerConnectTitle, 60);
  const socialLinkedin = clampOptional(data.socialLinkedin, 300);
  const socialTwitter = clampOptional(data.socialTwitter, 300);
  const socialFacebook = clampOptional(data.socialFacebook, 300);
  const socialInstagram = clampOptional(data.socialInstagram, 300);
  const socialYoutube = clampOptional(data.socialYoutube, 300);
  const footerCopyright = clampOptional(data.footerCopyright, 200);
  const homeHeroEyebrow = clampOptional(data.homeHeroEyebrow, 120);
  const homeHeroTitle = clampOptional(data.homeHeroTitle, 200);
  const homeHeroSubtitle = clampOptional(data.homeHeroSubtitle, 500);
  const homeSearchPlaceholder = clampOptional(data.homeSearchPlaceholder, 120);
  const homeHeroImageUrl = clampOptionalStrictLength(data.homeHeroImageUrl, 262144, 'Header hero image');
  const homeHeroOverlayTitle = clampOptional(data.homeHeroOverlayTitle, 120);
  const homeHeroOverlaySubtitle = clampOptional(data.homeHeroOverlaySubtitle, 260);
  const siteLogoLightUrl = clampOptionalStrictLength(data.siteLogoLightUrl, 65536, 'Light mode logo');
  const siteLogoDarkUrl = clampOptionalStrictLength(data.siteLogoDarkUrl, 65536, 'Dark mode logo');
  const siteFaviconUrl = clampOptionalStrictLength(data.siteFaviconUrl, 65536, 'Website favicon');

  const baseFields = {
    brandName: clampRequired(data.brandName, 80),
    tagline: clampRequired(data.tagline, 240),
    email: clampRequired(data.email, 160),
    phone: clampRequired(data.phone, 40),
    address: clampRequired(data.address, 240),
    officeHours: clampRequired(data.officeHours, 120),
    aboutMission: clampRequired(data.aboutMission, 2000),
    aboutStory: clampRequired(data.aboutStory, 4000),
    footerCol2Links: clampFooterLinks(data.footerCol2Links),
    footerCol3Links: clampFooterLinks(data.footerCol3Links),
    footerCol4Links: clampFooterLinks(data.footerCol4Links),
    updatedAt: serverTimestamp(),
  };

  try {
    const existingSnap = await getDoc(docRef);
    if (existingSnap.exists()) {
      await updateDoc(docRef, {
        ...baseFields,
        whatsapp: whatsapp ?? deleteField(),
        footerNewsletterTitle: footerNewsletterTitle ?? deleteField(),
        footerNewsletterSubtitle: footerNewsletterSubtitle ?? deleteField(),
        footerAboutTitle: footerAboutTitle ?? deleteField(),
        footerAboutText: footerAboutText ?? deleteField(),
        footerCol2Title: footerCol2Title ?? deleteField(),
        footerCol3Title: footerCol3Title ?? deleteField(),
        footerCol4Title: footerCol4Title ?? deleteField(),
        footerConnectTitle: footerConnectTitle ?? deleteField(),
        socialLinkedin: socialLinkedin ?? deleteField(),
        socialTwitter: socialTwitter ?? deleteField(),
        socialFacebook: socialFacebook ?? deleteField(),
        socialInstagram: socialInstagram ?? deleteField(),
        socialYoutube: socialYoutube ?? deleteField(),
        footerCopyright: footerCopyright ?? deleteField(),
        homeHeroEyebrow: homeHeroEyebrow ?? deleteField(),
        homeHeroTitle: homeHeroTitle ?? deleteField(),
        homeHeroSubtitle: homeHeroSubtitle ?? deleteField(),
        homeSearchPlaceholder: homeSearchPlaceholder ?? deleteField(),
        homeHeroImageUrl: homeHeroImageUrl ?? deleteField(),
        homeHeroOverlayTitle: homeHeroOverlayTitle ?? deleteField(),
        homeHeroOverlaySubtitle: homeHeroOverlaySubtitle ?? deleteField(),
        siteLogoLightUrl: siteLogoLightUrl ?? deleteField(),
        siteLogoDarkUrl: siteLogoDarkUrl ?? deleteField(),
        siteFaviconUrl: siteFaviconUrl ?? deleteField(),
        siteTheme: normalizeSiteTheme(data.siteTheme),
      });
    } else {
      await setDoc(docRef, buildNormalizedSitePayload(data));
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}

export async function saveSiteSettingsSection(
  section: SiteSettingsSection,
  data: Omit<SiteSettings, 'updatedAt'>,
): Promise<void> {
  const docPath = 'siteSettings/public';
  const docRef = doc(db, 'siteSettings', 'public');

  try {
    const existingSnap = await getDoc(docRef);
    if (!existingSnap.exists()) {
      await setDoc(docRef, buildNormalizedSitePayload({ ...DEFAULT_SITE_SETTINGS, ...data }));
      return;
    }

    if (section === 'home_header') {
      const homeHeroImageUrl = clampOptionalStrictLength(
        data.homeHeroImageUrl,
        262144,
        'Header hero image',
      );
      await updateDoc(docRef, {
        homeHeroEyebrow: clampOptional(data.homeHeroEyebrow, 120) ?? deleteField(),
        homeHeroTitle: clampOptional(data.homeHeroTitle, 200) ?? deleteField(),
        homeHeroSubtitle: clampOptional(data.homeHeroSubtitle, 500) ?? deleteField(),
        homeSearchPlaceholder: clampOptional(data.homeSearchPlaceholder, 120) ?? deleteField(),
        homeHeroImageUrl: homeHeroImageUrl ?? deleteField(),
        homeHeroOverlayTitle: clampOptional(data.homeHeroOverlayTitle, 120) ?? deleteField(),
        homeHeroOverlaySubtitle: clampOptional(data.homeHeroOverlaySubtitle, 260) ?? deleteField(),
        updatedAt: serverTimestamp(),
      });
    } else if (section === 'site_branding') {
      const siteLogoLightUrl = clampOptionalStrictLength(
        data.siteLogoLightUrl,
        65536,
        'Light mode logo',
      );
      const siteLogoDarkUrl = clampOptionalStrictLength(
        data.siteLogoDarkUrl,
        65536,
        'Dark mode logo',
      );
      const siteFaviconUrl = clampOptionalStrictLength(
        data.siteFaviconUrl,
        65536,
        'Website favicon',
      );
      await updateDoc(docRef, {
        brandName: clampRequired(data.brandName, 80),
        siteLogoLightUrl: siteLogoLightUrl ?? deleteField(),
        siteLogoDarkUrl: siteLogoDarkUrl ?? deleteField(),
        siteFaviconUrl: siteFaviconUrl ?? deleteField(),
        updatedAt: serverTimestamp(),
      });
    } else if (section === 'site_theme') {
      await updateDoc(docRef, {
        siteTheme: normalizeSiteTheme(data.siteTheme),
        updatedAt: serverTimestamp(),
      });
    } else if (section === 'contacts') {
      const whatsapp = clampOptional(data.whatsapp, 40);
      await updateDoc(docRef, {
        brandName: clampRequired(data.brandName, 80),
        tagline: clampRequired(data.tagline, 240),
        email: clampRequired(data.email, 160),
        phone: clampRequired(data.phone, 40),
        whatsapp: whatsapp ?? deleteField(),
        address: clampRequired(data.address, 240),
        officeHours: clampRequired(data.officeHours, 120),
        updatedAt: serverTimestamp(),
      });
    } else if (section === 'about_settings') {
      await updateDoc(docRef, {
        aboutMission: clampRequired(data.aboutMission, 2000),
        aboutStory: clampRequired(data.aboutStory, 4000),
        updatedAt: serverTimestamp(),
      });
    } else if (section === 'footer_intro') {
      await updateDoc(docRef, {
        footerNewsletterTitle: clampOptional(data.footerNewsletterTitle, 120) ?? deleteField(),
        footerNewsletterSubtitle: clampOptional(data.footerNewsletterSubtitle, 240) ?? deleteField(),
        footerAboutTitle: clampOptional(data.footerAboutTitle, 80) ?? deleteField(),
        footerAboutText: clampOptional(data.footerAboutText, 500) ?? deleteField(),
        footerCopyright: clampOptional(data.footerCopyright, 200) ?? deleteField(),
        updatedAt: serverTimestamp(),
      });
    } else if (section === 'footer_links') {
      await updateDoc(docRef, {
        footerCol2Title: clampOptional(data.footerCol2Title, 60) ?? deleteField(),
        footerCol2Links: clampFooterLinks(data.footerCol2Links),
        footerCol3Title: clampOptional(data.footerCol3Title, 60) ?? deleteField(),
        footerCol3Links: clampFooterLinks(data.footerCol3Links),
        footerCol4Title: clampOptional(data.footerCol4Title, 60) ?? deleteField(),
        footerCol4Links: clampFooterLinks(data.footerCol4Links),
        updatedAt: serverTimestamp(),
      });
    } else if (section === 'footer_social') {
      await updateDoc(docRef, {
        footerConnectTitle: clampOptional(data.footerConnectTitle, 60) ?? deleteField(),
        socialLinkedin: clampOptional(data.socialLinkedin, 300) ?? deleteField(),
        socialTwitter: clampOptional(data.socialTwitter, 300) ?? deleteField(),
        socialFacebook: clampOptional(data.socialFacebook, 300) ?? deleteField(),
        socialInstagram: clampOptional(data.socialInstagram, 300) ?? deleteField(),
        socialYoutube: clampOptional(data.socialYoutube, 300) ?? deleteField(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}

export async function updateVisitorLeadStatus(
  leadId: string,
  status: VisitorLeadStatus,
): Promise<void> {
  const docPath = `visitorLeads/${leadId}`;
  try {
    await updateDoc(doc(db, 'visitorLeads', leadId), { status });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
  }
}

export async function deleteVisitorLead(leadId: string): Promise<void> {
  const docPath = `visitorLeads/${leadId}`;
  try {
    await deleteDoc(doc(db, 'visitorLeads', leadId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

export async function deleteNewsletterSubscriber(subId: string): Promise<void> {
  const docPath = `newsletterSubscribers/${subId}`;
  try {
    await deleteDoc(doc(db, 'newsletterSubscribers', subId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

// ---------- Team & RBAC Operations ----------

export async function inviteTeamMember(input: {
  email: string;
  displayName?: string;
  role: AdminRole;
  permissions: AdminPermission[];
  invitedBy: string;
}): Promise<string> {
  const email = clampRequired(input.email.toLowerCase(), 160);
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Please enter a valid team email address.');
  }
  if (email === ADMIN_EMAIL) {
    throw new Error('The primary owner account already has permanent Super Admin access.');
  }

  const inviteId = await emailToInviteId(email);
  const docPath = `teamInvites/${inviteId}`;
  const docRef = doc(db, 'teamInvites', inviteId);
  const displayName = clampOptional(input.displayName, 80);
  const permissions = normalizePermissions(input.permissions, input.role);
  const invitedBy = clampRequired(input.invitedBy.toLowerCase(), 160);

  try {
    const existingSnap = await getDoc(docRef);
    if (existingSnap.exists()) {
      await updateDoc(docRef, {
        displayName: displayName ?? deleteField(),
        role: input.role,
        permissions,
        status: 'pending',
        invitedBy,
        updatedAt: serverTimestamp(),
      });
    } else {
      const payload: Record<string, unknown> = {
        email,
        role: input.role,
        permissions,
        status: 'pending',
        invitedBy,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      if (displayName) payload.displayName = displayName;
      await setDoc(docRef, payload);
    }
    return inviteId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}

export async function revokeTeamInvite(inviteId: string, invitedBy: string): Promise<void> {
  const docPath = `teamInvites/${inviteId}`;
  try {
    await updateDoc(doc(db, 'teamInvites', inviteId), {
      status: 'revoked',
      invitedBy: clampRequired(invitedBy.toLowerCase(), 160),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
  }
}

export async function deleteTeamInvite(inviteId: string): Promise<void> {
  const docPath = `teamInvites/${inviteId}`;
  try {
    await deleteDoc(doc(db, 'teamInvites', inviteId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

export async function claimTeamInviteForUser(input: {
  uid: string;
  email: string;
  displayName?: string | null;
  invite: TeamInvite;
}): Promise<void> {
  const docPath = `admins/${input.uid}`;
  const adminRef = doc(db, 'admins', input.uid);
  const inviteRef = doc(db, 'teamInvites', input.invite.id);
  const normalizedEmail = clampRequired(input.email.toLowerCase(), 160);
  const displayName = clampOptional(input.displayName || input.invite.displayName, 80);

  try {
    const batch = writeBatch(db);
    const adminPayload: Record<string, unknown> = {
      email: normalizedEmail,
      role: input.invite.role,
      permissions: input.invite.permissions,
      status: 'active',
      inviteId: input.invite.id,
      invitedBy: input.invite.invitedBy,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    if (displayName) adminPayload.displayName = displayName;

    batch.set(adminRef, adminPayload);
    batch.update(inviteRef, {
      status: 'claimed',
      claimedUid: input.uid,
      updatedAt: serverTimestamp(),
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}

export async function createOrTouchAccessRequest(input: {
  uid: string;
  email: string;
  displayName?: string | null;
}): Promise<void> {
  const docPath = `accessRequests/${input.uid}`;
  const ref = doc(db, 'accessRequests', input.uid);
  const email = clampRequired(input.email.toLowerCase(), 160);
  const displayName = clampOptional(input.displayName || undefined, 80);

  try {
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      const payload: Record<string, unknown> = {
        email,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      if (displayName) payload.displayName = displayName;
      await setDoc(ref, payload);
    } else if (snap.data()?.status === 'pending' && displayName && snap.data()?.displayName !== displayName) {
      await updateDoc(ref, {
        displayName,
        status: 'pending',
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}

export async function approveAccessRequestWithRole(input: {
  request: AccessRequest;
  role: AdminRole;
  permissions: AdminPermission[];
  invitedBy: string;
  displayName?: string;
}): Promise<void> {
  const docPath = `admins/${input.request.id}`;
  const adminRef = doc(db, 'admins', input.request.id);
  const requestRef = doc(db, 'accessRequests', input.request.id);
  const permissions = normalizePermissions(input.permissions, input.role);
  const displayName = clampOptional(input.displayName || input.request.displayName, 80);

  try {
    const batch = writeBatch(db);
    const adminPayload: Record<string, unknown> = {
      email: clampRequired(input.request.email.toLowerCase(), 160),
      role: input.role,
      permissions,
      status: 'active',
      invitedBy: clampRequired(input.invitedBy.toLowerCase(), 160),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    if (displayName) adminPayload.displayName = displayName;

    batch.set(adminRef, adminPayload);
    batch.update(requestRef, {
      status: 'approved',
      updatedAt: serverTimestamp(),
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}

export async function rejectAccessRequest(requestId: string): Promise<void> {
  const docPath = `accessRequests/${requestId}`;
  try {
    await updateDoc(doc(db, 'accessRequests', requestId), {
      status: 'rejected',
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
  }
}

export async function deleteAccessRequest(requestId: string): Promise<void> {
  const docPath = `accessRequests/${requestId}`;
  try {
    await deleteDoc(doc(db, 'accessRequests', requestId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

export async function updateAdminMember(
  adminId: string,
  input: {
    displayName?: string;
    role: AdminRole;
    permissions: AdminPermission[];
    status: AdminMemberStatus;
  },
): Promise<void> {
  const docPath = `admins/${adminId}`;
  const permissions = normalizePermissions(input.permissions, input.role);
  const displayName = clampOptional(input.displayName, 80);

  try {
    await updateDoc(doc(db, 'admins', adminId), {
      displayName: displayName ?? deleteField(),
      role: input.role,
      permissions,
      status: input.status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
  }
}

export async function removeAdminMember(adminId: string): Promise<void> {
  const docPath = `admins/${adminId}`;
  try {
    await deleteDoc(doc(db, 'admins', adminId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

export async function seedStarterCatalogToFirestore(): Promise<void> {
  for (const job of STARTER_JOBS) {
    const existing = await getDoc(doc(db, 'jobs', job.id));
    if (!existing.exists()) {
      const { id: _id, ...rest } = job;
      await saveJob(rest, undefined);
    }
  }
  for (const tender of STARTER_TENDERS) {
    const existing = await getDoc(doc(db, 'tenders', tender.id));
    if (!existing.exists()) {
      const { id: _id, ...rest } = tender;
      await saveTender(rest, undefined);
    }
  }
  for (const item of STARTER_MARKETPLACE) {
    const existing = await getDoc(doc(db, 'marketplaceItems', item.id));
    if (!existing.exists()) {
      const { id: _id, ...rest } = item;
      await saveMarketplaceItem(rest, undefined);
    }
  }
  for (const blog of STARTER_BLOGS) {
    const existing = await getDoc(doc(db, 'blogs', blog.id));
    if (!existing.exists()) {
      const { id: _id, ...rest } = blog;
      await saveBlogPost(rest, undefined);
    }
  }
  const settingsSnap = await getDoc(doc(db, 'siteSettings', 'public'));
  if (!settingsSnap.exists()) {
    await saveSiteSettings(DEFAULT_SITE_SETTINGS);
  }
}
