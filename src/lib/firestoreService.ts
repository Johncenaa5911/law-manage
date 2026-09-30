import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  writeBatch,
  onSnapshot,
} from 'firebase/firestore';
import { db, auth } from './firebase';
import {
  Client,
  Case,
  FIRRecord,
  Hearing,
  DocumentItem,
  PaymentRecord,
  LegalServiceRecord,
  ActivityLog,
  PakistanLegalSection,
  Firm,
  UserProfile,
  FirmMember,
  SubscriptionPlan,
  SubscriptionStatus,
  AuthorizedAccount,
} from '../types';
import {
  INITIAL_CLIENTS,
  INITIAL_CASES,
  INITIAL_FIRS,
  INITIAL_HEARINGS,
  INITIAL_DOCUMENTS,
  INITIAL_PAYMENTS,
  INITIAL_LEGAL_SERVICES,
  INITIAL_ACTIVITIES,
} from '../data/mockData';
import { INITIAL_LEGAL_SECTIONS } from '../data/legalSectionsData';
import {
  DEMO_FIRMS,
  DEMO_USERS,
  INITIAL_AUTHORIZED_ACCOUNTS,
  FIRM_B_CLIENTS,
  FIRM_B_CASES,
  FIRM_B_FIRS,
  FIRM_B_HEARINGS,
  FIRM_B_DOCUMENTS,
  FIRM_B_PAYMENTS,
} from '../data/commercialMockData';

// Firestore collection names
export const COLLECTIONS = {
  USERS: 'users',
  FIRMS: 'firms',
  LEGAL_SECTIONS: 'legalSections',
  SYSTEM_SETTINGS: 'systemSettings',
  AUTHORIZED_ACCOUNTS: 'authorizedAccounts',
  // Subcollections / root collections
  CLIENTS: 'clients',
  CASES: 'cases',
  FIRS: 'firs',
  HEARINGS: 'hearings',
  DOCUMENTS: 'documents',
  PAYMENTS: 'payments',
  SERVICES: 'services',
  ACTIVITIES: 'activities',
  MEMBERS: 'members',
} as const;

// OperationType enum as required by Firebase skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

// Error payload interface adhering to Firebase skill guidelines
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

// Standardized error handler adhering to skill specification
export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
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

// Deep clean objects and arrays to prevent Firestore 'unsupported field value: undefined' errors
export function sanitizeForFirestore<T>(data: T): T {
  if (data === undefined) return undefined as unknown as T;
  if (data === null || typeof data !== 'object') return data;
  if (Array.isArray(data)) {
    return data
      .filter((item) => item !== undefined)
      .map((item) => sanitizeForFirestore(item)) as unknown as T;
  }
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(data as Record<string, any>)) {
    if (value !== undefined) {
      clean[key] = sanitizeForFirestore(value);
    }
  }
  return clean as T;
}

export interface RemoteLegalData {
  clients: Client[];
  cases: Case[];
  firs: FIRRecord[];
  hearings: Hearing[];
  documents: DocumentItem[];
  payments: PaymentRecord[];
  services: LegalServiceRecord[];
  activities: ActivityLog[];
}

export interface RealtimeSyncCallbacks {
  onClients?: (clients: Client[]) => void;
  onCases?: (cases: Case[]) => void;
  onFirs?: (firs: FIRRecord[]) => void;
  onHearings?: (hearings: Hearing[]) => void;
  onDocuments?: (documents: DocumentItem[]) => void;
  onPayments?: (payments: PaymentRecord[]) => void;
  onServices?: (services: LegalServiceRecord[]) => void;
  onActivities?: (activities: ActivityLog[]) => void;
  onStatusChange?: (status: 'connected' | 'connecting' | 'error', details?: string) => void;
  onError?: (err: Error) => void;
}

// -------------------------------------------------------------
// Multi-Tenant Real-Time Subscription Layer
// -------------------------------------------------------------

/**
 * Subscribes to an isolated firm's subcollections:
 * `firms/{firmId}/clients`, `firms/{firmId}/cases`, etc.
 * Guarantees zero data leakage across different lawyers / firms.
 */
