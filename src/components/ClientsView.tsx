import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  FileBadge,
  CalendarClock,
  CreditCard,
  FolderLock,
  Share2,
  Printer,
  Edit2,
  Trash2,
  ArrowLeft,
  ChevronRight,
  ShieldAlert,
  UserCheck,
  CheckCircle2,
  Clock,
  Building,
  BadgeCheck,
  Eye,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Client, LegalServiceRecord, DocumentItem } from '../types';
import { ShareData } from './ShareModal';
import { ServiceSlipModal } from './modals/ServiceSlipModal';
import { DocumentViewerModal } from './modals/DocumentViewerModal';
import { ClientDossierModal } from './modals/ClientDossierModal';

interface ClientsViewProps {
  onOpenClientModal: (clientToEdit?: Client) => void;
  onOpenShareModal: (data: ShareData) => void;
}

export const ClientsView: React.FC<ClientsViewProps> = ({
  onOpenClientModal,
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
    selectedClientId,
    setSelectedClientId,
    setSelectedCaseId,
    deleteClient,
    setActiveView,
    languageMode,
    currentRole,
    currentUser,
  } = useApp();

  const isRoman = languageMode === 'romanUrdu';

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<
    'overview' | 'cases' | 'services' | 'firs' | 'hearings' | 'docs' | 'payments'
  >('overview');

  const [serviceForSlip, setServiceForSlip] = useState<LegalServiceRecord | null>(null);
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [dossierClient, setDossierClient] = useState<Client | null>(null);

  const getClientName = (c: Client) => c.name || c.fullName || 'Unnamed Client';
  const getClientPhone = (c: Client) => c.mobile || c.phone || 'N/A';

  const filteredClients = clients.filter((c) => {
    const name = getClientName(c).toLowerCase();
    const father = (c.fatherOrHusbandName || '').toLowerCase();
    const cnic = c.cnic || '';
    const phone = getClientPhone(c);
    const city = (c.city || '').toLowerCase();
    const q = searchTerm.toLowerCase();

    const matchesSearch =
      name.includes(q) ||
      father.includes(q) ||
      cnic.includes(q) ||
      phone.includes(q) ||
      city.includes(q);

    const matchesType = filterType === 'all' || c.clientType === filterType;

    return matchesSearch && matchesType;
  });

  const selectedClient = clients.find((c) => c.id === selectedClientId);

  // Client-specific related records
  const clientCases = selectedClient ? cases.filter((c) => c.clientId === selectedClient.id) : [];
  const clientServices = selectedClient ? services.filter((s) => s.clientId === selectedClient.id) : [];
  const clientFirs = selectedClient ? firs.filter((f) => f.relatedClientId === selectedClient.id) : [];
  const clientCaseIds = clientCases.map((c) => c.id);
  const clientHearings = hearings.filter((h) => clientCaseIds.includes(h.caseId) || h.clientId === selectedClient?.id);
  const clientDocs = documents.filter((d) => d.clientId === selectedClient?.id || (d.caseId && clientCaseIds.includes(d.caseId)));
  const clientPayments = payments.filter((p) => p.clientId === selectedClient?.id);

  const totalFee = clientPayments.reduce((acc, p) => acc + p.totalFee, 0) + clientServices.reduce((acc, s) => acc + s.totalFee, 0);
  const paidFee = clientPayments.reduce((acc, p) => acc + p.paidAmount, 0) + clientServices.reduce((acc, s) => acc + s.paidAmount, 0);
  const remainingFee = clientPayments.reduce((acc, p) => acc + p.remainingAmount, 0) + clientServices.reduce((acc, s) => acc + s.remainingAmount, 0);

  // Detail View for a single client
  if (selectedClient) {
    const cName = getClientName(selectedClient);
    const cPhone = getClientPhone(selectedClient);

    return (
      <div className="p-3 sm:p-5 md:p-8 max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Navigation & Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
          <button
            onClick={() => setSelectedClientId(null)}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors w-fit cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Clients</span>
          </button>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                setDossierClient(selectedClient);
                setIsDossierOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              title="View, print, or download full client dossier PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Download Dossier (PDF)</span>
            </button>
            <button
              onClick={() => {
                onOpenShareModal({
                  title: `Client Dossier: ${cName}`,
                  type: 'case',
                  clientName: cName,
                  clientMobile: cPhone,
                  clientEmail: selectedClient.email,
                  caseNumber: clientCases[0]?.caseNumber,
                  courtName: clientCases[0]?.courtName,
                  extraNotes: `Active Cases: ${clientCases.length} | Legal Services: ${clientServices.length} | Balance Due: PKR ${remainingFee.toLocaleString()}`,
                });
              }}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share on WhatsApp</span>
            </button>
            {currentRole !== 'clerk' && (
              <button
                onClick={() => onOpenClientModal(selectedClient)}
                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Client</span>
              </button>
            )}
          </div>
        </div>

        {/* Client Master Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 relative">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-950 font-bold flex items-center justify-center text-xl shrink-0 border border-emerald-300 shadow-inner">
                {cName
                  .split(' ')
                  .map((n: string) => n[0])
                  .slice(0, 2)
                  .join('')}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                    {cName}
                  </h1>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 font-mono">
                    CNIC: {selectedClient.cnic}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                    {selectedClient.clientType}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  S/o or W/o: <strong className="text-slate-800">{selectedClient.fatherOrHusbandName}</strong> • Occupation: {selectedClient.occupation || 'N/A'} • DOB: {selectedClient.dob || 'N/A'}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-600">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <strong>{cPhone}</strong>
                  </span>
                  {selectedClient.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-blue-600" />
                      {selectedClient.email}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-600" />
                    {selectedClient.address}, {selectedClient.city}
                  </span>
                </div>
              </div>
            </div>

            {/* Financial Ledger Quick Pill */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs shrink-0 flex items-center gap-4">
              <div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Total Agreed Fee</div>
                <div className="font-bold text-slate-900 text-sm">PKR {totalFee.toLocaleString()}</div>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Paid Amount</div>
                <div className="font-bold text-emerald-700 text-sm">PKR {paidFee.toLocaleString()}</div>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Balance Due</div>
                <div className="font-bold text-amber-700 text-sm">PKR {remainingFee.toLocaleString()}</div>
              </div>
            </div>
          </div>

          {selectedClient.notes && (
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600 bg-amber-50/40 p-2.5 rounded-lg border border-amber-100">
              <strong className="text-amber-900">Lawyer Chamber Notes:</strong> {selectedClient.notes}
            </div>
          )}
        </div>

        {/* Related Records Tabs */}
        <div className="no-print">
          <div className="flex border-b border-slate-200 gap-2 overflow-x-auto text-xs font-semibold">
            {[
              { id: 'overview', label: 'Overview & History', count: null },
              { id: 'cases', label: 'Cases', count: clientCases.length },
              { id: 'services', label: 'Legal Services (FBR/Police)', count: clientServices.length },
              { id: 'firs', label: 'FIR Records', count: clientFirs.length },
              { id: 'hearings', label: 'Court Hearings', count: clientHearings.length },
              { id: 'docs', label: 'Documents', count: clientDocs.length },
              { id: 'payments', label: 'Fee Payments', count: clientPayments.length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3 px-3 border-b-2 font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== null && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700 font-mono">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recent Cases */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-emerald-600" />
                  <span>Linked Cases ({clientCases.length})</span>
                </h3>
              </div>
              <div className="space-y-3">
                {clientCases.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      setSelectedCaseId(c.id);
                      setActiveView('cases');
                    }}
                    className="p-3 border border-slate-200 hover:border-emerald-400 rounded-xl cursor-pointer hover:bg-emerald-50/20 transition-all text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded">
                        {c.caseNumber}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-800">
                        {c.status}
                      </span>
                    </div>
                    <div className="font-semibold text-slate-900 mt-1">{c.caseTitle}</div>
                    <div className="text-slate-500 text-[11px] mt-0.5">
                      Court: {c.courtName} • Year: {c.caseYear}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chamber Legal Services */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <BadgeCheck className="w-4 h-4 text-teal-600" />
                  <span>Legal & Administrative Services ({clientServices.length})</span>
                </h3>
                <button
                  onClick={() => setActiveView('services')}
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                >
                  Manage Hub →
                </button>
              </div>
              <div className="space-y-3">
                {clientServices.length > 0 ? (
                  clientServices.map((s) => (
                    <div
                      key={s.id}
                      className="p-3 border border-slate-200 rounded-xl text-xs bg-slate-50/50 flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900">{s.tokenOrChallanNo}</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800">
                            {s.category}
                          </span>
                        </div>
                        <p className="font-bold text-slate-800 mt-1">{s.serviceTitle}</p>
                        <p className="text-[11px] text-slate-500">Dept: {s.department} • Status: {s.status}</p>
                      </div>
                      <button
                        onClick={() => setServiceForSlip(s)}
                        className="px-2 py-1 bg-emerald-600 text-white rounded text-[11px] font-semibold flex items-center gap-1"
                      >
                        <Printer className="w-3 h-3" />
                        Slip
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-slate-400 text-xs">
                    No active legal services for this client.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'services' && (
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-sm">
                Legal & Administrative Services for {cName}
              </h3>
              <button
                onClick={() => setActiveView('services')}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Book New Service
              </button>
            </div>
            <div className="grid gap-3">
              {clientServices.length > 0 ? (
                clientServices.map((s) => (
                  <div
                    key={s.id}
                    className="p-4 border border-slate-200 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold px-2 py-0.5 rounded bg-slate-900 text-emerald-300">
                          Ref: {s.tokenOrChallanNo}
                        </span>
                        <span className="font-bold text-slate-900 text-sm">{s.serviceTitle}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-100 text-teal-800">
                          {s.status}
                        </span>
                      </div>
                      <div className="text-slate-500 mt-1">
                        Category: {s.category} • Department: {s.department} • Filing Date: {s.applicationDate}
                      </div>
                      <div className="text-[11px] text-slate-600 mt-0.5">
                        Agreed Fee: PKR {s.totalFee.toLocaleString()} | Balance: PKR {s.remainingAmount.toLocaleString()}
                      </div>
                    </div>
                    <button
                      onClick={() => setServiceForSlip(s)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold flex items-center gap-1.5 shrink-0"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Clearance Slip</span>
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Is client ke zimmay koi service record nahi hai. Nayi service add karne ke liye Services Hub par jayein.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'cases' && (
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
            <h3 className="font-bold text-slate-900 text-sm mb-4">All Cases for {cName}</h3>
            <div className="grid gap-3">
              {clientCases.map((c) => (
                <div
                  key={c.id}
                  onClick={() => {
                    setSelectedCaseId(c.id);
                    setActiveView('cases');
                  }}
                  className="p-4 border border-slate-200 hover:border-emerald-400 rounded-xl cursor-pointer hover:bg-slate-50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold px-2 py-0.5 rounded bg-slate-900 text-emerald-300">
                        {c.caseNumber}
                      </span>
                      <span className="font-bold text-slate-900 text-sm">{c.caseTitle}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                        {c.status}
                      </span>
                    </div>
                    <div className="text-slate-500 mt-1">
                      Type: {c.caseType} • Court: {c.courtName} • Judge: {c.judgeName}
                    </div>
                    {c.firNumber && (
                      <div className="text-rose-700 font-semibold mt-0.5">Linked FIR: {c.firNumber}</div>
                    )}
                  </div>
                  <button className="text-emerald-700 font-semibold flex items-center gap-1 shrink-0">
                    <span>View Case File</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'firs' && (
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
            <h3 className="font-bold text-slate-900 text-sm mb-4">FIR Records Linked to Client</h3>
            <div className="grid gap-3">
              {clientFirs.length > 0 ? (
                clientFirs.map((f) => (
                  <div key={f.id} className="p-4 border border-rose-200 bg-rose-50/30 rounded-xl text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-sm text-rose-800">
                        FIR No. {f.firNumber} ({f.firYear})
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-200 text-rose-900">
                        {f.status}
                      </span>
                    </div>
                    <div className="mt-1 text-slate-700">
                      <strong>Police Station:</strong> {f.policeStation}, {f.district}
                    </div>
                    <div className="mt-0.5 text-slate-800 font-mono">
                      <strong>Sections:</strong> {f.sections}
                    </div>
                    <p className="text-slate-600 mt-1">{f.description}</p>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-400">
                  Is client ke khilaf koi FIR record dakhil nahi hai.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'docs' && (
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
            <h3 className="font-bold text-slate-900 text-sm mb-4">Uploaded Legal Documents & History</h3>
            {clientDocs.length === 0 ? (
              <div className="text-xs text-slate-400 italic py-6 text-center">
                No documents found for this client.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {clientDocs.map((d) => (
                  <div
                    key={d.id}
                    onClick={() => setPreviewDoc(d)}
                    className="p-3 border border-slate-200 rounded-xl text-xs hover:border-cyan-400 hover:bg-slate-50 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 group-hover:text-cyan-800 truncate">{d.name}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {d.format}
                      </span>
                    </div>
                    <div className="text-slate-500 mt-1">Type: {d.type}</div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1 pt-1 border-t border-slate-100">
                      <span>{d.fileSize} • {d.uploadDate}</span>
                      <span className="text-cyan-700 font-semibold flex items-center gap-0.5">
                        <Eye className="w-3 h-3" />
                        <span>Preview</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
            <h3 className="font-bold text-slate-900 text-sm mb-4">Fee Receipts & Ledger</h3>
            <div className="divide-y divide-slate-100">
              {clientPayments.map((p) => (
                <div key={p.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900">{p.receiptNumber}</div>
                    <div className="text-slate-500">
                      Method: {p.paymentMethod} • Date: {p.paymentDate}
                    </div>
                    <div className="text-slate-600 text-[11px] mt-0.5">{p.notes}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-emerald-700 text-sm">
                      PKR {p.paidAmount.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Remaining: PKR {p.remainingAmount.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal for Service Slip */}
        <ServiceSlipModal
          isOpen={!!serviceForSlip}
          onClose={() => setServiceForSlip(null)}
          service={serviceForSlip}
        />

        {/* Client Master Dossier Modal (Print & PDF) */}
        {dossierClient && (
          <ClientDossierModal
            isOpen={isDossierOpen}
            onClose={() => {
              setIsDossierOpen(false);
              setDossierClient(null);
            }}
            client={dossierClient}
            cases={cases.filter((c) => c.clientId === dossierClient.id)}
            services={services.filter((s) => s.clientId === dossierClient.id)}
            firs={firs.filter((f) => f.relatedClientId === dossierClient.id)}
            hearings={hearings.filter((h) => {
              const cIds = cases.filter((c) => c.clientId === dossierClient.id).map((c) => c.id);
              return cIds.includes(h.caseId) || h.clientId === dossierClient.id;
            })}
            documents={documents.filter((d) => {
              const cIds = cases.filter((c) => c.clientId === dossierClient.id).map((c) => c.id);
              return d.clientId === dossierClient.id || (d.caseId && cIds.includes(d.caseId));
            })}
            payments={payments.filter((p) => p.clientId === dossierClient.id)}
          />
        )}
      </div>
    );
  }

  // List View
  return (
    <div className="p-3 sm:p-5 md:p-8 max-w-7xl mx-auto space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-600" />
            <span>Client Management Directory</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            {isRoman
              ? 'Complete client profiles, CNIC verification, cases, services, hearings aur payment history'
              : 'Registered clients directory, advocate files, legal services, and full litigation histories'}
          </p>
        </div>

        <button
          id="btn-add-new-client"
          onClick={() => onOpenClientModal()}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs md:text-sm font-semibold flex items-center gap-1.5 shadow-xs transition-all w-fit active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ New Client</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Name, CNIC, Phone, City..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <span className="text-xs text-slate-400 font-medium">Type:</span>
          {['all', 'Individual', 'Corporate', 'Government'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors cursor-pointer ${
                filterType === type
                  ? 'bg-emerald-800 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Clients Table / Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map((client) => {
          const cName = getClientName(client);
          const cPhone = getClientPhone(client);
          const clientCasesCount = cases.filter((c) => c.clientId === client.id).length;
          const clientServicesCount = services.filter((s) => s.clientId === client.id).length;
          const clientFirsCount = firs.filter((f) => f.relatedClientId === client.id).length;

          return (
            <div
              key={client.id}
              onClick={() => setSelectedClientId(client.id)}
              className="bg-white rounded-xl border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all p-5 cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-950 font-bold flex items-center justify-center text-sm shrink-0 border border-emerald-200">
                      {cName
                        .split(' ')
                        .map((n: string) => n[0])
                        .slice(0, 2)
                        .join('')}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors">
                        {cName}
                      </h3>
                      <p className="text-[11px] text-slate-500">S/o: {client.fatherOrHusbandName}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-semibold border border-blue-200">
                    {client.cnic}
                  </span>
                </div>

                <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{cPhone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span className="truncate">{client.city} • {client.address}</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 flex items-center gap-1 font-medium">
                    <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
                    <strong>{clientCasesCount}</strong> Cases
                  </span>
                  <span className="text-slate-500 flex items-center gap-1 font-medium">
                    <BadgeCheck className="w-3.5 h-3.5 text-teal-600" />
                    <strong>{clientServicesCount}</strong> Services
                  </span>
                  {clientFirsCount > 0 && (
                    <span className="text-rose-700 font-semibold flex items-center gap-1">
                      <FileBadge className="w-3.5 h-3.5" />
                      {clientFirsCount} FIR
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-3 pt-2 flex items-center justify-between text-[11px] border-t border-slate-100">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDossierClient(client);
                    setIsDossierOpen(true);
                  }}
                  className="inline-flex items-center gap-1 text-slate-600 hover:text-emerald-700 font-semibold px-2 py-1 rounded hover:bg-emerald-50 transition-colors"
                  title="Direct Dossier Print or PDF"
                >
                  <Printer className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Dossier PDF</span>
                </button>

                <div className="flex items-center gap-1 text-emerald-700 font-semibold group-hover:translate-x-0.5 transition-transform">
                  <span>View Full Record →</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <DocumentViewerModal
        isOpen={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        documentItem={previewDoc}
      />

      {/* Client Master Dossier Modal (Print & PDF) */}
      {dossierClient && (
        <ClientDossierModal
          isOpen={isDossierOpen}
          onClose={() => {
            setIsDossierOpen(false);
            setDossierClient(null);
          }}
          client={dossierClient}
          cases={cases.filter((c) => c.clientId === dossierClient.id)}
          services={services.filter((s) => s.clientId === dossierClient.id)}
          firs={firs.filter((f) => f.relatedClientId === dossierClient.id)}
          hearings={hearings.filter((h) => {
            const cIds = cases.filter((c) => c.clientId === dossierClient.id).map((c) => c.id);
            return cIds.includes(h.caseId) || h.clientId === dossierClient.id;
          })}
          documents={documents.filter((d) => {
            const cIds = cases.filter((c) => c.clientId === dossierClient.id).map((c) => c.id);
            return d.clientId === dossierClient.id || (d.caseId && cIds.includes(d.caseId));
          })}
          payments={payments.filter((p) => p.clientId === dossierClient.id)}
        />
      )}
    </div>
  );
};
