import React from 'react';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  CalendarClock,
  Menu,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const BottomNavBar: React.FC = () => {
  const {
    activeView,
    setActiveView,
    setIsMobileSidebarOpen,
    setSelectedClientId,
    setSelectedCaseId,
    setSelectedFirId,
    totalActiveCases,
    clients,
    todayHearings,
  } = useApp();

  const handleNav = (view: string) => {
    setSelectedClientId(null);
    setSelectedCaseId(null);
    setSelectedFirId(null);
    setActiveView(view);
  };

  const navButtons = [
    {
      id: 'dashboard',
      label: 'Home',
      icon: LayoutDashboard,
      badge: null,
      onClick: () => handleNav('dashboard'),
    },
    {
      id: 'cases',
      label: 'Cases',
      icon: Briefcase,
      badge: totalActiveCases > 0 ? totalActiveCases : null,
      onClick: () => handleNav('cases'),
    },
    {
      id: 'clients',
      label: 'Clients',
      icon: Users,
      badge: clients.length > 0 ? clients.length : null,
      onClick: () => handleNav('clients'),
    },
    {
      id: 'hearings',
      label: 'Diary',
      icon: CalendarClock,
      badge: todayHearings.length > 0 ? todayHearings.length : null,
      badgeColor: 'bg-rose-500 text-white',
      onClick: () => handleNav('hearings'),
    },
    {
      id: 'menu',
      label: 'Menu',
      icon: Menu,
      badge: null,
      onClick: () => setIsMobileSidebarOpen(true),
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 text-slate-800 z-40 sm:hidden select-none safe-area-pb no-print shadow-lg"
    >
      <div className="grid grid-cols-5 h-16 items-center px-1">
        {navButtons.map((btn) => {
          const Icon = btn.icon;
          const isActive = btn.id === 'menu' ? false : activeView === btn.id;

          return (
            <button
              key={btn.id}
              type="button"
              id={`mobile-tab-${btn.id}`}
              onClick={btn.onClick}
              className={`relative flex flex-col items-center justify-center h-full py-1.5 px-1 transition-colors min-h-[44px] cursor-pointer ${
                isActive
                  ? 'text-amber-600 font-extrabold'
                  : 'text-slate-600 hover:text-black font-semibold'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-amber-600 scale-110' : 'text-slate-600'} transition-transform stroke-[2.2]`} />
                {btn.badge !== null && (
                  <span
                    className={`absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-bold flex items-center justify-center leading-none ${
                      btn.badgeColor || 'bg-amber-500 text-slate-950'
                    }`}
                  >
                    {btn.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 leading-tight tracking-tight truncate max-w-[56px]">
                {btn.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 w-8 h-0.5 bg-amber-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