export const DEMO_ITEM_IDS_SET = new Set([
  // Clients
  'cl-1', 'cl-2', 'cl-3', 'cl-4', 'cl-5', 'c_1', 'c_2', 'c_3', 'c_4', 'c_k1', 'c_k2', 'cl_b_1', 'cl_b_2', 'khi_cl_1', 'khi_cl_2',
  // Cases
  'case-1', 'case-2', 'case-3', 'case-4', 'case-5', 'case-6', 'case_1', 'case_2', 'case_3', 'case_4', 'case_5', 'case_6', 'case_k1', 'case_k2', 'case_b_1', 'case_b_2', 'khi_cs_1',
  // FIRs
  'fir-1', 'fir-2', 'fir-3', 'fir-4', 'fir_1', 'fir_2', 'fir_3', 'fir_k1', 'fir_b_1', 'khi_fir_1',
  // Hearings
  'hr-1', 'hr-2', 'hr-3', 'hr-4', 'hr-5', 'h_1', 'h_2', 'h_3', 'h_4', 'h_5', 'h_6', 'h_k1', 'h_k2', 'hr_b_1', 'hr_b_2', 'khi_hr_1',
  // Documents
  'doc-1', 'doc-2', 'doc-3', 'doc-4', 'doc-5', 'doc-6', 'doc-7', 'doc-8', 'doc_1', 'doc_2', 'doc_3', 'doc_4', 'doc_5', 'doc_6', 'doc_k1', 'doc_b_1', 'khi_doc_1',
  // Payments
  'pay-1', 'pay-2', 'pay-3', 'pay-4', 'pay-5', 'pay-6', 'p_1', 'p_2', 'p_3', 'p_4', 'p_5', 'p_k1', 'pay_b_1', 'pay_b_2', 'khi_pay_1',
  // Services
  'srv-1', 'srv-2', 'srv-3', 'srv-4', 'srv-5', 'srv-6', 's_1', 's_2', 's_3', 's_4', 's_5',
  // Activities
  'act-1', 'act-2', 'act-3', 'act-4', 'act-5', 'act_1', 'act_2', 'act_3', 'act_4', 'act_5',
]);

export const isDemoRecordId = (id?: string): boolean => {
  if (!id) return false;
  if (DEMO_ITEM_IDS_SET.has(id)) return true;
  if (/^(cl|case|fir|hr|h|doc|pay|p|srv|s|act|khi|hist|cat|tm)[_-]/i.test(id)) return true;
  return false;
};

export function subscribeToFirmRealtimeCollections(
  firmId: string,
  callbacks: RealtimeSyncCallbacks
): () => void {
  let isCancelled = false;
  const activeUnsubscribers: (() => void)[] = [];
  const retryTimeouts: any[] = [];

  const isDemoFirm = firmId === 'firm_lahore_chambers' || firmId === 'firm_karachi_advocates';

  const setupSubcollectionListener = <T>(
    subcollName: string,
    callback?: (items: T[]) => void,
    retryCount = 0
  ) => {
    if (isCancelled || !callback) return;

    try {
      const collRef = collection(db, COLLECTIONS.FIRMS, firmId, subcollName);
      const unsub = onSnapshot(
        collRef,
        (snap) => {
          if (isCancelled) return;
          const items = snap.docs
            .map((docSnap) => ({
              ...docSnap.data(),
              id: docSnap.id,
              firmId,
            }))
            .filter((item: any) => {
              if (!item || !item.id) return false;
              if (!isDemoFirm && isDemoRecordId(item.id)) return false;
              if (item.firmId && item.firmId !== firmId) return false;
              return true;
            }) as T[];
          callback(items);
          if (callbacks.onStatusChange) {
            callbacks.onStatusChange('connected', `Firm ${firmId} synced: ${subcollName} (${items.length})`);
          }
        },
        (error) => {
          if (isCancelled) return;
          console.warn(`Firestore onSnapshot error on 'firms/${firmId}/${subcollName}':`, error);
          if (callbacks.onStatusChange) {
            callbacks.onStatusChange('error', error.message || 'Sync disconnected');
          }
          if (callbacks.onError) {
            callbacks.onError(error instanceof Error ? error : new Error(String(error)));
          }

          if (!isCancelled && retryCount < 8) {
            const delay = Math.min(1000 * Math.pow(1.5, retryCount), 10000);
            const t = setTimeout(() => {
              if (!isCancelled) {
                setupSubcollectionListener(subcollName, callback, retryCount + 1);
              }
            }, delay);
            retryTimeouts.push(t);
          }
        }
      );
      activeUnsubscribers.push(unsub);
    } catch (err) {
      console.warn(`Error setting up subcollection listener for ${subcollName}:`, err);
    }
  };

  setupSubcollectionListener<Client>(COLLECTIONS.CLIENTS, callbacks.onClients);
  setupSubcollectionListener<Case>(COLLECTIONS.CASES, callbacks.onCases);
  setupSubcollectionListener<FIRRecord>(COLLECTIONS.FIRS, callbacks.onFirs);
  setupSubcollectionListener<Hearing>(COLLECTIONS.HEARINGS, callbacks.onHearings);
  setupSubcollectionListener<DocumentItem>(COLLECTIONS.DOCUMENTS, callbacks.onDocuments);
  setupSubcollectionListener<PaymentRecord>(COLLECTIONS.PAYMENTS, callbacks.onPayments);
  setupSubcollectionListener<LegalServiceRecord>(COLLECTIONS.SERVICES, callbacks.onServices);
  setupSubcollectionListener<ActivityLog>(COLLECTIONS.ACTIVITIES, callbacks.onActivities);

  return () => {
    isCancelled = true;
    activeUnsubscribers.forEach((u) => {
      try {
        u();
      } catch {
        // ignore
      }
    });
    retryTimeouts.forEach((t) => clearTimeout(t));
  };
}

