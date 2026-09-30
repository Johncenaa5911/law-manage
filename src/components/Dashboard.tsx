import React from 'react';
import {
  Users,
  Briefcase,
  CalendarClock,
  Clock,
  FolderLock,
  CreditCard,
  Search,
  Plus,
  ArrowUpRight,
  AlertCircle,
  CheckCircle,
  FileBadge,
  Share2,
  Calendar,
  Building2,
  ChevronRight,
  TrendingUp,
  BadgeCheck,
  Printer,
  Sparkles,
  Shield,
  HardDrive,
  FileText,
  CheckCircle2,
  Mail,
  Zap,
  Cloud,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Hearing } from '../types';
import { ShareData } from './ShareModal';

interface DashboardProps {
  onOpenClientModal: () => void;
  onOpenCaseModal: () => void;
  onOpenHearingModal: (hearing?: Hearing) => void;
  onOpenDocModal: () => void;
  onOpenShareModal: (data: ShareData) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onOpenClientModal,
  onOpenCaseModal,
  onOpenHearingModal,
  onOpenDocModal,
  onOpenShareModal,
}) => {
  const {
    clients,
    cases,
    firs,
    hearings,
    documents,
    payments,
    services,
    activities,
    todayHearings,
    upcomingHearings,
    totalActiveCases,
    totalPendingFees,
    totalPaidFees,
    activeServicesCount,
    completedServicesCount,
    setIsSearchModalOpen,
    setActiveView,
    setSelectedCaseId,
    setSelectedClientId,
    languageMode,
    currentUser,
    currentRole,
    setCurrentRole,
    updateHearing,
    setIsGmailBackupModalOpen,
  } = useApp();

  const isRoman = languageMode === 'romanUrdu';
  const pendingCases = cases.filter((c) => c.status === 'Pending').length;
  const closedCases = cases.filter((c) => c.status === 'Closed' || c.status === 'Won').length;

  const statCards = [
    {
      title: 'Total Clients',
      urdu: 'کل موکلین',
      roman: 'Registered Clients',
      value: clients.length,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-100',
      view: 'clients',
    },
    {
      title: 'Active Cases',
      urdu: 'زیرِ سماعت مقدمات',
      roman: 'Under Proceedings',
      value: totalActiveCases,
      icon: Briefcase,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-100',
      view: 'cases',
    },
    {
      title: 'Legal Services (FBR/Police)',
      urdu: 'خدماتِ وکالت (فائلر/کریکٹر)',
      roman: 'Active Administrative Services',
      value: activeServicesCount,
      subValue: `${services.length} Total Booked`,
      icon: BadgeCheck,
      color: 'text-teal-600',
      bg: 'bg-teal-50',
      border: 'border-teal-200',
      view: 'services',
      highlight: true,
    },
    {
      title: "Today's Hearings",
      urdu: 'آج کی پیشیاں',
      roman: 'Today Court Peshi',
      value: todayHearings.length,
      icon: CalendarClock,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      border: 'border-rose-100',
      highlight: todayHearings.length > 0,
      view: 'hearings',
    },
    {
      title: 'FIR Police Records',
      urdu: 'ایف آئی آر ریکارڈز',
      roman: 'Tracked Police Files',
      value: firs.length,
      icon: FileBadge,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      border: 'border-indigo-100',
      view: 'firs',
    },
    {
      title: 'Upcoming Hearings',
      urdu: 'آئندہ پیشیاں',
      roman: 'Scheduled Dates',
      value: upcomingHearings.length,
      icon: Calendar,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      border: 'border-purple-100',
      view: 'hearings',
    },
    {
      title: 'Total Documents',
      urdu: 'قانونی فائلیں',
      roman: 'FIR, Bail, Orders',
      value: documents.length,
      icon: FolderLock,
      color: 'text-cyan-600',
      bg: 'bg-cyan-50',
      border: 'border-cyan-100',
      view: 'documents',
    },
    {
      title: 'Pending Payments',
      urdu: 'بقایا فیس',
      roman: 'Outstanding Fees',
      value: `PKR ${(totalPendingFees / 1000).toFixed(0)}k`,
      subValue: `Paid: PKR ${(totalPaidFees / 1000).toFixed(0)}k`,
      icon: CreditCard,
      color: 'text-emerald-700',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
      view: 'payments',
    },
  ];

  const reminderHearing = todayHearings[0] || upcomingHearings[0] || hearings[0];
  const reminderCase = reminderHearing ? cases.find((c) => c.id === reminderHearing.caseId) : null;
  const reminderClient = reminderCase ? clients.find((cl) => cl.id === reminderCase.clientId) : null;

  const formattedToday = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="p-3 sm:p-5 md:p-8 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner with Quick Actions */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 text-slate-900 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold border ${
                currentRole === 'super_admin'
                  ? 'bg-purple-50 text-purple-900 border-purple-200'
                  : currentRole === 'assistant'
                  ? 'bg-cyan-50 text-cyan-900 border-cyan-200'
                  : 'bg-amber-50 text-amber-900 border-amber-200'
              }`}>
                {currentRole === 'super_admin'
                  ? '🏛️ Master Admin Section • Platform Owner & Firm Management'
                  : currentRole === 'assistant'
                  ? '📋 Clerk Section • Munshi Roznamcha & Daily Court Diary Desk'
                  : '⚖️ Lawyer Section • Advocate Practice & Litigation Briefs'}
              </span>
              <span className="text-xs text-slate-500 font-semibold">Date: {formattedToday}</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black mt-1.5 tracking-tight text-slate-950">
              {isRoman ? 'Khush Amdeed' : 'Welcome'}, {currentUser.name}
            </h1>
            <p className="text-xs md:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed font-medium">
              {currentRole === 'super_admin'
                ? (isRoman
                    ? 'Chamber ke tamam maaliat, fees collection, staff roznamcha, rates aur secure cloud backup ko mukammal control ke sath manage karein.'
                    : 'Manage firm financials, fee collections, staff audit activities, service rate catalog, and database backups with complete administrative authority.')
                : currentRole === 'assistant'
                ? (isRoman
                    ? 'Rozana ki adalat peshiyan, tareekh peshi update, naye clients ka indiraaj, certified documents scanning aur fee receipts ka markazi portal.'
                    : 'Daily court diaries, tareekh peshi adjournment updates, client intake, certified documents scanning to drive, and payment receipts.')
                : (isRoman
                    ? 'Apne Clients, Cases, FIR Records, Court Hearings, Legal Services, Documents aur Payments ko ek hi Dashboard se manage karein.'
                    : 'Manage your active legal briefs, administrative services, court diary, client files, FIR records, and verified fee receipts efficiently.')}
            </p>
          </div>

          {/* Search Record Quick Trigger */}
          <button
            id="dash-search-record-btn"
            type="button"
            onClick={() => setIsSearchModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs md:text-sm transition-transform active:scale-95 shadow-md shrink-0 cursor-pointer"
          >
            <Search className="w-4 h-4 stroke-[2.2]" />
            <span>Search Records</span>
          </button>
        </div>

        {/* Quick Action Buttons Row */}
        <div className="mt-5 pt-4 border-t border-slate-200 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 mr-2">Quick Actions:</span>
          
          <button
            id="dash-btn-new-client"
            type="button"
            onClick={onOpenClientModal}
            className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-900 border border-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" /> + New Client
          </button>

          <button
            id="dash-btn-new-case"
            type="button"
            onClick={onOpenCaseModal}
            className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-900 border border-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5 text-blue-600 stroke-[2.5]" /> + New Case
          </button>

          <button
            type="button"
            onClick={() => setActiveView('services')}
            className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <BadgeCheck className="w-3.5 h-3.5 text-emerald-700 stroke-[2.2]" /> + Book Legal Service
          </button>

          <button
            id="dash-btn-new-hearing"
            type="button"
            onClick={() => onOpenHearingModal()}
            className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-900 border border-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5 text-rose-600 stroke-[2.5]" /> + New Hearing
          </button>

          <button
            id="dash-btn-upload-doc"
            type="button"
            onClick={onOpenDocModal}
            className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-900 border border-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-600 stroke-[2.5]" /> + Upload to Drive
          </button>

          <button
            type="button"
            onClick={() => setActiveView('reports')}
            className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-900 border border-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 text-amber-600 stroke-[2.2]" /> Print Reports
          </button>
        </div>
      </div>

      {/* Lawyer Personal Gmail & Isolated Google Drive Backup Card */}
      {!currentUser.connectedGmail ? (
        <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-blue-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-md">
              <Mail className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-sm sm:text-base text-white">
                  {isRoman ? 'Apna Personal Gmail & Google Drive Attach Karein' : 'Attach Your Personal Gmail & Google Drive'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950 uppercase tracking-wider">
                  Separate Backup
                </span>
              </div>
              <p className="text-xs text-blue-200 mt-1 max-w-2xl leading-relaxed">
                {isRoman
                  ? 'Aapke chamber ka data (Cases, Peshiyan, Clients, Files) doosre wakeelon se 100% alag rahe ga aur aapki personal Google Drive mein foran auto-sync ho jaye ga.'
                  : 'Your chamber records (cases, hearings, clients, files) remain completely isolated and will automatically sync directly into your personal Google Drive.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsGmailBackupModalOpen(true)}
            className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black rounded-xl shrink-0 flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-md cursor-pointer"
          >
            <Zap className="w-4 h-4 fill-slate-950 stroke-[2.5]" />
            <span>{isRoman ? 'Attach Gmail & Sync Drive' : 'Attach Gmail & Sync'}</span>
          </button>
        </div>
      ) : (
        <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-3.5 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
          <div className="flex items-center gap-3 min-w-0">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-slate-900">
                  {isRoman ? 'Personal Drive Backup:' : 'Isolated Drive Backup:'}
                </span>
                <span className="font-mono font-bold text-blue-800 truncate">
                  {currentUser.connectedGmail}
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold">
                  Active
                </span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Last Synced: <strong>{currentUser.lastBackupDate || 'Just now'}</strong> • Strict Chamber Isolation
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsGmailBackupModalOpen(true)}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors shrink-0 flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>{isRoman ? 'Sync / Backup Manage Karein' : 'Sync / Manage Drive'}</span>
          </button>
        </div>
      )}


      {/* Munshi Court Desk & Roznamcha Portal (Visible when in Clerk Section) */}
      {currentRole === 'clerk' && (
        <div className="bg-gradient-to-r from-cyan-50 via-sky-50 to-white rounded-2xl border-2 border-cyan-200 p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyan-200/80 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-cyan-600 text-white flex items-center justify-center font-bold shadow-xs">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-base">مرکزی منشی ڈیسک • Munshi Court Desk</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-200 text-cyan-900">
                    Roznamcha Active
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  {isRoman
                    ? 'Adalat se aakar foran tareekh peshi darj karein aur client ko WhatsApp notice bhejein'
                    : 'Log court appearances, mark adjournments, intake client CNICs, and issue cash receipts'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenHearingModal()}
                className="px-3.5 py-1.5 bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Nayi Tareekh Peshi</span>
              </button>
              <button
                onClick={() => setActiveView('calendar')}
                className="px-3 py-1.5 bg-white hover:bg-cyan-100 text-cyan-800 border border-cyan-300 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Cause List</span>
              </button>
            </div>
          </div>

          {/* Today's Court Diary Quick Action Bar */}
          <div>
            <div className="flex items-center justify-between mb-2 text-xs font-bold text-slate-800">
              <span className="flex items-center gap-1.5">
                <CalendarClock className="w-4 h-4 text-cyan-700" />
                <span>Aaj Ki Peshiyan (Today&apos;s Court Diary: {todayHearings.length})</span>
              </span>
              <button
                onClick={() => setActiveView('hearings')}
                className="text-cyan-700 hover:underline text-[11px]"
              >
                View Full Diary →
              </button>
            </div>

            {todayHearings.length > 0 ? (
              <div className="space-y-2">
                {todayHearings.slice(0, 3).map((h) => {
                  const linkedCase = cases.find((c) => c.id === h.caseId);
                  return (
                    <div
                      key={h.id}
                      className="p-3 bg-white rounded-xl border border-cyan-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-900">
                            {linkedCase?.caseNumber || 'Court Case'}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-amber-100 text-amber-900">
                            {h.hearingType}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-500">
                            {h.courtName} ({h.hearingTime})
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 font-medium line-clamp-1">
                          {linkedCase?.caseTitle || 'Legal Matter'} • Judge: {h.judgeName}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => updateHearing(h.id, { status: 'Attended' })}
                          className={`px-2.5 py-1 rounded text-xs font-semibold border transition-colors cursor-pointer ${
                            h.status === 'Attended'
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                          }`}
                        >
                          ✓ Attended
                        </button>
                        <button
                          onClick={() => updateHearing(h.id, { status: 'Adjourned' })}
                          className={`px-2.5 py-1 rounded text-xs font-semibold border transition-colors cursor-pointer ${
                            h.status === 'Adjourned'
                              ? 'bg-amber-600 text-white border-amber-600'
                              : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
                          }`}
                        >
                          Adjourned
                        </button>
                        <button
                          onClick={() => onOpenHearingModal(h)}
                          className="px-2.5 py-1 rounded text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition-colors cursor-pointer"
                          title="Update next hearing date and notes"
                        >
                          Next Date
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 bg-white/80 rounded-xl border border-dashed border-cyan-300 text-center text-xs text-slate-500">
                Aaj ke din koi peshi schedule nahi hai. Agli tareekh darj karne ke liye &ldquo;+ Nayi Tareekh Peshi&rdquo; use karein.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hearing Reminder Banner */}
      {reminderHearing && reminderCase && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-600 p-4 rounded-xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-200/80 text-amber-900 flex items-center justify-center shrink-0 font-bold">
              <CalendarClock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded">
                  Hearing Reminder
                </span>
                <span className="text-xs text-amber-700 font-mono">
                  Target: {reminderHearing.hearingDate}
                </span>
              </div>
              <div className="font-bold text-slate-900 text-sm mt-0.5">
                Case No: <span className="font-mono text-amber-900">{reminderCase.caseNumber}</span> •{' '}
                {reminderCase.courtName}
              </div>
              <div className="text-xs text-slate-600 mt-0.5">
                Client: <strong>{reminderClient?.fullName || (reminderClient as any)?.name || 'Client'}</strong> | Hearing Date:{' '}
                <strong>{reminderHearing.hearingDate}</strong> ({reminderHearing.hearingTime}) | Stage:{' '}
                <span className="text-amber-800 font-semibold">{reminderHearing.hearingType}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                onOpenShareModal({
                  title: 'Hearing Reminder Notice',
                  type: 'hearing',
                  clientName: reminderClient?.fullName || (reminderClient as any)?.name,
                  clientMobile: reminderClient?.phone || (reminderClient as any)?.mobile,
                  clientEmail: reminderClient?.email,
                  caseNumber: reminderCase.caseNumber,
                  courtName: reminderHearing.courtName,
                  hearingDate: reminderHearing.hearingDate,
                  hearingTime: reminderHearing.hearingTime,
                  extraNotes: reminderHearing.lawyerNotes,
                });
              }}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp Reminder</span>
            </button>
            <button
              onClick={() => {
                setSelectedCaseId(reminderCase.id);
                setActiveView('cases');
              }}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>View Case</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Dashboard Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <span>Key Metrics & Records</span>
            {isRoman && (
              <span className="text-xs font-normal text-slate-500 lowercase">(ek nazar mein summary)</span>
            )}
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                onClick={() => setActiveView(card.view)}
                className={`bg-white p-4 rounded-xl border ${card.border} hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between`}
              >
                <div className="flex items-start justify-between">
                  <div className={`w-9 h-9 rounded-lg ${card.bg} ${card.color} flex items-center justify-center font-bold`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 transition-colors" />
                </div>

                <div className="mt-3">
                  <div className="text-xs font-medium text-slate-500">{card.title}</div>
                  <div className="text-xl md:text-2xl font-bold text-slate-900 mt-0.5 tracking-tight flex items-baseline gap-2">
                    {card.value}
                    {card.subValue && (
                      <span className="text-[11px] font-medium text-slate-400">{card.subValue}</span>
                    )}
                  </div>
                  {isRoman && (
                    <div className="text-[10px] text-slate-400 mt-0.5">{card.roman}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Today's Hearings + Legal Services Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Court Hearings */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-rose-600" />
                <span>Today's Court Hearings ({todayHearings.length})</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isRoman
                  ? 'Aaj ki peshiyan, judges, aur advocate notes'
                  : 'Active hearings listed for today on the court cause list'}
              </p>
            </div>
            <button
              onClick={() => setActiveView('hearings')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer"
            >
              Full Cause List →
            </button>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {todayHearings.length > 0 ? (
              todayHearings.map((h) => {
                const linkedCase = cases.find((c) => c.id === h.caseId);
                const linkedClient = linkedCase ? clients.find((cl) => cl.id === linkedCase.clientId) : null;
                const clientName = linkedClient?.fullName || (linkedClient as any)?.name;
                const clientPhone = linkedClient?.phone || (linkedClient as any)?.mobile;

                return (
                  <div key={h.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800">
                          {h.hearingTime}
                        </span>
                        <span className="font-mono font-bold text-xs text-slate-900">
                          {linkedCase?.caseNumber || 'Case File'}
                        </span>
                        <span className="text-xs font-medium text-slate-500">
                          • {linkedCase?.courtName}
                        </span>
                      </div>
                      <div className="font-semibold text-slate-900 text-sm mt-1">
                        {linkedCase?.caseTitle || 'Legal Proceeding'}
                      </div>
                      <div className="text-xs text-slate-600 mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span>Client: <strong>{clientName}</strong></span>
                        <span>Judge: {h.judgeName}</span>
                        <span className="text-amber-700 font-medium">Stage: {h.hearingType}</span>
                      </div>
                      {h.lawyerNotes && (
                        <div className="text-[11px] text-slate-500 mt-1 bg-slate-50 p-1.5 rounded border border-slate-100">
                          <strong>Note:</strong> {h.lawyerNotes}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          onOpenShareModal({
                            title: 'Today Court Hearing Notice',
                            type: 'hearing',
                            clientName: clientName,
                            clientMobile: clientPhone,
                            clientEmail: linkedClient?.email,
                            caseNumber: linkedCase?.caseNumber,
                            courtName: h.courtName,
                            hearingDate: h.hearingDate,
                            hearingTime: h.hearingTime,
                            extraNotes: h.lawyerNotes,
                          });
                        }}
                        className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        title="Share on WhatsApp"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">WhatsApp</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedCaseId(h.caseId);
                          setActiveView('cases');
                        }}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Dossier
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-slate-400">
                <CheckCircle className="w-8 h-8 mx-auto text-emerald-500 mb-1" />
                <p className="text-xs">Aaj koi peshi scheduled nahi hai.</p>
              </div>
            )}
          </div>
        </div>

        {/* Legal & Administrative Services Quick Box */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BadgeCheck className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm">Chamber Services</h3>
              </div>
              <button
                onClick={() => setActiveView('services')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer"
              >
                Manage All →
              </button>
            </div>

            <div className="mt-3 space-y-2.5">
              {services.length > 0 ? (
                services.slice(0, 4).map((srv) => {
                  const sClient = clients.find((c) => c.id === srv.clientId);
                  return (
                    <div
                      key={srv.id}
                      onClick={() => setActiveView('services')}
                      className="p-2.5 bg-slate-50 hover:bg-emerald-50/40 rounded-lg border border-slate-200/80 hover:border-emerald-300 transition-all cursor-pointer text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 truncate max-w-[160px]">
                          {srv.serviceTitle}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          {srv.status.split(' ')[0]}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                        <span>{sClient?.fullName || 'Client'}</span>
                        <span className="font-mono">PKR {srv.totalFee.toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-6 text-center text-slate-400">
                  <p className="text-xs">No services registered yet. Click below to add a new matter.</p>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => setActiveView('services')}
            className="w-full mt-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Open Services Hub</span>
          </button>
        </div>
      </div>

      {/* Activity Log row */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Chamber Audit Trail & Activity Log</h3>
            <p className="text-xs text-slate-500">System changes, receipts, hearings, and services</p>
          </div>
          <button
            onClick={() => setActiveView('activity')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer"
          >
            Full Audit Log →
          </button>
        </div>

        <div className="divide-y divide-slate-100 mt-2">
          {activities.length > 0 ? (
            activities.slice(0, 5).map((act) => (
              <div key={act.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <div>
                    <span className="font-bold text-slate-900">{act.action}</span>
                    <span className="text-slate-500 ml-2">{act.details}</span>
                  </div>
                </div>
                <div className="text-right text-[11px] text-slate-400 font-mono shrink-0">
                  {act.timestamp.slice(11)} by {act.userName}
                </div>
              </div>
            ))
          ) : (
            <div className="py-6 text-center text-slate-400">
              <p className="text-xs">Chamber log clean and initialized. New activities will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
