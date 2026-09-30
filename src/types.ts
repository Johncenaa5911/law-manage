export type UserRole = 'super_admin' | 'firm_admin' | 'lawyer' | 'assistant' | 'admin' | 'clerk';

export type AccountType = 'individual' | 'lawfirm';

export type SubscriptionPlan = 'starter' | 'professional' | 'enterprise';

export type SubscriptionStatus = 'active' | 'trial' | 'expired' | 'suspended';

export interface FirmPermissions {
  canManageClients: boolean;
  canManageCases: boolean;
  canManageFirs: boolean;
  canManageHearings: boolean;
  canManageDocuments: boolean;
  canViewFinancials: boolean;
  canManagePayments: boolean;
  canManageTeam: boolean;
  canManageFirm: boolean;
}

export interface FirmMember {
  id: string; // userId
  userId: string;
  firmId: string;
  email: string;
  name: string;
  lawyerName?: string;
  role: UserRole;
  barLicenseNo?: string;
  phone?: string;
  joinedAt: string;
  permissions: FirmPermissions;
}

export interface Firm {
  id: string; // firmId
  name: string;
  ownerId: string;
  accountType: AccountType;
  plan: SubscriptionPlan;
  subscriptionStatus: SubscriptionStatus;
  trialEndsAt: string;
  officeAddress: string;
  city: string;
  province: string;
  country: string;
  phone: string;
  email: string;
  barCouncil?: string;
  practiceAreas?: string[];
  logoUrl?: string;
  createdAt: string;
  maxLawyers?: number;
  currency?: string;
  dossierTitle?: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  firmId: string;
  lawyerId?: string;
  firmName: string;
  accountType: AccountType;
  barLicenseNo?: string;
  chamberAddress?: string;
  courtEnrollment?: string;
  officeAddress?: string;
  city?: string;
  province?: string;
  country?: string;
  profilePhoto?: string;
  practiceAreas?: string[];
  subscriptionStatus?: SubscriptionStatus;
  plan?: SubscriptionPlan;
  createdDate: string;
  onboardingCompleted?: boolean;
  connectedGmail?: string; // Gmail attached by lawyer for backup & sync
  lastBackupDate?: string;
  lastBackupDriveLink?: string;
  dossierTitle?: string; // Custom lawyer chamber dossier title
}

export interface AuthorizedAccount {
  id: string;
  email: string;
  password?: string;
  name: string;
  firmId: string;
  firmName: string;
  role: UserRole;
  status: 'active' | 'suspended' | 'pending';
  plan: SubscriptionPlan;
  connectedGmail?: string;
  lastBackupDate?: string;
  lastBackupDriveLink?: string;
  dossierTitle?: string;
  createdDate: string;
}

export type ClientType = 'Individual' | 'Corporate' | 'Government' | 'Overseas Pakistani';

export interface Client {
  id: string;
  firmId?: string;
  lawyerId?: string;
  createdById?: string;
  name: string;
  fullName?: string;
  fatherOrHusbandName: string;
  cnic: string;
  mobile: string;
  phone?: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  province?: string;
  occupation: string;
  dob: string;
  clientType: ClientType;
  notes: string;
  profilePhoto?: string;
  idDocumentUrl?: string;
  createdAt: string;
}

export type CaseType =
  | 'Criminal'
  | 'Civil'
  | 'Family'
  | 'Corporate'
  | 'Constitutional / Writ'
  | 'NAB / Accountability'
  | 'Banking & Recovery'
  | 'Labor / Service'
  | 'Anti-Terrorism (ATC)';

export type CaseStatus =
  | 'Active'
  | 'Pending'
  | 'Hearing'
  | 'Adjourned'
  | 'Won'
  | 'Lost'
  | 'Withdrawn'
  | 'Closed';

export type ClientRole =
  | 'Petitioner / Complainant'
  | 'Respondent / Accused'
  | 'Appellant'
  | 'Defendant'
  | 'Third Party Intervenor';

