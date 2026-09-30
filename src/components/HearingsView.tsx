import React, { useState } from 'react';
import {
  CalendarClock,
  Plus,
  Search,
  Calendar,
  Clock,
  Gavel,
  CheckCircle,
  AlertTriangle,
  Share2,
  Printer,
  ChevronRight,
  Edit2,
  Trash2,
  Filter,
  CheckCircle2,
  XCircle,
  FileText,
  User,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Hearing, HearingStatus, HearingType } from '../types';
import { ShareData } from './ShareModal';
import { printElement } from '../utils/printHelper';

interface HearingsViewProps {
  onOpenHearingModal: (hearingToEdit?: Hearing) => void;
  onOpenShareModal: (data: ShareData) => void;
}

export const HearingsView: React.FC<HearingsViewProps> = ({
  onOpenHearingModal,
  onOpenShareModal,
}) => {
  const {
    hearings,
    cases,
    clients,
    todayDateStr,
    todayHearings,
    upcomingHearings,
    updateHearing,
    deleteHearing,
    setSelectedCaseId,
    setActiveView,
    languageMode,
    currentRole,
  } = useApp();

  const [filterTab, setFilterTab] = useState<'today' | 'upcoming' | 'past' | 'all'>('today');
  const [searchTerm, setSearchTerm] = useState('');

  const pastHearings = hearings.filter((h) => h.hearingDate < todayDateStr);

  const activeHearingsList =
    filterTab === 'today'
      ? todayHearings
      : filterTab === 'upcoming'
      ? upcomingHearings
      : filterTab === 'past'
      ? pastHearings
      : hearings;

  const filteredHearings = activeHearingsList.filter((h) => {
    const q = searchTerm.toLowerCase();
    const linkedCase = cases.find((c) => c.id === h.caseId);
    return (
      h.courtName.toLowerCase().includes(q) ||
      h.judgeName.toLowerCase().includes(q) ||
      h.hearingType.toLowerCase().includes(q) ||
      h.lawyerNotes.toLowerCase().includes(q) ||
      h.nextAction.toLowerCase().includes(q) ||
      (linkedCase && linkedCase.caseNumber.toLowerCase().includes(q)) ||
      (linkedCase && linkedCase.caseTitle.toLowerCase().includes(q))
    );
  });

  const handleMarkAttended = (id: string) => {
    updateHearing(id, { status: 'Attended' });
  };

  const handleAdjourn = (id: string) => {
    updateHearing(id, { status: 'Adjourned' });
  };

  return (
    <div className="p-3 sm:p-5 md:p-8 max-w-7xl mx-auto space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarClock className="w-6 h-6 text-rose-600" />
            <span>Court Hearings & Cause List</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            {languageMode === 'romanUrdu'
              ? 'Rozana ki peshiyan, cause list, judges schedule aur WhatsApp hearing reminders'
              : 'Daily court diaries, hearing stages, court orders and automated notices'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => printElement('hearings-cause-list-container', 'Court-Cause-List')}
            className="px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Cause List</span>
          </button>
          <button
            id="btn-add-new-hearing"
            onClick={() => onOpenHearingModal()}
            className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs md:text-sm font-semibold flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Schedule Hearing</span>
          </button>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="flex border-b border-slate-200 gap-1 w-full md:w-auto overflow-x-auto no-scrollbar">
            <button
              onClick={() => setFilterTab('today')}
              className={`pb-2 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
                filterTab === 'today'
                  ? 'border-rose-600 text-rose-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>Today&apos;s Hearings</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-rose-100 text-rose-800">
                {todayHearings.length}
              </span>
            </button>

            <button
              onClick={() => setFilterTab('upcoming')}
              className={`pb-2 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
                filterTab === 'upcoming'
                  ? 'border-purple-600 text-purple-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>Upcoming Hearings</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-purple-100 text-purple-800">
                {upcomingHearings.length}
              </span>
            </button>

            <button
              onClick={() => setFilterTab('past')}
              className={`pb-2 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
                filterTab === 'past'
                  ? 'border-slate-800 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>Hearing History ({pastHearings.length})</span>
            </button>

            <button
              onClick={() => setFilterTab('all')}
              className={`pb-2 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
                filterTab === 'all'
                  ? 'border-amber-600 text-amber-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>All ({hearings.length})</span>
            </button>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter Court, Stage, Judge, Notes..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>
      </div>

      {/* Cause List Items */}
      <div id="hearings-cause-list-container" className="space-y-4 printable-surface">
        {filteredHearings.length > 0 ? (
          filteredHearings.map((h) => {
            const linkedCase = cases.find((c) => c.id === h.caseId);
            const linkedClient = linkedCase
              ? clients.find((cl) => cl.id === linkedCase.clientId)
              : null;
            const isToday = h.hearingDate === todayDateStr;

            return (
              <div
                key={h.id}
                className={`bg-white rounded-xl border p-5 transition-all shadow-2xs ${
                  isToday
                    ? 'border-rose-300 ring-1 ring-rose-200 bg-linear-to-r from-white to-rose-50/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`font-bold px-2.5 py-1 rounded text-xs flex items-center gap-1 ${
                          isToday
                            ? 'bg-rose-600 text-white'
                            : 'bg-slate-900 text-amber-300'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>
                          {h.hearingDate} • {h.hearingTime}
                        </span>
                      </span>

                      {linkedCase && (
                        <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                          {linkedCase.caseNumber}
                        </span>
                      )}

                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                        {h.hearingType}
                      </span>

                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                        Status: {h.status}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-base">
                      {linkedCase?.caseTitle || 'Legal Proceeding'}
                    </h3>

                    <div className="text-xs text-slate-600 flex flex-wrap items-center gap-x-4 gap-y-1">
                      <span>
                        <strong>Court:</strong> {h.courtName}
                      </span>
                      <span>
                        <strong>Presiding Judge:</strong> {h.judgeName}
                      </span>
                      {linkedClient && (
                        <span>
                          <strong>Client:</strong> {linkedClient.name} ({linkedClient.mobile})
                        </span>
                      )}
                    </div>

                    {/* Notes & Court Order */}
                    {h.lawyerNotes && (
                      <div className="text-xs text-slate-700 bg-amber-50/60 p-2.5 rounded-lg border border-amber-200">
                        <strong className="text-amber-900">Advocate Notes / Strategy:</strong> {h.lawyerNotes}
                      </div>
                    )}

                    {h.courtOrder && (
                      <div className="text-xs text-slate-700 bg-blue-50/60 p-2.5 rounded-lg border border-blue-200">
                        <strong className="text-blue-900">Court Order / Proceeding:</strong> {h.courtOrder}
                      </div>
                    )}

                    <div className="text-xs text-slate-500 font-medium">
                      Next Proposed Action: <strong className="text-slate-800">{h.nextAction}</strong>
                    </div>
                  </div>

                  {/* Actions Right Column */}
                  <div className="flex flex-wrap md:flex-col items-start md:items-end justify-between gap-2 shrink-0">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          onOpenShareModal({
                            title: 'Court Hearing Scheduled Notice',
                            type: 'hearing',
                            clientName: linkedClient?.name,
                            clientMobile: linkedClient?.mobile,
                            clientEmail: linkedClient?.email,
                            caseNumber: linkedCase?.caseNumber,
                            courtName: h.courtName,
                            hearingDate: h.hearingDate,
                            hearingTime: h.hearingTime,
                            extraNotes: h.lawyerNotes,
                          });
                        }}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-2xs transition-colors"
                        title="Share on WhatsApp (Section 13)"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </button>

                      {linkedCase && (
                        <button
                          onClick={() => {
                            setSelectedCaseId(linkedCase.id);
                            setActiveView('cases');
                          }}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors"
                        >
                          Dossier
                        </button>
                      )}
                    </div>

                    {/* Quick status change buttons */}
                    <div className="flex items-center gap-1.5 mt-2">
                      {h.status === 'Scheduled' && (
                        <>
                          <button
                            onClick={() => handleMarkAttended(h.id)}
                            className="px-2 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 cursor-pointer"
                            title="Mark Hearing Attended in Court"
                          >
                            Mark Attended
                          </button>
                          <button
                            onClick={() => handleAdjourn(h.id)}
                            className="px-2 py-1 text-[11px] font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded border border-amber-200 cursor-pointer"
                            title="Mark Hearing Adjourned"
                          >
                            Adjourn
                          </button>
                        </>
                      )}
                      
                      {/* Edit Hearing (Available to Admin, Lawyer, and Clerk for Tareekh Peshi updates) */}
                      <button
                        onClick={() => onOpenHearingModal(h)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                        title="Update Hearing / Tareekh Peshi"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Hearing (Admin Only) */}
                      {currentRole === 'admin' && (
                        <button
                          onClick={() => {
                            if (window.confirm('Kya aap yeh hearing record delete karna chahte hain?')) {
                              deleteHearing(h.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                          title="Delete Hearing Record (Admin Only)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-12 bg-white rounded-xl border border-slate-200 text-center text-slate-400">
            <CalendarClock className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="font-semibold text-slate-700">Koi hearing record nahi mila.</p>
            <p className="text-xs text-slate-500 mt-1">
              &ldquo;+ Schedule Hearing&rdquo; button daba kar nayi court hearing date register karein.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
