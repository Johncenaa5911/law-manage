import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  ChevronLeft,
  ChevronRight,
  Gavel,
  Briefcase,
  Share2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ShareData } from './ShareModal';

interface CalendarViewProps {
  onOpenShareModal: (data: ShareData) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ onOpenShareModal }) => {
  const { hearings, cases, clients, todayDateStr, setSelectedCaseId, setActiveView } = useApp();

  // Selected date filter
  const [selectedDate, setSelectedDate] = useState<string>(todayDateStr);

  const datesWithHearings = Array.from(new Set(hearings.map((h) => h.hearingDate))).sort();

  const selectedDateHearings = hearings.filter((h) => h.hearingDate === selectedDate);

  return (
    <div className="p-3 sm:p-5 md:p-8 max-w-7xl mx-auto space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <CalendarIcon className="w-6 h-6 text-purple-600" />
          <span>Court Diary & Hearing Calendar</span>
        </h1>
        <p className="text-xs md:text-sm text-slate-500 mt-0.5">
          Schedule and cause list mapped across courts and benches
        </p>
      </div>

      {/* Date Ribbon */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Dates with Active Court Proceedings:
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {datesWithHearings.map((d) => {
            const count = hearings.filter((h) => h.hearingDate === d).length;
            const isToday = d === todayDateStr;
            const isSelected = d === selectedDate;
            return (
              <button
                key={d}
                onClick={() => setSelectedDate(d)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 border ${
                  isSelected
                    ? 'bg-purple-700 text-white border-purple-800 shadow-xs'
                    : isToday
                    ? 'bg-rose-50 text-rose-800 border-rose-300'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <span>{d}</span>
                {isToday && (
                  <span className="text-[10px] bg-rose-200 text-rose-900 px-1.5 py-0.2 rounded font-mono">
                    Today
                  </span>
                )}
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/10 font-mono">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Daily Diary List */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 text-sm">Cause List for:</span>
            <span className="font-mono font-bold text-sm text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
              {selectedDate}
            </span>
          </div>
          <span className="text-xs text-slate-500">{selectedDateHearings.length} Proceedings</span>
        </div>

        <div className="space-y-3">
          {selectedDateHearings.length > 0 ? (
            selectedDateHearings.map((h) => {
              const linkedCase = cases.find((c) => c.id === h.caseId);
              const linkedClient = linkedCase ? clients.find((cl) => cl.id === linkedCase.clientId) : null;
              return (
                <div
                  key={h.id}
                  className="p-4 border border-slate-200 rounded-xl hover:border-purple-300 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-100 text-purple-800">
                        {h.hearingTime}
                      </span>
                      <span className="font-mono font-bold text-slate-900">
                        {linkedCase?.caseNumber}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-900">
                        {h.hearingType}
                      </span>
                    </div>
                    <div className="font-bold text-slate-900 text-sm">{linkedCase?.caseTitle}</div>
                    <div className="text-slate-600 flex flex-wrap gap-x-3 text-[11px]">
                      <span>Court: {h.courtName}</span>
                      <span>Judge: {h.judgeName}</span>
                      <span>Client: {linkedClient?.name}</span>
                    </div>
                    {h.lawyerNotes && (
                      <div className="text-[11px] text-slate-500 bg-slate-50 p-1.5 rounded">
                        Note: {h.lawyerNotes}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        onOpenShareModal({
                          title: 'Court Diary Reminder',
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
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg font-semibold flex items-center gap-1"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>WhatsApp Notice</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedCaseId(h.caseId);
                        setActiveView('cases');
                      }}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold"
                    >
                      Dossier
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-slate-400">
              Is tareekh par koi hearing schedule nahi hai.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
