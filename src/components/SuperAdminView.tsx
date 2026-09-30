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
  LogIn,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Firm, PakistanLegalSection, SubscriptionStatus, SubscriptionPlan, LegalLawCategory, AuthorizedAccount, UserRole } from '../types';

export const SuperAdminView: React.FC = () => {
  const {
    firms,
    updateFirmStatus,
    legalSections,
    addLegalSection,
    editLegalSection,
    deleteLegalSection,
    switchTenant,
    currentFirm,
    languageMode,
    authorizedAccounts,
    addAuthorizedAccount,
    updateAuthorizedAccount,
    deleteAuthorizedAccount,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'accounts' | 'firms' | 'sections' | 'plans'>('accounts');

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

  // Calculate SaaS platform metrics
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
    };

    if (editingAccount) {
      updateAuthorizedAccount(editingAccount.id, newAcc);
    } else {
      addAuthorizedAccount(newAcc);
    }

    setIsAddAccountModalOpen(false);
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
    <div className="p-3 sm:p-5 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Super Admin Top Header */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 p-6 rounded-3xl border border-purple-800/40 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300 shadow-inner">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded-full bg-purple-400/20 text-purple-300 border border-purple-400/30">
                  Software Owner Console
                </span>
                <span className="text-[10px] text-slate-400">Wakalat Commercial Multi-Tenant</span>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-white mt-0.5">
                Master Administration & Customer Portal
              </h1>
              <p className="text-xs text-slate-300 mt-0.5 max-w-2xl">
                Commercial control panel to manage customer law firms, subscription tiers, trial periods, and central statutory Pakistan legal sections database.
              </p>
            </div>
          </div>

          {/* Privacy compliance badge */}
          <div className="px-3.5 py-2 rounded-xl bg-purple-900/40 border border-purple-500/30 text-[11px] text-purple-200 flex items-center gap-2">
            <Lock className="w-4 h-4 text-purple-300 shrink-0" />
            <span>Strict Client-Attorney Isolation Active</span>
          </div>
        </div>

        {/* Global SaaS Platform Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-purple-800/40">
          <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-purple-900/50">
            <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
              Total Customer Firms
            </div>
            <div className="text-2xl font-black text-white mt-1 flex items-baseline gap-1.5">
              {totalFirms}
              <span className="text-xs text-purple-300 font-normal">Registered</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-purple-900/50">
            <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
              Active Subscriptions
            </div>
            <div className="text-2xl font-black text-emerald-400 mt-1 flex items-baseline gap-1.5">
              {activeFirms}
              <span className="text-xs text-slate-400 font-normal">Paying Firms</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-purple-900/50">
            <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
              Free Trial Accounts
            </div>
            <div className="text-2xl font-black text-amber-400 mt-1 flex items-baseline gap-1.5">
              {trialFirms}
              <span className="text-xs text-slate-400 font-normal">Active Trials</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-purple-900/50">
            <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
              Estimated Monthly MRR
            </div>
            <div className="text-2xl font-black text-cyan-300 mt-1 flex items-baseline gap-1.5">
              Rs. {estimatedMRR.toLocaleString()}
              <span className="text-xs text-slate-400 font-normal">/mo</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 text-xs font-semibold overflow-x-auto pb-1">
        {[
          { id: 'accounts', label: `Authorized Logins & Passwords (${authorizedAccounts.length})`, icon: KeyRound },
          { id: 'firms', label: `Customer Law Firms (${firms.length})`, icon: Building2 },
          { id: 'sections', label: `Pakistan Legal Sections (${legalSections.length})`, icon: BookOpen },
          { id: 'plans', label: 'Commercial Subscription Plans', icon: CreditCard },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 px-3.5 border-b-2 font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-400 bg-purple-950/50 rounded-t-lg'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 0: Authorized Customer Logins (Gmail & Password Access Control) */}
      {activeTab === 'accounts' && (
        <div className="space-y-4">
          {/* Super Admin Access Control Banner */}
          <div className="p-4 bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 rounded-2xl border border-purple-800/60 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300 shrink-0">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-purple-200">
                  Master Customer Access Control (Gmail & Password Authorization)
                </h3>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed max-w-2xl">
                  Sirf wohi lawyer ya law firm login kar sakti hai jinki Gmail aur Password aap yahan add karenge. Har customer ka dashboard aur database 100% elehda hoga.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleOpenAddAccount()}
              className="px-4 py-2 bg-purple-500 hover:bg-purple-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 transition-all shadow-lg shadow-purple-900/50 shrink-0 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Authorize New Lawyer (Add Gmail & Password)</span>
            </button>
          </div>

          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={accountSearch}
                onChange={(e) => setAccountSearch(e.target.value)}
                placeholder="Search lawyer name, email/Gmail, firm..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={accountStatusFilter}
                onChange={(e) => setAccountStatusFilter(e.target.value as any)}
                className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Accounts ({authorizedAccounts.length})</option>
                <option value="active">Active Only ({authorizedAccounts.filter((a) => a.status === 'active').length})</option>
                <option value="suspended">Suspended ({authorizedAccounts.filter((a) => a.status === 'suspended').length})</option>
              </select>
            </div>
          </div>

          {/* Accounts Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
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
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredAccounts.map((acc) => (
                    <tr key={acc.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm">{acc.name}</div>
                        <div className="text-[11px] text-purple-700 font-semibold mt-0.5">
                          {acc.firmName}
                        </div>
                        <div className="text-[10px] text-slate-400 uppercase font-mono mt-0.5">
                          Role: {acc.role.replace('_', ' ')} • Plan: {acc.plan}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-900 font-bold">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>{acc.email}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        <div className="flex items-center gap-2">
                          <span className="bg-slate-100 px-2 py-1 rounded text-slate-800 font-bold text-xs">
                            {showPasswordMap[acc.id] ? acc.password : '••••••••'}
                          </span>
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility(acc.id)}
                            className="text-slate-400 hover:text-slate-600 p-1 rounded"
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

                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                        <span className="bg-purple-50 text-purple-800 px-2 py-0.5 rounded border border-purple-200 font-semibold">
                          {acc.firmId}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {acc.connectedGmail ? (
                          <div>
                            <span className="text-emerald-700 font-semibold flex items-center gap-1 text-[11px]">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                              {acc.connectedGmail}
                            </span>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              Synced: {acc.lastBackupDate || 'Active'}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">Not attached yet</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {acc.status === 'active' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase">
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            Active (Access Granted)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 font-bold text-[10px] uppercase">
                            <Ban className="w-3 h-3 text-rose-600" />
                            Suspended (Blocked)
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Toggle Active / Suspended */}
                          <button
                            type="button"
                            onClick={() =>
                              updateAuthorizedAccount(acc.id, {
                                status: acc.status === 'active' ? 'suspended' : 'active',
                              })
                            }
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors border cursor-pointer ${
                              acc.status === 'active'
                                ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            }`}
                            title={acc.status === 'active' ? 'Suspend Account' : 'Activate Account'}
                          >
                            {acc.status === 'active' ? 'Suspend' : 'Activate'}
                          </button>

                          {/* Instant Workspace Login / Inspect */}
                          <button
                            type="button"
                            onClick={() => switchTenant(acc.firmId)}
                            className="px-2.5 py-1 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold text-[11px] transition-colors border border-purple-300 flex items-center gap-1 cursor-pointer"
                            title="Inspect isolated dashboard for this customer"
                          >
                            <span>Inspect Firm</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>

                          {/* Edit Account */}
                          <button
                            type="button"
                            onClick={() => handleOpenAddAccount(acc)}
                            className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Edit Account Details & Password"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Revoke Account */}
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Revoke access for ${acc.name} (${acc.email})?`)) {
                                deleteAuthorizedAccount(acc.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete / Revoke Access"
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

      {/* TAB 1: Customer Law Firms Directory */}
      {activeTab === 'firms' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={firmSearch}
                onChange={(e) => setFirmSearch(e.target.value)}
                placeholder="Search firm name, city, email..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Statuses ({firms.length})</option>
                <option value="active">Active ({activeFirms})</option>
                <option value="trial">Trial ({trialFirms})</option>
                <option value="expired">Expired ({expiredFirms})</option>
              </select>
            </div>
          </div>

          {/* Firms Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Law Firm / Chamber</th>
                    <th className="py-3.5 px-4">City / Province</th>
                    <th className="py-3.5 px-4">Commercial Plan</th>
                    <th className="py-3.5 px-4">Subscription Status</th>
                    <th className="py-3.5 px-4">Trial / Expiry Date</th>
                    <th className="py-3.5 px-4 text-right">Owner Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredFirms.map((firm) => (
                    <tr key={firm.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm">{firm.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2 mt-0.5">
                          <span>ID: {firm.id}</span>
                          <span>•</span>
                          <span>{firm.email}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{firm.city}</div>
                        <div className="text-[11px] text-slate-500">{firm.province}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border ${
                          firm.plan === 'enterprise'
                            ? 'bg-purple-50 text-purple-800 border-purple-200'
                            : firm.plan === 'professional'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          {firm.plan}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          {firm.subscriptionStatus === 'active' && (
                            <span className="flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                              Active
                            </span>
                          )}
                          {firm.subscriptionStatus === 'trial' && (
                            <span className="flex items-center gap-1 text-amber-700 font-bold text-[11px]">
                              <Clock className="w-3.5 h-3.5 text-amber-500" />
                              Free Trial
                            </span>
                          )}
                          {firm.subscriptionStatus === 'expired' && (
                            <span className="flex items-center gap-1 text-rose-700 font-bold text-[11px]">
                              <Ban className="w-3.5 h-3.5 text-rose-500" />
                              Expired
                            </span>
                          )}
                          {firm.subscriptionStatus === 'suspended' && (
                            <span className="flex items-center gap-1 text-slate-600 font-bold text-[11px]">
                              <AlertTriangle className="w-3.5 h-3.5 text-slate-500" />
                              Suspended
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                        {firm.trialEndsAt || 'No expiration'}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Toggle Status */}
                          <select
                            value={firm.subscriptionStatus}
                            onChange={(e) => updateFirmStatus(firm.id, e.target.value as SubscriptionStatus)}
                            className="text-[11px] font-semibold py-1 px-2 rounded-lg bg-slate-100 border border-slate-300 text-slate-800 focus:outline-none"
                          >
                            <option value="active">Set Active</option>
                            <option value="trial">Set Trial</option>
                            <option value="expired">Set Expired</option>
                            <option value="suspended">Set Suspended</option>
                          </select>

                          {/* Instant Tenant Switch for Live Testing */}
                          <button
                            type="button"
                            onClick={() => switchTenant(firm.id)}
                            className="px-2.5 py-1 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold text-[11px] transition-colors border border-purple-300 flex items-center gap-1"
                            title="Switch workspace to test customer experience"
                          >
                            <span>Inspect Firm</span>
                            <ChevronRight className="w-3 h-3" />
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

      {/* TAB 2: Pakistan Legal Sections / Dafaat Central Manager */}
      {activeTab === 'sections' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={sectionSearch}
                onChange={(e) => setSectionSearch(e.target.value)}
                placeholder="Search section (e.g. 302, 324, 489-F, Bail)..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Law Acts ({legalSections.length})</option>
                <option value="Pakistan Penal Code (PPC)">Pakistan Penal Code (PPC)</option>
                <option value="Code of Criminal Procedure (CrPC)">Code of Criminal Procedure (CrPC)</option>
                <option value="Code of Civil Procedure (CPC)">Code of Civil Procedure (CPC)</option>
                <option value="Qanun-e-Shahadat Order">Qanun-e-Shahadat Order</option>
                <option value="Anti-Terrorism laws">Anti-Terrorism laws</option>
                <option value="Narcotics laws">Narcotics laws (CNSA)</option>
                <option value="Cybercrime laws">Cybercrime laws (PECA)</option>
                <option value="Family laws">Family laws</option>
                <option value="Constitutional provisions">Constitutional provisions</option>
              </select>

              <button
                type="button"
                onClick={() => handleOpenSectionModal()}
                className="py-2 px-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Add Legal Section</span>
              </button>
            </div>
          </div>

          {/* Legal Sections Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredSections.map((sec) => (
              <div
                key={sec.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between hover:border-purple-300 transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-purple-50 border border-purple-200 text-purple-800 text-[10px] font-extrabold uppercase font-mono">
                      Sec. {sec.sectionNumber}
                    </span>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        sec.status === 'Non-Bailable'
                          ? 'bg-rose-100 text-rose-800'
                          : sec.status === 'Bailable'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {sec.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-xs mt-2 line-clamp-1">
                    {sec.sectionTitle}
                  </h3>
                  <div className="text-[10px] text-slate-400 font-medium">{sec.lawAct}</div>

                  <p className="text-[11px] text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                    {sec.description}
                  </p>

                  {sec.punishment && (
                    <div className="mt-2 text-[10px] bg-slate-50 p-2 rounded-lg text-slate-700">
                      <strong className="text-slate-900">Punishment:</strong> {sec.punishment}
                    </div>
                  )}
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-400">Updated: {sec.updatedAt || 'Official'}</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenSectionModal(sec)}
                      className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      title="Edit Section"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Delete section ${sec.sectionNumber}?`)) {
                          deleteLegalSection(sec.id);
                        }
                      }}
                      className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Section"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Commercial Plans & Pricing */}
      {activeTab === 'plans' && (
        <div className="space-y-4">
          <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 text-xs text-purple-900">
            <strong>Commercial SaaS Deployment Pricing:</strong> These plans define the feature limits and lawyer seat capacities provisioned to customer law firms.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-base text-slate-900">Starter Advocate</h3>
                <span className="text-xs font-bold text-slate-500 uppercase">Solo</span>
              </div>
              <div className="text-3xl font-black text-slate-900">
                Rs. 4,500 <span className="text-xs text-slate-500 font-normal">/ month</span>
              </div>
              <p className="text-xs text-slate-600">
                Designed for independent practitioners and young advocates building their initial practice.
              </p>
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-center gap-2">✓ 1 Lawyer Account</li>
                <li className="flex items-center gap-2">✓ Up to 150 Active Cases</li>
                <li className="flex items-center gap-2">✓ FIR & Bail Petitions Tracker</li>
                <li className="flex items-center gap-2">✓ Cause List & Daily Calendar</li>
                <li className="flex items-center gap-2">✓ Complete Case Dossier PDF</li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl border-2 border-purple-500 p-6 shadow-md space-y-4 relative">
              <div className="absolute -top-3 right-4 px-3 py-0.5 bg-purple-600 text-white text-[10px] font-black rounded-full uppercase">
                Most Popular
              </div>
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-base text-purple-950">Chamber Professional</h3>
                <span className="text-xs font-bold text-purple-700 uppercase">Multi-Lawyer</span>
              </div>
              <div className="text-3xl font-black text-purple-950">
                Rs. 9,500 <span className="text-xs text-slate-500 font-normal">/ month</span>
              </div>
              <p className="text-xs text-slate-600">
                For established chambers with junior advocates, associates, and court munshis.
              </p>
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-center gap-2">✓ Up to 5 Associate Advocates</li>
                <li className="flex items-center gap-2">✓ Unlimited Clients & Cases</li>
                <li className="flex items-center gap-2">✓ Clerk / Munshi Restricted Access</li>
                <li className="flex items-center gap-2">✓ WhatsApp & Email Instant Sharing</li>
                <li className="flex items-center gap-2">✓ Real-time Multi-device Live Sync</li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-base text-slate-900">Enterprise Law Firm</h3>
                <span className="text-xs font-bold text-slate-500 uppercase">Unlimited</span>
              </div>
              <div className="text-3xl font-black text-slate-900">
                Rs. 19,500 <span className="text-xs text-slate-500 font-normal">/ month</span>
              </div>
              <p className="text-xs text-slate-600">
                Corporate law firms with multiple branches across High Courts and Supreme Court.
              </p>
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-center gap-2">✓ Unlimited Lawyers & Paralegals</li>
                <li className="flex items-center gap-2">✓ Multi-Branch Chamber Management</li>
                <li className="flex items-center gap-2">✓ Custom Letterhead & Firm Watermark</li>
                <li className="flex items-center gap-2">✓ Dedicated Database Encryption</li>
                <li className="flex items-center gap-2">✓ Priority SLA 24/7 Telephone Support</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add/Edit Pakistan Legal Section */}
      {isSectionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3">
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
                className="text-slate-300 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSection} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Section Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={sectionForm.sectionNumber}
                    onChange={(e) => setSectionForm({ ...sectionForm, sectionNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                    placeholder="e.g. 302, 324, 489-F"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Bail / Nature Status *
                  </label>
                  <select
                    value={sectionForm.status}
                    onChange={(e) => setSectionForm({ ...sectionForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold"
                  >
                    <option value="Non-Bailable">Non-Bailable</option>
                    <option value="Bailable">Bailable</option>
                    <option value="Compoundable">Compoundable</option>
                    <option value="Non-Compoundable">Non-Compoundable</option>
                    <option value="Civil">Civil / Interlocutory</option>
                    <option value="Active">Active Provision</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Section Title / Offense Name *
                </label>
                <input
                  type="text"
                  required
                  value={sectionForm.sectionTitle}
                  onChange={(e) => setSectionForm({ ...sectionForm, sectionTitle: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                  placeholder="e.g. Punishment of Qatl-i-amd / Dishonestly issuing cheque"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Statutory Law / Act *
                  </label>
                  <input
                    type="text"
                    required
                    value={sectionForm.lawAct}
                    onChange={(e) => setSectionForm({ ...sectionForm, lawAct: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g. Pakistan Penal Code 1860"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Law Category *
                  </label>
                  <select
                    value={sectionForm.category}
                    onChange={(e) => setSectionForm({ ...sectionForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="Pakistan Penal Code (PPC)">Pakistan Penal Code (PPC)</option>
                    <option value="Code of Criminal Procedure (CrPC)">Code of Criminal Procedure (CrPC)</option>
                    <option value="Code of Civil Procedure (CPC)">Code of Civil Procedure (CPC)</option>
                    <option value="Qanun-e-Shahadat Order">Qanun-e-Shahadat Order</option>
                    <option value="Anti-Terrorism laws">Anti-Terrorism laws</option>
                    <option value="Narcotics laws">Narcotics laws (CNSA)</option>
                    <option value="Cybercrime laws">Cybercrime laws (PECA)</option>
                    <option value="Family laws">Family laws</option>
                    <option value="Constitutional provisions">Constitutional provisions</option>
                    <option value="Other applicable Pakistani laws">Other applicable Pakistani laws</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Legal Description & Essential Ingredients
                </label>
                <textarea
                  rows={3}
                  value={sectionForm.description}
                  onChange={(e) => setSectionForm({ ...sectionForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Statutory definition and ingredients to prove..."
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Prescribed Punishment / Penalty
                </label>
                <input
                  type="text"
                  value={sectionForm.punishment || ''}
                  onChange={(e) => setSectionForm({ ...sectionForm, punishment: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g. Death, Life Imprisonment, Fine..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsSectionModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-sm"
                >
                  {editingSec ? 'Update Section' : 'Save Legal Section'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Authorize New Lawyer Account (Gmail & Password Access Management) */}
      {isAddAccountModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-purple-900 to-indigo-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-purple-300">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">
                    {editingAccount ? 'Edit Authorized Customer Login' : 'Authorize New Lawyer / Law Firm'}
                  </h3>
                  <p className="text-xs text-purple-200">
                    Jis Gmail aur Password ko aap add karenge, sirf wahi login kar sakega
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddAccountModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveAccount} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-purple-900 text-[11px] leading-relaxed">
                <strong>Super Admin Notice:</strong> New lawyers will receive a dedicated, isolated workspace with their own database. They will not see any other lawyer's data.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Lawyer / Advocate Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={accountForm.name}
                    onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                    placeholder="e.g. Advocate Imran Cheema"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Chamber / Law Firm Name
                  </label>
                  <input
                    type="text"
                    value={accountForm.firmName}
                    onChange={(e) => setAccountForm({ ...accountForm, firmName: e.target.value })}
                    placeholder="e.g. Cheema & Associates"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Authorized Gmail / Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={accountForm.email}
                    onChange={(e) => setAccountForm({ ...accountForm, email: e.target.value })}
                    placeholder="advocate@gmail.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
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
                  <label className="block text-slate-700 font-semibold mb-1">
                    City / Bar Council Location
                  </label>
                  <input
                    type="text"
                    value={accountForm.city}
                    onChange={(e) => setAccountForm({ ...accountForm, city: e.target.value })}
                    placeholder="e.g. Lahore / Islamabad / Karachi"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Commercial Plan
                  </label>
                  <select
                    value={accountForm.plan}
                    onChange={(e) => setAccountForm({ ...accountForm, plan: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold"
                  >
                    <option value="starter">Starter (Rs. 4,500/mo - Solo Lawyer)</option>
                    <option value="professional">Professional (Rs. 9,500/mo - Up to 10 Lawyers)</option>
                    <option value="enterprise">Enterprise (Rs. 19,500/mo - Unlimited Firm)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Role in Firm
                  </label>
                  <select
                    value={accountForm.role}
                    onChange={(e) => setAccountForm({ ...accountForm, role: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold"
                  >
                    <option value="firm_admin">Firm Admin (Chamber Head)</option>
                    <option value="lawyer">Senior Lawyer / Associate</option>
                    <option value="assistant">Assistant / Munshi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Account Access Status
                  </label>
                  <select
                    value={accountForm.status}
                    onChange={(e) => setAccountForm({ ...accountForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold"
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
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black shadow-lg shadow-purple-600/30 cursor-pointer"
                >
                  {editingAccount ? 'Update Account Access' : 'Authorize & Grant Access'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