/**
 * Backward compatibility: Attaches real-time listeners to root collections.
 */
export function subscribeToAllRealtimeCollections(callbacks: RealtimeSyncCallbacks): () => void {
  let isCancelled = false;
  const activeUnsubscribers: (() => void)[] = [];
  const retryTimeouts: any[] = [];

  const setupCollectionListener = <T>(
    collName: string,
    callback?: (items: T[]) => void,
    retryCount = 0
  ) => {
    if (isCancelled || !callback) return;

    try {
      const unsub = onSnapshot(
        collection(db, collName),
        (snap) => {
          if (isCancelled) return;
          const items = snap.docs.map((docSnap) => ({
            ...docSnap.data(),
            id: docSnap.id,
          })) as T[];
          callback(items);
          if (callbacks.onStatusChange) {
            callbacks.onStatusChange('connected', `Live synced with ${collName}`);
          }
        },
        (error) => {
          if (isCancelled) return;
          console.warn(`Firestore onSnapshot error on collection '${collName}':`, error);
          if (callbacks.onStatusChange) {
            callbacks.onStatusChange('error', error.message || 'Connection interrupted');
          }
          if (callbacks.onError) {
            callbacks.onError(error instanceof Error ? error : new Error(String(error)));
          }

          if (!isCancelled && retryCount < 10) {
            const delay = Math.min(1000 * Math.pow(1.5, retryCount), 10000);
            const t = setTimeout(() => {
              if (!isCancelled) {
                setupCollectionListener(collName, callback, retryCount + 1);
              }
            }, delay);
            retryTimeouts.push(t);
          }
        }
      );
      activeUnsubscribers.push(unsub);
    } catch (err) {
      console.warn(`Error setting up real-time listener for ${collName}:`, err);
    }
  };

  setupCollectionListener<Client>(COLLECTIONS.CLIENTS, callbacks.onClients);
  setupCollectionListener<Case>(COLLECTIONS.CASES, callbacks.onCases);
  setupCollectionListener<FIRRecord>(COLLECTIONS.FIRS, callbacks.onFirs);
  setupCollectionListener<Hearing>(COLLECTIONS.HEARINGS, callbacks.onHearings);
  setupCollectionListener<DocumentItem>(COLLECTIONS.DOCUMENTS, callbacks.onDocuments);
  setupCollectionListener<PaymentRecord>(COLLECTIONS.PAYMENTS, callbacks.onPayments);
  setupCollectionListener<LegalServiceRecord>(COLLECTIONS.SERVICES, callbacks.onServices);
  setupCollectionListener<ActivityLog>(COLLECTIONS.ACTIVITIES, callbacks.onActivities);

  return () => {
    isCancelled = true;
    activeUnsubscribers.forEach((u) => {
      try {
        u();
      } catch {
        // ignore
      }
    });
    retryTimeouts.forEach((t) => clearTimeout(t));
  };
}

// -------------------------------------------------------------
// Pakistan Legal Sections / Dafaat Repository
// -------------------------------------------------------------

export function subscribeToLegalSections(
  callback: (sections: PakistanLegalSection[]) => void
): () => void {
  try {
    const unsub = onSnapshot(
      collection(db, COLLECTIONS.LEGAL_SECTIONS),
      (snap) => {
        if (!snap.empty) {
          const list = snap.docs.map((d) => ({ ...d.data(), id: d.id })) as PakistanLegalSection[];
          callback(list);
        } else {
          callback(INITIAL_LEGAL_SECTIONS);
          seedLegalSectionsIfEmpty();
        }
      },
      (err) => {
        console.warn('Error reading legalSections:', err);
        callback(INITIAL_LEGAL_SECTIONS);
      }
    );
    return unsub;
  } catch (err) {
    console.warn('subscribeToLegalSections error:', err);
    callback(INITIAL_LEGAL_SECTIONS);
    return () => {};
  }
}

export async function seedLegalSectionsIfEmpty(): Promise<void> {
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.LEGAL_SECTIONS));
    if (snap.empty) {
      const batch = writeBatch(db);
      INITIAL_LEGAL_SECTIONS.forEach((sec) => {
        batch.set(doc(db, COLLECTIONS.LEGAL_SECTIONS, sec.id), sanitizeForFirestore(sec));
      });
      await batch.commit();
      console.log('Seeded Pakistan Legal Sections into Firestore');
    }
  } catch (e) {
    console.warn('seedLegalSectionsIfEmpty notice:', e);
  }
}

