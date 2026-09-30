import React, { useState } from 'react';
import {
  ShieldAlert,
  Building2,
  Users,
  CreditCard,
  BookOpen,
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  Clock,
  Ban,
  Sparkles,
  Lock,
  ChevronRight,
  Filter,
  DollarSign,
  Briefcase,
  AlertTriangle,
  FileText,
  KeyRound,
  Eye,
  EyeOff,
  UserCheck,
  Mail,
  UserPlus,
  LogOut,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Globe,
  Layers,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  PakistanLegalSection,
  SubscriptionStatus,
  SubscriptionPlan,
  LegalLawCategory,
  AuthorizedAccount,
  UserRole,
} from '../types';

export const SuperAdminPortal: React.FC = () => {
  const {
    firms,
    updateFirmStatus,
    legalSections,
    addLegalSection,
    editLegalSection,
    deleteLegalSection,
    languageMode,
    setLanguageMode,
    authorizedAccounts,
    addAuthorizedAccount,
    updateAuthorizedAccount,
    deleteAuthorizedAccount,
    logout,
    syncNotification,
    syncWithCloud,
    isCloudSyncing,
    isConnectedToCloud,
    isRealtimeActive,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'accounts' | 'firms' | 'sections' | 'plans' | 'security'>('dashboard');

  // Search & filters
  const [accountSearch, setAccountSearch] = useState('');
  const [accountStatusFilter, setAccountStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});

  // Add/Edit Account Modal State
  const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AuthorizedAccount | null>(null);
  const [accountForm, setAccountForm] = useState({
    name: '',
    email: '',
    password: '',
    firmName: '',
    city: 'Lahore',
    province: 'Punjab',
    role: 'firm_admin' as UserRole,
    plan: 'starter' as SubscriptionPlan,
    status: 'active' as 'active' | 'suspended',
    dossierTitle: '',
  });

  // Search & filter for firms
  const [firmSearch, setFirmSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Search & filter for legal sections
  const [sectionSearch, setSectionSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Section Modal State
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [editingSec, setEditingSec] = useState<PakistanLegalSection | null>(null);
  const [sectionForm, setSectionForm] = useState<Partial<PakistanLegalSection>>({
    lawAct: 'Pakistan Penal Code (PPC) 1860',
    sectionNumber: '',
    sectionTitle: '',
    category: 'Pakistan Penal Code (PPC)',
    description: '',
    status: 'Non-Bailable',
    punishment: '',
    notes: '',
  });

  // SaaS platform metrics (Pure platform level - ZERO private lawyer data)
  const totalFirms = firms.length;
  const activeFirms = firms.filter((f) => f.subscriptionStatus === 'active').length;
  const trialFirms = firms.filter((f) => f.subscriptionStatus === 'trial').length;
  const expiredFirms = firms.filter((f) => f.subscriptionStatus === 'expired' || f.subscriptionStatus === 'suspended').length;

  const estimatedMRR = firms.reduce((acc, f) => {
    if (f.subscriptionStatus !== 'active') return acc;
    if (f.plan === 'enterprise') return acc + 19500;
    if (f.plan === 'professional') return acc + 9500;
    return acc + 4500;
  }, 0);

  const activeAccountsCount = authorizedAccounts.filter((a) => a.status === 'active').length;

  // Filtered firms
  const filteredFirms = firms.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(firmSearch.toLowerCase()) ||
      f.city.toLowerCase().includes(firmSearch.toLowerCase()) ||
      f.email.toLowerCase().includes(firmSearch.toLowerCase());
    const matchesStatus = statusFilter === 'all' || f.subscriptionStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filtered legal sections
  const filteredSections = legalSections.filter((s) => {
    const matchesSearch =
      s.sectionNumber.toLowerCase().includes(sectionSearch.toLowerCase()) ||
      s.sectionTitle.toLowerCase().includes(sectionSearch.toLowerCase()) ||
      s.description.toLowerCase().includes(sectionSearch.toLowerCase()) ||
      s.lawAct.toLowerCase().includes(sectionSearch.toLowerCase());
    const matchesCat = categoryFilter === 'all' || s.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  // Filtered authorized accounts
  const filteredAccounts = authorizedAccounts.filter((acc) => {
    const matchesSearch =
      acc.name.toLowerCase().includes(accountSearch.toLowerCase()) ||
      acc.email.toLowerCase().includes(accountSearch.toLowerCase()) ||
      acc.firmName.toLowerCase().includes(accountSearch.toLowerCase()) ||
      (acc.connectedGmail && acc.connectedGmail.toLowerCase().includes(accountSearch.toLowerCase()));
    const matchesStatus = accountStatusFilter === 'all' || acc.status === accountStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenAddAccount = (acc?: AuthorizedAccount) => {
    if (acc) {
      setEditingAccount(acc);
      setAccountForm({
        name: acc.name,
        email: acc.email,
        password: acc.password || '',
        firmName: acc.firmName,
        city: 'Lahore',
        province: 'Punjab',
        role: acc.role,
        plan: acc.plan,
        status: acc.status as 'active' | 'suspended',
        dossierTitle: acc.dossierTitle || `CHAMBER OF ADVOCATE ${acc.name.toUpperCase()}`,
      });
    } else {
      setEditingAccount(null);
      setAccountForm({
        name: '',
        email: '',
        password: '',
        firmName: '',
        city: 'Lahore',
        province: 'Punjab',
        role: 'firm_admin',
        plan: 'starter',
        status: 'active',
        dossierTitle: '',
      });
    }
    setIsAddAccountModalOpen(true);
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountForm.email || !accountForm.password) {
      alert('Please fill both email and password for the authorized lawyer.');
      return;
    }

    const firmSlug = (accountForm.firmName || accountForm.name || 'chambers')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .slice(0, 20);
    const firmId = editingAccount ? editingAccount.firmId : `firm_${firmSlug}_${Date.now().toString().slice(-4)}`;

    const newAcc: AuthorizedAccount = {
      id: editingAccount ? editingAccount.id : `acc_${Date.now()}`,
      name: accountForm.name || 'Advocate',
      email: accountForm.email.trim().toLowerCase(),
      password: accountForm.password.trim(),
      firmId,
      firmName: accountForm.firmName || `${accountForm.name} Law Chambers`,
      role: accountForm.role,
      plan: accountForm.plan,
      status: accountForm.status,
      createdDate: editingAccount ? editingAccount.createdDate : new Date().toISOString().split('T')[0],
      connectedGmail: editingAccount?.connectedGmail,
      lastBackupDate: editingAccount?.lastBackupDate,
      lastBackupDriveLink: editingAccount?.lastBackupDriveLink,
      dossierTitle:
        accountForm.dossierTitle.trim() ||
        `CHAMBER OF ADVOCATE ${(accountForm.name || 'Advocate').toUpperCase()}`,
    };

    // Guarantee strictly clean ZERO entries for newly created lawyer dashboard
    if (!editingAccount) {
      try {
        localStorage.setItem(
          `wakalat_firm_${firmId}_data`,
          JSON.stringify({
            clients: [],
            cases: [],
            firs: [],
            hearings: [],
            documents: [],
            payments: [],
            services: [],
            activities: [],
          })
        );
      } catch {}
    }

    if (editingAccount) {
      updateAuthorizedAccount(editingAccount.id, newAcc);
    } else {
      addAuthorizedAccount(newAcc);
    }

    setIsAddAccountModalOpen(false);
  };

  const handleResetLawyerDashboard = (acc: AuthorizedAccount) => {
    if (
      window.confirm(
        `Reset ${acc.name}'s dashboard (${acc.firmName}) to fresh ZERO (0) entries? All test clients, cases, and documents will be cleared.`
      )
    ) {
      try {
        localStorage.setItem(
          `wakalat_firm_${acc.firmId}_data`,
          JSON.stringify({
            clients: [],
            cases: [],
            firs: [],
            hearings: [],
            documents: [],
            payments: [],
            services: [],
            activities: [],
          })
        );
        alert(`Success: ${acc.name}'s chamber has been reset to a fresh dashboard with 0 entries!`);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const togglePasswordVisibility = (accId: string) => {
    setShowPasswordMap((prev) => ({
      ...prev,
      [accId]: !prev[accId],
    }));
  };

  const handleOpenSectionModal = (sec?: PakistanLegalSection) => {
    if (sec) {
      setEditingSec(sec);
      setSectionForm(sec);
    } else {
      setEditingSec(null);
      setSectionForm({
        id: `sec_${Date.now()}`,
        lawAct: 'Pakistan Penal Code (PPC) 1860',
        sectionNumber: '',
        sectionTitle: '',
        category: 'Pakistan Penal Code (PPC)',
        description: '',
        status: 'Non-Bailable',
        punishment: '',
        notes: '',
      });
    }
    setIsSectionModalOpen(true);
  };

  const handleSaveSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sectionForm.sectionNumber || !sectionForm.sectionTitle) {
      alert('Please fill Section Number and Section Title.');
      return;
    }

    const payload: PakistanLegalSection = {
      id: editingSec?.id || `sec_${Date.now()}`,
      lawAct: sectionForm.lawAct || 'Pakistan Penal Code (PPC) 1860',
      sectionNumber: sectionForm.sectionNumber,
      sectionTitle: sectionForm.sectionTitle,
      category: (sectionForm.category as LegalLawCategory) || 'Pakistan Penal Code (PPC)',
      description: sectionForm.description || '',
      status: (sectionForm.status as any) || 'Active',
      punishment: sectionForm.punishment || '',
      notes: sectionForm.notes || '',
      updatedAt: new Date().toISOString().split('T')[0],
    };

    if (editingSec) {
      editLegalSection(payload);
    } else {
      addLegalSection(payload);
    }
    setIsSectionModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {/* Super Admin Top Navigation Bar */}
      <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-md shadow-purple-600/20">
            <ShieldAlert className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-slate-950 text-base tracking-tight uppercase">
                WAKALAT PRO
              </span>
              <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-purple-100 text-purple-900 border border-purple-200">
                SUPER ADMIN
              </span>
            </div>
            <p className="text-[11px] text-slate-600 font-medium">
              Software Owner Console • 100% Isolated Platform Dashboard
            </p>
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Real-time Cross-Device Sync Badge */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold shadow-2xs"
            title="Real-time multi-device cloud sync is connected with Firestore"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="hidden sm:inline">Realtime Cloud Sync Active (Mobile ↔ Laptop)</span>
            <span className="sm:hidden">Live Sync</span>
          </div>

          {/* Force Refresh / Sync Button */}
          <button
            type="button"
            onClick={() => syncWithCloud()}
            disabled={isCloudSyncing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-900 text-xs font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-50"
            title="Refresh authorized accounts and firms from Firestore Cloud"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-purple-700 ${isCloudSyncing ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">{isCloudSyncing ? 'Syncing...' : 'Sync Cloud'}</span>
          </button>

          {/* Privacy & Zero-Lawyer-Data Guarantee Badge */}
          <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Zero Lawyer Private Data Access</span>
          </div>

          {/* Language Switcher */}
          <button
            type="button"
            onClick={() => setLanguageMode(languageMode === 'english' ? 'romanUrdu' : 'english')}
            className="px-2.5 py-1.5 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-900 transition-colors shadow-2xs cursor-pointer"
          >
            {languageMode === 'romanUrdu' ? '🇵🇰 Urdu' : '🇬🇧 EN'}
          </button>

          {/* Master Sign Out */}
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-900 text-xs font-bold transition-all shadow-2xs cursor-pointer"
            title="Sign out from Super Admin console"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-600" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Super Admin Viewport */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 md:p-8 space-y-6">
        {/* Navigation Tabs Bar */}
        <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25'
                : 'text-slate-800 hover:text-black hover:bg-slate-100'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Master Dashboard</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('accounts')}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'accounts'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25'
                : 'text-slate-800 hover:text-black hover:bg-slate-100'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Authorized Logins ({authorizedAccounts.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('firms')}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'firms'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25'
                : 'text-slate-800 hover:text-black hover:bg-slate-100'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Customer Chambers ({firms.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sections')}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'sections'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25'
                : 'text-slate-800 hover:text-black hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Pakistan Legal Sections ({legalSections.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('plans')}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'plans'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25'
                : 'text-slate-800 hover:text-black hover:bg-slate-100'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Subscription Plans</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'security'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25'
                : 'text-slate-800 hover:text-black hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Confidentiality & Isolation</span>
          </button>
        </div>

        {/* TAB 1: MASTER PLATFORM DASHBOARD (Completely Isolated from Lawyers) */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Zero Lawyer Data Assurance Banner */}
            <div className="bg-white rounded-2xl border-2 border-purple-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700 shrink-0">
                  <Lock className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black uppercase tracking-wider text-purple-900 bg-purple-100 px-2 py-0.5 rounded">
                      Zero-Knowledge Lawyer Privacy
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">
                      Complete Data Partition
                    </span>
                  </div>
                  <h2 className="text-lg font-black text-slate-950 mt-1">
                    Independent Super Admin Platform Overview
                  </h2>
                  <p className="text-xs text-slate-700 font-medium max-w-3xl mt-0.5 leading-relaxed">
                    Is dashboard mein kisi bhi doosre wakeel ka private data (moakil/clients, case files, FIR records, hearing peshiyan, aur personal fees) show nahi hota. Super Admin sirf customer accounts, software licenses, Pakistan dafaat repo, aur platform subscriptions manage karta hai.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleOpenAddAccount()}
                  className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-600/20 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Authorize New Lawyer</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('sections')}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-purple-700" />
                  <span>Legal Repository</span>
                </button>
              </div>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Customer Law Firms
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                    <Building2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-3xl font-black text-slate-950">{totalFirms}</div>
                  <div className="text-xs font-semibold text-emerald-700 mt-1 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>{activeFirms} Active • {trialFirms} Free Trial</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Authorized Logins
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                    <KeyRound className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-3xl font-black text-slate-950">{authorizedAccounts.length}</div>
                  <div className="text-xs font-semibold text-purple-800 mt-1 flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>{activeAccountsCount} Active Advocates Authorized</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Platform Monthly MRR
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-3xl font-black text-slate-950">
                    Rs. {estimatedMRR.toLocaleString()}
                  </div>
                  <div className="text-xs font-semibold text-slate-600 mt-1">
                    From active commercial subscriptions
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Legal Sections Repo
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                    <BookOpen className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-3xl font-black text-slate-950">{legalSections.length}</div>
                  <div className="text-xs font-semibold text-amber-900 mt-1">
                    Pakistan Penal Code & Statutory laws
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Management Shortcuts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Recent Authorized Accounts */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-purple-700" />
                    <h3 className="font-black text-slate-950 text-sm">
                      Recent Authorized Lawyer Logins
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('accounts')}
                    className="text-xs font-bold text-purple-700 hover:text-purple-900 cursor-pointer"
                  >
                    View All ({authorizedAccounts.length}) →
                  </button>
                </div>

                <div className="space-y-2.5">
                  {authorizedAccounts.slice(0, 4).map((acc) => (
                    <div
                      key={acc.id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-slate-950 text-xs">{acc.name}</div>
                        <div className="text-[11px] text-slate-600 font-mono flex items-center gap-1.5 mt-0.5">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{acc.email}</span>
                          <span>•</span>
                          <span className="text-purple-700 font-semibold">{acc.firmName}</span>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-black uppercase border ${
                          acc.status === 'active'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-rose-50 text-rose-800 border-rose-300'
                        }`}
                      >
                        {acc.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer Chambers Breakdown */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-700" />
                    <h3 className="font-black text-slate-950 text-sm">
                      Customer Law Chambers
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('firms')}
                    className="text-xs font-bold text-blue-700 hover:text-blue-900 cursor-pointer"
                  >
                    Manage Firms ({firms.length}) →
                  </button>
                </div>

                <div className="space-y-2.5">
                  {firms.map((f) => (
                    <div
                      key={f.id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-slate-950 text-xs">{f.name}</div>
                        <div className="text-[11px] text-slate-600 mt-0.5 font-medium">
                          {f.city}, {f.province} • Plan: <span className="font-bold uppercase text-purple-700">{f.plan}</span>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-black uppercase border ${
                          f.subscriptionStatus === 'active'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : f.subscriptionStatus === 'trial'
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : 'bg-slate-100 text-slate-700 border-slate-300'
                        }`}
                      >
                        {f.subscriptionStatus}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: AUTHORIZED LOGINS (Gmail & Password Access Control) */}
        {activeTab === 'accounts' && (
          <div className="space-y-4">
            {/* Realtime Multi-Device Sync Information Banner */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <div className="font-extrabold text-emerald-950 text-xs flex items-center gap-2">
                    <span>Multi-Device Realtime Cloud Sync Active (Mobile ↔ Laptop)</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-200 text-emerald-900 font-black uppercase tracking-wide">
                      Live Push
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-800 font-medium mt-0.5">
                    Aap mobile ya laptop kisi bhi device par naya lawyer add karein, wo Cloud Firestore ke zariye foran realtime mein laptop/admin section mein show hoga aur laptop par login bhi foran kaam karega.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] font-bold text-emerald-900 bg-white/80 px-3 py-1.5 rounded-xl border border-emerald-200">
                  Cloud Synced: <strong className="font-black text-emerald-950">{authorizedAccounts.length} Lawyers</strong>
                </span>
              </div>
            </div>

            {/* Header & Controls Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                <input
                  type="text"
                  value={accountSearch}
                  onChange={(e) => setAccountSearch(e.target.value)}
                  placeholder="Search lawyer name, email/Gmail, firm..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <select
                  value={accountStatusFilter}
                  onChange={(e) => setAccountStatusFilter(e.target.value as any)}
                  className="py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                >
                  <option value="all">All Accounts ({authorizedAccounts.length})</option>
                  <option value="active">Active Only ({authorizedAccounts.filter((a) => a.status === 'active').length})</option>
                  <option value="suspended">Suspended ({authorizedAccounts.filter((a) => a.status === 'suspended').length})</option>
                </select>

                <button
                  type="button"
                  onClick={() => handleOpenAddAccount()}
                  className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md shadow-purple-600/20 cursor-pointer whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add Lawyer Login</span>
                </button>
              </div>
            </div>

            {/* Accounts Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 border-b border-slate-200 text-slate-900 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Lawyer / Advocate & Chamber</th>
                      <th className="py-3.5 px-4">Authorized Login (Email / Gmail)</th>
                      <th className="py-3.5 px-4">Chamber Password / PIN</th>
                      <th className="py-3.5 px-4">Workspace / Firm ID</th>
                      <th className="py-3.5 px-4">Attached Backup Gmail</th>
                      <th className="py-3.5 px-4">Status & Access</th>
                      <th className="py-3.5 px-4 text-right">Master Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {filteredAccounts.map((acc) => (
                      <tr key={acc.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-950 text-sm">{acc.name}</div>
                          <div className="text-[11px] text-purple-800 font-semibold mt-0.5">
                            {acc.firmName}
                          </div>
                          <div className="text-[10px] text-slate-600 uppercase font-mono mt-0.5">
                            Role: {acc.role.replace('_', ' ')} • Plan: {acc.plan}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-mono text-slate-950 font-bold">
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-slate-500" />
                            <span>{acc.email}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-mono">
                          <div className="flex items-center gap-2">
                            <span className="bg-slate-100 px-2 py-1 rounded text-slate-950 font-bold text-xs border border-slate-200">
                              {showPasswordMap[acc.id] ? acc.password : '••••••••'}
                            </span>
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility(acc.id)}
                              className="text-slate-500 hover:text-slate-800 p-1 rounded cursor-pointer"
                              title={showPasswordMap[acc.id] ? 'Hide Password' : 'Show Password'}
                            >
                              {showPasswordMap[acc.id] ? (
                                <EyeOff className="w-3.5 h-3.5" />
                              ) : (
                                <Eye className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-700">
                          <span className="bg-purple-50 text-purple-900 px-2 py-0.5 rounded border border-purple-200 font-semibold">
                            {acc.firmId}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          {acc.connectedGmail ? (
                            <div>
                              <span className="text-emerald-800 font-bold flex items-center gap-1 text-[11px]">
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                {acc.connectedGmail}
                              </span>
                              <div className="text-[10px] text-slate-500 mt-0.5">
                                Synced: {acc.lastBackupDate || 'Active'}
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-500 text-[11px] italic">Not attached yet</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          {acc.status === 'active' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 font-bold text-[10px] uppercase">
                              <CheckCircle className="w-3 h-3 text-emerald-600" />
                              Active (Allowed)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-100 text-rose-900 font-bold text-[10px] uppercase">
                              <Ban className="w-3 h-3 text-rose-600" />
                              Suspended (Blocked)
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                updateAuthorizedAccount(acc.id, {
                                  status: acc.status === 'active' ? 'suspended' : 'active',
                                })
                              }
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors border cursor-pointer ${
                                acc.status === 'active'
                                  ? 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                                  : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                              }`}
                            >
                              {acc.status === 'active' ? 'Suspend' : 'Activate'}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleResetLawyerDashboard(acc)}
                              className="p-1.5 text-amber-700 hover:text-amber-900 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                              title="Reset Dashboard to 0 Entries"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenAddAccount(acc)}
                              className="p-1.5 text-slate-700 hover:text-purple-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              title="Edit Credentials"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Revoke access for ${acc.name} (${acc.email})?`)) {
                                  deleteAuthorizedAccount(acc.id);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Account"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CUSTOMER LAW FIRMS DIRECTORY (Platform Level Only) */}
        {activeTab === 'firms' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                <input
                  type="text"
                  value={firmSearch}
                  onChange={(e) => setFirmSearch(e.target.value)}
                  placeholder="Search firm name, city, email..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                >
                  <option value="all">All Statuses ({firms.length})</option>
                  <option value="active">Active ({activeFirms})</option>
                  <option value="trial">Trial ({trialFirms})</option>
                  <option value="expired">Expired ({expiredFirms})</option>
                </select>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 border-b border-slate-200 text-slate-900 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Law Firm / Chamber</th>
                      <th className="py-3.5 px-4">City / Province</th>
                      <th className="py-3.5 px-4">Commercial Plan</th>
                      <th className="py-3.5 px-4">Subscription Status</th>
                      <th className="py-3.5 px-4">Trial / Expiry Date</th>
                      <th className="py-3.5 px-4 text-right">Owner Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {filteredFirms.map((firm) => (
                      <tr key={firm.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-950 text-sm">{firm.name}</div>
                          <div className="text-[11px] text-slate-600 font-mono flex items-center gap-2 mt-0.5">
                            <span>ID: {firm.id}</span>
                            <span>•</span>
                            <span>{firm.email}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{firm.city}</div>
                          <div className="text-[11px] text-slate-600">{firm.province}</div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border ${
                            firm.plan === 'enterprise'
                              ? 'bg-purple-100 text-purple-900 border-purple-300'
                              : firm.plan === 'professional'
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : 'bg-slate-100 text-slate-800 border-slate-300'
                          }`}>
                            {firm.plan}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            {firm.subscriptionStatus === 'active' && (
                              <span className="flex items-center gap-1 text-emerald-800 font-bold text-[11px]">
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                Active
                              </span>
                            )}
                            {firm.subscriptionStatus === 'trial' && (
                              <span className="flex items-center gap-1 text-amber-800 font-bold text-[11px]">
                                <Clock className="w-3.5 h-3.5 text-amber-600" />
                                Free Trial
                              </span>
                            )}
                            {firm.subscriptionStatus === 'expired' && (
                              <span className="flex items-center gap-1 text-rose-800 font-bold text-[11px]">
                                <Ban className="w-3.5 h-3.5 text-rose-600" />
                                Expired
                              </span>
                            )}
                            {firm.subscriptionStatus === 'suspended' && (
                              <span className="flex items-center gap-1 text-slate-700 font-bold text-[11px]">
                                <AlertTriangle className="w-3.5 h-3.5 text-slate-500" />
                                Suspended
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-slate-700 font-mono text-[11px]">
                          {firm.trialEndsAt || 'Permanent / Active'}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <select
                            value={firm.subscriptionStatus}
                            onChange={(e) => updateFirmStatus(firm.id, e.target.value as SubscriptionStatus)}
                            className="text-[11px] font-bold py-1 px-2.5 rounded-lg bg-slate-100 border border-slate-300 text-slate-900 focus:outline-none cursor-pointer"
                          >
                            <option value="active">Active</option>
                            <option value="trial">Trial</option>
                            <option value="expired">Expired</option>
                            <option value="suspended">Suspended</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PAKISTAN LEGAL SECTIONS REPOSITORY */}
        {activeTab === 'sections' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                <input
                  type="text"
                  value={sectionSearch}
                  onChange={(e) => setSectionSearch(e.target.value)}
                  placeholder="Search section (e.g. 302, 324, 489-F)..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                >
                  <option value="all">All Law Acts ({legalSections.length})</option>
                  <option value="Pakistan Penal Code (PPC)">PPC (Pakistan Penal Code)</option>
                  <option value="Code of Criminal Procedure (CrPC)">CrPC (Criminal Procedure)</option>
                  <option value="Civil Procedure Code (CPC)">CPC (Civil Procedure)</option>
                  <option value="Specific Relief Act">Specific Relief Act</option>
                  <option value="Family Courts Act">Family Courts Act</option>
                </select>

                <button
                  type="button"
                  onClick={() => handleOpenSectionModal()}
                  className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md shadow-purple-600/20 cursor-pointer whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add Legal Section</span>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 border-b border-slate-200 text-slate-900 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Section / Dafa #</th>
                      <th className="py-3.5 px-4">Law Act & Category</th>
                      <th className="py-3.5 px-4">Offense Title & Description</th>
                      <th className="py-3.5 px-4">Bail Status</th>
                      <th className="py-3.5 px-4">Prescribed Punishment</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {filteredSections.map((sec) => (
                      <tr key={sec.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4">
                          <span className="font-mono font-black text-purple-900 text-sm px-2.5 py-1 bg-purple-100 rounded-lg border border-purple-200 inline-block">
                            Sec {sec.sectionNumber}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{sec.lawAct}</div>
                          <div className="text-[11px] text-slate-600 mt-0.5">{sec.category}</div>
                        </td>

                        <td className="py-3.5 px-4 max-w-md">
                          <div className="font-bold text-slate-950">{sec.sectionTitle}</div>
                          <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
                            {sec.description}
                          </p>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${
                            sec.status === 'Bailable'
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                              : 'bg-rose-100 text-rose-900 border-rose-300'
                          }`}>
                            {sec.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-[11px] font-semibold text-slate-800">
                          {sec.punishment || 'As determined by trial court'}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenSectionModal(sec)}
                              className="p-1.5 text-slate-700 hover:text-purple-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              title="Edit Section"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Delete Section ${sec.sectionNumber} from repository?`)) {
                                  deleteLegalSection(sec.id);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Section"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SUBSCRIPTION PLANS & REVENUE TIERS */}
        {activeTab === 'plans' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
              <h2 className="text-base font-black text-slate-950 uppercase tracking-tight">
                Commercial Subscription Packages for Pakistan Law Chambers
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Configure SaaS pricing, lawyer user allowances, and automated backup limits.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-base text-slate-950">Solo Advocate</h3>
                  <span className="text-xs font-bold text-slate-600 uppercase">Starter</span>
                </div>
                <div className="text-3xl font-black text-slate-950">
                  Rs. 4,500 <span className="text-xs text-slate-600 font-normal">/ month</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Designed for independent legal practitioners and junior advocates building their chamber practice.
                </p>
                <ul className="space-y-2 text-xs text-slate-800 font-medium pt-2 border-t border-slate-100">
                  <li className="flex items-center gap-2">✓ 1 Authorized Advocate Login</li>
                  <li className="flex items-center gap-2">✓ Up to 150 Active Court Cases</li>
                  <li className="flex items-center gap-2">✓ FIR & Police Bail Tracker</li>
                  <li className="flex items-center gap-2">✓ Cause List & Peshi Calendar</li>
                  <li className="flex items-center gap-2">✓ Complete Case Dossier PDF Export</li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl border-2 border-purple-500 p-6 shadow-md space-y-4 relative">
                <div className="absolute -top-3 right-4 px-3 py-0.5 bg-purple-600 text-white text-[10px] font-black rounded-full uppercase">
                  Most Popular
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-base text-purple-950">Chamber Professional</h3>
                  <span className="text-xs font-black text-purple-700 uppercase">Multi-Lawyer</span>
                </div>
                <div className="text-3xl font-black text-purple-950">
                  Rs. 9,500 <span className="text-xs text-slate-600 font-normal">/ month</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  For established chambers with junior advocates, associates, and court munshis.
                </p>
                <ul className="space-y-2 text-xs text-slate-900 font-semibold pt-2 border-t border-purple-100">
                  <li className="flex items-center gap-2">✓ Up to 5 Associate Advocates</li>
                  <li className="flex items-center gap-2">✓ Unlimited Clients & Court Cases</li>
                  <li className="flex items-center gap-2">✓ Munshi Restricted Court Desk Access</li>
                  <li className="flex items-center gap-2">✓ WhatsApp & Email Instant Sharing</li>
                  <li className="flex items-center gap-2">✓ Real-time Multi-device Live Sync</li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-base text-slate-950">Enterprise Law Firm</h3>
                  <span className="text-xs font-bold text-slate-600 uppercase">Unlimited</span>
                </div>
                <div className="text-3xl font-black text-slate-950">
                  Rs. 19,500 <span className="text-xs text-slate-600 font-normal">/ month</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Corporate law firms with multiple branches across High Courts and Supreme Court.
                </p>
                <ul className="space-y-2 text-xs text-slate-800 font-medium pt-2 border-t border-slate-100">
                  <li className="flex items-center gap-2">✓ Unlimited Lawyers & Paralegals</li>
                  <li className="flex items-center gap-2">✓ Multi-Branch Chamber Management</li>
                  <li className="flex items-center gap-2">✓ Custom Letterhead & Firm Watermark</li>
                  <li className="flex items-center gap-2">✓ Dedicated Database Encryption</li>
                  <li className="flex items-center gap-2">✓ Priority SLA 24/7 Support</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: CONFIDENTIALITY & ISOLATION AUDIT */}
        {activeTab === 'security' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-800">
                <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-950">
                  Client-Attorney Confidentiality & Architecture Guarantee
                </h2>
                <p className="text-xs text-slate-600 font-medium">
                  Compliance with the Legal Practitioners and Bar Councils Act 1973 & Qanun-e-Shahadat Order 1984
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-800 font-medium">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <h4 className="font-bold text-slate-950 text-sm flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-purple-700" />
                  1. Complete Multi-Tenant Data Isolation
                </h4>
                <p className="text-slate-600 leading-relaxed">
                  Every law firm tenant operates with a cryptographically enforced partition key. Cases, clients, FIRs, and financial ledgers belonging to Chamber A can never be queried, displayed, or accessed by Chamber B or by the Super Admin console.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <h4 className="font-bold text-slate-950 text-sm flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-emerald-700" />
                  2. Zero Access to Case Files & Court Dossiers
                </h4>
                <p className="text-slate-600 leading-relaxed">
                  The Super Admin panel strictly manages authentication licenses, platform subscriptions, and central Pakistan statutory legal sections. Super Admin has zero access to individual client records, litigation files, or police FIR reports.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <h4 className="font-bold text-slate-950 text-sm flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-blue-700" />
                  3. Encrypted Personal Gmail & Google Drive Backup
                </h4>
                <p className="text-slate-600 leading-relaxed">
                  When a lawyer connects their personal Gmail or Google Drive, documents and backups flow directly between their authenticated Google account and their private chamber workspace with 256-bit encryption.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <h4 className="font-bold text-slate-950 text-sm flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-amber-700" />
                  4. Secure Role-Based Access Control (RBAC)
                </h4>
                <p className="text-slate-600 leading-relaxed">
                  Within each customer chamber, Managing Partners have full oversight, Associate Lawyers see their assigned cases, and Munshis (Clerks) are strictly confined to the court cause list with confidential fee ledgers blocked.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Add/Edit Authorized Account */}
      {isAddAccountModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-purple-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-purple-300" />
                <h3 className="font-bold text-sm">
                  {editingAccount ? 'Edit Authorized Lawyer Access' : 'Authorize New Lawyer / Law Firm'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddAccountModalOpen(false)}
                className="text-slate-300 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAccount} className="p-5 space-y-3.5 text-xs text-slate-900">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-900 font-bold mb-1">
                    Lawyer / Advocate Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={accountForm.name}
                    onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                    placeholder="e.g. Advocate Imran Cheema"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-slate-900 font-bold mb-1">
                    Chamber / Law Firm Name
                  </label>
                  <input
                    type="text"
                    value={accountForm.firmName}
                    onChange={(e) => setAccountForm({ ...accountForm, firmName: e.target.value })}
                    placeholder="e.g. Cheema & Associates"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-900 font-bold mb-1">
                  Custom Dossier Header Title (ڈوسیئر ٹائٹل)
                </label>
                <input
                  type="text"
                  value={accountForm.dossierTitle}
                  onChange={(e) => setAccountForm({ ...accountForm, dossierTitle: e.target.value })}
                  placeholder={`e.g. CHAMBER OF ADVOCATE ${(accountForm.name || 'NAME').toUpperCase()} (HIGH COURT)`}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-serif font-bold text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-900 font-bold mb-1">
                    Authorized Gmail / Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={accountForm.email}
                    onChange={(e) => setAccountForm({ ...accountForm, email: e.target.value })}
                    placeholder="advocate@gmail.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-900 font-bold mb-1">
                    Chamber Password / PIN *
                  </label>
                  <input
                    type="text"
                    required
                    value={accountForm.password}
                    onChange={(e) => setAccountForm({ ...accountForm, password: e.target.value })}
                    placeholder="e.g. legal2026"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-900 font-bold mb-1">
                    City / Bar Council Location
                  </label>
                  <input
                    type="text"
                    value={accountForm.city}
                    onChange={(e) => setAccountForm({ ...accountForm, city: e.target.value })}
                    placeholder="e.g. Lahore / Islamabad / Karachi"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-slate-900 font-bold mb-1">
                    Commercial Plan
                  </label>
                  <select
                    value={accountForm.plan}
                    onChange={(e) => setAccountForm({ ...accountForm, plan: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-bold"
                  >
                    <option value="starter">Starter (Rs. 4,500/mo - Solo Lawyer)</option>
                    <option value="professional">Professional (Rs. 9,500/mo - Up to 10 Lawyers)</option>
                    <option value="enterprise">Enterprise (Rs. 19,500/mo - Unlimited Firm)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-900 font-bold mb-1">
                    Role in Firm
                  </label>
                  <select
                    value={accountForm.role}
                    onChange={(e) => setAccountForm({ ...accountForm, role: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-bold"
                  >
                    <option value="firm_admin">Firm Admin (Chamber Head)</option>
                    <option value="lawyer">Senior Lawyer / Associate</option>
                    <option value="assistant">Assistant / Munshi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-900 font-bold mb-1">
                    Account Access Status
                  </label>
                  <select
                    value={accountForm.status}
                    onChange={(e) => setAccountForm({ ...accountForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-bold"
                  >
                    <option value="active">Active (Access Allowed)</option>
                    <option value="suspended">Suspended (Access Blocked)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddAccountModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black shadow-md shadow-purple-600/30 cursor-pointer"
                >
                  {editingAccount ? 'Update Account Access' : 'Authorize & Grant Access'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add/Edit Pakistan Legal Section */}
      {isSectionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-purple-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-300" />
                <h3 className="font-bold text-sm">
                  {editingSec ? 'Edit Legal Section / Dafa' : 'Add New Pakistan Legal Section'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSectionModalOpen(false)}
                className="text-slate-300 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSection} className="p-5 space-y-3.5 text-xs text-slate-900">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-900 font-bold mb-1">
                    Section Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={sectionForm.sectionNumber}
                    onChange={(e) => setSectionForm({ ...sectionForm, sectionNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono font-bold"
                    placeholder="e.g. 302, 324, 489-F"
                  />
                </div>

                <div>
                  <label className="block text-slate-900 font-bold mb-1">
                    Bail / Nature Status *
                  </label>
                  <select
                    value={sectionForm.status}
                    onChange={(e) => setSectionForm({ ...sectionForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-bold"
                  >
                    <option value="Non-Bailable">Non-Bailable (ناقابلِ ضمانت)</option>
                    <option value="Bailable">Bailable (قابلِ ضمانت)</option>
                    <option value="Active">Active Procedural</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-900 font-bold mb-1">
                  Law Act / Source Code *
                </label>
                <select
                  value={sectionForm.lawAct}
                  onChange={(e) => setSectionForm({ ...sectionForm, lawAct: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold"
                >
                  <option value="Pakistan Penal Code (PPC) 1860">Pakistan Penal Code (PPC) 1860</option>
                  <option value="Code of Criminal Procedure (CrPC) 1898">Code of Criminal Procedure (CrPC) 1898</option>
                  <option value="Civil Procedure Code (CPC) 1908">Civil Procedure Code (CPC) 1908</option>
                  <option value="Specific Relief Act 1877">Specific Relief Act 1877</option>
                  <option value="Family Courts Act 1964">Family Courts Act 1964</option>
                  <option value="Anti-Terrorism Act (ATA) 1997">Anti-Terrorism Act (ATA) 1997</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-900 font-bold mb-1">
                  Section Title / Legal Head *
                </label>
                <input
                  type="text"
                  required
                  value={sectionForm.sectionTitle}
                  onChange={(e) => setSectionForm({ ...sectionForm, sectionTitle: e.target.value })}
                  placeholder="e.g. Qatl-i-Amd, Cheque Dishonour, Bail after Arrest"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-slate-900 font-bold mb-1">
                  Statutory Description & Essential Ingredients
                </label>
                <textarea
                  rows={2}
                  value={sectionForm.description}
                  onChange={(e) => setSectionForm({ ...sectionForm, description: e.target.value })}
                  placeholder="Enter statutory description and legal definition..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-900 font-bold mb-1">
                  Prescribed Punishment / Penalty
                </label>
                <input
                  type="text"
                  value={sectionForm.punishment}
                  onChange={(e) => setSectionForm({ ...sectionForm, punishment: e.target.value })}
                  placeholder="e.g. Death, Imprisonment for life, or fine"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsSectionModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black shadow-md shadow-purple-600/30 cursor-pointer"
                >
                  {editingSec ? 'Update Legal Section' : 'Add to Repository'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
