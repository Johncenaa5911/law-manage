import React from 'react';
import { X, Printer, Scale, Calendar, FileText, User, ShieldCheck } from 'lucide-react';
import { Case, Client, Hearing, DocumentItem, PaymentRecord } from '../../types';
import { useApp } from '../../context/AppContext';
import { printElement } from '../../utils/printHelper';

interface CaseDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseItem: Case;
  client?: Client;
  hearings: Hearing[];
  documents: DocumentItem[];
  payments: PaymentRecord[];
}

export const CaseDossierModal: React.FC<CaseDossierModalProps> = ({
  isOpen,
  onClose,
  caseItem,
  client,
  hearings,
  documents,
  payments,
}) => {
  const { currentUser, currentFirm, firs } = useApp();

  if (!isOpen) return null;

  const linkedFir = firs.find(
    (f) => (caseItem.firNumber && f.firNumber === caseItem.firNumber) || f.relatedCaseId === caseItem.id
  );
  const totalPaid = payments.reduce((acc, p) => acc + p.paidAmount, 0);
  const totalAgreedFee = payments.length > 0 ? payments[0].totalFee : 150000;
  const balanceDue = Math.max(0, totalAgreedFee - totalPaid);

  const clientName = client?.fullName || (client as any)?.name || 'N/A';
  const clientPhone = client?.phone || (client as any)?.mobile || 'N/A';

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

  const handlePrint = () => {
    printElement('case-dossier-content', `Case-Dossier-${caseItem.caseNumber}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-200 my-auto print:shadow-none print:border-none print:w-full print:max-w-none print:rounded-none">
        {/* Modal Top Bar - Hidden in Print */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-sm">Official Case Dossier (مقدمہ فائل خلاصہ)</h3>
              <p className="text-[11px] text-slate-400">
                {chamberTitle} • Ready for court presentation or office record
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Dossier (A4)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Surface */}
        <div id="case-dossier-content" className="p-6 md:p-10 font-serif text-slate-900 print:p-0 printable-surface bg-white">
          {/* Chamber Header */}
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
              OFFICIAL CASE DOSSIER & RECORD SUMMARY
            </div>
          </div>

          {/* Master Case Metadata Grid */}
          <div className="font-sans mb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 border border-slate-300 p-3 rounded-md text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Case Number</span>
                <span className="font-bold text-slate-900 text-sm">{caseItem.caseNumber}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Court Name</span>
                <span className="font-semibold text-slate-800">{caseItem.courtName}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Presiding Judge</span>
                <span className="font-semibold text-slate-800">{caseItem.judgeName}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Status</span>
                <span className="font-bold text-slate-900">{caseItem.status}</span>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="border border-slate-300 p-3 rounded-md">
                <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-1 mb-2 uppercase text-[11px] flex items-center justify-between">
                  <span>Client / Represented Party</span>
                  <span className="text-emerald-700">Client ID: {client?.id || 'N/A'}</span>
                </h4>
                <div className="space-y-1 text-slate-700">
                  <p><strong>Name:</strong> {clientName}</p>
                  {client?.fatherOrHusbandName && <p><strong>S/O / D/O / W/O:</strong> {client.fatherOrHusbandName}</p>}
                  <p><strong>CNIC:</strong> {client?.cnic || 'N/A'}</p>
                  <p><strong>Mobile:</strong> {clientPhone}</p>
                  {client?.address && <p><strong>Address:</strong> {client.address}</p>}
                </div>
              </div>

              <div className="border border-slate-300 p-3 rounded-md">
                <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-1 mb-2 uppercase text-[11px] flex items-center justify-between">
                  <span>Case Matter & FIR Details</span>
                  <span className="text-slate-500">{caseItem.caseType}</span>
                </h4>
                <div className="space-y-1 text-slate-700">
                  <p><strong>Title:</strong> {caseItem.caseTitle}</p>
                  <p><strong>Institution Date:</strong> {caseItem.startDate}</p>
                  {linkedFir ? (
                    <div className="mt-1 p-2 bg-rose-50 border border-rose-200 rounded text-[11px]">
                      <p className="font-bold text-rose-900">FIR #: {linkedFir.firNumber}/{linkedFir.firYear}</p>
                      <p>PS: {linkedFir.policeStation} • Sections: {linkedFir.sections}</p>
                      <p>Complainant: {linkedFir.complainant}</p>
                    </div>
                  ) : (
                    <p className="text-slate-500 italic">No criminal FIR attached (Civil/Corporate Matter)</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Case Description / Brief */}
          {caseItem.description && (
            <div className="mb-6 font-sans text-xs bg-slate-50 border border-slate-200 p-3 rounded-md">
              <strong className="block text-slate-800 mb-1 uppercase text-[10px]">Chamber Legal Summary / Brief:</strong>
              <p className="text-slate-700 leading-relaxed">{caseItem.description}</p>
            </div>
          )}

          {/* Chronological Court Hearings / Order Sheet History */}
          <div className="mb-6 font-sans">
            <h4 className="font-bold text-slate-900 uppercase text-xs tracking-wider mb-2 border-b border-slate-400 pb-1 flex items-center justify-between">
              <span>Chronological Order Sheets & Hearing History</span>
              <span className="text-slate-500 text-[10px]">Total Proceedings: {hearings.length}</span>
            </h4>

            {hearings.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No hearings recorded yet.</p>
            ) : (
              <table className="w-full text-left text-xs border border-slate-300">
                <thead className="bg-slate-100 text-slate-900 border-b border-slate-300">
                  <tr>
                    <th className="p-2 border-r border-slate-300 w-24">Date</th>
                    <th className="p-2 border-r border-slate-300 w-32">Stage / Purpose</th>
                    <th className="p-2 border-r border-slate-300">Court Order / Proceedings</th>
                    <th className="p-2 w-28">Next Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {hearings.map((h) => (
                    <tr key={h.id} className="hover:bg-slate-50">
                      <td className="p-2 border-r border-slate-200 font-bold text-slate-900">
                        {h.hearingDate}
                      </td>
                      <td className="p-2 border-r border-slate-200 text-slate-700">
                        <span className="font-semibold block">{h.hearingType}</span>
                        <span className="text-[10px] text-slate-500">{h.status}</span>
                      </td>
                      <td className="p-2 border-r border-slate-200 text-slate-800">
                        {h.courtOrder ? (
                          <p className="font-medium">{h.courtOrder}</p>
                        ) : (
                          <p className="text-slate-600">{h.lawyerNotes || 'Proceedings recorded.'}</p>
                        )}
                        {h.nextAction && (
                          <p className="text-[10px] text-amber-800 mt-0.5">
                            <strong>Action:</strong> {h.nextAction}
                          </p>
                        )}
                      </td>
                      <td className="p-2 font-bold text-slate-900">
                        {h.nextHearingDate || 'Disposed'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Record of Documents Filed / Vault */}
          <div className="mb-6 font-sans">
            <h4 className="font-bold text-slate-900 uppercase text-xs tracking-wider mb-2 border-b border-slate-400 pb-1">
              Documentary Evidence & Pleadings on Record
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
              {documents.length === 0 ? (
                <p className="text-slate-500 italic col-span-3">No documents uploaded to this file.</p>
              ) : (
                documents.map((d) => (
                  <div key={d.id} className="p-2 border border-slate-200 rounded bg-slate-50">
                    <p className="font-bold text-slate-800 truncate">{d.name}</p>
                    <p className="text-[10px] text-slate-500">{d.type} • {d.format} ({d.fileSize})</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Financial Summary */}
          <div className="mb-8 font-sans p-3 bg-slate-50 border border-slate-300 rounded-md text-xs grid grid-cols-3 text-center">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Agreed Professional Fee</span>
              <span className="text-sm font-bold text-slate-900">PKR {totalAgreedFee.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Received</span>
              <span className="text-sm font-bold text-emerald-800">PKR {totalPaid.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Balance Payable</span>
              <span className={`text-sm font-bold ${balanceDue > 0 ? 'text-amber-800' : 'text-slate-700'}`}>
                PKR {balanceDue.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Professional Signature & Seal Section */}
          <div className="pt-8 border-t-2 border-slate-800 font-sans grid grid-cols-2 gap-12 text-xs items-end">
            <div>
              <div className="h-14 border-b border-slate-700 mb-2"></div>
              <p className="font-bold text-slate-900">Chamber Reader / Associate Verification</p>
              <p className="text-[10px] text-slate-500">Record audited and indexed for Court appearance</p>
            </div>

            <div className="text-right">
              <div className="h-14 border-b-2 border-slate-900 mb-2 flex items-end justify-end pb-1">
                <span className="font-serif italic text-base text-slate-900 font-bold">
                  {currentUser.name.replace('Advocate ', '')}
                </span>
              </div>
              <p className="font-bold text-slate-900">{currentUser.name}</p>
              <p className="text-[10px] text-slate-600 font-semibold">{currentUser.courtEnrollment}</p>
              <p className="text-[10px] text-slate-500">Advocate High Court / Senior Counsel</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