export async function saveLegalSection(section: PakistanLegalSection): Promise<void> {
  const path = `${COLLECTIONS.LEGAL_SECTIONS}/${section.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.LEGAL_SECTIONS, section.id), sanitizeForFirestore(section), { merge: true });
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, path);
  }
}

export async function deleteLegalSection(id: string): Promise<void> {
  const path = `${COLLECTIONS.LEGAL_SECTIONS}/${id}`;
  try {
    await deleteDoc(doc(db, COLLECTIONS.LEGAL_SECTIONS, id));
  } catch (e) {
    handleFirestoreError(e, OperationType.DELETE, path);
  }
}

// -------------------------------------------------------------
// Real-Time Authorized Lawyer Accounts & Super Admin Sync
// -------------------------------------------------------------

export function subscribeToAuthorizedAccounts(
  callback: (accounts: AuthorizedAccount[]) => void,
  onStatusChange?: (status: 'connected' | 'error', count?: number) => void
): () => void {
  try {
    const unsub = onSnapshot(
      collection(db, COLLECTIONS.AUTHORIZED_ACCOUNTS),
      (snap) => {
        if (!snap.empty) {
          const list = snap.docs.map((d) => ({ ...d.data(), id: d.id })) as AuthorizedAccount[];
          callback(list);
          if (onStatusChange) onStatusChange('connected', list.length);
        } else {
          callback(INITIAL_AUTHORIZED_ACCOUNTS);
          seedAuthorizedAccountsIfEmpty();
          if (onStatusChange) onStatusChange('connected', INITIAL_AUTHORIZED_ACCOUNTS.length);
        }
      },
      (err) => {
        console.warn('Real-time sync on authorizedAccounts notice:', err);
        if (onStatusChange) onStatusChange('error');
      }
    );
    return unsub;
  } catch (err) {
    console.warn('subscribeToAuthorizedAccounts error:', err);
    return () => {};
  }
}

export async function seedAuthorizedAccountsIfEmpty(): Promise<void> {
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.AUTHORIZED_ACCOUNTS));
    if (snap.empty) {
      const batch = writeBatch(db);
      INITIAL_AUTHORIZED_ACCOUNTS.forEach((acc) => {
        batch.set(doc(db, COLLECTIONS.AUTHORIZED_ACCOUNTS, acc.id), sanitizeForFirestore(acc), { merge: true });
      });
      await batch.commit();
      console.log('Seeded initial authorized accounts in Firestore');
    }
  } catch (e) {
    console.warn('seedAuthorizedAccountsIfEmpty notice:', e);
  }
}

export async function saveAuthorizedAccountToFirestore(account: AuthorizedAccount): Promise<void> {
  const path = `${COLLECTIONS.AUTHORIZED_ACCOUNTS}/${account.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.AUTHORIZED_ACCOUNTS, account.id), sanitizeForFirestore(account), { merge: true });
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, path);
  }
}

export async function deleteAuthorizedAccountFromFirestore(accountId: string): Promise<void> {
  const path = `${COLLECTIONS.AUTHORIZED_ACCOUNTS}/${accountId}`;
  try {
    await deleteDoc(doc(db, COLLECTIONS.AUTHORIZED_ACCOUNTS, accountId));
  } catch (e) {
    handleFirestoreError(e, OperationType.DELETE, path);
  }
}

export async function getAuthorizedAccountsFromFirestore(): Promise<AuthorizedAccount[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.AUTHORIZED_ACCOUNTS));
    if (snap.empty) {
      return INITIAL_AUTHORIZED_ACCOUNTS;
    }
    return snap.docs.map((d) => ({ ...d.data(), id: d.id })) as AuthorizedAccount[];
  } catch (e) {
    console.warn('getAuthorizedAccountsFromFirestore error:', e);
    return INITIAL_AUTHORIZED_ACCOUNTS;
  }
}

export function subscribeToAllFirms(
  callback: (firms: Firm[]) => void
): () => void {
  try {
    const unsub = onSnapshot(
      collection(db, COLLECTIONS.FIRMS),
      (snap) => {
        if (!snap.empty) {
          const list = snap.docs.map((d) => ({ ...d.data(), id: d.id })) as Firm[];
          callback(list);
        }
      },
      (err) => {
        console.warn('subscribeToAllFirms notice:', err);
      }
    );
    return unsub;
  } catch (err) {
    console.warn('subscribeToAllFirms error:', err);
    return () => {};
  }
}

// -------------------------------------------------------------
// Multi-Tenant Firm & User Management
// -------------------------------------------------------------

