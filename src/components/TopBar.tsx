import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Plus,
  Bell,
  Languages,
  LogOut,
  Briefcase,
  UserPlus,
  CalendarPlus,
  Upload,
  Clock,
  CheckCircle2,
  ChevronDown,
  X,
  Cloud,
  RefreshCw,
  Zap,
  Menu,
  Building2,
  ShieldCheck,
  Mail,
  User,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface TopBarProps {
  onOpenClientModal: () => void;
  onOpenCaseModal: () => void;
  onOpenHearingModal: () => void;
  onOpenDocModal: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenClientModal,
  onOpenCaseModal,
  onOpenHearingModal,
  onOpenDocModal,
}) => {
  const {
    currentUser,
    currentRole,
    currentFirm,
    logout,
    languageMode,
    setLanguageMode,
    setIsSearchModalOpen,
    globalSearchQuery,
    todayHearings,
    upcomingHearings,
    setActiveView,
    setSelectedCaseId,
    isCloudSyncing,
    isConnectedToCloud,
    isRealtimeActive,
    syncNotification,
    syncWithCloud,
    setIsMobileSidebarOpen,
    setIsGmailBackupModalOpen,
  } = useApp();

  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const quickAddRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (quickAddRef.current && !quickAddRef.current.contains(event.target as Node)) {
        setShowQuickAdd(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalNotifications = todayHearings.length + Math.min(upcomingHearings.length, 3);

  const getRoleDisplayName = () => {
    if (currentRole === 'super_admin') return 'Platform Owner';
    if (currentRole === 'firm_admin') return 'Managing Partner';
    if (currentRole === 'assistant') return 'Chamber Munshi';
    return 'Associate Advocate';
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-3 sm:px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs no-print gap-2 md:gap-3 text-slate-900 w-full select-none">
      {/* LEFT SECTION: Mobile Toggle & Global Search */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 max-w-xl">
        {/* Mobile Drawer Hamburger Trigger */}
        <button
          type="button"
          id="mobile-drawer-toggle"
          onClick={() => setIsMobileSidebarOpen(true)}
          className="p-2 -ml-1 text-slate-800 hover:text-black rounded-xl hover:bg-slate-100 lg:hidden min-w-[38px] min-h-[38px] flex items-center justify-center shrink-0 cursor-pointer border border-slate-200"
          title="Open Navigation Menu"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5 text-slate-800 stroke-[2.2]" />
        </button>

        {/* Global Search Bar (Adapts by screen ratio) */}
        <div
          onClick={() => setIsSearchModalOpen(true)}
          className="relative flex items-center w-full cursor-pointer group max-w-xs sm:max-w-sm md:max-w-md"
        >
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-hover:text-amber-600 transition-colors">
            <Search className="w-4 h-4 stroke-[2.2]" />
          </div>
          <input
            type="text"
            readOnly
            value={globalSearchQuery}
            placeholder={
              languageMode === 'romanUrdu'
                ? 'Search: Case, FIR, CNIC, Client...'
                : 'Search: Client, CNIC, FIR #, Case #...'
            }
            className="w-full pl-9 pr-2 sm:pr-14 py-2 bg-slate-50 hover:bg-slate-100/90 border border-slate-300 group-hover:border-amber-500 rounded-xl text-xs md:text-sm text-slate-900 placeholder-slate-500 focus:outline-none transition-all shadow-2xs cursor-pointer truncate font-medium"
          />
          <div className="absolute inset-y-0 right-0 pr-2.5 hidden sm:flex items-center pointer-events-none">
            <kbd className="hidden md:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-slate-600 bg-white border border-slate-300 rounded shadow-2xs font-bold">
              Ctrl+K
            </kbd>
          </div>
        </div>

        {/* Chamber Workspace Indicator (Adaptive: visible on tablet/desktop) */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 shadow-2xs shrink-0">
          <Building2 className="w-4 h-4 text-amber-600 shrink-0 stroke-[2.2]" />
          <div className="text-left leading-tight truncate max-w-[150px] xl:max-w-[200px]">
            <div className="font-extrabold text-slate-950 truncate">{currentFirm.name}</div>
            <div className="text-[10px] text-slate-600 font-semibold truncate">
              {currentFirm.city} • <span className="text-emerald-700 font-bold uppercase">{currentFirm.subscriptionStatus}</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT CONTROLS: Responsive Auto-Adapting Action Group */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {/* Firebase Cloud Sync Status & Manual Sync Button */}
        <button
          id="cloud-sync-btn"
          type="button"
          onClick={syncWithCloud}
          disabled={isCloudSyncing}
          className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 text-xs font-bold rounded-xl border transition-colors shadow-2xs min-h-[38px] cursor-pointer ${
            isCloudSyncing
              ? 'bg-cyan-50 border-cyan-300 text-cyan-900'
              : isConnectedToCloud && isRealtimeActive
              ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-900'
              : isConnectedToCloud
              ? 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-900'
              : 'bg-rose-50 border-rose-300 text-rose-900'
          }`}
          title={
            isCloudSyncing
              ? 'Syncing with Cloud Database...'
              : 'Real-time sync active: Changes are saved instantly to database.'
          }
        >
          {isCloudSyncing ? (
            <RefreshCw className="w-3.5 h-3.5 text-cyan-700 animate-spin" />
          ) : isRealtimeActive ? (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
            </span>
          ) : (
            <Cloud className="w-3.5 h-3.5 text-slate-500" />
          )}
          <span className="hidden md:inline text-[11px] font-extrabold flex items-center gap-1">
            {isCloudSyncing ? (
              'Syncing...'
            ) : isRealtimeActive ? (
              <>
                <Zap className="w-3 h-3 text-emerald-700 fill-emerald-600" />
                Live Sync
              </>
            ) : (
              'Cloud Sync'
            )}
          </span>
        </button>

        {/* Lawyer Personal Gmail & Cloud Sync */}
        <button
          id="lawyer-gmail-backup-btn"
          type="button"
          onClick={() => setIsGmailBackupModalOpen(true)}
          className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 text-xs font-bold rounded-xl border transition-all shadow-2xs min-h-[38px] cursor-pointer ${
            currentUser.connectedGmail
              ? 'bg-blue-50 hover:bg-blue-100 border-blue-300 text-blue-950'
              : 'bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-950'
          }`}
          title={
            currentUser.connectedGmail
              ? `Connected Gmail: ${currentUser.connectedGmail} (Click to manage sync & backup)`
              : 'Attach your Gmail for automated cloud backup & data syncing'
          }
        >
          <Mail className={`w-3.5 h-3.5 ${currentUser.connectedGmail ? 'text-blue-700' : 'text-amber-700'} stroke-[2.2]`} />
          <span className="text-[11px] truncate max-w-[120px]">
            {currentUser.connectedGmail ? currentUser.connectedGmail.split('@')[0] : 'Gmail Backup'}
          </span>
        </button>

        {/* Language Switcher (Adaptive: visible on sm+) */}
        <button
          id="toggle-language-btn"
          type="button"
          onClick={() => setLanguageMode(languageMode === 'english' ? 'romanUrdu' : 'english')}
          className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-300 transition-colors min-h-[38px] shadow-2xs cursor-pointer"
          title="Toggle Urdu / Roman Urdu guidance"
        >
          <Languages className="w-3.5 h-3.5 text-amber-600 stroke-[2.2]" />
          <span>
            {languageMode === 'romanUrdu' ? '🇵🇰 Urdu' : '🇬🇧 EN'}
          </span>
        </button>

        {/* Quick Add Dropdown */}
        <div className="relative" ref={quickAddRef}>
          <button
            id="quick-action-btn"
            type="button"
            onClick={() => setShowQuickAdd(!showQuickAdd)}
            className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-slate-950 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs md:text-sm font-black shadow-xs transition-all active:scale-95 min-h-[38px] cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Add</span>
            <ChevronDown className="w-3.5 h-3.5 stroke-[2.2]" />
          </button>

          {showQuickAdd && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3.5 py-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                {languageMode === 'romanUrdu' ? 'Naya Legal Record' : 'Create New Record'}
              </div>
              <button
                id="quick-add-client"
                type="button"
                onClick={() => {
                  setShowQuickAdd(false);
                  onOpenClientModal();
                }}
                className="w-full text-left px-3.5 py-2.5 text-slate-900 hover:bg-amber-50 hover:text-amber-950 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <UserPlus className="w-4 h-4 text-amber-600 stroke-[2.2]" />
                <div>
                  <div className="font-extrabold text-slate-900">+ New Client</div>
                  <div className="text-[10px] text-slate-500 font-medium">Naya client aur CNIC add karein</div>
                </div>
              </button>
              <button
                id="quick-add-case"
                type="button"
                onClick={() => {
                  setShowQuickAdd(false);
                  onOpenCaseModal();
                }}
                className="w-full text-left px-3.5 py-2.5 text-slate-900 hover:bg-amber-50 hover:text-amber-950 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <Briefcase className="w-4 h-4 text-blue-600 stroke-[2.2]" />
                <div>
                  <div className="font-extrabold text-slate-900">+ New Case</div>
                  <div className="text-[10px] text-slate-500 font-medium">Case title, court aur FIR link</div>
                </div>
              </button>
              <button
                id="quick-add-hearing"
                type="button"
                onClick={() => {
                  setShowQuickAdd(false);
                  onOpenHearingModal();
                }}
                className="w-full text-left px-3.5 py-2.5 text-slate-900 hover:bg-amber-50 hover:text-amber-950 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <CalendarPlus className="w-4 h-4 text-rose-600 stroke-[2.2]" />
                <div>
                  <div className="font-extrabold text-slate-900">+ New Hearing</div>
                  <div className="text-[10px] text-slate-500 font-medium">Peshi date aur judge schedule</div>
                </div>
              </button>
              <button
                id="quick-upload-doc"
                type="button"
                onClick={() => {
                  setShowQuickAdd(false);
                  onOpenDocModal();
                }}
                className="w-full text-left px-3.5 py-2.5 text-slate-900 hover:bg-amber-50 hover:text-amber-950 flex items-center gap-2.5 border-t border-slate-100 transition-colors cursor-pointer"
              >
                <Upload className="w-4 h-4 text-emerald-600 stroke-[2.2]" />
                <div>
                  <div className="font-extrabold text-slate-900">+ Upload Document</div>
                  <div className="text-[10px] text-slate-500 font-medium">FIR, Bail, Order, CNIC copy</div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Notifications / Hearing Reminders */}
        <div className="relative" ref={notifRef}>
          <button
            id="notifications-bell-btn"
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-800 hover:text-black hover:bg-slate-100 rounded-xl transition-colors border border-slate-200 cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center"
            title="Hearing Reminders"
          >
            <Bell className="w-4.5 h-4.5 stroke-[2.2]" />
            {totalNotifications > 0 && (
              <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-rose-600 text-white rounded-full text-[10px] font-black flex items-center justify-center shadow-xs">
                {totalNotifications}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-black text-slate-950 text-sm">Hearing Reminders</h3>
                  <p className="text-[11px] text-slate-600 font-medium">
                    {todayHearings.length} hearings scheduled today for {currentFirm.name}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNotifications(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-4 h-4 stroke-[2.2]" />
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {todayHearings.length === 0 ? (
                  <div className="p-5 text-center text-slate-500">
                    <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-600 mb-1.5" />
                    <p className="font-bold text-slate-800">No hearings scheduled for today!</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Court cause list is completely clear.</p>
                  </div>
                ) : (
                  todayHearings.map((h) => (
                    <div
                      key={h.id}
                      onClick={() => {
                        setSelectedCaseId(h.caseId);
                        setActiveView('cases');
                        setShowNotifications(false);
                      }}
                      className="p-3 hover:bg-amber-50/60 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black text-rose-700 flex items-center gap-1">
                          <Clock className="w-3 h-3 stroke-[2.2]" /> {h.hearingTime}
                        </span>
                        <span className="text-slate-600 font-bold bg-slate-100 px-1.5 py-0.2 rounded text-[10px]">{h.hearingType}</span>
                      </div>
                      <div className="font-bold text-slate-900 text-xs mt-1">{h.courtName}</div>
                      <div className="text-[11px] text-slate-600 truncate mt-0.5">{h.nextAction}</div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-2.5 border-t border-slate-100 bg-slate-50 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setActiveView('hearings');
                    setShowNotifications(false);
                  }}
                  className="text-amber-800 hover:text-amber-950 font-black text-xs cursor-pointer"
                >
                  View Full Cause List & Calendar →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Authenticated User Profile & Role Chip (Strictly Secure, No Backdoors) */}
        <div className="flex items-center gap-2 pl-1.5 sm:pl-2 border-l border-slate-200">
          <div
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-xs font-black shadow-xs ${
              currentRole === 'super_admin'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-900 text-amber-400'
            }`}
            title={`Logged in as ${currentUser.name} (${getRoleDisplayName()})`}
          >
            {currentUser.name.charAt(0).toUpperCase()}
          </div>

          <div className="hidden lg:block text-left leading-tight">
            <div className="font-extrabold text-slate-950 text-xs truncate max-w-[120px]">
              {currentUser.name}
            </div>
            <div className="text-[10px] text-slate-600 font-bold uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>{getRoleDisplayName()}</span>
            </div>
          </div>

          {/* Secure Logout Button */}
          <button
            id="logout-header-btn"
            type="button"
            onClick={logout}
            className="p-2 text-slate-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors border border-slate-200 cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center"
            title="Secure Logout from Chamber"
          >
            <LogOut className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>
      </div>

      {/* Real-time synchronization floating feedback */}
      {syncNotification && (
        <div
          id="realtime-sync-toast"
          className="fixed bottom-20 sm:bottom-6 right-3 sm:right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-800 text-xs font-bold animate-in fade-in slide-in-from-bottom-2 duration-200 max-w-[calc(100vw-24px)] sm:max-w-md"
        >
          <div className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </div>
          <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="text-slate-100">{syncNotification}</span>
        </div>
      )}
    </header>
  );
};