export interface Case {
  id: string;
  firmId?: string;
  lawyerId?: string;
  createdById?: string;
  assignedLawyer?: string;
  clientId: string;
  caseTitle: string;
  caseNumber: string;
  firNumber?: string;
  firDate?: string;
  caseYear: string;
  caseType: CaseType;
  caseCategory: string;
  courtName: string;
  courtLocation: string;
  policeStation?: string;
  district: string;
  judgeName: string;
  complainant: string;
  accused: string;
  oppositeParty: string;
  clientRole: ClientRole;
  advocateName: string;
  status: CaseStatus;
  priority?: 'High' | 'Medium' | 'Low';
  dafaSections?: string;
  startDate: string;
  closingDate?: string;
  description: string;
  importantNotes: string;
  createdAt: string;
}

export type FIRStatus =
  | 'Under Investigation'
  | 'Challan Submitted'
  | 'Bail Granted'
  | 'Quashed'
  | 'Trial in Progress'
  | 'Disposed';

export interface FIRRecord {
  id: string;
  firmId?: string;
  lawyerId?: string;
  createdById?: string;
  firNumber: string; // e.g. "125/2024"
  firYear: string;
  firDate: string;
  policeStation: string;
  district: string;
  sections: string; // e.g. "302, 324, 109 PPC"
  complainant: string;
  accused: string;
  investigatingOfficer: string;
  description: string;
  relatedCaseId?: string;
  relatedClientId?: string;
  documentUrl?: string;
  status: FIRStatus;
  createdAt: string;
}

export type HearingType =
  | 'Bail Arguments'
  | 'Framing of Charges'
  | 'Evidence / Examination'
  | 'Cross-Examination'
  | 'Final Arguments'
  | 'Order / Judgment'
  | 'Interim Relief / Status Quo'
  | 'Summon / Notice Service';

export type HearingStatus =
  | 'Scheduled'
  | 'Attended'
  | 'Adjourned'
  | 'Disposed';

export interface Hearing {
  id: string;
  firmId?: string;
  lawyerId?: string;
  createdById?: string;
  caseId: string;
  clientId: string;
  hearingDate: string; // YYYY-MM-DD
  hearingTime: string; // e.g. "09:30 AM"
  courtName: string;
  judgeName: string;
  hearingType: HearingType;
  previousHearingDate?: string;
  nextHearingDate?: string;
  status: HearingStatus;
  lawyerNotes: string;
  courtOrder?: string;
  nextAction: string;
  createdAt: string;
}

export type DocumentType =
  | 'FIR Copy'
  | 'CNIC Copy'
  | 'Bail Application'
  | 'Court Order'
  | 'Judgment'
  | 'Affidavit'
  | 'Agreement'
  | 'Evidence'
  | 'Witness Documents'
  | 'Police Report'
  | 'Medical Report'
  | 'Vakalatnama'
  | 'Other Documents';

export interface DocumentItem {
  id: string;
  firmId?: string;
  userId?: string;
  lawyerId?: string;
  name: string;
  type: DocumentType;
  uploadDate: string;
  uploadedBy: string;
  description: string;
  clientId?: string;
  caseId?: string;
  firId?: string;
  serviceId?: string;
  format: 'PDF' | 'JPG' | 'PNG' | 'DOCX';
  fileSize: string;
  fileUrl?: string;
  fileData?: string;
  driveFileId?: string;
  driveWebViewLink?: string;
  isSyncedToDrive?: boolean;
  driveSyncDate?: string;
}

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  webContentLink?: string;
  iconLink?: string;
  thumbnailLink?: string;
  size?: string;
  createdTime?: string;
  modifiedTime?: string;
}

export interface GoogleDriveProfile {
  email: string;
  displayName: string;
  photoURL?: string;
  storageUsage?: string;
  storageLimit?: string;
}

export type PaymentMethod =
  | 'Cash'
  | 'Bank Transfer'
  | 'Cheque'
  | 'EasyPaisa / JazzCash'
  | 'Online Card';

export type PaymentHistoryAction =
  | 'Created'
  | 'Modified'
  | 'Installment Added'
  | 'Fee Adjusted'
  | 'Method Changed'
  | 'Status Cleared'
  | 'Refund / Reversal';