export async function saveFirm(firm: Firm): Promise<void> {
  const path = `${COLLECTIONS.FIRMS}/${firm.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.FIRMS, firm.id), sanitizeForFirestore(firm), { merge: true });
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, path);
  }
}

export async function getFirm(firmId: string): Promise<Firm | null> {
  const path = `${COLLECTIONS.FIRMS}/${firmId}`;
  try {
    const d = await getDoc(doc(db, COLLECTIONS.FIRMS, firmId));
    if (d.exists()) {
      return { ...d.data(), id: d.id } as Firm;
    }
    return null;
  } catch (e) {
    console.warn(`getFirm ${firmId} failed:`, e);
    return null;
  }
}

export async function getAllFirms(): Promise<Firm[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.FIRMS));
    if (snap.empty) {
      return DEMO_FIRMS;
    }
    return snap.docs.map((d) => ({ ...d.data(), id: d.id })) as Firm[];
  } catch (e) {
    console.warn('getAllFirms error:', e);
    return DEMO_FIRMS;
  }
}

export async function updateFirmSubscription(
  firmId: string,
  subscriptionStatus: SubscriptionStatus,
  plan?: SubscriptionPlan,
  trialEndsAt?: string
): Promise<void> {
  const path = `${COLLECTIONS.FIRMS}/${firmId}`;
  try {
    const updateData: Partial<Firm> = { subscriptionStatus };
    if (plan) updateData.plan = plan;
    if (trialEndsAt) updateData.trialEndsAt = trialEndsAt;
    await setDoc(doc(db, COLLECTIONS.FIRMS, firmId), sanitizeForFirestore(updateData), { merge: true });
  } catch (e) {
    handleFirestoreError(e, OperationType.UPDATE, path);
  }
}

export async function saveUserProfile(user: UserProfile): Promise<void> {
  const path = `${COLLECTIONS.USERS}/${user.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.USERS, user.id), sanitizeForFirestore(user), { merge: true });
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, path);
  }
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const d = await getDoc(doc(db, COLLECTIONS.USERS, userId));
    if (d.exists()) {
      return { ...d.data(), id: d.id } as UserProfile;
    }
    return null;
  } catch (e) {
    console.warn(`getUserProfile error:`, e);
    return null;
  }
}

