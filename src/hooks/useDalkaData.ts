import { useEffect, useState } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  DEFAULT_SITE_SETTINGS,
  STARTER_BLOGS,
  STARTER_JOBS,
  STARTER_MARKETPLACE,
  STARTER_TENDERS,
} from '../lib/seedData';
import {
  BlogPost,
  JobListing,
  MarketplaceItem,
  SiteSettings,
  TenderNotice,
} from '../types/dalka';

export interface DalkaDataState {
  jobs: JobListing[];
  tenders: TenderNotice[];
  marketplaceItems: MarketplaceItem[];
  blogs: BlogPost[];
  siteSettings: SiteSettings;
  loading: boolean;
  isUsingStarterCatalog: {
    jobs: boolean;
    tenders: boolean;
    marketplace: boolean;
    blogs: boolean;
  };
}

export function useDalkaData(): DalkaDataState {
  const [jobs, setJobs] = useState<JobListing[]>(STARTER_JOBS);
  const [tenders, setTenders] = useState<TenderNotice[]>(STARTER_TENDERS);
  const [marketplaceItems, setMarketplaceItems] = useState<MarketplaceItem[]>(STARTER_MARKETPLACE);
  const [blogs, setBlogs] = useState<BlogPost[]>(STARTER_BLOGS);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [loadedFlags, setLoadedFlags] = useState({
    jobs: false,
    tenders: false,
    marketplace: false,
    blogs: false,
    settings: false,
  });
  const [starterFlags, setStarterFlags] = useState({
    jobs: true,
    tenders: true,
    marketplace: true,
    blogs: true,
  });

  useEffect(() => {
    const jobsQuery = query(
      collection(db, 'jobs'),
      where('status', 'in', ['active', 'closed']),
    );
    const unsubJobs = onSnapshot(
      jobsQuery,
      (snap) => {
        if (!snap.empty) {
          const items = snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<JobListing, 'id'>),
          }));
          setJobs(items);
          setStarterFlags((prev) => ({ ...prev, jobs: false }));
        } else {
          setJobs(STARTER_JOBS);
          setStarterFlags((prev) => ({ ...prev, jobs: true }));
        }
        setLoadedFlags((prev) => ({ ...prev, jobs: true }));
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'jobs');
      },
    );

    const tendersQuery = query(
      collection(db, 'tenders'),
      where('status', 'in', ['open', 'awarded', 'closed']),
    );
    const unsubTenders = onSnapshot(
      tendersQuery,
      (snap) => {
        if (!snap.empty) {
          const items = snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<TenderNotice, 'id'>),
          }));
          setTenders(items);
          setStarterFlags((prev) => ({ ...prev, tenders: false }));
        } else {
          setTenders(STARTER_TENDERS);
          setStarterFlags((prev) => ({ ...prev, tenders: true }));
        }
        setLoadedFlags((prev) => ({ ...prev, tenders: true }));
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'tenders');
      },
    );

    const marketplaceQuery = query(
      collection(db, 'marketplaceItems'),
      where('status', '==', 'published'),
    );
    const unsubMarketplace = onSnapshot(
      marketplaceQuery,
      (snap) => {
        if (!snap.empty) {
          const items = snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<MarketplaceItem, 'id'>),
          }));
          setMarketplaceItems(items);
          setStarterFlags((prev) => ({ ...prev, marketplace: false }));
        } else {
          setMarketplaceItems(STARTER_MARKETPLACE);
          setStarterFlags((prev) => ({ ...prev, marketplace: true }));
        }
        setLoadedFlags((prev) => ({ ...prev, marketplace: true }));
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'marketplaceItems');
      },
    );

    const blogsQuery = query(
      collection(db, 'blogs'),
      where('status', '==', 'published'),
    );
    const unsubBlogs = onSnapshot(
      blogsQuery,
      (snap) => {
        if (!snap.empty) {
          const items = snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<BlogPost, 'id'>),
          }));
          setBlogs(items);
          setStarterFlags((prev) => ({ ...prev, blogs: false }));
        } else {
          setBlogs(STARTER_BLOGS);
          setStarterFlags((prev) => ({ ...prev, blogs: true }));
        }
        setLoadedFlags((prev) => ({ ...prev, blogs: true }));
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'blogs');
      },
    );

    const unsubSettings = onSnapshot(
      doc(db, 'siteSettings', 'public'),
      (snap) => {
        if (snap.exists()) {
          setSiteSettings({
            ...DEFAULT_SITE_SETTINGS,
            ...(snap.data() as Partial<SiteSettings>),
          });
        } else {
          setSiteSettings(DEFAULT_SITE_SETTINGS);
        }
        setLoadedFlags((prev) => ({ ...prev, settings: true }));
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'siteSettings/public');
      },
    );

    return () => {
      unsubJobs();
      unsubTenders();
      unsubMarketplace();
      unsubBlogs();
      unsubSettings();
    };
  }, []);

  const loading =
    !loadedFlags.jobs ||
    !loadedFlags.tenders ||
    !loadedFlags.marketplace ||
    !loadedFlags.blogs ||
    !loadedFlags.settings;

  return {
    jobs,
    tenders,
    marketplaceItems,
    blogs,
    siteSettings,
    loading,
    isUsingStarterCatalog: starterFlags,
  };
}
