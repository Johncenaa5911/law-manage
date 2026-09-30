import React from 'react';
import { X, Printer, Download, User, Phone, Mail, MapPin, Scale, Briefcase, BadgeCheck, FileBadge, CalendarClock, CreditCard, ShieldCheck } from 'lucide-react';
import { Client, Case, LegalServiceRecord, FIRRecord, Hearing, DocumentItem, PaymentRecord } from '../../types';
import { useApp } from '../../context/AppContext';
import { printElement } from '../../utils/printHelper';

interface ClientDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client;
  cases: Case[];
  services: LegalServiceRecord[];
  firs: FIRRecord[];
  hearings: Hearing[];
  documents: DocumentItem[];
  payments: PaymentRecord[];
}

export const ClientDossierModal: React.FC<ClientDossierModalProps> = ({
  isOpen,
  onClose,
  client,
  cases,
  services,
  firs,
  hearings,
  documents,
  payments,
}) => {
  const { currentUser, currentFirm } = useApp();

  if (!isOpen) return null;

  const clientName = client.fullName || (client as any).name || 'N/A';
  const clientPhone = client.phone || (client as any).mobile || 'N/A';

  const totalCaseFee = payments.reduce((acc, p) => acc + (p.totalFee || 0), 0);
  const paidCaseFee = payments.reduce((acc, p) => acc + (p.paidAmount || 0), 0);
  const totalServiceFee = services.reduce((acc, s) => acc + (s.totalFee || 0), 0);
  const paidServiceFee = services.reduce((acc, s) => acc + (s.paidAmount || 0), 0);

  const grandTotalFee = totalCaseFee + totalServiceFee;
  const grandPaidFee = paidCaseFee + paidServiceFee;
  const grandRemainingFee = Math.max(0, grandTotalFee - grandPaidFee);

  const chamberTitle =
    currentUser.dossierTitle ||
    currentFirm?.dossierTitle ||
    (currentUser.firmName
      ? currentUser.firmName.toUpperCase()
      : currentUser.name
      ? `CHAMBER OF ADVOCATE ${currentUser.name.toUpperCase()}`
      : 'OFFICIAL LEGAL CHAMBER');

  const courtDesignation =
    currentUser.courtEnrollment
      ? currentUser.courtEnrollment.toUpperCase()
      : 'ADVOCATES HIGH COURT & SUPREME COURT OF PAKISTAN';

  const chamberContactLine =
    [
      currentUser.chamberAddress || currentFirm?.officeAddress,
      currentUser.phone ? `Ph: ${currentUser.phone}` : currentFirm?.phone ? `Ph: ${currentFirm.phone}` : '',
      currentUser.email ? `Email: ${currentUser.email}` : currentFirm?.email ? `Email: ${currentFirm.email}` : '',
    ]
      .filter(Boolean)
      .join(' • ') || 'High Court Bar Association • District & Sessions Courts';

  const handlePrintOrPdf = () => {
    printElement('client-dossier-printable-surface', `Client-Dossier-${client.cnic || clientName}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-200 my-auto print:shadow-none print:border-none print:w-full print:max-w-none print:rounded-none">
        
        {/* Modal Top Bar - Hidden in Print */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between no-print">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">
                Complete Client Dossier (مکمل موکل فائل و ریکارڈ)
              </h3>
              <p className="text-[11px] text-slate-400">
                {chamberTitle} • Direct Printable & Save as PDF
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintOrPdf}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              title="Click to print or save as PDF via your browser's Print dialog"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Surface (Standard Law Chamber Dossier) */}
        <div
          id="client-dossier-printable-surface"
          className="p-6 md:p-10 font-serif text-slate-900 print:p-0 printable-surface bg-white"
        >
          {/* Law Chamber Header */}
          <div className="border-b-2 border-slate-900 pb-5 mb-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Scale className="w-6 h-6 text-slate-900" />
              <h1 className="text-2xl font-bold tracking-tight uppercase font-serif text-slate-950">
                {chamberTitle}
              </h1>
            </div>
            <p className="text-xs uppercase font-sans tracking-widest text-slate-700 font-semibold">
              {courtDesignation}
            </p>
            <p className="text-[11px] font-sans text-slate-600 mt-1">
              {chamberContactLine}
            </p>
            <div className="mt-3 inline-block px-4 py-1 bg-slate-100 border border-slate-400 rounded-sm font-sans font-bold text-xs uppercase tracking-wider text-slate-900">
              OFFICIAL CLIENT MASTER DOSSIER (مفصل موکل انکوائری رپورٹ)
            </div>
          </div>

          {/* Client Identity & Bio Card */}
          <div className="font-sans mb-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2 border-b border-slate-200 pb-1 flex items-center justify-between">
              <span>Client Personal Profile & Particulars</span>
              <span className="font-mono text-[10px] text-slate-500 font-normal">
                Generated: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 border border-slate-300 p-3.5 rounded-md text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Full Legal Name</span>
                <span className="font-bold text-slate-900 text-sm">{clientName}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Father / Husband Name</span>
                <span className="font-semibold text-slate-800">{client.fatherOrHusbandName || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">CNIC / Identity No</span>
                <span className="font-mono font-bold text-slate-900">{client.cnic || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Client Category</span>
                <span className="font-semibold text-slate-800">{client.clientType || 'Regular Individual'}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Mobile Contact</span>
                <span className="font-mono font-semibold text-slate-900">{clientPhone}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Email Address</span>
                <span className="text-slate-800 truncate block">{client.email || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Occupation / Profession</span>
                <span className="text-slate-800">{client.occupation || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">City / Jurisdiction</span>
                <span className="text-slate-800 font-semibold">{client.city || 'Lahore'}</span>
              </div>
              <div className="col-span-2 md:col-span-4 mt-1 pt-1 border-t border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 inline-block mr-2">Permanent Address:</span>
                <span className="text-slate-800">{client.address || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Cumulative Financial Summary */}
          <div className="font-sans mb-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2 border-b border-slate-200 pb-1">
              Consolidated Chamber Fee & Ledger Summary
            </h2>
            <div className="grid grid-cols-3 gap-3 bg-slate-50 border border-slate-300 p-3 rounded-md text-center text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Agreed Fee</span>
                <span className="text-base font-bold text-slate-900 font-mono">
                  PKR {grandTotalFee.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Paid To Date</span>
                <span className="text-base font-bold text-emerald-700 font-mono">
                  PKR {grandPaidFee.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Outstanding Balance Due</span>
                <span className={`text-base font-bold font-mono ${grandRemainingFee > 0 ? 'text-amber-700' : 'text-slate-700'}`}>
                  PKR {grandRemainingFee.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Section: Linked Court Cases */}
          <div className="font-sans mb-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2 border-b border-slate-200 pb-1 flex items-center justify-between">
              <span>Court Cases Under Chamber Representation ({cases.length})</span>
            </h2>
            {cases.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-1">No court litigation cases linked with this client.</p>
            ) : (
              <table className="w-full text-left text-xs border border-slate-300">
                <thead className="bg-slate-100 border-b border-slate-300 text-[11px] font-bold text-slate-700">
                  <tr>
                    <th className="p-2">Case No</th>
                    <th className="p-2">Case Title</th>
                    <th className="p-2">Court & Judge</th>
                    <th className="p-2">Client Role</th>
                    <th className="p-2">Current Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {cases.map((c) => (
                    <tr key={c.id}>
                      <td className="p-2 font-mono font-bold text-slate-900">{c.caseNumber}</td>
                      <td className="p-2 font-semibold text-slate-900">{c.caseTitle}</td>
                      <td className="p-2 text-slate-700">{c.courtName} ({c.judgeName})</td>
                      <td className="p-2 text-slate-800">{c.clientRole}</td>
                      <td className="p-2 font-bold text-slate-900">{c.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Section: Legal & Corporate Services */}
          <div className="font-sans mb-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2 border-b border-slate-200 pb-1 flex items-center justify-between">
              <span>Legal Services, FBR, Police & Corporate Registrations ({services.length})</span>
            </h2>
            {services.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-1">No administrative or legal services recorded.</p>
            ) : (
              <table className="w-full text-left text-xs border border-slate-300">
                <thead className="bg-slate-100 border-b border-slate-300 text-[11px] font-bold text-slate-700">
                  <tr>
                    <th className="p-2">Token / Ref #</th>
                    <th className="p-2">Service Title</th>
                    <th className="p-2">Department / Authority</th>
                    <th className="p-2">Status</th>
                    <th className="p-2 text-right">Fee Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {services.map((s) => (
                    <tr key={s.id}>
                      <td className="p-2 font-mono font-bold text-slate-900">{s.tokenOrChallanNo}</td>
                      <td className="p-2 font-semibold text-slate-900">{s.serviceTitle}</td>
                      <td className="p-2 text-slate-700">{s.department}</td>
                      <td className="p-2 font-semibold text-emerald-800">{s.status}</td>
                      <td className="p-2 text-right font-mono">
                        PKR {s.paidAmount.toLocaleString()} / {s.totalFee.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Section: FIR & Police Station Clearances */}
          {firs.length > 0 && (
            <div className="font-sans mb-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2 border-b border-slate-200 pb-1">
                Police Station FIRs & Criminal Proceedings ({firs.length})
              </h2>
              <table className="w-full text-left text-xs border border-slate-300">
                <thead className="bg-slate-100 border-b border-slate-300 text-[11px] font-bold text-slate-700">
                  <tr>
                    <th className="p-2">FIR Number</th>
                    <th className="p-2">Police Station</th>
                    <th className="p-2">Sections / Offences</th>
                    <th className="p-2">Registration Date</th>
                    <th className="p-2">Current Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {firs.map((f) => (
                    <tr key={f.id}>
                      <td className="p-2 font-mono font-bold text-slate-900">{f.firNumber}</td>
                      <td className="p-2 font-semibold text-slate-900">{f.policeStation} ({f.district})</td>
                      <td className="p-2 text-slate-800">{f.sections || (f as any).offencesOrSections || 'N/A'}</td>
                      <td className="p-2 text-slate-700">{f.firDate || (f as any).registrationDate || 'N/A'}</td>
                      <td className="p-2 font-bold text-rose-800">{f.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Section: Court Hearings Record */}
          {hearings.length > 0 && (
            <div className="font-sans mb-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2 border-b border-slate-200 pb-1">
                Scheduled Court Hearings & Cause List History ({hearings.length})
              </h2>
              <table className="w-full text-left text-xs border border-slate-300">
                <thead className="bg-slate-100 border-b border-slate-300 text-[11px] font-bold text-slate-700">
                  <tr>
                    <th className="p-2">Hearing Date</th>
                    <th className="p-2">Hearing Type</th>
                    <th className="p-2">Presiding Judge</th>
                    <th className="p-2">Court Order / Direction</th>
                    <th className="p-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {hearings.map((h) => (
                    <tr key={h.id}>
                      <td className="p-2 font-mono font-bold text-slate-900">{h.hearingDate}</td>
                      <td className="p-2 font-semibold text-slate-900">{h.hearingType}</td>
                      <td className="p-2 text-slate-700">{h.judgeName}</td>
                      <td className="p-2 text-slate-800">{h.courtOrder || 'Awaiting Order'}</td>
                      <td className="p-2 font-bold text-slate-900">{h.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Chamber Notes */}
          {client.notes && (
            <div className="font-sans mb-6 p-3 bg-amber-50/60 border border-amber-300 rounded text-xs">
              <span className="font-bold text-amber-950 block mb-0.5">Advocate Confidential File Notes:</span>
              <p className="text-slate-800">{client.notes}</p>
            </div>
          )}

          {/* Official Seal and Signatures */}
          <div className="font-sans mt-10 pt-8 border-t-2 border-slate-900 grid grid-cols-2 gap-8 text-xs">
            <div>
              <p className="font-semibold text-slate-900">VERIFIED & COMPILED BY:</p>
              <div className="mt-8 border-t border-slate-400 pt-1 text-slate-600">
                Chamber In-Charge / Associate Advocate
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-slate-900">SENIOR ADVOCATE SIGNATURE & SEAL:</p>
              <div className="mt-8 border-t border-slate-400 pt-1 text-slate-600">
                Malik & Associates Law Chamber
              </div>
            </div>
          </div>

          <div className="text-center text-[10px] font-sans text-slate-400 mt-6 pt-2 border-t border-slate-200">
            This confidential legal document is intended solely for client briefing and internal court chamber usage.
          </div>
        </div>

      </div>
    </div>
  );
};
