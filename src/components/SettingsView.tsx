import React, { useState, useEffect } from 'react';
import {
  Settings,
  Shield,
  User,
  Users,
  HardDrive,
  Cloud,
  Download,
  Upload,
  History,
  CheckCircle,
  Globe,
  Building,
  Key,
  Database,
  Lock,
  RefreshCw,
  Mail,
  Sparkles,
  UserPlus,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Phone,
  Briefcase,
  Scale,
  Eye,
  Trash,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole, UserProfile, AuthorizedAccount } from '../types';
import { signInWithGoogleDrive } from '../lib/googleDriveService';

export const SettingsView: React.FC = () => {
  const {
    currentUser,
    setCurrentUser,
    currentRole,
    setCurrentRole,
    currentFirm,
    updateFirm,
    firmMembers,
    languageMode,
    setLanguageMode,
    activities,
    clients,
    cases,
    firs,
    hearings,
    documents,
    payments,
    attachLawyerGmail,
    disconnectLawyerGmail,
    syncLawyerDriveBackup,
    setIsGmailBackupModalOpen,
    setIsTeamModalOpen,
    setShowOnboarding,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'profile' | 'team' | 'backup' | 'roles' | 'wizard' | 'audit'>('profile');
  const [profileSaved, setProfileSaved] = useState(false);
  const [isDriveConnecting, setIsDriveConnecting] = useState(false);
  const [driveActionNotice, setDriveActionNotice] = useState<string | null>(null);

  // Advocate form state - keeps fresh inputs without demo contamination for new lawyers
  const [advocateForm, setAdvocateForm] = useState({
    name: currentUser.name || '',
    firmName: currentFirm?.name || currentUser.firmName || '',
    city: currentFirm?.city || currentUser.city || '',
    email: currentUser.email || '',
    phone: currentUser.phone || currentFirm?.phone || '',
    chamberAddress: currentUser.chamberAddress || currentFirm?.officeAddress || '',
    courtEnrollment: currentUser.courtEnrollment || '',
    barLicenseNo: currentUser.barLicenseNo || '',
    dossierTitle:
      currentUser.dossierTitle ||
      currentFirm?.dossierTitle ||
      (currentUser.name ? `CHAMBERS OF ADVOCATE ${currentUser.name.toUpperCase()}` : 'OFFICIAL LAW CHAMBERS'),
    dossierSubtitle: currentUser.courtEnrollment || 'ADVOCATES HIGH COURT & SUPREME COURT OF PAKISTAN',
  });

  // Sync form whenever logged in lawyer changes, ensuring fresh zero demo entries for new accounts
  useEffect(() => {
    const isLegacyDemo =
      currentUser.email === 'admin@khanlawchambers.pk' && currentUser.firmId === 'firm_lahore_chambers';

    setAdvocateForm({
      name: currentUser.name || '',
      firmName:
        currentFirm?.name ||
        currentUser.firmName ||
        (isLegacyDemo ? 'Khan & Associates Law Chambers' : currentUser.name ? `Chamber of Adv. ${currentUser.name}` : ''),
      city: currentFirm?.city || currentUser.city || (isLegacyDemo ? 'Lahore' : ''),
      email: currentUser.email || '',
      phone: currentUser.phone || (isLegacyDemo ? '+92 300 8472910' : (currentFirm?.phone || '')),
      chamberAddress:
        currentUser.chamberAddress ||
        (isLegacyDemo ? 'Chamber Suite 402, High Court Bar Association Building, Lahore' : (currentFirm?.officeAddress || '')),
      courtEnrollment: currentUser.courtEnrollment || (isLegacyDemo ? 'Advocate High Court & Supreme Court' : ''),
      barLicenseNo: currentUser.barLicenseNo || (isLegacyDemo ? 'LH-HC-19482' : ''),
      dossierTitle:
        currentUser.dossierTitle ||
        currentFirm?.dossierTitle ||
        (currentUser.name ? `CHAMBER OF ADVOCATE ${currentUser.name.toUpperCase()}` : 'OFFICIAL LAW CHAMBER DOSSIER'),
      dossierSubtitle:
        currentUser.courtEnrollment || 'ADVOCATES HIGH COURT & SUPREME COURT OF PAKISTAN',
    });
  }, [currentUser, currentFirm]);

  // Clean / Fresh Blank Chamber reset
  const handleResetToBlank = () => {
    if (window.confirm('Kya aap is chamber configuration ke fields ko bilkul fresh aur blank karna chahte hain?')) {
      setAdvocateForm({
        name: currentUser.name || '',
        firmName: '',
        city: '',
        email: currentUser.email || '',
        phone: '',
        chamberAddress: '',
        courtEnrollment: '',
        barLicenseNo: '',
        dossierTitle: currentUser.name ? `CHAMBER OF ADVOCATE ${currentUser.name.toUpperCase()}` : '',
        dossierSubtitle: 'ADVOCATES HIGH COURT & SUPREME COURT OF PAKISTAN',
      });
    }
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUser: UserProfile = {
      ...currentUser,
      name: advocateForm.name.trim(),
      email: advocateForm.email.trim(),
      phone: advocateForm.phone.trim(),
      chamberAddress: advocateForm.chamberAddress.trim(),
      courtEnrollment: advocateForm.courtEnrollment.trim(),
      barLicenseNo: advocateForm.barLicenseNo.trim(),
      dossierTitle: advocateForm.dossierTitle.trim(),
    };
    setCurrentUser(updatedUser);

    if (updateFirm) {
      updateFirm({
        name: advocateForm.firmName.trim() || `${advocateForm.name} Law Chambers`,
        city: advocateForm.city.trim(),
        officeAddress: advocateForm.chamberAddress.trim(),
        phone: advocateForm.phone.trim(),
        email: advocateForm.email.trim(),
        dossierTitle: advocateForm.dossierTitle.trim(),
      });
    }

    // Persist in localStorage session and authorized accounts
    try {
      localStorage.setItem('CURRENT_LAWYER_USER', JSON.stringify(updatedUser));
      const savedAccountsRaw = localStorage.getItem('wakalat_authorized_accounts');
      if (savedAccountsRaw) {
        const accounts: AuthorizedAccount[] = JSON.parse(savedAccountsRaw);
        const updatedAccounts = accounts.map((a) =>
          a.email.toLowerCase() === currentUser.email.toLowerCase()
            ? {
                ...a,
                name: advocateForm.name.trim(),
                firmName: advocateForm.firmName.trim() || a.firmName,
                dossierTitle: advocateForm.dossierTitle.trim(),
              }
            : a
        );
        localStorage.setItem('wakalat_authorized_accounts', JSON.stringify(updatedAccounts));
      }
    } catch {}

    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3500);
  };

  // Export database backup JSON (Section 12: Cloud & Local Backup)
  const handleExportBackup = () => {
    const backupData = {
      exportedAt: new Date().toISOString(),
      firm: currentFirm,
      advocate: currentUser,
      dossierTitle: advocateForm.dossierTitle,
      clients,
      cases,
      firs,
      hearings,
      documents,
      payments,
      activities,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `wakalat_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="p-3 sm:p-5 md:p-8 max-w-7xl mx-auto space-y-4 sm:space-y-6 font-sans">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-slate-800" />
          <span>System Settings & Chamber Configuration</span>
        </h1>
        <p className="text-xs md:text-sm text-slate-600 font-medium mt-1">
          {languageMode === 'romanUrdu'
            ? 'Chamber profile, Alag Dossier Title, Team & Munshis, Gmail/Drive real-time connect, aur Roles'
            : 'Advocate credentials, custom dossier title, team roster, real-time Google Drive sync, and RBAC'}
        </p>
      </div>

      {/* Tabs Navigation (Organized into separate dedicated areas) */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2 text-xs font-bold no-scrollbar">
        {[
          { id: 'profile', label: 'Chamber Profile & Dossier Title', urdu: 'چیمبر پروفائل و ڈوسیئر', icon: Building },
          { id: 'team', label: 'Team & Munshis', urdu: 'ٹیم اور منشی', icon: Users },
          { id: 'backup', label: 'Gmail & Google Drive Sync', urdu: 'گوگل ڈرائیو سنک', icon: HardDrive },
          { id: 'roles', label: 'Roles & Access (RBAC)', urdu: 'اختیارات', icon: Shield },
          { id: 'wizard', label: 'Guided Setup Wizard', urdu: 'سیٹ اپ وزرڈ', icon: Sparkles },
          { id: 'audit', label: 'Audit Trail', urdu: 'آڈٹ لاگ', icon: History },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 px-3.5 border-b-2 font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'border-amber-600 text-slate-950 font-black'
                  : 'border-transparent text-slate-600 hover:text-black hover:border-slate-300'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-amber-600 stroke-[2.5]' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: Chamber Profile, Credentials & Custom Dossier Title */}
      {activeTab === 'profile' && (
        <div className="space-y-6 max-w-4xl">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
            <div className="mb-5 pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Building className="w-5 h-5 text-amber-600" />
                  <span>Advocate Chamber Profile & Bar Credentials</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Har lawyer ki apni maloomat jo letters, receipts aur legal records par print hoti hain
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetToBlank}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs flex items-center gap-1 transition-colors cursor-pointer border border-slate-300"
                  title="Wipe fields to blank/fresh state"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Start Fresh / Blank</span>
                </button>
                <span className="text-[11px] px-2.5 py-1 rounded-md bg-amber-50 text-amber-900 border border-amber-200 font-bold">
                  Section 21
                </span>
              </div>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-6 text-xs">
              {/* Core Lawyer Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-900 mb-1">Advocate Full Name</label>
                  <input
                    type="text"
                    required
                    value={advocateForm.name}
                    onChange={(e) => setAdvocateForm({ ...advocateForm, name: e.target.value })}
                    placeholder="e.g. Advocate Tariq Hussain"
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-900 mb-1">Chamber / Law Firm Name</label>
                  <input
                    type="text"
                    required
                    value={advocateForm.firmName}
                    onChange={(e) => setAdvocateForm({ ...advocateForm, firmName: e.target.value })}
                    placeholder="e.g. Al-Meezan Law Associates"
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-900 mb-1">Court Enrollment</label>
                  <input
                    type="text"
                    required
                    value={advocateForm.courtEnrollment}
                    onChange={(e) =>
                      setAdvocateForm({ ...advocateForm, courtEnrollment: e.target.value })
                    }
                    placeholder="e.g. Advocate High Court / Supreme Court"
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-900 mb-1">Bar License Number</label>
                  <input
                    type="text"
                    value={advocateForm.barLicenseNo}
                    onChange={(e) =>
                      setAdvocateForm({ ...advocateForm, barLicenseNo: e.target.value })
                    }
                    placeholder="e.g. LHC-2026-9812 / SBC-..."
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-mono font-bold focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-900 mb-1">Official Mobile / WhatsApp</label>
                  <input
                    type="text"
                    value={advocateForm.phone}
                    onChange={(e) => setAdvocateForm({ ...advocateForm, phone: e.target.value })}
                    placeholder="e.g. +92 300 1234567"
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-900 mb-1">City / Bar Association</label>
                  <input
                    type="text"
                    value={advocateForm.city}
                    onChange={(e) => setAdvocateForm({ ...advocateForm, city: e.target.value })}
                    placeholder="e.g. Lahore / Islamabad / Rawalpindi"
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-900 mb-1">Official Chamber Email Address</label>
                  <input
                    type="email"
                    required
                    value={advocateForm.email}
                    onChange={(e) => setAdvocateForm({ ...advocateForm, email: e.target.value })}
                    placeholder="e.g. advocate@lawpractice.pk"
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-900 mb-1">
                    Chamber Physical Address (Appears on legal briefs & fee receipts)
                  </label>
                  <textarea
                    rows={2}
                    value={advocateForm.chamberAddress}
                    onChange={(e) =>
                      setAdvocateForm({ ...advocateForm, chamberAddress: e.target.value })
                    }
                    placeholder="e.g. Chamber Suite 104, District & High Court Bar Association Building"
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* DEDICATED SECTION: Separate Dossier Title for Lawyer Profile */}
              <div className="p-5 bg-gradient-to-br from-amber-50/70 via-slate-50 to-amber-50/40 rounded-2xl border-2 border-amber-200/80 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                      <Scale className="w-5 h-5 text-amber-700" />
                      <span>Official Dossier Title & Header Customization (ڈوسیئر ٹائٹل اور چیمبر ہیڈنگ)</span>
                    </h3>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                      Har lawyer ka elehda dossier title: Aap apni marzi ka title aur court designation yahan edit kar sakte hain jo Case Dossier, Client Master Dossier aur PDF exports par sab se ooper print hoga.
                    </p>
                  </div>
                  <span className="text-[10px] uppercase font-mono font-extrabold bg-amber-200/80 text-amber-950 px-2 py-0.5 rounded shrink-0">
                    Dossier Heading
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block font-bold text-slate-900 mb-1">
                      Dossier Main Title / Chamber Letterhead (ڈوسیئر کا مرکزی ٹائٹل)
                    </label>
                    <input
                      type="text"
                      required
                      value={advocateForm.dossierTitle}
                      onChange={(e) =>
                        setAdvocateForm({ ...advocateForm, dossierTitle: e.target.value })
                      }
                      placeholder="e.g. MALIK & ASSOCIATES LAW CHAMBER / CHAMBERS OF ADVOCATE ..."
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-slate-950 font-bold font-serif uppercase tracking-wide text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    />
                  </div>

                  {/* 1-Click Quick Preset Buttons */}
                  <div>
                    <span className="text-[11px] font-bold text-slate-600 block mb-1.5">
                      Quick Preset Suggestions (1-Click Fill):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        `CHAMBER OF ADVOCATE ${(advocateForm.name || 'NAME').toUpperCase()} (HIGH COURT)`,
                        `${(advocateForm.firmName || advocateForm.name || 'CHAMBER').toUpperCase()} LAW ASSOCIATES`,
                        `BARRISTER ${(advocateForm.name || 'NAME').toUpperCase()} & PARTNERS`,
                        `OFFICE OF ADVOCATE ${(advocateForm.name || 'NAME').toUpperCase()} | LEGAL DOSSIER`,
                      ].map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setAdvocateForm({ ...advocateForm, dossierTitle: preset })}
                          className="px-2.5 py-1 bg-white hover:bg-amber-100 hover:text-amber-950 text-slate-700 border border-slate-300 rounded-lg text-[10px] font-bold transition-all cursor-pointer shadow-2xs"
                        >
                          + {preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-900 mb-1">
                      Dossier Sub-Heading / Court Designation (عدالتی عہدہ و سب ٹائٹل)
                    </label>
                    <input
                      type="text"
                      value={advocateForm.dossierSubtitle}
                      onChange={(e) =>
                        setAdvocateForm({ ...advocateForm, dossierSubtitle: e.target.value })
                      }
                      placeholder="e.g. ADVOCATES HIGH COURT & SUPREME COURT OF PAKISTAN"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 font-semibold tracking-wider uppercase text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    />
                  </div>

                  {/* Interactive Live Preview Box */}
                  <div className="mt-4 pt-4 border-t border-amber-200/60">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-amber-600" />
                        <span>Live Dossier Print Preview (ڈوسیئر لائیو پرنٹ پریویو)</span>
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold">
                        A4 Print Surface Preview
                      </span>
                    </div>

                    <div className="p-4 md:p-6 bg-white border-2 border-slate-900 rounded-xl text-center font-serif text-slate-900 shadow-sm">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <Scale className="w-5 h-5 text-slate-900" />
                        <h4 className="text-base md:text-lg font-bold tracking-tight uppercase font-serif text-slate-950">
                          {advocateForm.dossierTitle || 'CHAMBER OF ADVOCATE (TITLE)'}
                        </h4>
                      </div>
                      <p className="text-[10px] uppercase font-sans tracking-widest text-slate-700 font-semibold">
                        {advocateForm.dossierSubtitle || 'ADVOCATES HIGH COURT & SUPREME COURT OF PAKISTAN'}
                      </p>
                      <p className="text-[10px] font-sans text-slate-600 mt-1 truncate">
                        {[
                          advocateForm.chamberAddress || 'Chamber Address',
                          advocateForm.phone ? `Ph: ${advocateForm.phone}` : '',
                          advocateForm.email ? `Email: ${advocateForm.email}` : '',
                        ]
                          .filter(Boolean)
                          .join(' • ')}
                      </p>
                      <div className="mt-2.5 inline-block px-3 py-0.5 bg-slate-100 border border-slate-400 rounded-xs font-sans font-bold text-[9px] uppercase tracking-wider text-slate-900">
                        OFFICIAL CASE & CLIENT DOSSIER • COURT RECORD SUMMARY
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                {profileSaved ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1.5 text-xs">
                    <CheckCircle className="w-4 h-4" />
                    <span>Chamber Profile & Dossier Title saved successfully!</span>
                  </span>
                ) : (
                  <span />
                )}
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Chamber Profile & Dossier Title</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: Chamber Team & Munshis */}
      {activeTab === 'team' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs max-w-3xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-600" />
                <span>Chamber Team & Munshis (Staff Roster)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Managing Partners, Associate Advocates, aur Munshis ke accounts aur unki permissions
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsTeamModalOpen(true)}
              className="px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-cyan-400" />
              <span>+ Add / Manage Team</span>
            </button>
          </div>

          {/* Current Team Members Roster */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Active Chamber Members:</h3>
            <div className="grid gap-3">
              {/* Senior Managing Partner */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-sm shadow-xs">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                      <span>{currentUser.name}</span>
                      <span className="text-[10px] px-2 py-0.2 rounded-full font-bold bg-amber-100 text-amber-900 border border-amber-300">
                        Managing Partner
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {currentUser.email} • {currentUser.phone}
                    </div>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Full Access
                </span>
              </div>

              {/* Dynamic Firm Members */}
              {firmMembers && firmMembers.length > 0 ? (
                firmMembers.map((member) => (
                  <div
                    key={member.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50/80 flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-800 font-bold flex items-center justify-center text-sm border border-slate-300">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                          <span>{member.name}</span>
                          <span
                            className={`text-[10px] px-2 py-0.2 rounded-full font-bold border ${
                              member.role === 'lawyer'
                                ? 'bg-blue-50 text-blue-800 border-blue-200'
                                : member.role === 'assistant'
                                ? 'bg-cyan-50 text-cyan-800 border-cyan-200'
                                : 'bg-slate-100 text-slate-800 border-slate-300'
                            }`}
                          >
                            {member.role === 'assistant' ? 'Munshi (Clerk)' : member.role.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {member.email} • {member.phone}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsTeamModalOpen(true)}
                      className="text-xs text-amber-700 hover:text-amber-900 font-bold cursor-pointer"
                    >
                      Edit →
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-xl border border-dashed border-slate-300 text-center text-slate-500 text-xs">
                  Abhi tak koi additional associate ya munshi add nahi kiya gaya. Upar diye gaye &ldquo;+ Add / Manage Team&rdquo; button par click karke naya member add karein.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Backup & Cloud Sync */}
      {activeTab === 'backup' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6 max-w-3xl">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-emerald-600" />
              <span>Database Backup & Cloud Storage (Sections 11 & 12)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Secure real-time persistence with one-click JSON database dump and Google Drive export
            </p>
          </div>

          {/* Lawyer Personal Gmail & Cloud Sync Feature */}
          <div className="p-5 rounded-2xl border-2 border-indigo-200 bg-indigo-50/40 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs font-bold">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-sm">Lawyer Personal Gmail & Google Drive Cloud Storage</h3>
                    {currentUser.connectedGmail ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-bold border border-emerald-300">
                        Drive Sync Active
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold border border-amber-300">
                        Not Attached
                      </span>
                    )}
                  </div>
                  <p className="text-slate-700 text-xs mt-0.5">
                    Har lawyer apni personal Gmail attach kar sakta hai taake cases, FIRs, court notices, files aur database backup Google Drive mein real-time save ho sake.
                  </p>
                  {currentUser.connectedGmail && (
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] font-mono">
                      <span className="text-indigo-900 font-bold bg-white px-2.5 py-1 rounded-md border border-indigo-200">
                        {currentUser.connectedGmail}
                      </span>
                      <span className="text-slate-500">
                        Last synced: <strong>{currentUser.lastBackupDate || 'Just now'}</strong>
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsGmailBackupModalOpen(true)}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Cloud className="w-4 h-4" />
                  <span>{currentUser.connectedGmail ? 'Manage Drive & Sync' : 'Connect Gmail & Drive'}</span>
                </button>
              </div>
            </div>

            {/* Direct Google Drive Folder Link if uploaded */}
            {currentUser.lastBackupDriveLink && (
              <div className="p-3 bg-white rounded-xl border border-indigo-300 flex items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-2 text-xs text-indigo-950 font-bold truncate">
                  <HardDrive className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="truncate">Saved Folder: Wakalat Pro - {currentUser.dossierTitle || currentFirm.name}</span>
                </div>
                <a
                  href={currentUser.lastBackupDriveLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold flex items-center gap-1 shrink-0 transition-colors"
                >
                  <span>Open in Google Drive</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40">
              <div className="flex items-center gap-2 text-emerald-950 font-bold">
                <Database className="w-4 h-4 text-emerald-700" />
                <span>Primary Cloud: Firebase Firestore</span>
              </div>
              <p className="text-slate-700 mt-1">
                Client records, case timelines, and encrypted metadata are persisted locally and cloud-ready.
              </p>
              <div className="mt-3 text-[11px] font-mono text-emerald-900 font-bold">
                Status: Operational & Synced
              </div>
            </div>

            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40">
              <div className="flex items-center gap-2 text-blue-950 font-bold">
                <Cloud className="w-4 h-4 text-blue-700" />
                <span>Backup: Google Drive Integration</span>
              </div>
              <p className="text-slate-700 mt-1">
                Export case files and legal attachments for remote Google Drive folder preservation.
              </p>
              <div className="mt-3 text-[11px] font-mono text-blue-900 font-bold">
                Status: Export Ready
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="font-bold text-slate-900 text-xs">Download Full Chamber Database Backup</div>
              <div className="text-slate-600 text-[11px]">
                Includes {clients.length} Clients, {cases.length} Cases, {firs.length} FIRs, {hearings.length} Hearings, {documents.length} Files, and Ledger.
              </div>
            </div>
            <button
              onClick={handleExportBackup}
              className="px-4 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shrink-0 cursor-pointer shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Export JSON Backup</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: Roles & Access Control (RBAC) */}
      {activeTab === 'roles' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6 max-w-3xl">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-600" />
              <span>Role-Based Access Control (RBAC - Section 2)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              System Admin, Senior Advocate, aur Chamber Assistant / Clerk ke darmiyan permissions
            </p>
          </div>

          <div className="grid gap-4 text-xs">
            {[
              {
                role: 'admin' as UserRole,
                title: 'Admin (System Administrator / Managing Partner)',
                badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
                desc: 'Complete control: Add/Delete Users, Manage all Cases, FIRs, Ledger & Audit Logs',
                permissions: ['Full Access', 'Delete Records', 'Backup Export', 'User Management', 'Financial Oversight'],
              },
              {
                role: 'lawyer' as UserRole,
                title: 'Lawyer (Senior Advocate / Associate)',
                badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
                desc: 'Manage Cases, Add Clients, Schedule Court Hearings, Share Notices, Upload Petitions',
                permissions: ['Create/Edit Cases', 'Schedule Hearings', 'Client Dossiers', 'WhatsApp Share', 'Fee Tracking'],
              },
              {
                role: 'clerk' as UserRole,
                title: 'Assistant / Chamber Clerk (Munshi)',
                badgeColor: 'bg-slate-100 text-slate-900 border-slate-300',
                desc: 'View Daily Cause List, update hearing next dates, view documents, generate receipts. Financial records remain private.',
                permissions: ['View Cause List', 'Log Attended Dates', 'Generate Receipts', 'Read Only Files', 'Financials Locked'],
              },
            ].map((r) => (
              <div
                key={r.role}
                onClick={() => setCurrentRole(r.role)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  currentRole === r.role
                    ? 'border-purple-600 ring-2 ring-purple-100 bg-purple-50/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{r.title}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${r.badgeColor}`}>
                      {r.role.toUpperCase()}
                    </span>
                  </div>
                  {currentRole === r.role && (
                    <span className="text-[11px] font-bold text-purple-700 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Active Role
                    </span>
                  )}
                </div>

                <p className="text-slate-600 mt-1">{r.desc}</p>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {r.permissions.map((perm) => (
                    <span
                      key={perm}
                      className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200 text-[10px] font-semibold"
                    >
                      ✓ {perm}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: Guided Setup Wizard (Separated inside Settings) */}
      {activeTab === 'wizard' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs max-w-3xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-600" />
                <span>Interactive Guided Chamber Setup Wizard</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Naye chamber ke liye 4-step guided interactive walk-through
              </p>
            </div>
            <span className="text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-md">
              Onboarding
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Launch Setup Walkthrough Anytime</h3>
              <p className="text-xs text-slate-700 mt-1 max-w-lg leading-relaxed">
                Agar aap apne chamber ki bunyadi settings, practice areas, bar license aur team structure ko dobara step-by-step verify ya update karna chahein to yeh wizard use karein.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowOnboarding(true)}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 shrink-0 transition-all shadow-xs cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Start Setup Wizard</span>
            </button>
          </div>

          {/* 4 Steps Breakdown */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Wizard Ke 4 Aham Steps:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">1</span>
                  <span>Chamber Identity & Bar Details</span>
                </div>
                <p className="text-slate-600 text-[11px] mt-1">
                  Advocate name, bar license number, court enrollment (High Court / Supreme Court), aur official phone.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">2</span>
                  <span>Practice Areas & Jurisdictions</span>
                </div>
                <p className="text-slate-600 text-[11px] mt-1">
                  Criminal Law, Civil Suits, High Court Writs, Family / Custody, Banking, FBR Taxation aur ATC Defense.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">3</span>
                  <span>Team & Munshi Permissions</span>
                </div>
                <p className="text-slate-600 text-[11px] mt-1">
                  Associate advocates ko cases assign karein aur clerks/munshis ko daily cause list ki access dein.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">4</span>
                  <span>Review & Chamber Activation</span>
                </div>
                <p className="text-slate-600 text-[11px] mt-1">
                  Chamber profile finalize karein aur seedha dashboard par first client aur case register karein.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: Activity Logs / Audit Trail */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4 max-w-4xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <History className="w-5 h-5 text-amber-600" />
                <span>Audit Trail & Activity Logs (Section 14)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Har action ka digital record: who added client, scheduled hearing, or recorded payment
              </p>
            </div>
            <span className="text-xs font-mono font-bold bg-slate-100 text-slate-800 px-2 py-1 rounded border border-slate-300">
              {activities.length} Events Logged
            </span>
          </div>

          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {activities.map((log) => (
              <div key={log.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{log.userName}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 font-bold uppercase border border-amber-300">
                      {log.action}
                    </span>
                    <span className="text-slate-500 text-[11px] font-mono">
                      {log.category} #{log.id.slice(0, 6)}
                    </span>
                  </div>
                  <p className="text-slate-700 font-medium mt-0.5">{log.details}</p>
                </div>
                <span className="text-[11px] text-slate-500 shrink-0 font-mono">{log.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
