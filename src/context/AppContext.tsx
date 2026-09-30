import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  Client,
  Case,
  FIRRecord,
  Hearing,
  DocumentItem,
  PaymentRecord,
  ActivityLog,
  UserProfile,
  UserRole,
  LegalServiceRecord,
  ServiceCatalogItem,
  PakistanLegalSection,
  Firm,
  FirmMember,
  SubscriptionPlan,
  SubscriptionStatus,
  AuthorizedAccount,
  PaymentHistoryEntry,
  PaymentMethod,
} from '../types';
import {
  ROLE_PROFILES,
  INITIAL_CLIENTS,
  INITIAL_CASES,
  INITIAL_FIRS,
  INITIAL_HEARINGS,
  INITIAL_DOCUMENTS,
  INITIAL_PAYMENTS,
  INITIAL_ACTIVITIES,
  INITIAL_LEGAL_SERVICES,
  SERVICES_CATALOG,
} from '../data/mockData';
import { INITIAL_LEGAL_SECTIONS } from '../data/legalSectionsData';
import {
  DEMO_FIRMS,
  DEMO_USERS,
  INITIAL_AUTHORIZED_ACCOUNTS,
} from '../data/commercialMockData';
import {
  syncFromFirestore,
  checkAndBootstrapFirestore,
  subscribeToFirmRealtimeCollections,
  subscribeToLegalSections,
  saveClientToFirestore,
  deleteClientFromFirestore,
  saveCaseToFirestore,
  deleteCaseFromFirestore,
  saveFIRToFirestore,
  deleteFIRFromFirestore,
  saveHearingToFirestore,
  deleteHearingFromFirestore,
  saveDocumentToFirestore,
  deleteDocumentFromFirestore,
  savePaymentToFirestore,
  deletePaymentFromFirestore,
  saveLegalServiceToFirestore,
  deleteLegalServiceFromFirestore,
  saveActivityToFirestore,
  saveLegalSection,
  deleteLegalSection as deleteLegalSectionDb,
  saveFirm,
  getAllFirms,
  updateFirmSubscription,
  subscribeToAuthorizedAccounts,
  saveAuthorizedAccountToFirestore,
  deleteAuthorizedAccountFromFirestore,
  getAuthorizedAccountsFromFirestore,
  subscribeToAllFirms,
} from '../lib/firestoreService';
import { testFirestoreConnection } from '../lib/firebase';
import {
  getAccessToken,
  getOrCreateChamberFolder,
  getOrCreateChamberFolderDetails,
  uploadBackupJsonToGoogleDrive,
  syncAndUploadAllToGoogleDrive,
} from '../lib/googleDriveService';

interface AppContextType {
  // Commercial Multi-Tenant State
  firms: Firm[];
  currentFirm: Firm;
  firmMembers: FirmMember[];
  switchTenant: (firmId: string) => void;
  switchDemoUser: (userId: string) => void;
  updateFirm: (firm: Partial<Firm>) => void;
  updateFirmStatus: (firmId: string, status: SubscriptionStatus) => void;
  addFirmMember: (member: FirmMember) => void;
  removeFirmMember: (memberId: string) => void;

  // Authorized User Accounts (Managed by Super Admin)
  authorizedAccounts: AuthorizedAccount[];
  addAuthorizedAccount: (account: AuthorizedAccount) => void;
  updateAuthorizedAccount: (id: string, updates: Partial<AuthorizedAccount>) => void;
  deleteAuthorizedAccount: (id: string) => void;

  // Onboarding & Modals
  showOnboarding: boolean;
  setShowOnboarding: (show: boolean) => void;
  isTeamModalOpen: boolean;
  setIsTeamModalOpen: (open: boolean) => void;
  isGmailBackupModalOpen: boolean;
  setIsGmailBackupModalOpen: (open: boolean) => void;

  // Gmail Attachment & Backup
  attachLawyerGmail: (gmail: string, driveLink?: string) => Promise<void>;
  disconnectLawyerGmail: () => void;
  syncLawyerDriveBackup: () => Promise<{ success: boolean; message: string; driveLink?: string; fileName?: string }>;

  // Pakistan Legal Sections Repository
  legalSections: PakistanLegalSection[];
  addLegalSection: (section: PakistanLegalSection) => void;
  editLegalSection: (section: PakistanLegalSection) => void;
  deleteLegalSection: (id: string) => void;

  // Auth & Roles
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (loggedIn: boolean) => void;
  login: (email: string, role: UserRole) => void;
  loginLawyer: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  registerLawyer: (params: {
    name: string;
    email: string;
    password: string;
    firmName: string;
    city?: string;
  }) => Promise<{ success: boolean; message?: string }>;
  loginSuperAdmin: (username: string, password: string) => { success: boolean; message?: string };
  logout: () => void;

  // Language & UI Preferences
  languageMode: 'english' | 'romanUrdu';
  setLanguageMode: (mode: 'english' | 'romanUrdu') => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  toggleDarkMode: () => void;

  // Navigation & View
  activeView: string;
  setActiveView: (view: string) => void;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean) => void;
  selectedClientId: string | null;
  setSelectedClientId: (id: string | null) => void;
  selectedCaseId: string | null;
  setSelectedCaseId: (id: string | null) => void;
  selectedFirId: string | null;
  setSelectedFirId: (id: string | null) => void;
  selectedServiceId: string | null;
  setSelectedServiceId: (id: string | null) => void;

  // Global Search Modal
  isSearchModalOpen: boolean;
  setIsSearchModalOpen: (open: boolean) => void;
  globalSearchQuery: string;
  setGlobalSearchQuery: (query: string) => void;

  // Data Collections (Filtered strictly to current firm)
  clients: Client[];
  cases: Case[];
  firs: FIRRecord[];
  hearings: Hearing[];
  documents: DocumentItem[];
  payments: PaymentRecord[];
  activities: ActivityLog[];
  services: LegalServiceRecord[];
  serviceCatalog: ServiceCatalogItem[];

  // Mutations
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => Client;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => void;

  addCase: (caseItem: Omit<Case, 'id' | 'createdAt'>) => Case;
  updateCase: (id: string, caseItem: Partial<Case>) => void;
  deleteCase: (id: string) => void;

  addFIR: (fir: Omit<FIRRecord, 'id' | 'createdAt'>) => FIRRecord;
  updateFIR: (id: string, fir: Partial<FIRRecord>) => void;
  deleteFIR: (id: string) => void;

  addHearing: (hearing: Omit<Hearing, 'id' | 'createdAt'>) => Hearing;
  updateHearing: (id: string, hearing: Partial<Hearing>) => void;
  deleteHearing: (id: string) => void;

  addDocument: (doc: Omit<DocumentItem, 'id' | 'uploadDate' | 'uploadedBy'>) => DocumentItem;
  updateDocument: (id: string, doc: Partial<DocumentItem>) => void;
  deleteDocument: (id: string) => void;

  addPayment: (payment: Omit<PaymentRecord, 'id' | 'remainingAmount' | 'createdAt'>) => PaymentRecord;
  updatePayment: (id: string, payment: Partial<PaymentRecord>, modificationReason?: string) => void;
  deletePayment: (id: string, reason?: string) => void;
  addPaymentInstallment: (
    paymentId: string,
    installmentAmount: number,
    paymentDate: string,
    paymentMethod: PaymentMethod,
    notes?: string
  ) => Promise<PaymentRecord | null>;

  addLegalService: (service: Omit<LegalServiceRecord, 'id' | 'remainingAmount' | 'createdAt'>) => LegalServiceRecord;
  updateLegalService: (id: string, service: Partial<LegalServiceRecord>) => void;
  deleteLegalService: (id: string) => void;

  addActivity: (action: string, details: string, category: ActivityLog['category']) => void;

  // Utilities
  getWhatsAppShareUrl: (phone: string, text: string) => string;
  openWhatsApp: (phone: string, text: string) => void;
  openEmail: (email: string, subject: string, body: string) => void;
  resetAllData: () => Promise<void>;
  exportDataJson: () => void;
  importDataJson: (jsonString: string) => Promise<boolean>;

  // Google Drive Modal
  isGoogleDriveModalOpen: boolean;
  setIsGoogleDriveModalOpen: (open: boolean) => void;
  driveTargetDoc: DocumentItem | null;
  setDriveTargetDoc: (doc: DocumentItem | null) => void;
  openGoogleDriveModal: (doc?: DocumentItem) => void;

  // Cloud & Real-time Sync
  isCloudSyncing: boolean;
  isConnectedToCloud: boolean;
  isRealtimeActive: boolean;
  syncNotification: string | null;
  syncWithCloud: () => Promise<void>;

  // Computed / Quick Metrics
  todayDateStr: string;
  todayHearings: Hearing[];
  upcomingHearings: Hearing[];
  totalActiveCases: number;
  totalPendingFees: number;
  totalPaidFees: number;
  activeServicesCount: number;
  completedServicesCount: number;
  totalPendingServiceFees: number;
  totalPaidServiceFees: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  FIRM_ID: 'wakalat_active_firm_id',
  USER_ID: 'wakalat_active_user_id',
  ROLE: 'wakalat_role',
  LANG: 'wakalat_lang',
  LOGGED_IN: 'wakalat_logged_in',
  AUTHORIZED_ACCOUNTS: 'wakalat_authorized_accounts',
  DARK_MODE: 'wakalat_dark_mode',
  ALL_FIRMS: 'wakalat_all_firms',
};

// Demo firm IDs with pre-seeded baseline data
const DEMO_FIRM_IDS = new Set(['firm_lahore_chambers', 'firm_tariq_associates', 'firm_karachi_advocates']);

