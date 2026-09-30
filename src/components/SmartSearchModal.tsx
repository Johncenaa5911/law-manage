import React, { useState, useMemo } from 'react';
import {
  Search,
  X,
  User,
  Briefcase,
  FileBadge,
  CalendarClock,
  ExternalLink,
  Phone,
  FileText,
  MapPin,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SmartSearchModal: React.FC = () => {
  const {
    isSearchModalOpen,
    setIsSearchModalOpen,
    globalSearchQuery,
    setGlobalSearchQuery,
    clients,
    cases,
    firs,
    hearings,
    setSelectedClientId,
    setSelectedCaseId,
    setSelectedFirId,
    setActiveView,
    languageMode,
  } = useApp();

  const [localQuery, setLocalQuery] = useState(globalSearchQuery || '');

  const results = useMemo(() => {
    const q = localQuery.trim().toLowerCase();
    if (!q) return { clients: [], cases: [], firs: [], hearings: [] };

    // Clean special characters from query for CNIC or phone match
    const qClean = q.replace(/[^a-z0-9]/g, '');

    const matchedClients = clients.filter((c) => {
      const cnicClean = c.cnic.replace(/[^a-z0-9]/g, '').toLowerCase();
      const phoneClean = c.mobile.replace(/[^a-z0-9]/g, '').toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.fatherOrHusbandName.toLowerCase().includes(q) ||
        c.cnic.toLowerCase().includes(q) ||
        (qClean.length >= 4 && cnicClean.includes(qClean)) ||
        c.mobile.includes(q) ||
        (qClean.length >= 4 && phoneClean.includes(qClean)) ||
        c.city.toLowerCase().includes(q) ||
        c.address.toLowerCase().includes(q) ||
        c.occupation.toLowerCase().includes(q)
      );
    });

    const matchedCases = cases.filter((item) => {
      return (
        item.caseNumber.toLowerCase().includes(q) ||
        item.caseTitle.toLowerCase().includes(q) ||
        (item.firNumber && item.firNumber.toLowerCase().includes(q)) ||
        item.courtName.toLowerCase().includes(q) ||
        item.caseType.toLowerCase().includes(q) ||
        item.judgeName.toLowerCase().includes(q) ||
        (item.policeStation && item.policeStation.toLowerCase().includes(q)) ||
        item.district.toLowerCase().includes(q) ||
        item.caseYear.includes(q) ||
        item.advocateName.toLowerCase().includes(q) ||
        (item.dafaSections && item.dafaSections.toLowerCase().includes(q)) ||
        item.complainant.toLowerCase().includes(q) ||
        item.accused.toLowerCase().includes(q)
      );
    });

    const matchedFirs = firs.filter((f) => {
      return (
        f.firNumber.toLowerCase().includes(q) ||
        f.policeStation.toLowerCase().includes(q) ||
        f.sections.toLowerCase().includes(q) ||
        f.district.toLowerCase().includes(q) ||
        f.firYear.includes(q) ||
        f.complainant.toLowerCase().includes(q) ||
        f.accused.toLowerCase().includes(q) ||
        f.investigatingOfficer.toLowerCase().includes(q)
      );
    });

    const matchedHearings = hearings.filter((h) => {
      return (
        h.courtName.toLowerCase().includes(q) ||
        h.judgeName.toLowerCase().includes(q) ||
        h.hearingType.toLowerCase().includes(q) ||
        h.hearingDate.includes(q) ||
        h.nextAction.toLowerCase().includes(q)
      );
    });

    return {
      clients: matchedClients,
      cases: matchedCases,
      firs: matchedFirs,
      hearings: matchedHearings,
    };
  }, [localQuery, clients, cases, firs, hearings]);

  if (!isSearchModalOpen) return null;

  const handleSelectClient = (id: string) => {
    setSelectedClientId(id);
    setActiveView('clients');
    setIsSearchModalOpen(false);
  };

  const handleSelectCase = (id: string) => {
    setSelectedCaseId(id);
    setActiveView('cases');
    setIsSearchModalOpen(false);
  };

  const handleSelectFir = (id: string) => {
    setSelectedFirId(id);
    setActiveView('firs');
    setIsSearchModalOpen(false);
  };

  const totalHits =
    results.clients.length + results.cases.length + results.firs.length + results.hearings.length;

  const quickPills = [
    '42101-1234567-8',
    'FIR No. 125/2024',
    'CR-123/2025',
    'PS Shalimar',
    'Sessions Court',
    'Muhammad Asif',
    '0300-1234567',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 md:pt-16 p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-200 flex flex-col max-h-[85vh]">
        {/* Search Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-3">
          <Search className="w-5 h-5 text-amber-600 shrink-0" />
          <input
            type="text"
            autoFocus
            value={localQuery}
            onChange={(e) => {
              setLocalQuery(e.target.value);
              setGlobalSearchQuery(e.target.value);
            }}
            placeholder="Search CNIC (42101-1234567-8), FIR No (125/2024), Case #, Client, Mobile, Police Station..."
            className="w-full bg-transparent text-sm md:text-base text-slate-900 placeholder-slate-400 focus:outline-hidden font-medium"
          />
          {localQuery && (
            <button
              onClick={() => {
                setLocalQuery('');
                setGlobalSearchQuery('');
              }}
              className="p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setIsSearchModalOpen(false)}
            className="px-2 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-200 hover:bg-slate-300 rounded-lg"
          >
            Esc
          </button>
        </div>

        {/* Quick Sample Queries */}
        <div className="px-4 py-2 border-b border-slate-100 bg-white flex items-center gap-2 overflow-x-auto text-xs text-slate-600">
          <span className="shrink-0 text-slate-400 font-medium">Quick Search:</span>
          {quickPills.map((pill) => (
            <button
              key={pill}
              onClick={() => {
                setLocalQuery(pill);
                setGlobalSearchQuery(pill);
              }}
              className="shrink-0 px-2 py-0.5 rounded-full bg-slate-100 hover:bg-amber-100 hover:text-amber-800 text-slate-700 text-[11px] font-mono border border-slate-200 transition-colors"
            >
              {pill}
            </button>
          ))}
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {!localQuery.trim() ? (
            <div className="py-12 text-center text-slate-400">
              <Search className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <div className="font-semibold text-slate-700">
                {languageMode === 'romanUrdu' ? 'Smart Search Bar' : 'Deep Legal Search'}
              </div>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                Lawyer koi bhi FIR No, CNIC, Phone, Case Number, Police Station ya Party Name enter kare aur
                system direct link show karega.
              </p>
            </div>
          ) : totalHits === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <p className="text-sm font-semibold">Koi record match nahi hua &ldquo;{localQuery}&rdquo;</p>
              <p className="text-xs text-slate-400 mt-1">
                Check spelling ya CNIC / FIR number ka format check karein.
              </p>
            </div>
          ) : (
            <>
              {/* Clients Matched */}
              {results.clients.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-blue-600" /> Clients ({results.clients.length})
                    </span>
                  </div>
                  <div className="grid gap-2">
                    {results.clients.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => handleSelectClient(c.id)}
                        className="p-3 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/40 cursor-pointer transition-all flex items-center justify-between group"
                      >
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                            {c.name}
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono">
                              CNIC: {c.cnic}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                            <span>S/o / D/o: {c.fatherOrHusbandName}</span>
                            <span>• Phone: {c.mobile}</span>
                            <span>• City: {c.city}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs font-semibold text-amber-700 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span>View Profile</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cases Matched */}
              {results.cases.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-amber-600" /> Cases ({results.cases.length})
                    </span>
                  </div>
                  <div className="grid gap-2">
                    {results.cases.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => handleSelectCase(c.id)}
                        className="p-3 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/40 cursor-pointer transition-all flex items-center justify-between group"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-slate-900 text-amber-300">
                              {c.caseNumber}
                            </span>
                            <span className="font-semibold text-slate-900 text-sm truncate">
                              {c.caseTitle}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                            {c.firNumber && (
                              <span className="text-rose-700 font-semibold">FIR: {c.firNumber}</span>
                            )}
                            <span>Court: {c.courtName}</span>
                            <span>Judge: {c.judgeName}</span>
                            {c.policeStation && <span>PS: {c.policeStation}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs font-semibold text-amber-700 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span>Open Dossier</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* FIRs Matched */}
              {results.firs.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <FileBadge className="w-3.5 h-3.5 text-rose-600" /> FIR Records ({results.firs.length})
                    </span>
                  </div>
                  <div className="grid gap-2">
                    {results.firs.map((f) => (
                      <div
                        key={f.id}
                        onClick={() => handleSelectFir(f.id)}
                        className="p-3 rounded-xl border border-rose-200 bg-rose-50/30 hover:border-rose-400 hover:bg-rose-50/60 cursor-pointer transition-all flex items-center justify-between group"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-rose-700 text-white">
                              FIR No. {f.firNumber}
                            </span>
                            <span className="font-semibold text-slate-900 text-xs">
                              {f.policeStation} ({f.district})
                            </span>
                          </div>
                          <div className="text-xs text-slate-600 mt-1">
                            <span className="font-medium text-slate-800">PPC Sections:</span> {f.sections}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                            Complainant: {f.complainant} • Accused: {f.accused}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs font-semibold text-rose-700 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span>FIR Detail</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <span>
            Press <kbd className="px-1 py-0.5 bg-white border rounded text-[10px] font-mono">Esc</kbd> to exit
          </span>
          <span className="text-[11px] text-slate-400">
            {totalHits} match{totalHits !== 1 ? 'es' : ''} found in database
          </span>
        </div>
      </div>
    </div>
  );
};