export async function saveFirmMember(firmId: string, member: FirmMember): Promise<void> {
  const path = `${COLLECTIONS.FIRMS}/${firmId}/${COLLECTIONS.MEMBERS}/${member.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.FIRMS, firmId, COLLECTIONS.MEMBERS, member.id), sanitizeForFirestore(member), { merge: true });
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, path);
  }
}

export async function getFirmMembers(firmId: string): Promise<FirmMember[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.FIRMS, firmId, COLLECTIONS.MEMBERS));
    return snap.docs.map((d) => ({ ...d.data(), id: d.id })) as FirmMember[];
  } catch (e) {
    console.warn(`getFirmMembers error:`, e);
    return [];
  }
}

// -------------------------------------------------------------
// Isolated Tenant Data Operations (Firms/{firmId}/...)
// -------------------------------------------------------------

export async function saveClientToFirestore(client: Client, firmId?: string): Promise<void> {
  const targetFirmId = firmId || client.firmId;
  if (!targetFirmId || targetFirmId === 'system_root') return;
  const cleanClient = { ...client, firmId: targetFirmId };

  const path = `${COLLECTIONS.FIRMS}/${targetFirmId}/${COLLECTIONS.CLIENTS}/${cleanClient.id}`;
  try {
    await setDoc(
      doc(db, COLLECTIONS.FIRMS, targetFirmId, COLLECTIONS.CLIENTS, cleanClient.id),
      sanitizeForFirestore(cleanClient),
      { merge: true }
    );
    if (targetFirmId === 'firm_lahore_chambers') {
      setDoc(doc(db, COLLECTIONS.CLIENTS, cleanClient.id), sanitizeForFirestore(cleanClient), { merge: true }).catch(() => {});
    }
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, path);
  }
}

export async function deleteClientFromFirestore(id: string, firmId?: string): Promise<void> {
  const targetFirmId = firmId;
  if (!targetFirmId || targetFirmId === 'system_root') return;
  const path = `${COLLECTIONS.FIRMS}/${targetFirmId}/${COLLECTIONS.CLIENTS}/${id}`;
  try {
    await deleteDoc(doc(db, COLLECTIONS.FIRMS, targetFirmId, COLLECTIONS.CLIENTS, id));
    if (targetFirmId === 'firm_lahore_chambers') {
      deleteDoc(doc(db, COLLECTIONS.CLIENTS, id)).catch(() => {});
    }
  } catch (e) {
    handleFirestoreError(e, OperationType.DELETE, path);
  }
}

export async function saveCaseToFirestore(caseItem: Case, firmId?: string): Promise<void> {
  const targetFirmId = firmId || caseItem.firmId;
  if (!targetFirmId || targetFirmId === 'system_root') return;
  const cleanCase = { ...caseItem, firmId: targetFirmId };
  const path = `${COLLECTIONS.FIRMS}/${targetFirmId}/${COLLECTIONS.CASES}/${cleanCase.id}`;
  try {
    await setDoc(
      doc(db, COLLECTIONS.FIRMS, targetFirmId, COLLECTIONS.CASES, cleanCase.id),
      sanitizeForFirestore(cleanCase),
      { merge: true }
    );
    if (targetFirmId === 'firm_lahore_chambers') {
      setDoc(doc(db, COLLECTIONS.CASES, cleanCase.id), sanitizeForFirestore(cleanCase), { merge: true }).catch(() => {});
    }
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, path);
  }
}

export async function deleteCaseFromFirestore(id: string, firmId?: string): Promise<void> {
  const targetFirmId = firmId;
  if (!targetFirmId || targetFirmId === 'system_root') return;
  const path = `${COLLECTIONS.FIRMS}/${targetFirmId}/${COLLECTIONS.CASES}/${id}`;
  try {
    await deleteDoc(doc(db, COLLECTIONS.FIRMS, targetFirmId, COLLECTIONS.CASES, id));
    if (targetFirmId === 'firm_lahore_chambers') {
      deleteDoc(doc(db, COLLECTIONS.CASES, id)).catch(() => {});
    }
  } catch (e) {
    handleFirestoreError(e, OperationType.DELETE, path);
  }
}

export async function saveFIRToFirestore(fir: FIRRecord, firmId?: string): Promise<void> {
  const targetFirmId = firmId || fir.firmId;
  if (!targetFirmId || targetFirmId === 'system_root') return;
  const cleanFIR = { ...fir, firmId: targetFirmId };
  const path = `${COLLECTIONS.FIRMS}/${targetFirmId}/${COLLECTIONS.FIRS}/${cleanFIR.id}`;
  try {
    await setDoc(
      doc(db, COLLECTIONS.FIRMS, targetFirmId, COLLECTIONS.FIRS, cleanFIR.id),
      sanitizeForFirestore(cleanFIR),
      { merge: true }
    );
    if (targetFirmId === 'firm_lahore_chambers') {
      setDoc(doc(db, COLLECTIONS.FIRS, cleanFIR.id), sanitizeForFirestore(cleanFIR), { merge: true }).catch(() => {});
    }
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, path);
  }
}

export async function deleteFIRFromFirestore(id: string, firmId?: string): Promise<void> {
  const targetFirmId = firmId;
  if (!targetFirmId || targetFirmId === 'system_root') return;
  const path = `${COLLECTIONS.FIRMS}/${targetFirmId}/${COLLECTIONS.FIRS}/${id}`;
  try {
    await deleteDoc(doc(db, COLLECTIONS.FIRMS, targetFirmId, COLLECTIONS.FIRS, id));
    if (targetFirmId === 'firm_lahore_chambers') {
      deleteDoc(doc(db, COLLECTIONS.FIRS, id)).catch(() => {});
    }
  } catch (e) {
    handleFirestoreError(e, OperationType.DELETE, path);
  }
}

export async function saveHearingToFirestore(hearing: Hearing, firmId?: string): Promise<void> {
  const targetFirmId = firmId || hearing.firmId;
  if (!targetFirmId || targetFirmId === 'system_root') return;
  const cleanHearing = { ...hearing, firmId: targetFirmId };
  const path = `${COLLECTIONS.FIRMS}/${targetFirmId}/${COLLECTIONS.HEARINGS}/${cleanHearing.id}`;
  try {
    await setDoc(
      doc(db, COLLECTIONS.FIRMS, targetFirmId, COLLECTIONS.HEARINGS, cleanHearing.id),
      sanitizeForFirestore(cleanHearing),
      { merge: true }
    );
    if (targetFirmId === 'firm_lahore_chambers') {
      setDoc(doc(db, COLLECTIONS.HEARINGS, cleanHearing.id), sanitizeForFirestore(cleanHearing), { merge: true }).catch(() => {});
    }
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, path);
  }
}

export async function deleteHearingFromFirestore(id: string, firmId?: string): Promise<void> {
  const targetFirmId = firmId;
  if (!targetFirmId || targetFirmId === 'system_root') return;
  const path = `${COLLECTIONS.FIRMS}/${targetFirmId}/${COLLECTIONS.HEARINGS}/${id}`;
  try {
    await deleteDoc(doc(db, COLLECTIONS.FIRMS, targetFirmId, COLLECTIONS.HEARINGS, id));
    if (targetFirmId === 'firm_lahore_chambers') {
      deleteDoc(doc(db, COLLECTIONS.HEARINGS, id)).catch(() => {});
    }
  } catch (e) {
    handleFirestoreError(e, OperationType.DELETE, path);
  }
}

export async function saveDocumentToFirestore(docItem: DocumentItem, firmId?: string): Promise<void> {
  const targetFirmId = firmId || docItem.firmId;
  if (!targetFirmId || targetFirmId === 'system_root') return;
  const cleanDoc = { ...docItem, firmId: targetFirmId };
  const path = `${COLLECTIONS.FIRMS}/${targetFirmId}/${COLLECTIONS.DOCUMENTS}/${cleanDoc.id}`;
  try {
    await setDoc(
      doc(db, COLLECTIONS.FIRMS, targetFirmId, COLLECTIONS.DOCUMENTS, cleanDoc.id),
      sanitizeForFirestore(cleanDoc),
      { merge: true }
    );
    if (targetFirmId === 'firm_lahore_chambers') {
      setDoc(doc(db, COLLECTIONS.DOCUMENTS, cleanDoc.id), sanitizeForFirestore(cleanDoc), { merge: true }).catch(() => {});
    }
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, path);
  }
}

export async function deleteDocumentFromFirestore(id: string, firmId?: string): Promise<void> {
  const targetFirmId = firmId;
  if (!targetFirmId || targetFirmId === 'system_root') return;
  const path = `${COLLECTIONS.FIRMS}/${targetFirmId}/${COLLECTIONS.DOCUMENTS}/${id}`;
  try {
    await deleteDoc(doc(db, COLLECTIONS.FIRMS, targetFirmId, COLLECTIONS.DOCUMENTS, id));
    if (targetFirmId === 'firm_lahore_chambers') {
      deleteDoc(doc(db, COLLECTIONS.DOCUMENTS, id)).catch(() => {});
    }
  } catch (e) {
    handleFirestoreError(e, OperationType.DELETE, path);
  }
}

export async function savePaymentToFirestore(payment: PaymentRecord, firmId?: string): Promise<void> {
  const targetFirmId = firmId || payment.firmId;
  if (!targetFirmId || targetFirmId === 'system_root') return;
  const cleanPayment = { ...payment, firmId: targetFirmId };
  const path = `${COLLECTIONS.FIRMS}/${targetFirmId}/${COLLECTIONS.PAYMENTS}/${cleanPayment.id}`;
  try {
    await setDoc(
      doc(db, COLLECTIONS.FIRMS, targetFirmId, COLLECTIONS.PAYMENTS, cleanPayment.id),
      sanitizeForFirestore(cleanPayment),
      { merge: true }
    );
    if (targetFirmId === 'firm_lahore_chambers') {
      setDoc(doc(db, COLLECTIONS.PAYMENTS, cleanPayment.id), sanitizeForFirestore(cleanPayment), { merge: true }).catch(() => {});
    }
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, path);
  }
}

export async function deletePaymentFromFirestore(id: string, firmId?: string): Promise<void> {
  const targetFirmId = firmId;
  if (!targetFirmId || targetFirmId === 'system_root') return;
  const path = `${COLLECTIONS.FIRMS}/${targetFirmId}/${COLLECTIONS.PAYMENTS}/${id}`;
  try {
    await deleteDoc(doc(db, COLLECTIONS.FIRMS, targetFirmId, COLLECTIONS.PAYMENTS, id));
    if (targetFirmId === 'firm_lahore_chambers') {
      deleteDoc(doc(db, COLLECTIONS.PAYMENTS, id)).catch(() => {});
    }
  } catch (e) {
    handleFirestoreError(e, OperationType.DELETE, path);
  }
}

export async function saveLegalServiceToFirestore(service: LegalServiceRecord, firmId?: string): Promise<void> {
  const targetFirmId = firmId || service.firmId;
  if (!targetFirmId || targetFirmId === 'system_root') return;
  const cleanService = { ...service, firmId: targetFirmId };
  const path = `${COLLECTIONS.FIRMS}/${targetFirmId}/${COLLECTIONS.SERVICES}/${cleanService.id}`;
  try {
    await setDoc(
      doc(db, COLLECTIONS.FIRMS, targetFirmId, COLLECTIONS.SERVICES, cleanService.id),
      sanitizeForFirestore(cleanService),
      { merge: true }
    );
    if (targetFirmId === 'firm_lahore_chambers') {
      setDoc(doc(db, COLLECTIONS.SERVICES, cleanService.id), sanitizeForFirestore(cleanService), { merge: true }).catch(() => {});
    }
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, path);
  }
}

export async function deleteLegalServiceFromFirestore(id: string, firmId?: string): Promise<void> {
  const targetFirmId = firmId;
  if (!targetFirmId || targetFirmId === 'system_root') return;
  const path = `${COLLECTIONS.FIRMS}/${targetFirmId}/${COLLECTIONS.SERVICES}/${id}`;
  try {
    await deleteDoc(doc(db, COLLECTIONS.FIRMS, targetFirmId, COLLECTIONS.SERVICES, id));
    if (targetFirmId === 'firm_lahore_chambers') {
      deleteDoc(doc(db, COLLECTIONS.SERVICES, id)).catch(() => {});
    }
  } catch (e) {
    handleFirestoreError(e, OperationType.DELETE, path);
  }
}

export async function saveActivityToFirestore(act: ActivityLog, firmId?: string): Promise<void> {
  const targetFirmId = firmId || act.firmId;
  if (!targetFirmId || targetFirmId === 'system_root') return;
  const cleanAct = { ...act, firmId: targetFirmId };
  const path = `${COLLECTIONS.FIRMS}/${targetFirmId}/${COLLECTIONS.ACTIVITIES}/${cleanAct.id}`;
  try {
    await setDoc(
      doc(db, COLLECTIONS.FIRMS, targetFirmId, COLLECTIONS.ACTIVITIES, cleanAct.id),
      sanitizeForFirestore(cleanAct),
      { merge: true }
    );
    if (targetFirmId === 'firm_lahore_chambers') {
      setDoc(doc(db, COLLECTIONS.ACTIVITIES, cleanAct.id), sanitizeForFirestore(cleanAct), { merge: true }).catch(() => {});
    }
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, path);
  }
}

// -------------------------------------------------------------
// Bootstrapping and Initial Seeding
// -------------------------------------------------------------

export async function bootstrapCommercialFirms(): Promise<void> {
  try {
    const batch = writeBatch(db);

    // Seed demo firms
    DEMO_FIRMS.forEach((firm) => {
      batch.set(doc(db, COLLECTIONS.FIRMS, firm.id), sanitizeForFirestore(firm), { merge: true });
    });

    // Seed demo users
    DEMO_USERS.forEach((usr) => {
      batch.set(doc(db, COLLECTIONS.USERS, usr.id), sanitizeForFirestore(usr), { merge: true });
    });

    // Seed initial authorized accounts for login
    INITIAL_AUTHORIZED_ACCOUNTS.forEach((acc) => {
      batch.set(doc(db, COLLECTIONS.AUTHORIZED_ACCOUNTS, acc.id), sanitizeForFirestore(acc), { merge: true });
    });

    await batch.commit();
    console.log('Successfully bootstrapped multi-tenant legal platform in Firestore');
  } catch (e) {
    console.warn('bootstrapCommercialFirms notice:', e);
  }
}

export async function checkAndBootstrapFirestore(): Promise<boolean> {
  try {
    const firmsSnap = await getDocs(collection(db, COLLECTIONS.FIRMS));
    if (firmsSnap.empty) {
      await bootstrapCommercialFirms();
    }
    await seedAuthorizedAccountsIfEmpty();
    await seedLegalSectionsIfEmpty();
    return true;
  } catch (error) {
    console.warn('Unable to bootstrap Firestore:', error);
    return false;
  }
}

export async function syncFromFirestore(firmId?: string): Promise<RemoteLegalData | null> {
  try {
    if (!firmId || firmId === 'system_root') {
      return null;
    }

    // STRICT MULTI-TENANT ISOLATION:
    // Read strictly this firm's subcollections from Firestore.
    // If empty, return clean pristine empty lists.
    // NEVER inject demo items or fall back to INITIAL_CLIENTS/INITIAL_CASES!
    const [clientsSnap, casesSnap, firsSnap, hearingsSnap, docsSnap, paymentsSnap, servicesSnap, activitiesSnap] =
      await Promise.all([
        getDocs(collection(db, COLLECTIONS.FIRMS, firmId, COLLECTIONS.CLIENTS)),
        getDocs(collection(db, COLLECTIONS.FIRMS, firmId, COLLECTIONS.CASES)),
        getDocs(collection(db, COLLECTIONS.FIRMS, firmId, COLLECTIONS.FIRS)),
        getDocs(collection(db, COLLECTIONS.FIRMS, firmId, COLLECTIONS.HEARINGS)),
        getDocs(collection(db, COLLECTIONS.FIRMS, firmId, COLLECTIONS.DOCUMENTS)),
        getDocs(collection(db, COLLECTIONS.FIRMS, firmId, COLLECTIONS.PAYMENTS)),
        getDocs(collection(db, COLLECTIONS.FIRMS, firmId, COLLECTIONS.SERVICES)),
        getDocs(collection(db, COLLECTIONS.FIRMS, firmId, COLLECTIONS.ACTIVITIES)),
      ]);

    const isDemoFirm = firmId === 'firm_lahore_chambers' || firmId === 'firm_karachi_advocates';

    // Strictly filter out any demo items or cross-firm records
    const filterClean = (docSnap: any): boolean => {
      if (!docSnap || !docSnap.id) return false;
      if (!isDemoFirm && isDemoRecordId(docSnap.id)) return false;
      const data = docSnap.data();
      if (data?.firmId && data.firmId !== firmId) return false;
      return true;
    };

    return {
      clients: clientsSnap.docs.filter(filterClean).map((d) => ({ ...d.data(), id: d.id, firmId } as Client)),
      cases: casesSnap.docs.filter(filterClean).map((d) => ({ ...d.data(), id: d.id, firmId } as Case)),
      firs: firsSnap.docs.filter(filterClean).map((d) => ({ ...d.data(), id: d.id, firmId } as FIRRecord)),
      hearings: hearingsSnap.docs.filter(filterClean).map((d) => ({ ...d.data(), id: d.id, firmId } as Hearing)),
      documents: docsSnap.docs.filter(filterClean).map((d) => ({ ...d.data(), id: d.id, firmId } as DocumentItem)),
      payments: paymentsSnap.docs.filter(filterClean).map((d) => ({ ...d.data(), id: d.id, firmId } as PaymentRecord)),
      services: servicesSnap.docs.filter(filterClean).map((d) => ({ ...d.data(), id: d.id, firmId } as LegalServiceRecord)),
      activities: activitiesSnap.docs.filter(filterClean).map((d) => ({ ...d.data(), id: d.id, firmId } as ActivityLog)),
    };
  } catch (error) {
    console.warn('syncFromFirestore notice:', error);
    // For fresh lawyers, always return clean empty arrays rather than null
    return {
      clients: [],
      cases: [],
      firs: [],
      hearings: [],
      documents: [],
      payments: [],
      services: [],
      activities: [],
    };
  }
}