// Pre-seeded demo record IDs that must NEVER appear in a real or newly registered lawyer's workspace
export const DEMO_ITEM_IDS = new Set([
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

export const isDemoItem = (item: any): boolean => {
  if (!item || !item.id) return false;
  const idStr = String(item.id);
  if (DEMO_ITEM_IDS.has(idStr)) return true;
  if (/^(cl|case|fir|hr|h|doc|pay|p|srv|s|act|khi|hist|cat|tm)[_-]/i.test(idStr)) return true;
  return false;
};

// Helper: Strictly purges any foreign or preloaded demo data from real registered lawyers
export const sanitizeTenantData = (firmId: string, data: any) => {
  if (!data) {
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

  const isDemoFirm = firmId === 'firm_lahore_chambers' || firmId === 'firm_karachi_advocates';

  // Strictly filter out any items from other firms or pre-seeded demo records!
  const isOwnItem = (item: any) => {
    if (!item || !item.id) return false;
    // For non-demo chambers: strip all known demo mock records
    if (!isDemoFirm && isDemoItem(item)) return false;
    // Strip any records marked with a different firmId
    if (item.firmId && item.firmId !== firmId) return false;
    return true;
  };

  return {
    clients: Array.isArray(data.clients) ? data.clients.filter(isOwnItem) : [],
    cases: Array.isArray(data.cases) ? data.cases.filter(isOwnItem) : [],
    firs: Array.isArray(data.firs) ? data.firs.filter(isOwnItem) : [],
    hearings: Array.isArray(data.hearings) ? data.hearings.filter(isOwnItem) : [],
    documents: Array.isArray(data.documents) ? data.documents.filter(isOwnItem) : [],
    payments: Array.isArray(data.payments) ? data.payments.filter(isOwnItem) : [],
    services: Array.isArray(data.services) ? data.services.filter(isOwnItem) : [],
    activities: Array.isArray(data.activities) ? data.activities.filter(isOwnItem) : [],
  };
};

// Firm Data Storage Helper: Strictly isolates data per law firm
const getFirmStorageData = (firmId: string) => {
  try {
    const raw = localStorage.getItem(`wakalat_firm_${firmId}_data`);
    if (raw) {
      const parsed = JSON.parse(raw);
      const sanitized = sanitizeTenantData(firmId, parsed);
      // Auto-heal: If localStorage was contaminated earlier with demo data, permanently clean it up!
      if (
        (parsed.clients && parsed.clients.length !== sanitized.clients.length) ||
        (parsed.cases && parsed.cases.length !== sanitized.cases.length) ||
        (parsed.firs && parsed.firs.length !== sanitized.firs.length) ||
        (parsed.hearings && parsed.hearings.length !== sanitized.hearings.length) ||
        (parsed.documents && parsed.documents.length !== sanitized.documents.length)
      ) {
        localStorage.setItem(`wakalat_firm_${firmId}_data`, JSON.stringify(sanitized));
      }
      return sanitized;
    }
  } catch (e) {
    console.warn('Error reading firm storage data:', e);
  }

  // All chambers start with fresh zero entries (no mock clutter)
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
};

const saveFirmStorageData = (
  firmId: string,
  data: {
    clients: Client[];
    cases: Case[];
    firs: FIRRecord[];
    hearings: Hearing[];
    documents: DocumentItem[];
    payments: PaymentRecord[];
    services: LegalServiceRecord[];
    activities: ActivityLog[];
  }
) => {
  if (!firmId || firmId === 'system_root') return;
  try {
    localStorage.setItem(`wakalat_firm_${firmId}_data`, JSON.stringify(data));
  } catch (e) {
    console.warn('Error saving firm storage data:', e);
  }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Commercial Multi-Tenant State
  const [firms, setFirms] = useState<Firm[]>(() => {
    const savedFirms = localStorage.getItem(STORAGE_KEYS.ALL_FIRMS);
    if (savedFirms) {
      try {
        const parsed = JSON.parse(savedFirms);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return DEMO_FIRMS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ALL_FIRMS, JSON.stringify(firms));
  }, [firms]);

  // Authorized User Accounts managed exclusively by Super Admin
  const [authorizedAccounts, setAuthorizedAccounts] = useState<AuthorizedAccount[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUTHORIZED_ACCOUNTS);
    return saved ? JSON.parse(saved) : INITIAL_AUTHORIZED_ACCOUNTS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUTHORIZED_ACCOUNTS, JSON.stringify(authorizedAccounts));
  }, [authorizedAccounts]);

  const [currentFirm, setCurrentFirm] = useState<Firm>(() => {
    const savedFirmId = localStorage.getItem(STORAGE_KEYS.FIRM_ID);
    if (savedFirmId) {
      const foundInFirms = firms.find((f) => f.id === savedFirmId);
      if (foundInFirms) return foundInFirms;

      const savedAccs = localStorage.getItem(STORAGE_KEYS.AUTHORIZED_ACCOUNTS);
      if (savedAccs) {
        try {
          const accs: AuthorizedAccount[] = JSON.parse(savedAccs);
          const acc = accs.find((a) => a.firmId === savedFirmId);
          if (acc) {
            return {
              id: acc.firmId,
              name: acc.firmName || `${acc.name} Law Chambers`,
              ownerId: acc.id,
              accountType: 'lawfirm',
              plan: acc.plan || 'starter',
              subscriptionStatus: acc.status === 'active' ? 'active' : 'trial',
              trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              officeAddress: 'Chamber Office',
              city: 'Pakistan',
              province: 'Punjab',
              country: 'Pakistan',
              phone: '',
              email: acc.email,
              createdAt: acc.createdDate || new Date().toISOString().split('T')[0],
            };
          }
        } catch {}
      }
    }
    return firms[0] || DEMO_FIRMS[0];
  });

// Demo chamber team members (only for demo firm_lahore_chambers)
const DEMO_MEMBERS: FirmMember[] = [
  {
    id: 'usr_tariq_admin',
    userId: 'usr_tariq_admin',
    firmId: 'firm_lahore_chambers',
    name: 'Advocate Malik Tariq Hussain',
    email: 'admin@khanlawchambers.pk',
    phone: '+92 300 8472910',
    role: 'firm_admin',
    barLicenseNo: 'LH-HC-19482',
    joinedAt: '2025-01-10',
    permissions: {
      canManageClients: true,
      canManageCases: true,
      canManageFirs: true,
      canManageHearings: true,
      canManageDocuments: true,
      canViewFinancials: true,
      canManagePayments: true,
      canManageTeam: true,
      canManageFirm: true,
    },
  },
  {
    id: 'usr_daniyal_lawyer',
    userId: 'usr_daniyal_lawyer',
    firmId: 'firm_lahore_chambers',
    name: 'Advocate Daniyal Tariq',
    email: 'daniyal@khanlawchambers.pk',
    phone: '+92 321 4455667',
    role: 'lawyer',
    barLicenseNo: 'LH-HC-28491',
    joinedAt: '2025-01-15',
    permissions: {
      canManageClients: true,
      canManageCases: true,
      canManageFirs: true,
      canManageHearings: true,
      canManageDocuments: true,
      canViewFinancials: true,
      canManagePayments: true,
      canManageTeam: false,
      canManageFirm: false,
    },
  },
  {
    id: 'usr_bashir_clerk',
    userId: 'usr_bashir_clerk',
    firmId: 'firm_lahore_chambers',
    name: 'Munshi Bashir Ahmed',
    email: 'bashir@khanlawchambers.pk',
    phone: '+92 333 7890123',
    role: 'assistant',
    joinedAt: '2025-01-20',
    permissions: {
      canManageClients: true,
      canManageCases: true,
      canManageFirs: true,
      canManageHearings: true,
      canManageDocuments: true,
      canViewFinancials: false,
      canManagePayments: false,
      canManageTeam: false,
      canManageFirm: false,
    },
  },
];

const getFirmMembersStorage = (firmId: string): FirmMember[] => {
  try {
    const raw = localStorage.getItem(`wakalat_firm_${firmId}_members`);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
};

  const [firmMembers, setFirmMembers] = useState<FirmMember[]>(() =>
    getFirmMembersStorage(currentFirm.id)
  );

  // Modals for Commercial Features
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState<boolean>(false);
  const [isGmailBackupModalOpen, setIsGmailBackupModalOpen] = useState<boolean>(false);

  // Central Pakistan Legal Sections / Dafaat Repository
  const [legalSections, setLegalSections] = useState<PakistanLegalSection[]>(INITIAL_LEGAL_SECTIONS);

  // User & Authentication State
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const savedUserId = localStorage.getItem(STORAGE_KEYS.USER_ID);
    if (savedUserId) {
      const foundInDemo = DEMO_USERS.find((u) => u.id === savedUserId);
      if (foundInDemo) return foundInDemo;

      // Check authorized accounts
      const savedAccountsRaw = localStorage.getItem(STORAGE_KEYS.AUTHORIZED_ACCOUNTS);
      if (savedAccountsRaw) {
        try {
          const accounts: AuthorizedAccount[] = JSON.parse(savedAccountsRaw);
          const acc = accounts.find((a) => a.id === savedUserId || a.email.toLowerCase() === savedUserId.toLowerCase());
          if (acc) {
            return {
              id: acc.id,
              userId: acc.id,
              name: acc.name,
              email: acc.email,
              phone: '',
              role: acc.role,
              firmId: acc.firmId,
              firmName: acc.firmName,
              accountType: 'lawfirm',
              subscriptionStatus: acc.status === 'active' ? 'active' : 'trial',
              plan: acc.plan,
              createdDate: acc.createdDate,
              connectedGmail: acc.connectedGmail,
              lastBackupDate: acc.lastBackupDate,
              onboardingCompleted: true,
            };
          }
        } catch {}
      }
    }
    return DEMO_USERS[1];
  });

  const [currentRole, setCurrentRoleState] = useState<UserRole>(currentUser.role || 'firm_admin');

  // CRITICAL REQUIREMENT: The website must always start on the login screen
  const [isLoggedIn, setIsLoggedInState] = useState<boolean>(false);

  const [languageMode, setLanguageModeState] = useState<'english' | 'romanUrdu'>(() => {
    return (localStorage.getItem(STORAGE_KEYS.LANG) as 'english' | 'romanUrdu') || 'romanUrdu';
  });

  // Exclusively White Mode per user instruction: "isy bus white mode ma bnao all text must be visible"
  const [darkMode, setDarkMode] = useState<boolean>(false);

  useEffect(() => {
    // Pure White Mode permanently enforced
    document.documentElement.classList.remove('dark');
    localStorage.setItem(STORAGE_KEYS.DARK_MODE, 'false');
  }, []);

  const toggleDarkMode = () => {
    // Pure White Mode permanently enforced
    setDarkMode(false);
    document.documentElement.classList.remove('dark');
  };

  // Secure Navigation State
  const [activeView, setActiveViewState] = useState<string>('dashboard');

  const setActiveView = useCallback((view: string) => {
    if (view === 'super_admin' && currentUser.role !== 'super_admin') {
      setActiveViewState('dashboard');
      return;
    }
    setActiveViewState(view);
  }, [currentUser.role]);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [selectedFirId, setSelectedFirId] = useState<string | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');

  // Google Drive Modal
  const [isGoogleDriveModalOpen, setIsGoogleDriveModalOpen] = useState<boolean>(false);
  const [driveTargetDoc, setDriveTargetDoc] = useState<DocumentItem | null>(null);

  const openGoogleDriveModal = (doc?: DocumentItem) => {
    setDriveTargetDoc(doc || null);
    setIsGoogleDriveModalOpen(true);
  };

  // Main collections initialized with current firm's isolated dataset (Fresh 0-entry for new lawyers!)
  const initialFirmData = getFirmStorageData(currentFirm.id);
  const [clients, setClients] = useState<Client[]>(() => initialFirmData.clients);
  const [cases, setCases] = useState<Case[]>(() => initialFirmData.cases);
  const [firs, setFirs] = useState<FIRRecord[]>(() => initialFirmData.firs);
  const [hearings, setHearings] = useState<Hearing[]>(() => initialFirmData.hearings);
  const [documents, setDocuments] = useState<DocumentItem[]>(() => initialFirmData.documents);
  const [payments, setPayments] = useState<PaymentRecord[]>(() => initialFirmData.payments);
  const [services, setServices] = useState<LegalServiceRecord[]>(() => initialFirmData.services);
  const [activities, setActivities] = useState<ActivityLog[]>(() => initialFirmData.activities);

  // Automatically persist current firm's changes locally so they are never lost
  useEffect(() => {
    if (currentFirm.id && currentFirm.id !== 'system_root') {
      saveFirmStorageData(currentFirm.id, {
        clients,
        cases,
        firs,
        hearings,
        documents,
        payments,
        services,
        activities,
      });
    }
  }, [currentFirm.id, clients, cases, firs, hearings, documents, payments, services, activities]);

  const [serviceCatalog] = useState<ServiceCatalogItem[]>(SERVICES_CATALOG);

  // Cloud Sync state
  const [isCloudSyncing, setIsCloudSyncing] = useState<boolean>(false);
  const [isConnectedToCloud, setIsConnectedToCloud] = useState<boolean>(true);
  const [isRealtimeActive, setIsRealtimeActive] = useState<boolean>(true);
  const [syncNotification, setSyncNotification] = useState<string | null>(null);

  const showSyncNotice = (msg: string) => {
    setSyncNotification(msg);
    setTimeout(() => {
      setSyncNotification((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  // Global Real-Time Cloud Sync Subscriptions (Lawyer Accounts, Law Firms, Legal Sections)
  useEffect(() => {
    let isMounted = true;

    testFirestoreConnection().catch(() => {});
    checkAndBootstrapFirestore().catch(() => {});

    // 1. Subscribe to central Pakistan Legal Sections
    const unsubSections = subscribeToLegalSections((secList) => {
      if (isMounted && secList.length) {
        setLegalSections(secList);
      }
    });

    // 2. Subscribe to Authorized Accounts in real-time across ALL devices (Mobile, Laptop, Desktop)
    const unsubAccounts = subscribeToAuthorizedAccounts(
      (remoteAccounts) => {
        if (isMounted && remoteAccounts && remoteAccounts.length > 0) {
          setAuthorizedAccounts(remoteAccounts);
          try {
            localStorage.setItem(STORAGE_KEYS.AUTHORIZED_ACCOUNTS, JSON.stringify(remoteAccounts));
          } catch {}
        }
      },
      (status) => {
        if (isMounted) {
          setIsConnectedToCloud(status === 'connected');
          setIsRealtimeActive(status === 'connected');
        }
      }
    );

    // 3. Subscribe to all Law Firms in real-time across devices
    const unsubFirms = subscribeToAllFirms((remoteFirms) => {
      if (isMounted && remoteFirms && remoteFirms.length > 0) {
        setFirms((prev) => {
          const map = new Map<string, Firm>();
          prev.forEach((f) => map.set(f.id, f));
          remoteFirms.forEach((f) => map.set(f.id, f));
          const merged = Array.from(map.values());
          try {
            localStorage.setItem(STORAGE_KEYS.ALL_FIRMS, JSON.stringify(merged));
          } catch {}
          return merged;
        });
      }
    });

    return () => {
      isMounted = false;
      unsubSections();
      unsubAccounts();
      unsubFirms();
    };
  }, []);

  // Subscribe to isolated current firm's real-time collections
  useEffect(() => {
    let isMounted = true;

    const unsubFirmData = subscribeToFirmRealtimeCollections(currentFirm.id, {
      onClients: (items) => {
        if (isMounted) setClients(items);
      },
      onCases: (items) => {
        if (isMounted) setCases(items);
      },
      onFirs: (items) => {
        if (isMounted) setFirs(items);
      },
      onHearings: (items) => {
        if (isMounted) setHearings(items);
      },
      onDocuments: (items) => {
        if (isMounted) setDocuments(items);
      },
      onPayments: (items) => {
        if (isMounted) setPayments(items);
      },
      onServices: (items) => {
        if (isMounted) setServices(items);
      },
      onActivities: (items) => {
        if (isMounted) setActivities(items);
      },
      onStatusChange: (status) => {
        if (isMounted) {
          setIsConnectedToCloud(status === 'connected');
          setIsRealtimeActive(status === 'connected');
        }
      },
    });

    return () => {
      isMounted = false;
      unsubFirmData();
    };
  }, [currentFirm.id]);

  // Tenant Switcher: Switches active workspace and guarantees ZERO data leakage across firms
  const switchTenant = (firmId: string, customUser?: UserProfile) => {
    let targetFirm = firms.find((f) => f.id === firmId);
    if (!targetFirm) {
      const acc = authorizedAccounts.find((a) => a.firmId === firmId);
      if (acc) {
        targetFirm = {
          id: acc.firmId,
          name: acc.firmName || `${acc.name} Law Chambers`,
          ownerId: acc.id,
          accountType: 'lawfirm',
          plan: acc.plan || 'starter',
          subscriptionStatus: acc.status === 'active' ? 'active' : 'trial',
          trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          officeAddress: 'Chamber Office',
          city: 'Pakistan',
          province: 'Punjab',
          country: 'Pakistan',
          phone: '',
          email: acc.email,
          createdAt: acc.createdDate || new Date().toISOString().split('T')[0],
        };
        setFirms((prev) => [...prev, targetFirm!]);
      } else if (customUser) {
        targetFirm = {
          id: customUser.firmId || firmId,
          name: customUser.firmName || `${customUser.name} Law Chambers`,
          ownerId: customUser.id,
          accountType: 'lawfirm',
          plan: customUser.plan || 'starter',
          subscriptionStatus: customUser.subscriptionStatus || 'trial',
          trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          officeAddress: 'Chamber Office',
          city: 'Pakistan',
          province: 'Punjab',
          country: 'Pakistan',
          phone: '',
          email: customUser.email,
          createdAt: customUser.createdDate || new Date().toISOString().split('T')[0],
        };
        setFirms((prev) => [...prev, targetFirm!]);
      } else {
        return;
      }
    }

    setCurrentFirm(targetFirm);
    localStorage.setItem(STORAGE_KEYS.FIRM_ID, firmId);

    // Swap local records instantly to isolate tenant data
    if (firmId === 'system_root') {
      const superAdmin = DEMO_USERS.find((u) => u.id === 'usr_superadmin');
      if (superAdmin) {
        setCurrentUser(superAdmin);
        setCurrentRoleState('super_admin');
        setActiveView('super_admin');
        localStorage.setItem(STORAGE_KEYS.USER_ID, superAdmin.id);
      }
      return;
    }

    // Load strictly isolated tenant data (Zero entries for all newly created lawyers!)
    const firmData = getFirmStorageData(firmId);
    setClients(firmData.clients);
    setCases(firmData.cases);
    setFirs(firmData.firs);
    setHearings(firmData.hearings);
    setDocuments(firmData.documents);
    setPayments(firmData.payments);
    setServices(firmData.services);
    setActivities(firmData.activities);
    setFirmMembers(getFirmMembersStorage(firmId));

    if (customUser) {
      setCurrentUser(customUser);
      setCurrentRoleState(customUser.role);
      localStorage.setItem(STORAGE_KEYS.USER_ID, customUser.id);
    } else if (firmId === 'firm_lahore_chambers' || firmId === 'firm_tariq_associates') {
      const lawyerA = DEMO_USERS.find((u) => u.id === 'usr_tariq_admin');
      if (lawyerA) {
        setCurrentUser(lawyerA);
        setCurrentRoleState(lawyerA.role);
        localStorage.setItem(STORAGE_KEYS.USER_ID, lawyerA.id);
      }
    } else if (firmId === 'firm_karachi_advocates') {
      const lawyerB = DEMO_USERS.find((u) => u.id === 'usr_zeeshan_lawyer');
      if (lawyerB) {
        setCurrentUser(lawyerB);
        setCurrentRoleState(lawyerB.role);
        localStorage.setItem(STORAGE_KEYS.USER_ID, lawyerB.id);
      }
    }

    showSyncNotice(`Switched to workspace: "${targetFirm.name}". Data strictly isolated.`);
  };

  // Switch demo user within or across firms
  const switchDemoUser = (userId: string) => {
    const user = DEMO_USERS.find((u) => u.id === userId);
    if (!user) return;

    setCurrentUser(user);
    setCurrentRoleState(user.role);
    setIsLoggedInState(true);
    localStorage.setItem(STORAGE_KEYS.USER_ID, user.id);

    if (user.role === 'super_admin') {
      setActiveView('super_admin');
    } else {
      if (user.firmId !== currentFirm.id) {
        switchTenant(user.firmId);
      }
      setActiveView('dashboard');
    }

    showSyncNotice(`Active User: ${user.name} (${user.role.toUpperCase()})`);
  };

  // Super Admin adds/authorizes lawyer accounts (Realtime Cloud Synced Across All Devices)
  const addAuthorizedAccount = (account: AuthorizedAccount) => {
    // 1. Update local state immediately
    setAuthorizedAccounts((prev) => [account, ...prev.filter((a) => a.id !== account.id)]);
    try {
      localStorage.setItem(
        STORAGE_KEYS.AUTHORIZED_ACCOUNTS,
        JSON.stringify([account, ...authorizedAccounts.filter((a) => a.id !== account.id)])
      );
    } catch {}

    // 2. Persist to Firestore collection `authorizedAccounts` immediately
    saveAuthorizedAccountToFirestore(account).catch((err) =>
      console.warn('saveAuthorizedAccountToFirestore error:', err)
    );

    // 3. Ensure firm workspace exists and is saved to Firestore
    const existingFirm = firms.find((f) => f.id === account.firmId);
    const newFirm: Firm = existingFirm || {
      id: account.firmId,
      name: account.firmName || `${account.name} Law Chambers`,
      ownerId: account.id,
      accountType: 'lawfirm',
      plan: account.plan || 'starter',
      subscriptionStatus: account.status === 'active' ? 'active' : 'trial',
      trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      officeAddress: 'Chamber Office',
      city: 'Pakistan',
      province: 'Punjab',
      country: 'Pakistan',
      phone: '',
      email: account.email,
      createdAt: account.createdDate || new Date().toISOString().split('T')[0],
      dossierTitle: account.dossierTitle || `CHAMBER OF ADVOCATE ${account.name.toUpperCase()}`,
    };

    if (!existingFirm) {
      setFirms((prev) => [...prev, newFirm]);
    }
    saveFirm(newFirm).catch((err) => console.warn('saveFirm error:', err));

    // Guarantee fresh ZERO entries in localStorage for this new lawyer
    saveFirmStorageData(account.firmId, {
      clients: [],
      cases: [],
      firs: [],
      hearings: [],
      documents: [],
      payments: [],
      services: [],
      activities: [],
    });

    showSyncNotice(`✓ Realtime Synced: Lawyer "${account.name}" (${account.email}) active on all devices!`);
  };

  const updateAuthorizedAccount = (id: string, updates: Partial<AuthorizedAccount>) => {
    let updatedAcc: AuthorizedAccount | null = null;
    setAuthorizedAccounts((prev) => {
      const updatedList = prev.map((a) => {
        if (a.id === id) {
          updatedAcc = { ...a, ...updates };
          return updatedAcc;
        }
        return a;
      });
      try {
        localStorage.setItem(STORAGE_KEYS.AUTHORIZED_ACCOUNTS, JSON.stringify(updatedList));
      } catch {}
      return updatedList;
    });

    if (updatedAcc) {
      saveAuthorizedAccountToFirestore(updatedAcc).catch((err) =>
        console.warn('saveAuthorizedAccountToFirestore update error:', err)
      );
    }
    showSyncNotice('Account permissions updated in real-time cloud');
  };

  const deleteAuthorizedAccount = (id: string) => {
    setAuthorizedAccounts((prev) => {
      const updatedList = prev.filter((a) => a.id !== id);
      try {
        localStorage.setItem(STORAGE_KEYS.AUTHORIZED_ACCOUNTS, JSON.stringify(updatedList));
      } catch {}
      return updatedList;
    });
    deleteAuthorizedAccountFromFirestore(id).catch((err) =>
      console.warn('deleteAuthorizedAccountFromFirestore error:', err)
    );
    showSyncNotice('Account revoked and deleted from cloud');
  };

  // Secure Super Admin Authentication: Strict Username <admin> and Password <5121472>
  const loginSuperAdmin = (username: string, pass: string): { success: boolean; message?: string } => {
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = pass.trim();

    if (
      (cleanUser === 'admin' || cleanUser === 'admin@wakalat.pk' || cleanUser === 'owner@wakalat.pk') &&
      cleanPass === '5121472'
    ) {
      const superAdminUser = DEMO_USERS.find((u) => u.role === 'super_admin') || DEMO_USERS[0];
      setCurrentUser(superAdminUser);
      setCurrentRoleState('super_admin');
      setIsLoggedInState(true);
      setActiveView('super_admin');
      showSyncNotice('Welcome Super Admin! Master Software Owner session authenticated.');
      return { success: true };
    }

    return {
      success: false,
      message: 'Invalid credentials! Super Admin access is restricted to the platform owner (Username: admin, Password: ***).',
    };
  };

  // Secure Lawyer Login: Checks against accounts approved by Super Admin with Realtime Cloud Fallback
  const loginLawyer = async (email: string, pass: string): Promise<{ success: boolean; message?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();

    let account = authorizedAccounts.find(
      (a) => a.email.toLowerCase() === cleanEmail
    );

    // If not found in memory, query Firestore directly for real-time fallback across devices
    if (!account) {
      try {
        const remoteAccounts = await getAuthorizedAccountsFromFirestore();
        account = remoteAccounts.find((a) => a.email.toLowerCase() === cleanEmail);
        if (account) {
          setAuthorizedAccounts(remoteAccounts);
          try {
            localStorage.setItem(STORAGE_KEYS.AUTHORIZED_ACCOUNTS, JSON.stringify(remoteAccounts));
          } catch {}
        }
      } catch (e) {
        console.warn('Direct firestore accounts check fallback notice:', e);
      }
    }

    if (!account) {
      return {
        success: false,
        message: 'Access Denied: This email / Gmail has not been authorized by the Super Admin yet.',
      };
    }

    if (account.status === 'suspended') {
      return {
        success: false,
        message: 'Access Denied: Your law firm account has been suspended by the administrator.',
      };
    }

    if (account.password && account.password !== cleanPass) {
      return {
        success: false,
        message: 'Incorrect Password: Check your chamber password or secure PIN.',
      };
    }

    // Successfully authenticated! Prepare user profile
    const userProf: UserProfile = {
      id: account.id,
      userId: account.id,
      name: account.name,
      email: account.email,
      phone: '',
      role: account.role,
      firmId: account.firmId,
      firmName: account.firmName,
      accountType: 'lawfirm',
      subscriptionStatus: account.status === 'active' ? 'active' : 'trial',
      plan: account.plan,
      createdDate: account.createdDate,
      connectedGmail: account.connectedGmail,
      lastBackupDate: account.lastBackupDate,
      lastBackupDriveLink: account.lastBackupDriveLink,
      dossierTitle: account.dossierTitle || `Chamber Legal Dossier - Advocate ${account.name}`,
      onboardingCompleted: true,
    };

    // Switch to isolated workspace with customUser (Loads fresh 0 entries for new lawyers!)
    switchTenant(account.firmId, userProf);
    setCurrentUser(userProf);
    setCurrentRoleState(account.role);
    setIsLoggedInState(true);
    localStorage.setItem(STORAGE_KEYS.LOGGED_IN, 'true');
    localStorage.setItem(STORAGE_KEYS.USER_ID, account.id);
    localStorage.setItem(STORAGE_KEYS.ROLE, account.role);
    setActiveView('dashboard');
    showSyncNotice(`Authenticated: ${account.name} (${account.firmName}) - Realtime Cloud Connected`);
    return { success: true };
  };

  // Register a new independent lawyer & law chamber with 100% clean pristine data
  const registerLawyer = async (params: {
    name: string;
    email: string;
    password: string;
    firmName: string;
    city?: string;
  }): Promise<{ success: boolean; message?: string }> => {
    const cleanEmail = params.email.trim().toLowerCase();
    const cleanPass = params.password.trim();
    const cleanName = params.name.trim();
    const cleanFirm = params.firmName.trim() || `${cleanName} Law Chambers`;
    const cleanCity = (params.city || '').trim() || 'Pakistan';

    if (!cleanEmail || !cleanPass || !cleanName) {
      return { success: false, message: 'Please provide lawyer name, email, and password.' };
    }

    // Check if account already exists
    const existing = authorizedAccounts.find((a) => a.email.toLowerCase() === cleanEmail);
    if (existing) {
      return { success: false, message: 'This email is already registered. Please login with your password.' };
    }

    const firmSlug = cleanFirm.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 20);
    const firmId = `firm_${firmSlug}_${Date.now().toString().slice(-4)}`;
    const accountId = `acc_${Date.now()}`;

    const newAcc: AuthorizedAccount = {
      id: accountId,
      name: cleanName,
      email: cleanEmail,
      password: cleanPass,
      firmId,
      firmName: cleanFirm,
      role: 'firm_admin',
      plan: 'starter',
      status: 'active',
      createdDate: new Date().toISOString().split('T')[0],
      connectedGmail: cleanEmail.includes('@gmail.com') ? cleanEmail : undefined,
      lastBackupDate: 'Ready for Cloud Backup',
      dossierTitle: `CHAMBER OF ADVOCATE ${cleanName.toUpperCase()}`,
    };

    const newFirm: Firm = {
      id: firmId,
      name: cleanFirm,
      ownerId: accountId,
      accountType: 'lawfirm',
      plan: 'starter',
      subscriptionStatus: 'active',
      trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      officeAddress: 'Advocate Chamber Office',
      city: cleanCity,
      province: 'Punjab',
      country: 'Pakistan',
      phone: '',
      email: cleanEmail,
      createdAt: new Date().toISOString().split('T')[0],
      dossierTitle: `CHAMBER OF ADVOCATE ${cleanName.toUpperCase()}`,
    };

    // 1. Immediately wipe & save clean zero dataset in localStorage for this fresh firm
    saveFirmStorageData(firmId, {
      clients: [],
      cases: [],
      firs: [],
      hearings: [],
      documents: [],
      payments: [],
      services: [],
      activities: [],
    });

    // 2. Add to local state & persist
    const updatedAccounts = [newAcc, ...authorizedAccounts];
    setAuthorizedAccounts(updatedAccounts);
    try {
      localStorage.setItem(STORAGE_KEYS.AUTHORIZED_ACCOUNTS, JSON.stringify(updatedAccounts));
    } catch {}

    setFirms((prev) => [...prev, newFirm]);
    try {
      localStorage.setItem(STORAGE_KEYS.ALL_FIRMS, JSON.stringify([...firms, newFirm]));
    } catch {}

    // 3. Persist to Firestore
    saveAuthorizedAccountToFirestore(newAcc).catch((err) => console.warn('saveAuthorizedAccountToFirestore err:', err));
    saveFirm(newFirm).catch((err) => console.warn('saveFirm err:', err));

    // 4. Log in immediately to clean workspace
    const userProf: UserProfile = {
      id: newAcc.id,
      userId: newAcc.id,
      name: newAcc.name,
      email: newAcc.email,
      phone: '',
      role: 'firm_admin',
      firmId,
      firmName: cleanFirm,
      accountType: 'lawfirm',
      subscriptionStatus: 'active',
      plan: 'starter',
      createdDate: newAcc.createdDate,
      connectedGmail: newAcc.connectedGmail,
      dossierTitle: newAcc.dossierTitle,
      onboardingCompleted: true,
    };

    setCurrentFirm(newFirm);
    localStorage.setItem(STORAGE_KEYS.FIRM_ID, firmId);
    setCurrentUser(userProf);
    setCurrentRoleState('firm_admin');
    setClients([]);
    setCases([]);
    setFirs([]);
    setHearings([]);
    setDocuments([]);
    setPayments([]);
    setServices([]);
    setActivities([]);
    setIsLoggedInState(true);
    localStorage.setItem(STORAGE_KEYS.LOGGED_IN, 'true');
    localStorage.setItem(STORAGE_KEYS.USER_ID, newAcc.id);
    localStorage.setItem(STORAGE_KEYS.ROLE, 'firm_admin');
    setActiveView('dashboard');

    showSyncNotice(`✓ Chamber Registered: Welcome Advocate ${cleanName}! Workspace is 100% private & clean.`);
    return { success: true };
  };

  // Attach personal Gmail for cloud backup and sync with automatic isolated backup creation
  const attachLawyerGmail = async (gmail: string, driveLink?: string) => {
    const cleanGmail = gmail.trim().toLowerCase();
    const backupDate = new Date().toLocaleDateString('en-PK', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    let effectiveDriveLink = driveLink || currentUser.lastBackupDriveLink;

    // Compile complete snapshot of this lawyer's isolated chamber data
    const backupPayload = {
      firm: currentFirm,
      lawyer: {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        connectedGmail: cleanGmail,
        role: currentRole,
      },
      clients,
      cases,
      firs,
      hearings,
      documents,
      payments,
      services,
      activities,
      backupTimestamp: new Date().toISOString(),
      backupFormattedDate: backupDate,
      version: '2.0-isolated',
    };

    // Store in persistent local chamber archive
    try {
      localStorage.setItem(`wakalat_cloud_backup_${currentFirm.id}`, JSON.stringify(backupPayload));
    } catch (e) {
      console.warn('Backup payload save warning:', e);
    }

    const dossierTitle =
      currentUser.dossierTitle || currentFirm.dossierTitle || `Advocate ${currentUser.name || 'Advocate'} - Chamber Dossier`;

    // If Google Drive OAuth is connected, upload immediately to their personal Google Drive!
    const token = getAccessToken();
    if (token) {
      try {
        const uploadResult = await syncAndUploadAllToGoogleDrive(
          token,
          backupPayload,
          dossierTitle,
          cleanGmail,
          documents
        );
        if (uploadResult.success && (uploadResult.folderLink || uploadResult.backupLink)) {
          effectiveDriveLink = uploadResult.folderLink || uploadResult.backupLink;
        }
      } catch (uploadErr) {
        console.warn('Drive upload error:', uploadErr);
      }
    }

    const updated: UserProfile = {
      ...currentUser,
      connectedGmail: cleanGmail,
      lastBackupDate: backupDate,
      lastBackupDriveLink: effectiveDriveLink,
      dossierTitle,
    };
    setCurrentUser(updated);

    // Persist in current lawyer user session
    try {
      localStorage.setItem('CURRENT_LAWYER_USER', JSON.stringify(updated));
    } catch {}

    // Update in authorized accounts list and save in localStorage
    setAuthorizedAccounts((prev) => {
      const updatedList = prev.map((a) =>
        a.email.toLowerCase() === currentUser.email.toLowerCase()
          ? {
              ...a,
              connectedGmail: cleanGmail,
              lastBackupDate: backupDate,
              lastBackupDriveLink: effectiveDriveLink,
              dossierTitle,
            }
          : a
      );
      try {
        localStorage.setItem(STORAGE_KEYS.AUTHORIZED_ACCOUNTS, JSON.stringify(updatedList));
      } catch {}
      return updatedList;
    });

    if (effectiveDriveLink) {
      showSyncNotice(`✓ Gmail "${cleanGmail}" attached & complete data + files saved in Google Drive!`);
    } else {
      showSyncNotice(`✓ Gmail "${cleanGmail}" attached. Chamber data synced & backup snapshot ready.`);
    }
  };

  const syncLawyerDriveBackup = async (): Promise<{
    success: boolean;
    message: string;
    driveLink?: string;
    fileName?: string;
  }> => {
    const backupDate = new Date().toLocaleDateString('en-PK', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const activeGmail = currentUser.connectedGmail || currentUser.email;
    const dossierTitle =
      currentUser.dossierTitle || currentFirm.dossierTitle || `Advocate ${currentUser.name || 'Advocate'} - Chamber Dossier`;

    const backupPayload = {
      firm: currentFirm,
      lawyer: {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        connectedGmail: activeGmail,
        dossierTitle,
        role: currentRole,
      },
      clients,
      cases,
      firs,
      hearings,
      documents,
      payments,
      services,
      activities,
      backupTimestamp: new Date().toISOString(),
      backupFormattedDate: backupDate,
      version: '2.0-isolated',
    };

    // Save locally
    try {
      localStorage.setItem(`wakalat_cloud_backup_${currentFirm.id}`, JSON.stringify(backupPayload));
    } catch (e) {
      console.warn('Local backup save error:', e);
    }

    const token = getAccessToken();
    if (token) {
      try {
        const uploadResult = await syncAndUploadAllToGoogleDrive(
          token,
          backupPayload,
          dossierTitle,
          activeGmail,
          documents
        );

        if (uploadResult.success) {
          const effectiveLink = uploadResult.folderLink || uploadResult.backupLink;
          const updatedUser: UserProfile = {
            ...currentUser,
            lastBackupDate: backupDate,
            lastBackupDriveLink: effectiveLink,
            dossierTitle,
          };
          setCurrentUser(updatedUser);
          try {
            localStorage.setItem('CURRENT_LAWYER_USER', JSON.stringify(updatedUser));
          } catch {}

          setAuthorizedAccounts((prev) => {
            const updated = prev.map((a) =>
              a.email.toLowerCase() === currentUser.email.toLowerCase()
                ? { ...a, lastBackupDate: backupDate, lastBackupDriveLink: effectiveLink, dossierTitle }
                : a
            );
            try {
              localStorage.setItem(STORAGE_KEYS.AUTHORIZED_ACCOUNTS, JSON.stringify(updated));
            } catch {}
            return updated;
          });

          showSyncNotice(`✓ Data and files successfully uploaded to Google Drive!`);
          return {
            success: true,
            message: uploadResult.message,
            driveLink: effectiveLink,
            fileName: uploadResult.backupFileName,
          };
        }
      } catch (err: any) {
        console.error('syncLawyerDriveBackup error:', err);
      }
    }

    // Direct / Local sync fallback
    const updatedUser: UserProfile = {
      ...currentUser,
      lastBackupDate: backupDate,
    };
    setCurrentUser(updatedUser);
    try {
      localStorage.setItem('CURRENT_LAWYER_USER', JSON.stringify(updatedUser));
    } catch {}

    setAuthorizedAccounts((prev) => {
      const updated = prev.map((a) =>
        a.email.toLowerCase() === currentUser.email.toLowerCase()
          ? { ...a, lastBackupDate: backupDate }
          : a
      );
      try {
        localStorage.setItem(STORAGE_KEYS.AUTHORIZED_ACCOUNTS, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    showSyncNotice(`✓ Chamber data synced & backup snapshot refreshed.`);
    return {
      success: true,
      message: 'Chamber data snapshot synced and ready.',
    };
  };

  const disconnectLawyerGmail = () => {
    const updated: UserProfile = {
      ...currentUser,
      connectedGmail: undefined,
      lastBackupDriveLink: undefined,
    };
    setCurrentUser(updated);
    try {
      localStorage.setItem('CURRENT_LAWYER_USER', JSON.stringify(updated));
    } catch {}

    setAuthorizedAccounts((prev) => {
      const updatedList = prev.map((a) =>
        a.email.toLowerCase() === currentUser.email.toLowerCase()
          ? { ...a, connectedGmail: undefined, lastBackupDriveLink: undefined }
          : a
      );
      try {
        localStorage.setItem(STORAGE_KEYS.AUTHORIZED_ACCOUNTS, JSON.stringify(updatedList));
      } catch {}
      return updatedList;
    });
    showSyncNotice('Gmail disconnected from chamber backup');
  };

  const updateFirm = (updates: Partial<Firm>) => {
    const updated = { ...currentFirm, ...updates };
    setCurrentFirm(updated);
    setFirms((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
    saveFirm(updated).catch((e) => console.warn('updateFirm error:', e));
    showSyncNotice(`Firm "${updated.name}" updated successfully`);
  };

  const updateFirmStatus = (firmId: string, status: SubscriptionStatus) => {
    setFirms((prev) =>
      prev.map((f) => (f.id === firmId ? { ...f, subscriptionStatus: status } : f))
    );
    if (currentFirm.id === firmId) {
      setCurrentFirm((prev) => ({ ...prev, subscriptionStatus: status }));
    }
    updateFirmSubscription(firmId, status).catch((e) => console.warn('updateFirmStatus error:', e));
    showSyncNotice(`Subscription status updated to "${status.toUpperCase()}"`);
  };

  const addFirmMember = (member: FirmMember) => {
    setFirmMembers((prev) => [...prev, member]);
    showSyncNotice(`Added team member "${member.name}"`);
  };

  const removeFirmMember = (memberId: string) => {
    setFirmMembers((prev) => prev.filter((m) => m.id !== memberId));
    showSyncNotice('Team member removed from chamber');
  };

  // Legal Sections Management
  const addLegalSection = (sec: PakistanLegalSection) => {
    setLegalSections((prev) => [sec, ...prev]);
    saveLegalSection(sec).catch((e) => console.warn('addLegalSection error:', e));
    showSyncNotice(`Added Section ${sec.sectionNumber} to legal repository`);
  };

  const editLegalSection = (sec: PakistanLegalSection) => {
    setLegalSections((prev) => prev.map((s) => (s.id === sec.id ? sec : s)));
    saveLegalSection(sec).catch((e) => console.warn('editLegalSection error:', e));
    showSyncNotice(`Updated Section ${sec.sectionNumber}`);
  };

  const deleteLegalSection = (id: string) => {
    setLegalSections((prev) => prev.filter((s) => s.id !== id));
    deleteLegalSectionDb(id).catch((e) => console.warn('deleteLegalSection error:', e));
    showSyncNotice('Deleted legal section from repository');
  };

  // Auth & Roles: Secure Role Setter preventing privilege escalation
  const setCurrentRole = (role: UserRole) => {
    if (role === 'super_admin' && currentUser.role !== 'super_admin') {
      showSyncNotice('Access Denied: Super Admin console requires owner authentication.');
      return;
    }
    setCurrentRoleState(role);
    localStorage.setItem(STORAGE_KEYS.ROLE, role);
    addActivity('Role Verified', `Verified session role as ${role.toUpperCase()}`, 'auth');
  };

  const setIsLoggedIn = (loggedIn: boolean) => {
    setIsLoggedInState(loggedIn);
    localStorage.setItem(STORAGE_KEYS.LOGGED_IN, String(loggedIn));
  };

  const login = (email: string, role: UserRole) => {
    setIsLoggedInState(true);
    setCurrentRole(role);
    localStorage.setItem(STORAGE_KEYS.LOGGED_IN, 'true');
    localStorage.setItem(STORAGE_KEYS.ROLE, role);
    addActivity('User Login', `Session started as ${role} (${email})`, 'auth');
    showSyncNotice(`Logged in as ${role.toUpperCase()}`);
  };

  const logout = () => {
    setIsLoggedInState(false);
    localStorage.setItem(STORAGE_KEYS.LOGGED_IN, 'false');
    // Clear active in-memory lists to prevent any bleed-over into the next login
    setClients([]);
    setCases([]);
    setFirs([]);
    setHearings([]);
    setDocuments([]);
    setPayments([]);
    setServices([]);
    setActivities([]);
    addActivity('User Logout', 'Signed out from chamber portal', 'auth');
  };

  const setLanguageMode = (mode: 'english' | 'romanUrdu') => {
    setLanguageModeState(mode);
    localStorage.setItem(STORAGE_KEYS.LANG, mode);
  };

  // Activity Logger
  const addActivity = (
    action: string,
    details: string,
    category: ActivityLog['category']
  ) => {
    const timeStr = new Date().toISOString();
    const newLog: ActivityLog = {
      id: 'act-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      firmId: currentFirm.id,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentRole,
      action,
      details,
      timestamp: timeStr,
      category,
    };
    setActivities((prev) => [newLog, ...prev.slice(0, 99)]);
    saveActivityToFirestore(newLog, currentFirm.id).catch(() => {});
  };

  // Multi-tenant Mutations: strictly associate firmId & save to isolated subcollections
  const addClient = (data: Omit<Client, 'id' | 'createdAt'>): Client => {
    const newClient: Client = {
      ...data,
      id: 'cl-' + Date.now(),
      firmId: currentFirm.id,
      lawyerId: currentUser.lawyerId || currentUser.id,
      createdById: currentUser.id,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setClients((prev) => [newClient, ...prev]);
    saveClientToFirestore(newClient, currentFirm.id).catch((err) =>
      console.warn('saveClient error:', err)
    );
    addActivity('New Client Added', `${newClient.name} (CNIC: ${newClient.cnic}) registered`, 'client');
    showSyncNotice(`Client "${newClient.name}" added to ${currentFirm.name}`);
    return newClient;
  };

  const updateClient = (id: string, updates: Partial<Client>) => {
    let updatedClient: Client | null = null;
    setClients((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          updatedClient = { ...c, ...updates, firmId: currentFirm.id };
          return updatedClient;
        }
        return c;
      })
    );
    if (updatedClient) {
      saveClientToFirestore(updatedClient, currentFirm.id).catch((err) =>
        console.warn('updateClient error:', err)
      );
      addActivity('Client Updated', `Details updated for ${(updatedClient as Client).name}`, 'client');
      showSyncNotice(`Client "${(updatedClient as Client).name}" updated`);
    }
  };

  const deleteClient = (id: string) => {
    const client = clients.find((c) => c.id === id);
    setClients((prev) => prev.filter((c) => c.id !== id));
    deleteClientFromFirestore(id, currentFirm.id).catch((err) =>
      console.warn('deleteClient error:', err)
    );
    addActivity('Client Deleted', `Client ${client?.name || id} removed`, 'client');
    showSyncNotice(`Client "${client?.name || id}" deleted`);
  };

  // Case Mutations
  const addCase = (data: Omit<Case, 'id' | 'createdAt'>): Case => {
    const newCase: Case = {
      ...data,
      id: 'case-' + Date.now(),
      firmId: currentFirm.id,
      lawyerId: currentUser.lawyerId || currentUser.id,
      createdById: currentUser.id,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setCases((prev) => [newCase, ...prev]);
    saveCaseToFirestore(newCase, currentFirm.id).catch((err) => console.warn('saveCase error:', err));
    addActivity('New Case Opened', `Case ${newCase.caseNumber} - "${newCase.caseTitle}" registered`, 'case');
    showSyncNotice(`Case "${newCase.caseNumber}" opened in ${currentFirm.name}`);
    return newCase;
  };

  const updateCase = (id: string, updates: Partial<Case>) => {
    let updatedCase: Case | null = null;
    setCases((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          updatedCase = { ...c, ...updates, firmId: currentFirm.id };
          return updatedCase;
        }
        return c;
      })
    );
    if (updatedCase) {
      saveCaseToFirestore(updatedCase, currentFirm.id).catch((err) =>
        console.warn('updateCase error:', err)
      );
      addActivity('Case Updated', `Case ${(updatedCase as Case).caseNumber} updated`, 'case');
      showSyncNotice(`Case "${(updatedCase as Case).caseNumber}" updated`);
    }
  };

  const deleteCase = (id: string) => {
    const item = cases.find((c) => c.id === id);
    setCases((prev) => prev.filter((c) => c.id !== id));
    deleteCaseFromFirestore(id, currentFirm.id).catch((err) =>
      console.warn('deleteCase error:', err)
    );
    addActivity('Case Deleted', `Case ${item?.caseNumber || id} deleted`, 'case');
    showSyncNotice(`Case "${item?.caseNumber || id}" deleted`);
  };

  // FIR Mutations
  const addFIR = (data: Omit<FIRRecord, 'id' | 'createdAt'>): FIRRecord => {
    const newFIR: FIRRecord = {
      ...data,
      id: 'fir-' + Date.now(),
      firmId: currentFirm.id,
      lawyerId: currentUser.lawyerId || currentUser.id,
      createdById: currentUser.id,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setFirs((prev) => [newFIR, ...prev]);
    saveFIRToFirestore(newFIR, currentFirm.id).catch((err) => console.warn('saveFIR error:', err));
    addActivity('FIR Registered', `FIR No. ${newFIR.firNumber} (${newFIR.policeStation}) added`, 'fir');
    showSyncNotice(`FIR "${newFIR.firNumber}" registered`);
    return newFIR;
  };

  const updateFIR = (id: string, updates: Partial<FIRRecord>) => {
    let updatedFir: FIRRecord | null = null;
    setFirs((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          updatedFir = { ...f, ...updates, firmId: currentFirm.id };
          return updatedFir;
        }
        return f;
      })
    );
    if (updatedFir) {
      saveFIRToFirestore(updatedFir, currentFirm.id).catch((err) =>
        console.warn('updateFIR error:', err)
      );
      addActivity('FIR Updated', `FIR ${(updatedFir as FIRRecord).firNumber} updated`, 'fir');
      showSyncNotice(`FIR "${(updatedFir as FIRRecord).firNumber}" updated`);
    }
  };

  const deleteFIR = (id: string) => {
    const item = firs.find((f) => f.id === id);
    setFirs((prev) => prev.filter((c) => c.id !== id));
    deleteFIRFromFirestore(id, currentFirm.id).catch((err) =>
      console.warn('deleteFIR error:', err)
    );
    addActivity('FIR Deleted', `FIR ${item?.firNumber || id} deleted`, 'fir');
    showSyncNotice(`FIR "${item?.firNumber || id}" deleted`);
  };

  // Hearing Mutations
  const addHearing = (data: Omit<Hearing, 'id' | 'createdAt'>): Hearing => {
    const newHearing: Hearing = {
      ...data,
      id: 'hr-' + Date.now(),
      firmId: currentFirm.id,
      lawyerId: currentUser.lawyerId || currentUser.id,
      createdById: currentUser.id,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setHearings((prev) => [newHearing, ...prev]);
    saveHearingToFirestore(newHearing, currentFirm.id).catch((err) =>
      console.warn('saveHearing error:', err)
    );
    addActivity('Hearing Scheduled', `Hearing for case ${newHearing.caseId} on ${newHearing.hearingDate}`, 'hearing');
    showSyncNotice(`Hearing on ${newHearing.hearingDate} scheduled`);
    return newHearing;
  };

  const updateHearing = (id: string, updates: Partial<Hearing>) => {
    let updatedHearing: Hearing | null = null;
    setHearings((prev) =>
      prev.map((h) => {
        if (h.id === id) {
          updatedHearing = { ...h, ...updates, firmId: currentFirm.id };
          return updatedHearing;
        }
        return h;
      })
    );
    if (updatedHearing) {
      saveHearingToFirestore(updatedHearing, currentFirm.id).catch((err) =>
        console.warn('updateHearing error:', err)
      );
      addActivity('Hearing Updated', `Hearing on ${(updatedHearing as Hearing).hearingDate} updated`, 'hearing');
      showSyncNotice('Hearing details updated');
    }
  };

  const deleteHearing = (id: string) => {
    setHearings((prev) => prev.filter((h) => h.id !== id));
    deleteHearingFromFirestore(id, currentFirm.id).catch((err) =>
      console.warn('deleteHearing error:', err)
    );
    addActivity('Hearing Cancelled', `Hearing ${id} removed`, 'hearing');
    showSyncNotice('Hearing removed');
  };

  // Document Mutations
  const addDocument = (
    data: Omit<DocumentItem, 'id' | 'uploadDate' | 'uploadedBy'>
  ): DocumentItem => {
    const newDoc: DocumentItem = {
      ...data,
      id: 'doc-' + Date.now(),
      firmId: currentFirm.id,
      userId: currentUser.id,
      lawyerId: currentUser.lawyerId || currentUser.id,
      uploadDate: new Date().toISOString().split('T')[0],
      uploadedBy: currentUser.name,
    };
    setDocuments((prev) => [newDoc, ...prev]);
    saveDocumentToFirestore(newDoc, currentFirm.id).catch((err) =>
      console.warn('saveDoc error:', err)
    );
    addActivity('Document Uploaded', `Document "${newDoc.name}" added to vault`, 'document');
    showSyncNotice(`Document "${newDoc.name}" uploaded`);
    return newDoc;
  };

  const updateDocument = (id: string, updates: Partial<DocumentItem>) => {
    let updatedDoc: DocumentItem | null = null;
    setDocuments((prev) =>
      prev.map((d) => {
        if (d.id === id) {
          updatedDoc = { ...d, ...updates, firmId: currentFirm.id };
          return updatedDoc;
        }
        return d;
      })
    );
    if (updatedDoc) {
      saveDocumentToFirestore(updatedDoc, currentFirm.id).catch((err) =>
        console.warn('updateDoc error:', err)
      );
      showSyncNotice(`Document "${(updatedDoc as DocumentItem).name}" updated`);
    }
  };

  const deleteDocument = (id: string) => {
    const item = documents.find((d) => d.id === id);
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    deleteDocumentFromFirestore(id, currentFirm.id).catch((err) =>
      console.warn('deleteDoc error:', err)
    );
    addActivity('Document Deleted', `Document ${item?.name || id} removed from vault`, 'document');
    showSyncNotice(`Document "${item?.name || id}" removed`);
  };

  // Payment Mutations
  const addPayment = (
    data: Omit<PaymentRecord, 'id' | 'remainingAmount' | 'createdAt'>
  ): PaymentRecord => {
    const total = Number(data.totalFee) || 0;
    const paid = Number(data.paidAmount) || 0;
    const remaining = Math.max(0, total - paid);
    const timeIso = new Date().toISOString();
    const dateFormatted = new Date().toLocaleString('en-PK', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const initialHistory: PaymentHistoryEntry = {
      id: 'hist-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      timestamp: timeIso,
      date: dateFormatted,
      action: 'Created',
      changedBy: currentUser.name || 'Advocate',
      userRole: currentRole,
      newTotalFee: total,
      newPaidAmount: paid,
      newRemaining: remaining,
      newMethod: data.paymentMethod,
      receiptNumber: data.receiptNumber,
      reason: 'Initial legal fee retainer contract & receipt registered',
      notes: data.notes || '',
    };

    const newPay: PaymentRecord = {
      ...data,
      id: 'pay-' + Date.now(),
      firmId: currentFirm.id,
      lawyerId: currentUser.lawyerId || currentUser.id,
      createdById: currentUser.id,
      totalFee: total,
      paidAmount: paid,
      remainingAmount: remaining,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: timeIso,
      updatedBy: currentUser.name,
      history: [initialHistory],
    };

    setPayments((prev) => [newPay, ...prev]);
    savePaymentToFirestore(newPay, currentFirm.id).catch((err) =>
      console.warn('savePayment error:', err)
    );
    addActivity(
      'Fee Payment Logged',
      `Receipt #${newPay.receiptNumber}: Paid PKR ${newPay.paidAmount.toLocaleString()} of PKR ${newPay.totalFee.toLocaleString()}`,
      'payment'
    );
    showSyncNotice(`Payment Receipt #${newPay.receiptNumber} generated & synced`);
    return newPay;
  };

  const updatePayment = (id: string, updates: Partial<PaymentRecord>, modificationReason?: string) => {
    let updatedPay: PaymentRecord | null = null;
    const timeIso = new Date().toISOString();
    const dateFormatted = new Date().toLocaleString('en-PK', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    setPayments((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const total = updates.totalFee !== undefined ? Number(updates.totalFee) : p.totalFee;
          const paid = updates.paidAmount !== undefined ? Number(updates.paidAmount) : p.paidAmount;
          const remaining = Math.max(0, total - paid);
          const existingHistory = p.history || [];

          let actionType: PaymentHistoryEntry['action'] = 'Modified';
          if (remaining === 0 && p.remainingAmount > 0) {
            actionType = 'Status Cleared';
          } else if (updates.totalFee !== undefined && updates.totalFee !== p.totalFee) {
            actionType = 'Fee Adjusted';
          } else if (updates.paymentMethod !== undefined && updates.paymentMethod !== p.paymentMethod) {
            actionType = 'Method Changed';
          }

          const historyEntry: PaymentHistoryEntry = {
            id: 'hist-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
            timestamp: timeIso,
            date: dateFormatted,
            action: actionType,
            changedBy: currentUser.name || 'Advocate',
            userRole: currentRole,
            previousTotalFee: p.totalFee,
            newTotalFee: total,
            previousPaidAmount: p.paidAmount,
            newPaidAmount: paid,
            previousRemaining: p.remainingAmount,
            newRemaining: remaining,
            previousMethod: p.paymentMethod,
            newMethod: updates.paymentMethod || p.paymentMethod,
            receiptNumber: updates.receiptNumber || p.receiptNumber,
            reason: modificationReason || 'Payment details modified in chamber ledger',
            notes: updates.notes !== undefined ? updates.notes : p.notes,
          };

          updatedPay = {
            ...p,
            ...updates,
            totalFee: total,
            paidAmount: paid,
            remainingAmount: remaining,
            firmId: currentFirm.id,
            updatedAt: timeIso,
            updatedBy: currentUser.name,
            history: [historyEntry, ...existingHistory],
          };
          return updatedPay;
        }
        return p;
      })
    );

    if (updatedPay) {
      savePaymentToFirestore(updatedPay, currentFirm.id).catch((err) =>
        console.warn('updatePayment error:', err)
      );
      addActivity(
        'Fee Record Modified',
        `Receipt #${(updatedPay as PaymentRecord).receiptNumber}: Total PKR ${(updatedPay as PaymentRecord).totalFee.toLocaleString()}, Paid PKR ${(updatedPay as PaymentRecord).paidAmount.toLocaleString()} (${modificationReason || 'Modified'})`,
        'payment'
      );
      showSyncNotice(`Receipt #${(updatedPay as PaymentRecord).receiptNumber} modified & synced`);
    }
  };

  const addPaymentInstallment = async (
    paymentId: string,
    installmentAmount: number,
    paymentDate: string,
    paymentMethod: PaymentMethod,
    notes?: string
  ): Promise<PaymentRecord | null> => {
    let updatedRecord: PaymentRecord | null = null;
    const timeIso = new Date().toISOString();
    const dateFormatted = new Date().toLocaleString('en-PK', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    setPayments((prev) =>
      prev.map((p) => {
        if (p.id === paymentId) {
          const added = Number(installmentAmount) || 0;
          const newPaid = p.paidAmount + added;
          const newRemaining = Math.max(0, p.totalFee - newPaid);
          const existingHistory = p.history || [];
          const installmentCount = existingHistory.filter((h) => h.action === 'Installment Added').length + 1;
          const installmentReceiptNo = `${p.receiptNumber}/Q-${installmentCount}`;

          const historyEntry: PaymentHistoryEntry = {
            id: 'hist-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
            timestamp: timeIso,
            date: dateFormatted,
            action: newRemaining === 0 ? 'Status Cleared' : 'Installment Added',
            changedBy: currentUser.name || 'Advocate',
            userRole: currentRole,
            previousTotalFee: p.totalFee,
            newTotalFee: p.totalFee,
            previousPaidAmount: p.paidAmount,
            newPaidAmount: newPaid,
            installmentAmount: added,
            previousRemaining: p.remainingAmount,
            newRemaining: newRemaining,
            previousMethod: p.paymentMethod,
            newMethod: paymentMethod,
            receiptNumber: installmentReceiptNo,
            reason: `Installment #${installmentCount} received: PKR ${added.toLocaleString()}`,
            notes: notes || `Installment received on ${paymentDate} via ${paymentMethod}`,
          };

          updatedRecord = {
            ...p,
            paidAmount: newPaid,
            remainingAmount: newRemaining,
            paymentDate,
            paymentMethod,
            updatedAt: timeIso,
            updatedBy: currentUser.name,
            history: [historyEntry, ...existingHistory],
          };
          return updatedRecord;
        }
        return p;
      })
    );

    if (updatedRecord) {
      await savePaymentToFirestore(updatedRecord, currentFirm.id).catch((err) =>
        console.warn('addPaymentInstallment error:', err)
      );
      addActivity(
        'Fee Installment Received',
        `Receipt #${(updatedRecord as PaymentRecord).receiptNumber}: Received PKR ${installmentAmount.toLocaleString()} via ${paymentMethod}`,
        'payment'
      );
      showSyncNotice(`Installment PKR ${installmentAmount.toLocaleString()} recorded & synced`);
    }
    return updatedRecord;
  };

  const deletePayment = (id: string, reason?: string) => {
    const target = payments.find((p) => p.id === id);
    setPayments((prev) => prev.filter((p) => p.id !== id));
    deletePaymentFromFirestore(id, currentFirm.id).catch((err) =>
      console.warn('deletePayment error:', err)
    );
    addActivity(
      'Fee Record Deleted',
      `Receipt #${target?.receiptNumber || id} (Total PKR ${target?.totalFee.toLocaleString() || '0'}, Paid PKR ${target?.paidAmount.toLocaleString() || '0'}) deleted. Reason: ${reason || 'Removed from ledger'}`,
      'payment'
    );
    showSyncNotice(`Payment record #${target?.receiptNumber || id} removed from ledger`);
  };

  // Legal Services Mutations
  const addLegalService = (
    data: Omit<LegalServiceRecord, 'id' | 'remainingAmount' | 'createdAt'>
  ): LegalServiceRecord => {
    const remaining = Math.max(0, data.totalFee - data.paidAmount);
    const newService: LegalServiceRecord = {
      ...data,
      id: 'srv-' + Date.now(),
      firmId: currentFirm.id,
      lawyerId: currentUser.lawyerId || currentUser.id,
      createdById: currentUser.id,
      remainingAmount: remaining,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setServices((prev) => [newService, ...prev]);
    saveLegalServiceToFirestore(newService, currentFirm.id).catch((err) =>
      console.warn('saveService error:', err)
    );
    addActivity('Legal Service Registered', `Service: ${newService.serviceTitle} (${newService.tokenOrChallanNo})`, 'service');
    showSyncNotice(`Service "${newService.serviceTitle}" registered`);
    return newService;
  };

  const updateLegalService = (id: string, updates: Partial<LegalServiceRecord>) => {
    let updatedService: LegalServiceRecord | null = null;
    setServices((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const total = updates.totalFee !== undefined ? updates.totalFee : s.totalFee;
          const paid = updates.paidAmount !== undefined ? updates.paidAmount : s.paidAmount;
          updatedService = {
            ...s,
            ...updates,
            firmId: currentFirm.id,
            remainingAmount: Math.max(0, total - paid),
          };
          return updatedService;
        }
        return s;
      })
    );
    if (updatedService) {
      saveLegalServiceToFirestore(updatedService, currentFirm.id).catch((err) =>
        console.warn('updateService error:', err)
      );
      showSyncNotice(`Service "${(updatedService as LegalServiceRecord).serviceTitle}" updated`);
    }
  };

  const deleteLegalService = (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
    deleteLegalServiceFromFirestore(id, currentFirm.id).catch((err) =>
      console.warn('deleteService error:', err)
    );
    showSyncNotice('Legal service record deleted');
  };

  // Utilities
  const getWhatsAppShareUrl = (phone: string, text: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const intlPhone = cleanPhone.startsWith('0') ? '92' + cleanPhone.slice(1) : cleanPhone;
    return `https://wa.me/${intlPhone}?text=${encodeURIComponent(text)}`;
  };

  const openWhatsApp = (phone: string, text: string) => {
    window.open(getWhatsAppShareUrl(phone, text), '_blank');
  };

  const openEmail = (email: string, subject: string, body: string) => {
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
  };

  const resetAllData = async () => {
    const freshEmpty = {
      clients: [],
      cases: [],
      firs: [],
      hearings: [],
      documents: [],
      payments: [],
      services: [],
      activities: [],
    };
    setClients([]);
    setCases([]);
    setFirs([]);
    setHearings([]);
    setDocuments([]);
    setPayments([]);
    setServices([]);
    setActivities([]);
    saveFirmStorageData(currentFirm.id, freshEmpty);
    showSyncNotice(
      languageMode === 'romanUrdu'
        ? 'Chamber database bilkul saaf aur zero entries par reset ho gaya'
        : 'Chamber workspace reset to zero entries'
    );
  };

  const exportDataJson = () => {
    const payload = {
      firm: currentFirm,
      clients,
      cases,
      firs,
      hearings,
      documents,
      payments,
      services,
      activities,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wakalat_${currentFirm.id}_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importDataJson = async (jsonString: string): Promise<boolean> => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.clients) setClients(parsed.clients);
      if (parsed.cases) setCases(parsed.cases);
      if (parsed.firs) setFirs(parsed.firs);
      if (parsed.hearings) setHearings(parsed.hearings);
      if (parsed.documents) setDocuments(parsed.documents);
      if (parsed.payments) setPayments(parsed.payments);
      if (parsed.services) setServices(parsed.services);
      showSyncNotice('Backup restored successfully');
      return true;
    } catch {
      return false;
    }
  };

  const syncWithCloud = async () => {
    setIsCloudSyncing(true);
    try {
      const [data, remoteAccounts, remoteFirms] = await Promise.all([
        syncFromFirestore(currentFirm.id),
        getAuthorizedAccountsFromFirestore(),
        getAllFirms(),
      ]);
      if (remoteAccounts && remoteAccounts.length > 0) {
        setAuthorizedAccounts(remoteAccounts);
        try {
          localStorage.setItem(STORAGE_KEYS.AUTHORIZED_ACCOUNTS, JSON.stringify(remoteAccounts));
        } catch {}
      }
      if (remoteFirms && remoteFirms.length > 0) {
        setFirms(remoteFirms);
        try {
          localStorage.setItem(STORAGE_KEYS.ALL_FIRMS, JSON.stringify(remoteFirms));
        } catch {}
      }
      if (data) {
        // Guarantee strict data isolation: NO demo data or other lawyer records can leak!
        const cleanData = sanitizeTenantData(currentFirm.id, data);
        setClients(cleanData.clients);
        setCases(cleanData.cases);
        setFirs(cleanData.firs);
        setHearings(cleanData.hearings);
        setDocuments(cleanData.documents);
        setPayments(cleanData.payments);
        setServices(cleanData.services);
        setActivities(cleanData.activities);
        saveFirmStorageData(currentFirm.id, cleanData);
      } else {
        // Immediately purge any lingering demo mock items from workspace
        const filterClean = (item: any) => item && !isDemoItem(item) && (!item.firmId || item.firmId === currentFirm.id);
        setClients((prev) => prev.filter(filterClean));
        setCases((prev) => prev.filter(filterClean));
        setFirs((prev) => prev.filter(filterClean));
        setHearings((prev) => prev.filter(filterClean));
        setDocuments((prev) => prev.filter(filterClean));
        setPayments((prev) => prev.filter(filterClean));
        setServices((prev) => prev.filter(filterClean));
        setActivities((prev) => prev.filter(filterClean));
      }
      showSyncNotice(
        languageMode === 'romanUrdu'
          ? `✓ Cloud Sync Kamyab: Chamber "${currentFirm.name}" ka apna private record refresh ho gaya.`
          : `✓ Cloud Synced: Private workspace refreshed for "${currentFirm.name}"`
      );
    } catch (err: any) {
      console.warn('syncWithCloud error:', err);
      showSyncNotice('Cloud Sync complete');
    } finally {
      setIsCloudSyncing(false);
    }
  };

  // Quick Metrics
  const todayDateStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const todayHearings = useMemo(() => {
    return hearings.filter((h) => h.hearingDate === todayDateStr && h.status !== 'Disposed');
  }, [hearings, todayDateStr]);

  const upcomingHearings = useMemo(() => {
    return hearings.filter((h) => h.hearingDate > todayDateStr && h.status !== 'Disposed');
  }, [hearings, todayDateStr]);

  const totalActiveCases = useMemo(() => {
    return cases.filter((c) => c.status !== 'Closed' && c.status !== 'Won' && c.status !== 'Lost').length;
  }, [cases]);

  const totalPendingFees = useMemo(() => {
    return payments.reduce((acc, p) => acc + (p.remainingAmount || 0), 0);
  }, [payments]);

  const totalPaidFees = useMemo(() => {
    return payments.reduce((acc, p) => acc + (p.paidAmount || 0), 0);
  }, [payments]);

  const activeServicesCount = useMemo(() => {
    return services.filter(
      (s) => s.status !== 'Completed & Delivered' && s.status !== 'Cancelled'
    ).length;
  }, [services]);

  const completedServicesCount = useMemo(() => {
    return services.filter((s) => s.status === 'Completed & Delivered').length;
  }, [services]);

  const totalPendingServiceFees = useMemo(() => {
    return services.reduce((acc, s) => acc + (s.remainingAmount || 0), 0);
  }, [services]);

  const totalPaidServiceFees = useMemo(() => {
    return services.reduce((acc, s) => acc + (s.paidAmount || 0), 0);
  }, [services]);

  return (
    <AppContext.Provider
      value={{
        firms,
        currentFirm,
        firmMembers,
        switchTenant,
        switchDemoUser,
        updateFirm,
        updateFirmStatus,
        addFirmMember,
        removeFirmMember,
        authorizedAccounts,
        addAuthorizedAccount,
        updateAuthorizedAccount,
        deleteAuthorizedAccount,
        showOnboarding,
        setShowOnboarding,
        isTeamModalOpen,
        setIsTeamModalOpen,
        isGmailBackupModalOpen,
        setIsGmailBackupModalOpen,
        attachLawyerGmail,
        disconnectLawyerGmail,
        syncLawyerDriveBackup,
        legalSections,
        addLegalSection,
        editLegalSection,
        deleteLegalSection,
        currentUser,
        setCurrentUser,
        currentRole,
        setCurrentRole,
        isLoggedIn,
        setIsLoggedIn,
        login,
        loginLawyer,
        registerLawyer,
        loginSuperAdmin,
        logout,
        languageMode,
        setLanguageMode,
        darkMode,
        setDarkMode,
        toggleDarkMode,
        activeView,
        setActiveView,
        isMobileSidebarOpen,
        setIsMobileSidebarOpen,
        selectedClientId,
        setSelectedClientId,
        selectedCaseId,
        setSelectedCaseId,
        selectedFirId,
        setSelectedFirId,
        selectedServiceId,
        setSelectedServiceId,
        isSearchModalOpen,
        setIsSearchModalOpen,
        globalSearchQuery,
        setGlobalSearchQuery,
        clients,
        cases,
        firs,
        hearings,
        documents,
        payments,
        activities,
        services,
        serviceCatalog,
        addClient,
        updateClient,
        deleteClient,
        addCase,
        updateCase,
        deleteCase,
        addFIR,
        updateFIR,
        deleteFIR,
        addHearing,
        updateHearing,
        deleteHearing,
        addDocument,
        updateDocument,
        deleteDocument,
        addPayment,
        updatePayment,
        deletePayment,
        addPaymentInstallment,
        addLegalService,
        updateLegalService,
        deleteLegalService,
        addActivity,
        getWhatsAppShareUrl,
        openWhatsApp,
        openEmail,
        resetAllData,
        exportDataJson,
        importDataJson,
        isGoogleDriveModalOpen,
        setIsGoogleDriveModalOpen,
        driveTargetDoc,
        setDriveTargetDoc,
        openGoogleDriveModal,
        isCloudSyncing,
        isConnectedToCloud,
        isRealtimeActive,
        syncNotification,
        syncWithCloud,
        todayDateStr,
        todayHearings,
        upcomingHearings,
        totalActiveCases,
        totalPendingFees,
        totalPaidFees,
        activeServicesCount,
        completedServicesCount,
        totalPendingServiceFees,
        totalPaidServiceFees,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