export interface PaymentHistoryEntry {
  id: string;
  timestamp: string; // ISO string
  date: string; // readable e.g. "27 Sep 2026, 03:45 PM"
  action: PaymentHistoryAction;
  changedBy: string; // advocate / user name
  userRole?: string;
  previousTotalFee?: number;
  newTotalFee?: number;
  previousPaidAmount?: number;
  newPaidAmount?: number;
  installmentAmount?: number;
  previousRemaining?: number;
  newRemaining?: number;
  previousMethod?: PaymentMethod;
  newMethod?: PaymentMethod;
  receiptNumber?: string;
  reason?: string;
  notes?: string;
}

export interface PaymentRecord {
  id: string;
  firmId?: string;
  lawyerId?: string;
  createdById?: string;
  clientId: string;
  caseId: string;
  totalFee: number; // PKR
  paidAmount: number; // PKR
  remainingAmount: number; // calculated: totalFee - paidAmount
  paymentDate: string;
  paymentMethod: PaymentMethod;
  receiptNumber: string;
  notes: string;
  createdAt: string;
  updatedAt?: string;
  updatedBy?: string;
  history?: PaymentHistoryEntry[];
}

export interface ActivityLog {
  id: string;
  firmId?: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
  timestamp: string;
  category: 'case' | 'client' | 'hearing' | 'document' | 'payment' | 'fir' | 'service' | 'auth' | 'firm';
}

export interface CaseTimelineMilestone {
  id: string;
  caseId: string;
  date: string;
  title: string;
  description: string;
  type: 'fir' | 'hearing' | 'bail' | 'order' | 'evidence' | 'filing' | 'verdict';
  badge: string;
}

export type ServiceCategory =
  | 'Taxation & FBR'
  | 'Police & Verification'
  | 'NADRA & Succession'
  | 'Corporate & SECP'
  | 'Property & Registry'
  | 'Family & Matrimonial'
  | 'Power of Attorney & Affidavits'
  | 'Trademark & IPO'
  | 'Legal Notice & Opinion';

export type ServiceStatus =
  | 'Application Received'
  | 'Documents Verified'
  | 'Under Department Processing'
  | 'Department Objection'
  | 'Clearance / Approval Granted'
  | 'Completed & Delivered'
  | 'Cancelled';

export interface LegalServiceRecord {
  id: string;
  firmId?: string;
  lawyerId?: string;
  createdById?: string;
  clientId: string;
  serviceTitle: string;
  category: ServiceCategory;
  department: string;
  tokenOrChallanNo: string;
  assignedLawyer: string;
  applicationDate: string;
  targetCompletionDate: string;
  completedDate?: string;
  status: ServiceStatus;
  totalFee: number;
  paidAmount: number;
  remainingAmount: number;
  requiredDocuments: string[];
  deliverableSummary: string;
  description?: string;
  notes: string;
  createdAt: string;
}

export interface ServiceCatalogItem {
  id: string;
  title: string;
  category: ServiceCategory;
  department: string;
  suggestedFee: number;
  typicalDurationDays: number;
  requiredDocuments: string[];
  deliverableSummary: string;
  description: string;
}

export type LegalLawCategory =
  | 'Pakistan Penal Code (PPC)'
  | 'Code of Criminal Procedure (CrPC)'
  | 'Code of Civil Procedure (CPC)'
  | 'Qanun-e-Shahadat Order'
  | 'Anti-Terrorism laws'
  | 'Narcotics laws'
  | 'Cybercrime laws'
  | 'Family laws'
  | 'Constitutional provisions'
  | 'Other applicable Pakistani laws';

export interface PakistanLegalSection {
  id: string;
  lawAct: string; // e.g. "Pakistan Penal Code 1860"
  sectionNumber: string; // e.g. "302", "324", "420", "489-F"
  sectionTitle: string; // e.g. "Punishment of Qatl-i-Amd"
  category: LegalLawCategory;
  description: string;
  status: 'Bailable' | 'Non-Bailable' | 'Compoundable' | 'Non-Compoundable' | 'Civil' | 'Active';
  punishment?: string;
  cognizable?: boolean;
  notes?: string;
  updatedAt?: string;
}
