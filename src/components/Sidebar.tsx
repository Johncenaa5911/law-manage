import React from 'react';
import {
  Scale,
  LayoutDashboard,
  Users,
  Briefcase,
  FileBadge,
  CalendarClock,
  FolderLock,
  CreditCard,
  FileText,
  Calendar,
  History,
  Settings,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  Building2,
  ChevronRight,
  BadgeCheck,
  X,
  UserPlus,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Sidebar: React.FC = () => {
  const {
    activeView,
    setActiveView,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    setSelectedClientId,
    setSelectedCaseId,
    setSelectedFirId,
    clients,
    cases,
    firs,
    services,
    activeServicesCount,
    todayHearings,
    totalActiveCases,
    totalPendingFees,
    currentRole,
    currentUser,
    currentFirm,
    setIsTeamModalOpen,
    setShowOnboarding,
    languageMode,
  } = useApp();

  const handleNav = (view: string) => {
    setSelectedClientId(null);
    setSelectedCaseId(null);
    setSelectedFirId(null);
    setActiveView(view);
    setIsMobileSidebarOpen(false);
  };

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      urdu: 'مرکزی ڈیش بورڈ',
      roman: 'Main Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'clients',
      label: 'Clients',
      urdu: 'موکلین',
      roman: 'Client Records',
      icon: Users,
      badge: clients.length,
    },
    {
      id: 'cases',
      label: 'Cases',
      urdu: 'مقدمات',
      roman: 'Case Management',
      icon: Briefcase,
      badge: totalActiveCases,
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    },
    {
      id: 'services',
      label: 'Legal Services',
      urdu: 'خدماتِ وکالت (فائلر/کریکٹر)',
      roman: 'Legal Services (FBR/Police)',
      icon: BadgeCheck,
      badge: activeServicesCount > 0 ? `${activeServicesCount} Active` : services.length,
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold',
    },
    {
      id: 'firs',
      label: 'FIR Records',
      urdu: 'ایف آئی آر ریکارڈز',
      roman: 'FIR Police Records',
      icon: FileBadge,
      badge: firs.length,
    },
    {
      id: 'hearings',
      label: 'Hearings',
      urdu: 'عدالتی پیشیاں',
      roman: 'Court Hearings',
      icon: CalendarClock,
      badge: todayHearings.length > 0 ? `${todayHearings.length} Today` : null,
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-300 font-semibold',
    },
    {
      id: 'documents',
      label: 'Documents',
      urdu: 'قانونی دستاویزات',
      roman: 'Legal Documents',
      icon: FolderLock,
      badge: null,
    },
    {
      id: 'payments',
      label: 'Payments & Fees',
      urdu: 'فیس اور ادائیگیاں',
      roman: 'Fee Management',
      icon: CreditCard,
      badge: totalPendingFees > 0 ? 'Pending' : null,
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    },
    {
      id: 'reports',
      label: 'Reports & PDF',
      urdu: 'رپورٹس اور پرنٹ',
      roman: 'PDF Reports & Print',
      icon: FileText,
      badge: null,
    },
    {
      id: 'calendar',
      label: 'Calendar & Diary',
      urdu: 'عدالتی ڈائری',
      roman: 'Court Cause List',
      icon: Calendar,
      badge: null,
    },
    {
      id: 'activity',
      label: 'Activity Log',
      urdu: 'سسٹم لاگ',
      roman: 'Audit Trail',
      icon: History,
      badge: null,
    },
    {
      id: 'settings',
      label: 'Settings & Firm',
      urdu: 'ترتیبات',
      roman: 'Firm Profile & Backup',
      icon: Settings,
      badge: null,
    },
  ];

  const renderSidebarInner = (isMobileDrawer = false) => (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/20">
              <Scale className="w-6 h-6 text-slate-950" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-extrabold tracking-tight text-slate-950 dark:text-white flex items-center gap-1.5">
                WAKALAT
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30">
                  PRO
                </span>
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-400 truncate font-medium">
                Commercial Multi-Lawyer Suite
              </p>
            </div>
          </div>

          {isMobileDrawer && (
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(false)}
              className="p-2 text-slate-600 hover:text-black hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Current Law Firm Workspace Card */}
        <div className="mt-3.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 flex flex-col gap-1.5 text-xs shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-950 dark:text-slate-200 font-bold truncate">
              <Building2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="truncate">{currentFirm.name}</span>
            </div>
            <span
              className={`text-[9px] px-1.5 py-0.2 rounded font-extrabold uppercase border ${
                currentFirm.subscriptionStatus === 'active'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-900/60 dark:text-emerald-300 dark:border-emerald-600/40'
                  : 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-900/60 dark:text-amber-300 dark:border-amber-600/40'
              }`}
            >
              {currentFirm.subscriptionStatus}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
            <span className="truncate font-medium">{currentFirm.city} • {currentUser.name}</span>
            <span className="text-[9px] font-mono px-1 rounded bg-slate-200 dark:bg-slate-900 text-slate-800 dark:text-slate-400 font-semibold">
              {currentRole === 'firm_admin' ? 'Managing Partner' : currentRole}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
        <div className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {languageMode === 'romanUrdu' ? 'Modules & Records' : 'Legal Navigation'}
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all group cursor-pointer ${
                isActive
                  ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                  : 'text-slate-800 dark:text-slate-300 hover:text-black dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80'
              }`}
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-slate-950 stroke-[2.5]' : 'text-slate-600 dark:text-slate-400 group-hover:text-black dark:group-hover:text-amber-400'
                  }`}
                />
                <span className="truncate">
                  {languageMode === 'romanUrdu' ? item.roman : item.label}
                </span>
              </div>

              {item.badge !== null && item.badge !== undefined && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                    item.badgeColor
                      ? item.badgeColor
                      : isActive
                      ? 'bg-slate-950 text-amber-400 border-amber-300'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Commercial Section Divider */}
        <div className="pt-3 px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400 flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-purple-700 dark:text-purple-400" />
          <span>Commercial & Administration</span>
        </div>

        {/* Team & Munshi Management */}
        <button
          type="button"
          onClick={() => {
            setIsTeamModalOpen(true);
            setIsMobileSidebarOpen(false);
          }}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-300 hover:text-black dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all group cursor-pointer"
        >
          <div className="flex items-center space-x-2.5">
            <UserPlus className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0 group-hover:scale-110 transition-transform" />
            <span>Chamber Team & Munshis</span>
          </div>
          <ChevronRight className="w-3 h-3 text-slate-400 dark:text-slate-500" />
        </button>
      </nav>

      {/* Footer System Status */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/90 text-center">
        <div className="text-[10px] text-slate-600 dark:text-slate-400 text-center flex items-center justify-center gap-1 font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-500" />
          <span>Wakalat Pro Enterprise • Multi-Tenant Isolated</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Permanent) */}
      <aside className="hidden lg:flex w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-col h-screen shrink-0">
        {renderSidebarInner(false)}
      </aside>

      {/* Mobile Sidebar (Slide-over Drawer) */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileSidebarOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer container */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-2xl">
            {renderSidebarInner(true)}
          </div>
        </div>
      )}
    </>
  );
};
