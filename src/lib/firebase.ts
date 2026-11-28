import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  doc,
  Firestore,
  getDocFromServer,
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { VisitorLeadInput } from '../types/dalka';

const app = initializeApp(firebaseConfig);

function createFirestoreInstance(): Firestore {
  try {
    return initializeFirestore(
      app,
      {
        experimentalForceLongPolling: true,
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager(),
        }),
      },
      firebaseConfig.firestoreDatabaseId,
    );
  } catch {
    return getFirestore(app, firebaseConfig.firestoreDatabaseId);
  }
}

export const db = createFirestoreInstance();
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null,
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection(): Promise<void> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

void testConnection();

function trimAndClamp(value: string | undefined, maxLen: number): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, maxLen);
}

export async function submitVisitorLead(input: VisitorLeadInput): Promise<string> {
  const fullName = input.fullName.trim().slice(0, 120);
  const phone = input.phone.trim().slice(0, 32);

  if (fullName.length < 2) {
    throw new Error('Please enter your full name (at least 2 characters).');
  }
  if (phone.length < 5) {
    throw new Error('Please enter a valid phone number.');
  }

  const leadId = `lead-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const payload: Record<string, unknown> = {
    fullName,
    phone,
    source: input.source,
    status: 'new',
    createdAt: serverTimestamp(),
  };

  const location = trimAndClamp(input.location, 120);
  const email = trimAndClamp(input.email, 160);
  const higherEducation = trimAndClamp(input.higherEducation, 120);
  const itemId = trimAndClamp(input.itemId, 128);
  const itemTitle = trimAndClamp(input.itemTitle, 160);
  const message = trimAndClamp(input.message, 2000);

  if (location) payload.location = location;
  if (email) payload.email = email;
  if (higherEducation) payload.higherEducation = higherEducation;
  if (itemId) payload.itemId = itemId;
  if (itemTitle) payload.itemTitle = itemTitle;
  if (message) payload.message = message;

  const docPath = `visitorLeads/${leadId}`;
  try {
    await setDoc(doc(db, 'visitorLeads', leadId), payload);
    return leadId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, docPath);
  }
}

export async function submitNewsletterEmail(rawEmail: string): Promise<string> {
  const email = rawEmail.trim().slice(0, 160);
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Please enter a valid email address.');
  }

  const subId = `sub-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const docPath = `newsletterSubscribers/${subId}`;

  try {
    await setDoc(doc(db, 'newsletterSubscribers', subId), {
      email,
      source: 'footer',
      createdAt: serverTimestamp(),
    });
    return subId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, docPath);
  }
}
