import React, { useState } from 'react';
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  CalendarClock,
  FileBadge,
  FolderLock,
  CreditCard,
  Share2,
  Printer,
  Edit2,
  Trash2,
  ArrowLeft,
  ChevronRight,
  ShieldAlert,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  User,
  Building,
  Gavel,
  History,
  Calendar,
  Eye,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Case, CaseStatus, CaseType, CaseTimelineMilestone, DocumentItem } from '../types';
import { ShareData } from './ShareModal';
import { CaseDossierModal } from './modals/CaseDossierModal';
import { DocumentViewerModal } from './modals/DocumentViewerModal';

interface CasesViewProps {
  onOpenCaseModal: (caseToEdit?: Case) => void;
  onOpenHearingModal: () => void;
  onOpenDocModal: (doc?: DocumentItem) => void;
  onOpenShareModal: (data: ShareData) => void;
}

export const CasesView: React.FC<CasesViewProps> = ({
  onOpenCaseModal,
  onOpenHearingModal,
  onOpenDocModal,
  onOpenShareModal,
}) => {
  const {
    cases,
    clients,
    firs,
    hearings,
    documents,
    payments,
    selectedCaseId,
    setSelectedCaseId,
    deleteCase,
    deleteDocument,
    setActiveView,
    setSelectedClientId,
    setSelectedFirId,
    languageMode,
    currentRole,
  } = useApp();

  // Advanced Filters State (Section 20)
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [courtFilter, setCourtFilter] = useState<string>('all');
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [dossierCase, setDossierCase] = useState<Case | null>(null);
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);

  const selectedCase = cases.find((c) => c.id === selectedCaseId);
  const selectedClient = selectedCase ? clients.find((cl) => cl.id === selectedCase.clientId) : null;
  const linkedFir = selectedCase?.firNumber
    ? firs.find((f) => f.firNumber === selectedCase.firNumber)
    : null;
  const caseHearings = selectedCase
    ? hearings.filter((h) => h.caseId === selectedCase.id)
    : [];
  const caseDocs = selectedCase
    ? documents.filter((d) => d.caseId === selectedCase.id)
    : [];
  const casePayments = selectedCase
    ? payments.filter((p) => p.caseId === selectedCase.id)
    : [];

  // Filter options dynamically extracted
  const uniqueCourts = Array.from(new Set(cases.map((c) => c.courtName)));
  const uniqueYears = Array.from(new Set(cases.map((c) => c.caseYear))).sort().reverse();

  // Filter application (Section 20: Advanced Filters)
  const filteredCases = cases.filter((c) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      c.caseTitle.toLowerCase().includes(q) ||
      c.caseNumber.toLowerCase().includes(q) ||
      (c.firNumber && c.firNumber.toLowerCase().includes(q)) ||
      c.courtName.toLowerCase().includes(q) ||
      c.judgeName.toLowerCase().includes(q) ||
      (c.policeStation && c.policeStation.toLowerCase().includes(q)) ||
      c.district.toLowerCase().includes(q) ||
      c.complainant.toLowerCase().includes(q) ||
      c.accused.toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesType = typeFilter === 'all' || c.caseType === typeFilter;
    const matchesCourt = courtFilter === 'all' || c.courtName === courtFilter;
    const matchesYear = yearFilter === 'all' || c.caseYear === yearFilter;

    return matchesSearch && matchesStatus && matchesType && matchesCourt && matchesYear;
  });

  // Dynamic timeline for this case constructed from case filing, hearings, and orders
  const caseMilestones: CaseTimelineMilestone[] = React.useMemo(() => {
    if (!selectedCase) return [];
    const milestones: CaseTimelineMilestone[] = [];

    if (selectedCase.startDate) {
      milestones.push({
        id: `ms-start-${selectedCase.id}`,
        caseId: selectedCase.id,
        date: selectedCase.startDate,
        title: 'Case Filed & Registered',
        description: `Case ${selectedCase.caseNumber} formally instituted in ${selectedCase.courtName} before ${selectedCase.judgeName || 'Honourable Court'}.`,
        badge: 'Filing',
        type: 'filing',
      });
    }

    if (linkedFir) {
      milestones.push({
        id: `ms-fir-${linkedFir.id}`,
        caseId: selectedCase.id,
        date: linkedFir.firDate || selectedCase.startDate,
        title: `Police FIR #${linkedFir.firNumber}`,
        description: `Registered at Thana ${linkedFir.policeStation} under Sections ${linkedFir.sections}. Status: ${linkedFir.status}.`,
        badge: 'Police Record',
        type: 'fir',
      });
    }

    caseHearings.forEach((h) => {
      milestones.push({
        id: `ms-hr-${h.id}`,
        caseId: selectedCase.id,
        date: h.hearingDate,
        title: `Court Proceeding: ${h.hearingType}`,
        description: h.courtOrder
          ? `Order: ${h.courtOrder}`
          : h.lawyerNotes
          ? `Advocate Note: ${h.lawyerNotes}`
          : `Hearing conducted before ${h.judgeName}. Status: ${h.status}.`,
        badge: h.status || 'Hearing',
        type: h.courtOrder ? 'order' : h.hearingType === 'Bail Arguments' ? 'bail' : 'hearing',
      });
    });

    return milestones.sort((a, b) => a.date.localeCompare(b.date));
  }, [selectedCase, linkedFir, caseHearings]);

  // If specific case is selected: Dossier View with Timeline (Section 17)
  if (selectedCase) {
    return (
      <div className="p-3 sm:p-5 md:p-8 max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Navigation & Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
          <button
            onClick={() => setSelectedCaseId(null)}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Cases</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDossierOpen(true)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Dossier</span>
            </button>
            <button
              onClick={() => {
                onOpenShareModal({
                  title: 'Case File Summary',
                  type: 'case',
                  clientName: selectedClient?.fullName || (selectedClient as any)?.name,
                  clientMobile: selectedClient?.phone || (selectedClient as any)?.mobile,
                  clientEmail: selectedClient?.email,
                  caseNumber: selectedCase.caseNumber,
                  courtName: selectedCase.courtName,
                  hearingDate: caseHearings[0]?.hearingDate,
                  extraNotes: `Status: ${selectedCase.status} | Judge: ${selectedCase.judgeName}`,
                });
              }}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp Update</span>
            </button>
            {currentRole !== 'clerk' && (
              <button
                onClick={() => onOpenCaseModal(selectedCase)}
                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Case</span>
              </button>
            )}
          </div>
        </div>

        {/* Case Dossier Master Header */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 relative">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono font-bold px-2.5 py-1 rounded bg-slate-900 text-amber-300 text-sm">
                  {selectedCase.caseNumber}
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                  {selectedCase.status}
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                  {selectedCase.caseType}
                </span>
                {selectedCase.firNumber && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
                    FIR No. {selectedCase.firNumber}
                  </span>
                )}
              </div>

              <h1 className="text-xl md:text-2xl font-bold text-slate-900 mt-2 tracking-tight">
                {selectedCase.caseTitle}
              </h1>

              <div className="mt-2 text-xs text-slate-600 space-y-1">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  <span><strong>Court:</strong> {selectedCase.courtName} ({selectedCase.courtLocation})</span>
                  <span><strong>Judge:</strong> {selectedCase.judgeName}</span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-500">
                  <span><strong>Complainant:</strong> {selectedCase.complainant}</span>
                  <span><strong>Accused:</strong> {selectedCase.accused}</span>
                  <span><strong>Opposite Party:</strong> {selectedCase.oppositeParty}</span>
                </div>
              </div>
            </div>

            {/* Linked Client Box */}
            {selectedClient && (
              <div
                onClick={() => {
                  setSelectedClientId(selectedClient.id);
                  setActiveView('clients');
                }}
                className="bg-slate-50 hover:bg-amber-50/50 border border-slate-200 hover:border-amber-300 rounded-xl p-3 text-xs cursor-pointer transition-colors shrink-0 max-w-xs"
              >
                <div className="text-[10px] uppercase font-bold text-slate-400">Representing Client:</div>
                <div className="font-bold text-slate-900 mt-0.5 text-sm flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  <span>{selectedClient.name}</span>
                </div>
                <div className="text-slate-500 text-[11px] mt-0.5">Role: {selectedCase.clientRole}</div>
                <div className="text-slate-500 text-[11px]">Phone: {selectedClient.mobile}</div>
              </div>
            )}
          </div>

          {selectedCase.description && (
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-700">
              <strong className="text-slate-900">Legal Brief / Summary:</strong> {selectedCase.description}
            </div>
          )}

          {selectedCase.importantNotes && (
            <div className="mt-2 text-xs text-amber-900 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
              <strong>Advocate Strategic Notes:</strong> {selectedCase.importantNotes}
            </div>
          )}
        </div>

        {/* Section 17: Visual Case Timeline */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <History className="w-4 h-4 text-amber-600" />
                <span>Case Timeline & Procedural Milestones (Section 17)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                FIR se lekar First Hearing, Bail Application, Court Orders aur Next Date tak visual history
              </p>
            </div>
          </div>

          <div className="relative pl-6 border-l-2 border-amber-500/40 space-y-6">
            {caseMilestones.length > 0 ? (
              caseMilestones.map((ms, idx) => (
                <div key={ms.id} className="relative group">
                  {/* Dot */}
                  <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-amber-500 border-4 border-white shadow-xs" />

                  <div className="bg-slate-50 hover:bg-amber-50/40 border border-slate-200 rounded-xl p-4 transition-all">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-amber-900 font-mono">
                        {ms.date}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800">
                        {ms.badge}
                      </span>
                    </div>
                    <div className="font-bold text-slate-900 text-sm mt-1">{ms.title}</div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{ms.description}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-500 italic">
                Initial milestones: Case registered on {selectedCase.startDate}. Next hearing scheduled below.
              </div>
            )}
          </div>
        </div>

        {/* Hearings & Documents Sub-Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Hearings in this Case */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-rose-600" />
                <span>Court Hearings ({caseHearings.length})</span>
              </h3>
              <button
                onClick={onOpenHearingModal}
                className="text-xs font-semibold text-amber-700 hover:text-amber-800"
              >
                + Add Hearing
              </button>
            </div>

            <div className="space-y-3">
              {caseHearings.map((h) => (
                <div key={h.id} className="p-3 border border-slate-200 rounded-xl text-xs bg-slate-50/50">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">
                      {h.hearingDate} ({h.hearingTime})
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-100 text-rose-800">
                      {h.status}
                    </span>
                  </div>
                  <div className="text-slate-700 mt-1 font-semibold">{h.hearingType}</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">Judge: {h.judgeName}</div>
                  {h.courtOrder && (
                    <div className="mt-1 text-[11px] text-slate-800 bg-amber-50/80 p-1.5 rounded border border-amber-200">
                      <strong>Order:</strong> {h.courtOrder}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Documents in this Case */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <FolderLock className="w-4 h-4 text-cyan-600" />
                <span>Case Documents ({caseDocs.length})</span>
              </h3>
              <button
                onClick={() => onOpenDocModal()}
                className="text-xs font-semibold text-amber-700 hover:text-amber-800"
              >
                + Upload File
              </button>
            </div>

            <div className="space-y-3">
              {caseDocs.length === 0 ? (
                <div className="text-xs text-slate-400 italic p-3 text-center">
                  No documents attached to this case yet. Click + Upload File above.
                </div>
              ) : (
                caseDocs.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => setPreviewDoc(doc)}
                    className="p-3 border border-slate-200 rounded-xl text-xs flex items-center justify-between hover:bg-slate-50 hover:border-cyan-300 cursor-pointer transition-colors group"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="font-semibold text-slate-900 group-hover:text-cyan-800 flex items-center gap-1.5 truncate">
                        <FileText className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                        <span className="truncate">{doc.name}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                        {doc.type} • {doc.fileSize} • {doc.uploadDate}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
                        {doc.format}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenDocModal(doc);
                        }}
                        className="p-1 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded"
                        title="Edit Document"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Delete "${doc.name}"?`)) {
                            deleteDocument(doc.id);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                        title="Delete Document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-cyan-700 text-xs font-semibold flex items-center gap-0.5 ml-1">
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <DocumentViewerModal
          isOpen={!!previewDoc}
          onClose={() => setPreviewDoc(null)}
          documentItem={previewDoc}
          onEdit={(doc) => {
            setPreviewDoc(null);
            onOpenDocModal(doc);
          }}
          onDelete={(id) => {
            deleteDocument(id);
            setPreviewDoc(null);
          }}
        />

        <CaseDossierModal
          isOpen={isDossierOpen}
          onClose={() => setIsDossierOpen(false)}
          caseItem={selectedCase}
          client={selectedClient || undefined}
          hearings={caseHearings}
          documents={caseDocs}
          payments={casePayments}
        />
      </div>
    );
  }

  // Master Cases Table / Grid View
  return (
    <div className="p-3 sm:p-5 md:p-8 max-w-7xl mx-auto space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-amber-600" />
            <span>Case Management</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            {languageMode === 'romanUrdu'
              ? 'Court cases, FIR linkages, status tracking aur visual timelines'
              : 'Active legal proceedings, High Court and Sessions Court registries'}
          </p>
        </div>

        <button
          id="btn-add-new-case"
          onClick={() => onOpenCaseModal()}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs md:text-sm font-semibold flex items-center gap-1.5 shadow-xs transition-all w-fit active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>+ New Case</span>
        </button>
      </div>

      {/* Advanced Filter Bar (Section 20) */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Case #, Title, FIR #, Police Station, Judge..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-colors ${
                showFilters || statusFilter !== 'all' || typeFilter !== 'all' || courtFilter !== 'all'
                  ? 'bg-amber-50 text-amber-900 border-amber-300'
                  : 'bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Advanced Filters (Section 20)</span>
            </button>
          </div>
        </div>

        {/* Extended Filter Selectors */}
        {showFilters && (
          <div className="pt-3 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Status Filter</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-800 text-xs"
              >
                <option value="all">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Hearing">Hearing</option>
                <option value="Pending">Pending</option>
                <option value="Adjourned">Adjourned</option>
                <option value="Won">Won</option>
                <option value="Lost">Lost</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Case Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-800 text-xs"
              >
                <option value="all">All Case Types</option>
                <option value="Criminal">Criminal</option>
                <option value="Civil">Civil</option>
                <option value="Family">Family</option>
                <option value="Constitutional / Writ">Constitutional / Writ</option>
                <option value="Corporate">Corporate</option>
                <option value="Banking & Recovery">Banking & Recovery</option>
                <option value="NAB / Accountability">NAB / Accountability</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Court Name</label>
              <select
                value={courtFilter}
                onChange={(e) => setCourtFilter(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-800 text-xs"
              >
                <option value="all">All Courts</option>
                {uniqueCourts.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Case Year</label>
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-800 text-xs"
              >
                <option value="all">All Years</option>
                {uniqueYears.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Cases List */}
      <div className="grid gap-3">
        {filteredCases.map((c) => {
          const client = clients.find((cl) => cl.id === c.clientId);
          return (
            <div
              key={c.id}
              onClick={() => setSelectedCaseId(c.id)}
              className="bg-white rounded-xl border border-slate-200 hover:border-amber-400 hover:shadow-md transition-all p-5 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 group"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono font-bold text-xs px-2.5 py-0.5 rounded bg-slate-900 text-amber-300">
                    {c.caseNumber}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                    {c.status}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">Type: {c.caseType}</span>
                  {c.firNumber && (
                    <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                      FIR: {c.firNumber}
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-slate-900 text-sm md:text-base mt-1.5 group-hover:text-amber-700 transition-colors">
                  {c.caseTitle}
                </h3>

                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span>Court: <strong className="text-slate-700">{c.courtName}</strong></span>
                  <span>Judge: {c.judgeName}</span>
                  {c.policeStation && <span>PS: {c.policeStation}</span>}
                  {client && <span>Client: <strong className="text-slate-700">{client.name}</strong></span>}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                <div className="text-right hidden sm:block mr-1">
                  <div className="text-xs font-semibold text-slate-900">Year {c.caseYear}</div>
                  <div className="text-[10px] text-slate-400">Adv: {c.advocateName}</div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDossierCase(c);
                  }}
                  title="Print Official Case Dossier"
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 hover:border-emerald-600 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Print</span>
                  <span>Dossier</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCaseId(c.id);
                  }}
                  className="px-3 py-1.5 bg-slate-100 group-hover:bg-amber-600 group-hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <span>Open File</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Case Dossier Modal for Master List view */}
      {dossierCase && (
        <CaseDossierModal
          isOpen={!!dossierCase}
          onClose={() => setDossierCase(null)}
          caseItem={dossierCase}
          client={clients.find((cl) => cl.id === dossierCase.clientId)}
          hearings={hearings.filter((h) => h.caseId === dossierCase.id)}
          documents={documents.filter((d) => d.caseId === dossierCase.id)}
          payments={payments.filter((p) => p.caseId === dossierCase.id)}
        />
      )}
    </div>
  );
};
