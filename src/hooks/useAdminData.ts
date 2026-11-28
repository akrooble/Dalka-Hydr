import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, doc, getDoc, onSnapshot, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  ADMIN_EMAIL,
  claimTeamInviteForUser,
  createOrTouchAccessRequest,
} from '../lib/adminFirestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  ALL_PERMISSIONS,
  emailToInviteId,
  normalizePermissions,
} from '../lib/permissions';
import { DEFAULT_SITE_SETTINGS } from '../lib/seedData';
import {
  AccessRequest,
  AdminAccessStatus,
  AdminMember,
  AdminPermission,
  AdminRole,
  BlogPost,
  JobListing,
  MarketplaceItem,
  NewsletterSubscriber,
  SiteSettings,
  TeamInvite,
  TenderNotice,
  VisitorLead,
} from '../types/dalka';

export interface AdminDataState {
  user: User | null;
  authReady: boolean;
  accessStatus: AdminAccessStatus;
  isAuthorizedAdmin: boolean;
  adminRole: AdminRole;
  permissions: AdminPermission[];
  currentMember: AdminMember | null;
  jobs: JobListing[];
  tenders: TenderNotice[];
  marketplaceItems: MarketplaceItem[];
  blogs: BlogPost[];
  leads: VisitorLead[];
  newsletterSubscribers: NewsletterSubscriber[];
  teamMembers: AdminMember[];
  teamInvites: TeamInvite[];
  accessRequests: AccessRequest[];
  siteSettings: SiteSettings;
  dataLoading: boolean;
  refreshUser: () => Promise<boolean>;
}

function sortByCreatedAtDesc<T extends { createdAt?: unknown }>(rows: T[]): T[] {
  return [...rows].sort((a, b) => {
    const tA =
      typeof (a.createdAt as { toMillis?: () => number })?.toMillis === 'function'
        ? (a.createdAt as { toMillis: () => number }).toMillis()
        : 0;
    const tB =
      typeof (b.createdAt as { toMillis?: () => number })?.toMillis === 'function'
        ? (b.createdAt as { toMillis: () => number }).toMillis()
        : 0;
    return tB - tA;
  });
}

