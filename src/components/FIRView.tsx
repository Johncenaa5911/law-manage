import React, { useState } from 'react';
import {
  FileBadge,
  Plus,
  Search,
  FileText,
  User,
  Briefcase,
  Share2,
  Printer,
  Shield,
  MapPin,
  Calendar,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Edit2,
  Trash2,
  ArrowLeft,
  Paperclip,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { FIRRecord, DocumentItem } from '../types';
import { ShareData } from './ShareModal';

interface FIRViewProps {
  onOpenFIRModal: (firToEdit?: FIRRecord) => void;
  onOpenDocModal: (doc?: DocumentItem) => void;
  onOpenShareModal: (data: ShareData) => void;
}

export const FIRView: React.FC<FIRViewProps> = ({
  onOpenFIRModal,
  onOpenDocModal,
  onOpenShareModal,
}) => {
  const {
    firs,
    cases,
    clients,
    documents,
    selectedFirId,
    setSelectedFirId,
    setSelectedCaseId,
    setSelectedClientId,
    deleteFIR,
    deleteDocument,
    setActiveView,
    languageMode,
    currentRole,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [stationFilter, setStationFilter] = useState('all');

  const selectedFir = firs.find((f) => f.id === selectedFirId);
  const linkedCase = selectedFir?.relatedCaseId
    ? cases.find((c) => c.id === selectedFir.relatedCaseId)
    : null;
  const linkedClient = selectedFir?.relatedClientId
    ? clients.find((cl) => cl.id === selectedFir.relatedClientId)
    : linkedCase
    ? clients.find((cl) => cl.id === linkedCase.clientId)
    : null;
  const firDocs = selectedFir
    ? documents.filter((d) => d.firId === selectedFir.id || d.type === 'FIR Copy')
    : [];

  const policeStations = Array.from(new Set(firs.map((f) => f.policeStation)));

  const filteredFirs = firs.filter((f) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      f.firNumber.toLowerCase().includes(q) ||
      f.policeStation.toLowerCase().includes(q) ||
      f.sections.toLowerCase().includes(q) ||
      f.complainant.toLowerCase().includes(q) ||
      f.accused.toLowerCase().includes(q) ||
      f.investigatingOfficer.toLowerCase().includes(q);

    const matchesStation = stationFilter === 'all' || f.policeStation === stationFilter;
    return matchesSearch && matchesStation;
  });

  // Single FIR Detail View
  if (selectedFir) {
    return (
      <div className="p-3 sm:p-5 md:p-8 max-w-7xl mx-auto space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
          <button
            onClick={() => setSelectedFirId(null)}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All FIR Records</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print FIR Sheet</span>
            </button>
            <button
              onClick={() => {
                onOpenShareModal({
                  title: `FIR Record No. ${selectedFir.firNumber}`,
                  type: 'general',
                  clientName: linkedClient?.name,
                  clientMobile: linkedClient?.mobile,
                  clientEmail: linkedClient?.email,
                  caseNumber: linkedCase?.caseNumber,
                  courtName: linkedCase?.courtName,
                  extraNotes: `FIR No: ${selectedFir.firNumber}/${selectedFir.firYear} | PS: ${selectedFir.policeStation} | Sections: ${selectedFir.sections} | Status: ${selectedFir.status}`,
                });
              }}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Record</span>
            </button>
            <button
              onClick={() => onOpenFIRModal(selectedFir)}
              className="px-3 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Edit FIR details"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit FIR</span>
            </button>

            {currentRole === 'admin' && (
              <button
                onClick={() => {
                  if (window.confirm(`Kya aap FIR No. ${selectedFir.firNumber} delete karna chahte hain?`)) {
                    deleteFIR(selectedFir.id);
                    setSelectedFirId(null);
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Delete FIR Record (Admin Only)"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete FIR</span>
              </button>
            )}
          </div>
        </div>

        {/* Master FIR Header Card */}
        <div className="bg-white rounded-2xl border border-rose-200 shadow-sm p-6 relative">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono font-bold px-3 py-1 rounded bg-rose-700 text-white text-sm">
                  FIR No. {selectedFir.firNumber} / {selectedFir.firYear}
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                  {selectedFir.status}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Date: {selectedFir.firDate}
                </span>
              </div>

              <h1 className="text-xl md:text-2xl font-bold text-slate-900 mt-2 tracking-tight flex items-center gap-2">
                <span>{selectedFir.policeStation}</span>
                <span className="text-slate-400 font-normal text-base">({selectedFir.district})</span>
              </h1>

              <div className="mt-3 p-2.5 rounded-lg bg-rose-50/60 border border-rose-200 text-xs text-rose-950 font-mono">
                <strong>Sections / Offences:</strong> {selectedFir.sections}
              </div>
            </div>

            {/* Linkage card */}
            <div className="space-y-2 shrink-0">
              {linkedCase && (
                <div
                  onClick={() => {
                    setSelectedCaseId(linkedCase.id);
                    setActiveView('cases');
                  }}
                  className="bg-slate-50 hover:bg-amber-50 border border-slate-200 rounded-xl p-3 text-xs cursor-pointer transition-colors"
                >
                  <div className="text-[10px] uppercase font-bold text-slate-400">Linked Case:</div>
                  <div className="font-bold text-slate-900 font-mono mt-0.5">{linkedCase.caseNumber}</div>
                  <div className="text-slate-500 text-[11px] truncate max-w-[200px]">{linkedCase.caseTitle}</div>
                </div>
              )}

              {linkedClient && (
                <div
                  onClick={() => {
                    setSelectedClientId(linkedClient.id);
                    setActiveView('clients');
                  }}
                  className="bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded-xl p-3 text-xs cursor-pointer transition-colors"
                >
                  <div className="text-[10px] uppercase font-bold text-slate-400">Linked Client:</div>
                  <div className="font-bold text-slate-900 mt-0.5">{linkedClient.name}</div>
                  <div className="text-slate-500 text-[11px]">CNIC: {linkedClient.cnic}</div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Complainant (Mudai)</span>
              <strong className="text-slate-900">{selectedFir.complainant}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Accused Persons (Mulzimaan)</span>
              <strong className="text-slate-900">{selectedFir.accused}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Investigating Officer (Tafteesi Officer)</span>
              <strong className="text-slate-900">{selectedFir.investigatingOfficer}</strong>
            </div>
          </div>

          {selectedFir.description && (
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-700">
              <strong className="text-slate-900">FIR Narrative / Ibtidai Ittila:</strong>
              <p className="mt-1 leading-relaxed">{selectedFir.description}</p>
            </div>
          )}
        </div>

        {/* Attached Documents / Copies */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Paperclip className="w-4 h-4 text-rose-600" />
              <span>FIR Copies & Police Reports ({firDocs.length})</span>
            </h3>
            <button
              onClick={() => onOpenDocModal()}
              className="text-xs font-semibold text-rose-700 hover:text-rose-800"
            >
              + Upload Certified Copy
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {firDocs.map((doc) => (
              <div key={doc.id} className="p-3 border border-slate-200 rounded-xl text-xs flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="min-w-0 pr-2">
                  <div className="font-semibold text-slate-900 truncate">{doc.name}</div>
                  <div className="text-[11px] text-slate-500 truncate">{doc.type} • {doc.fileSize}</div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-rose-50 text-rose-800 border border-rose-200">
                    {doc.format}
                  </span>
                  <button
                    type="button"
                    onClick={() => onOpenDocModal(doc)}
                    className="p-1 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded"
                    title="Edit Document"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Delete "${doc.name}"?`)) {
                        deleteDocument(doc.id);
                      }
                    }}
                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                    title="Delete Document"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Master FIR List View
  return (
    <div className="p-3 sm:p-5 md:p-8 max-w-7xl mx-auto space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileBadge className="w-6 h-6 text-rose-600" />
            <span>FIR Management (First Information Report)</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            {languageMode === 'romanUrdu'
              ? 'Police Station, Sections (PPC), Complainant, Accused aur certified documents record'
              : 'Criminal First Information Reports, investigating officers, and case attachments'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print FIR Registry</span>
          </button>
          <button
            id="btn-add-new-fir"
            onClick={() => onOpenFIRModal()}
            className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs md:text-sm font-semibold flex items-center gap-1.5 shadow-xs transition-all w-fit active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ New FIR Record</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search FIR No (125/2024), Police Station, Sections (302 PPC)..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <span className="text-xs text-slate-400 font-medium">Station:</span>
          <button
            onClick={() => setStationFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
              stationFilter === 'all'
                ? 'bg-rose-700 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Stations
          </button>
          {policeStations.map((station) => (
            <button
              key={station}
              onClick={() => setStationFilter(station)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
                stationFilter === station
                  ? 'bg-rose-700 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {station}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of FIRs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFirs.map((f) => (
          <div
            key={f.id}
            onClick={() => setSelectedFirId(f.id)}
            className="bg-white rounded-xl border border-rose-200/80 hover:border-rose-400 hover:shadow-md transition-all p-5 cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-xs px-2.5 py-0.5 rounded bg-rose-700 text-white">
                  FIR No. {f.firNumber}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                  {f.status}
                </span>
              </div>

              <div className="mt-2">
                <h3 className="font-bold text-slate-900 text-sm group-hover:text-rose-800 transition-colors">
                  {f.policeStation}
                </h3>
                <p className="text-[11px] text-slate-500">
                  District {f.district} • Date: {f.firDate}
                </p>
              </div>

              <div className="mt-2.5 p-2 rounded-lg bg-rose-50/50 border border-rose-100 text-xs font-mono text-slate-800 line-clamp-1">
                <strong>Sec:</strong> {f.sections}
              </div>

              <div className="mt-3 text-xs text-slate-600 space-y-1">
                <div className="truncate">
                  Mudai (Complainant): <strong>{f.complainant}</strong>
                </div>
                <div className="truncate">
                  Mulzim (Accused): <strong>{f.accused}</strong>
                </div>
                <div className="text-[11px] text-slate-500">
                  Tafteesi: {f.investigatingOfficer}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-rose-700 font-semibold group-hover:translate-x-1 transition-transform">
              <span>View FIR Details →</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