export function useAdminData(): AdminDataState {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [, setAuthTick] = useState(0);

  const [accessStatus, setAccessStatus] = useState<AdminAccessStatus>('unauthenticated');
  const [currentMember, setCurrentMember] = useState<AdminMember | null>(null);
  const [adminRole, setAdminRole] = useState<AdminRole>('moderator');
  const [permissions, setPermissions] = useState<AdminPermission[]>([]);

  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [tenders, setTenders] = useState<TenderNotice[]>([]);
  const [marketplaceItems, setMarketplaceItems] = useState<MarketplaceItem[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [leads, setLeads] = useState<VisitorLead[]>([]);
  const [newsletterSubscribers, setNewsletterSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [teamMembers, setTeamMembers] = useState<AdminMember[]>([]);
  const [teamInvites, setTeamInvites] = useState<TeamInvite[]>([]);
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);

  const [loaded, setLoaded] = useState({
    jobs: false,
    tenders: false,
    marketplace: false,
    blogs: false,
    leads: false,
    newsletter: false,
    team: false,
    settings: false,
  });

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
      setAuthTick((t) => t + 1);
    });
    return () => unsubAuth();
  }, []);

  async function refreshUser(): Promise<boolean> {
    if (!auth.currentUser) return false;
    await auth.currentUser.reload();
    await auth.currentUser.getIdToken(true);
    setUser(auth.currentUser);
    setAuthTick((t) => t + 1);
    return Boolean(auth.currentUser.emailVerified);
  }

  const verifiedFlag = Boolean(auth.currentUser?.emailVerified ?? user?.emailVerified);
  const userEmail = (user?.email || '').toLowerCase();
  const isOwnerEmail = Boolean(user && verifiedFlag && userEmail === ADMIN_EMAIL);

  // Resolve active admin role & permissions (owner bootstrap OR /admins/{uid} OR pending invite claim OR access request)
  useEffect(() => {
    if (!authReady) return;

    if (!user) {
      setAccessStatus('unauthenticated');
      setCurrentMember(null);
      setPermissions([]);
      return;
    }

    if (!verifiedFlag) {
      setAccessStatus('unverified');
      setCurrentMember(null);
      setPermissions([]);
      return;
    }

    if (isOwnerEmail) {
      setAccessStatus('active');
      setAdminRole('super_admin');
      setPermissions([...ALL_PERMISSIONS]);
      setCurrentMember({
        id: user.uid,
        email: ADMIN_EMAIL,
        displayName: user.displayName || 'Workspace Owner',
        role: 'super_admin',
        permissions: [...ALL_PERMISSIONS],
        status: 'active',
      });
      return;
    }

    let cancelled = false;
    let unsubRequest: (() => void) | null = null;
    setAccessStatus('checking');

    const adminRef = doc(db, 'admins', user.uid);
    const unsubAdmin = onSnapshot(
      adminRef,
      async (snap) => {
        if (cancelled) return;
        if (snap.exists()) {
          if (unsubRequest) {
            unsubRequest();
            unsubRequest = null;
          }
          const data = snap.data() as Omit<AdminMember, 'id'>;
          const member: AdminMember = { id: snap.id, ...data };
          setCurrentMember(member);

          if (data.status === 'suspended') {
            setAccessStatus('suspended');
            setPermissions([]);
            return;
          }

          const resolvedRole: AdminRole =
            data.role === 'admin' ? 'super_admin' : data.role || 'moderator';
          const resolvedPerms = normalizePermissions(data.permissions, data.role);
          setAdminRole(resolvedRole);
          setPermissions(resolvedPerms);
          setAccessStatus('active');
          return;
        }

        // Not yet in /admins/{uid}: check for a pending team invite by deterministic email hash
        try {
          const inviteId = await emailToInviteId(userEmail);
          const inviteSnap = await getDoc(doc(db, 'teamInvites', inviteId));
          if (cancelled) return;

          if (inviteSnap.exists()) {
            const inviteData = inviteSnap.data() as Omit<TeamInvite, 'id'>;
            if (inviteData.status === 'pending' && inviteData.email.toLowerCase() === userEmail) {
              await claimTeamInviteForUser({
                uid: user.uid,
                email: userEmail,
                displayName: user.displayName,
                invite: { id: inviteSnap.id, ...inviteData },
              });
              return;
            }
          }

          // No pending invite: ensure an accessRequest exists so a Super Admin can assign a role
          await createOrTouchAccessRequest({
            uid: user.uid,
            email: userEmail,
            displayName: user.displayName,
          });
          if (cancelled) return;

          if (!unsubRequest) {
            unsubRequest = onSnapshot(
              doc(db, 'accessRequests', user.uid),
              (reqSnap) => {
                if (cancelled) return;
                const reqStatus = reqSnap.exists()
                  ? (reqSnap.data() as AccessRequest).status
                  : 'pending';
                if (reqStatus === 'rejected') {
                  setAccessStatus('rejected');
                } else {
                  setAccessStatus('pending_approval');
                }
              },
              (err) => handleFirestoreError(err, OperationType.GET, `accessRequests/${user.uid}`),
            );
          }
        } catch (err) {
          if (!cancelled) {
            setAccessStatus('pending_approval');
            console.error(err);
          }
        }
      },
      (err) => handleFirestoreError(err, OperationType.GET, `admins/${user.uid}`),
    );

    return () => {
      cancelled = true;
      unsubAdmin();
      if (unsubRequest) unsubRequest();
    };
  }, [authReady, user, verifiedFlag, isOwnerEmail, userEmail]);

  const isAuthorizedAdmin = accessStatus === 'active';
  const permsKey = permissions.join(',');

  // Subscribe only to collections this member's role/permissions allow
  useEffect(() => {
    if (!authReady || !isAuthorizedAdmin) {
      setJobs([]);
      setTenders([]);
      setMarketplaceItems([]);
      setBlogs([]);
      setLeads([]);
      setNewsletterSubscribers([]);
      setTeamMembers([]);
      setTeamInvites([]);
      setAccessRequests([]);
      setLoaded({
        jobs: false,
        tenders: false,
        marketplace: false,
        blogs: false,
        leads: false,
        newsletter: false,
        team: false,
        settings: false,
      });
      return;
    }

    const permSet = new Set<AdminPermission>(permissions);
    const canJobs = permSet.has('jobs');
    const canTenders = permSet.has('tenders');
    const canMarket = permSet.has('marketplace');
    const canBlogs = permSet.has('blogs');
    const canLeads = permSet.has('leads');
    const canNewsletter = permSet.has('newsletter');
    const canTeam = permSet.has('team');

    const unsubs: (() => void)[] = [];

    if (canJobs || permSet.has('overview')) {
      unsubs.push(
        onSnapshot(
          collection(db, 'jobs'),
          (snap) => {
            setJobs(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<JobListing, 'id'>) })));
            setLoaded((p) => ({ ...p, jobs: true }));
          },
          (err) => handleFirestoreError(err, OperationType.LIST, 'jobs'),
        ),
      );
    } else {
      setLoaded((p) => ({ ...p, jobs: true }));
    }

    if (canTenders || permSet.has('overview')) {
      unsubs.push(
        onSnapshot(
          collection(db, 'tenders'),
          (snap) => {
            setTenders(
              snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<TenderNotice, 'id'>) })),
            );
            setLoaded((p) => ({ ...p, tenders: true }));
          },
          (err) => handleFirestoreError(err, OperationType.LIST, 'tenders'),
        ),
      );
    } else {
      setLoaded((p) => ({ ...p, tenders: true }));
    }

    if (canMarket || permSet.has('overview')) {
      const marketSource = canMarket
        ? collection(db, 'marketplaceItems')
        : query(collection(db, 'marketplaceItems'), where('status', '==', 'published'));
      unsubs.push(
        onSnapshot(
          marketSource,
          (snap) => {
            setMarketplaceItems(
              snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<MarketplaceItem, 'id'>) })),
            );
            setLoaded((p) => ({ ...p, marketplace: true }));
          },
          (err) => handleFirestoreError(err, OperationType.LIST, 'marketplaceItems'),
        ),
      );
    } else {
      setLoaded((p) => ({ ...p, marketplace: true }));
    }

    if (canBlogs || permSet.has('overview')) {
      const blogSource = canBlogs
        ? collection(db, 'blogs')
        : query(collection(db, 'blogs'), where('status', '==', 'published'));
      unsubs.push(
        onSnapshot(
          blogSource,
          (snap) => {
            setBlogs(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<BlogPost, 'id'>) })));
            setLoaded((p) => ({ ...p, blogs: true }));
          },
          (err) => handleFirestoreError(err, OperationType.LIST, 'blogs'),
        ),
      );
    } else {
      setLoaded((p) => ({ ...p, blogs: true }));
    }

    if (canLeads) {
      unsubs.push(
        onSnapshot(
          collection(db, 'visitorLeads'),
          (snap) => {
            const rows = snap.docs.map((d) => ({
              id: d.id,
              ...(d.data() as Omit<VisitorLead, 'id'>),
            }));
            setLeads(sortByCreatedAtDesc(rows));
            setLoaded((p) => ({ ...p, leads: true }));
          },
          (err) => handleFirestoreError(err, OperationType.LIST, 'visitorLeads'),
        ),
      );
    } else {
      setLeads([]);
      setLoaded((p) => ({ ...p, leads: true }));
    }

    if (canNewsletter) {
      unsubs.push(
        onSnapshot(
          collection(db, 'newsletterSubscribers'),
          (snap) => {
            const rows = snap.docs.map((d) => ({
              id: d.id,
              ...(d.data() as Omit<NewsletterSubscriber, 'id'>),
            }));
            setNewsletterSubscribers(sortByCreatedAtDesc(rows));
            setLoaded((p) => ({ ...p, newsletter: true }));
          },
          (err) => handleFirestoreError(err, OperationType.LIST, 'newsletterSubscribers'),
        ),
      );
    } else {
      setNewsletterSubscribers([]);
      setLoaded((p) => ({ ...p, newsletter: true }));
    }

    if (canTeam) {
      let teamPartDone = { admins: false, invites: false, requests: false };
      const checkTeamDone = () => {
        if (teamPartDone.admins && teamPartDone.invites && teamPartDone.requests) {
          setLoaded((p) => ({ ...p, team: true }));
        }
      };

      unsubs.push(
        onSnapshot(
          collection(db, 'admins'),
          (snap) => {
            const rows = snap.docs.map((d) => ({
              id: d.id,
              ...(d.data() as Omit<AdminMember, 'id'>),
            }));
            setTeamMembers(sortByCreatedAtDesc(rows));
            teamPartDone = { ...teamPartDone, admins: true };
            checkTeamDone();
          },
          (err) => handleFirestoreError(err, OperationType.LIST, 'admins'),
        ),
      );

      unsubs.push(
        onSnapshot(
          collection(db, 'teamInvites'),
          (snap) => {
            const rows = snap.docs.map((d) => ({
              id: d.id,
              ...(d.data() as Omit<TeamInvite, 'id'>),
            }));
            setTeamInvites(sortByCreatedAtDesc(rows));
            teamPartDone = { ...teamPartDone, invites: true };
            checkTeamDone();
          },
          (err) => handleFirestoreError(err, OperationType.LIST, 'teamInvites'),
        ),
      );

      unsubs.push(
        onSnapshot(
          collection(db, 'accessRequests'),
          (snap) => {
            const rows = snap.docs.map((d) => ({
              id: d.id,
              ...(d.data() as Omit<AccessRequest, 'id'>),
            }));
            setAccessRequests(sortByCreatedAtDesc(rows));
            teamPartDone = { ...teamPartDone, requests: true };
            checkTeamDone();
          },
          (err) => handleFirestoreError(err, OperationType.LIST, 'accessRequests'),
        ),
      );
    } else {
      setTeamMembers([]);
      setTeamInvites([]);
      setAccessRequests([]);
      setLoaded((p) => ({ ...p, team: true }));
    }

    unsubs.push(
      onSnapshot(
        doc(db, 'siteSettings', 'public'),
        (snap) => {
          setSiteSettings(
            snap.exists()
              ? { ...DEFAULT_SITE_SETTINGS, ...(snap.data() as Partial<SiteSettings>) }
              : DEFAULT_SITE_SETTINGS,
          );
          setLoaded((p) => ({ ...p, settings: true }));
        },
        (err) => handleFirestoreError(err, OperationType.GET, 'siteSettings/public'),
      ),
    );

    return () => {
      unsubs.forEach((u) => u());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authReady, isAuthorizedAdmin, permsKey]);

  const dataLoading =
    isAuthorizedAdmin &&
    (!loaded.jobs ||
      !loaded.tenders ||
      !loaded.marketplace ||
      !loaded.blogs ||
      !loaded.leads ||
      !loaded.newsletter ||
      !loaded.team ||
      !loaded.settings);

  return {
    user,
    authReady,
    accessStatus,
    isAuthorizedAdmin,
    adminRole,
    permissions,
    currentMember,
    jobs,
    tenders,
    marketplaceItems,
    blogs,
    leads,
    newsletterSubscribers,
    teamMembers,
    teamInvites,
    accessRequests,
    siteSettings,
    dataLoading,
    refreshUser,
  };
}
