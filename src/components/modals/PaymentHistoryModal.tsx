import React from 'react';
import {
  X,
  History,
  Clock,
  Printer,
  CheckCircle2,
  Calendar,
  CreditCard,
  User,
  Briefcase,
  PlusCircle,
  Edit3,
  Receipt,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { PaymentRecord, PaymentHistoryEntry } from '../../types';
import { useApp } from '../../context/AppContext';
import { printElement } from '../../utils/printHelper';

interface PaymentHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: PaymentRecord | null;
  onOpenEditModal?: (payment: PaymentRecord) => void;
  onOpenInstallmentModal?: (payment: PaymentRecord) => void;
}

export const PaymentHistoryModal: React.FC<PaymentHistoryModalProps> = ({
  isOpen,
  onClose,
  payment,
  onOpenEditModal,
  onOpenInstallmentModal,
}) => {
  const { clients, cases, currentUser, languageMode } = useApp();

  if (!isOpen || !payment) return null;

  const client = clients.find((c) => c.id === payment.clientId);
  const linkedCase = cases.find((c) => c.id === payment.caseId);

  // Synthesize history if empty (e.g. for legacy records before history array existed)
  const historyList: PaymentHistoryEntry[] =
    payment.history && payment.history.length > 0
      ? payment.history
      : [
          {
            id: 'legacy-init-' + payment.id,
            timestamp: payment.createdAt,
            date: payment.createdAt,
            action: 'Created',
            changedBy: currentUser.name || 'Advocate',
            newTotalFee: payment.totalFee,
            newPaidAmount: payment.paidAmount,
            newRemaining: payment.remainingAmount,
            newMethod: payment.paymentMethod,
            receiptNumber: payment.receiptNumber,
            reason: 'Fee record created in ledger',
            notes: payment.notes || 'Initial fee agreement',
          },
        ];

  const getActionBadgeColor = (action: PaymentHistoryEntry['action']) => {
    switch (action) {
      case 'Created':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Installment Added':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Modified':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Fee Adjusted':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Status Cleared':
        return 'bg-emerald-600 text-white border-emerald-700';
      case 'Method Changed':
        return 'bg-sky-100 text-sky-800 border-sky-300';
      case 'Refund / Reversal':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 my-8">
        {/* Modal Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/20 rounded-xl border border-emerald-500/30 text-emerald-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm tracking-tight">Fee History & Audit Ledger</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-800 text-emerald-400 border border-slate-700">
                  {payment.receiptNumber}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {languageMode === 'romanUrdu'
                  ? 'Fee ki mukammal tareekh, qistein, tarmeem aur wasooli record'
                  : 'Complete timeline of fee creation, modifications, installments, and status'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => printElement('fee-history-printable-ledger', `Fee-History-${payment.receiptNumber}`)}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
              title="Print Fee History Statement"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print Statement</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Current State Summary Card */}
        <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Client & Case Info */}
            <div className="sm:col-span-3 bg-white p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">{client?.fullName || 'Client N/A'}</div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2">
                    <span>CNIC: {client?.cnic || 'N/A'}</span>
                    <span>•</span>
                    <span>Phone: {client?.phone || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                <div className="text-[11px] font-semibold text-slate-700 flex items-center sm:justify-end gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  <span>{linkedCase?.caseNumber || 'General Fee'}</span>
                </div>
                <div className="text-[10px] text-slate-500 truncate max-w-xs sm:ml-auto">
                  {linkedCase?.caseTitle || 'Legal Services'}
                </div>
              </div>
            </div>

            {/* Total Fee */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                Total Agreed Fee
              </span>
              <span className="text-base font-bold text-slate-900 font-mono mt-0.5 block">
                PKR {payment.totalFee.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400">Fixed chamber professional fee</span>
            </div>

            {/* Total Paid */}
            <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-200 shadow-2xs">
              <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider block flex items-center justify-between">
                <span>Total Received (Paid)</span>
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
              <span className="text-base font-bold text-emerald-800 font-mono mt-0.5 block">
                PKR {payment.paidAmount.toLocaleString()}
              </span>
              <span className="text-[10px] text-emerald-600">
                Method: {payment.paymentMethod}
              </span>
            </div>

            {/* Balance Remaining */}
            <div
              className={`p-3 rounded-xl border shadow-2xs ${
                payment.remainingAmount > 0
                  ? 'bg-rose-50/50 border-rose-200'
                  : 'bg-emerald-100/50 border-emerald-300'
              }`}
            >
              <span
                className={`text-[10px] font-semibold uppercase tracking-wider block ${
                  payment.remainingAmount > 0 ? 'text-rose-700' : 'text-emerald-800'
                }`}
              >
                {payment.remainingAmount > 0 ? 'Baqaya (Outstanding)' : 'Status'}
              </span>
              <span
                className={`text-base font-bold font-mono mt-0.5 block ${
                  payment.remainingAmount > 0 ? 'text-rose-800' : 'text-emerald-800'
                }`}
              >
                {payment.remainingAmount > 0 ? `PKR ${payment.remainingAmount.toLocaleString()}` : 'Cleared in Full ✓'}
              </span>
              <span className="text-[10px] text-slate-500">
                {payment.remainingAmount > 0 ? 'Pending recovery' : 'Zero outstanding balance'}
              </span>
            </div>
          </div>

          {/* Quick Actions Row */}
          <div className="mt-3 flex items-center justify-end gap-2">
            {payment.remainingAmount > 0 && onOpenInstallmentModal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenInstallmentModal(payment);
                }}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+ Add Installment (Wasooli)</span>
              </button>
            )}
            {onOpenEditModal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenEditModal(payment);
                }}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                <span>Edit / Modify Record</span>
              </button>
            )}
          </div>
        </div>

        {/* Printable Section & Timeline */}
        <div id="fee-history-printable-ledger" className="p-4 sm:p-6 max-h-[50vh] overflow-y-auto space-y-4">
          <div className="hidden print:block text-center border-b pb-4 mb-4">
            <h2 className="text-base font-bold text-slate-900 uppercase">
              Chamber Legal Fee Audit & Installment Ledger
            </h2>
            <div className="text-xs text-slate-600">
              Receipt No: {payment.receiptNumber} • Client: {client?.fullName} • Case: {linkedCase?.caseNumber}
            </div>
            <div className="text-xs text-slate-600">
              Total Fee: PKR {payment.totalFee.toLocaleString()} • Paid: PKR {payment.paidAmount.toLocaleString()} • Balance: PKR {payment.remainingAmount.toLocaleString()}
            </div>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Chamber Transaction Timeline ({historyList.length} Entries)</span>
            </h4>
            <span className="text-[11px] text-slate-400">Chronological Audit Log</span>
          </div>

          <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {historyList.map((entry, index) => {
              return (
                <div key={entry.id || index} className="relative group">
                  {/* Timeline Node Dot */}
                  <div className="absolute -left-6 top-1 w-5 h-5 rounded-full border-2 border-white bg-slate-900 text-white flex items-center justify-center text-[10px] shadow-xs">
                    {index + 1}
                  </div>

                  <div className="bg-slate-50/80 hover:bg-slate-50 border border-slate-200 rounded-xl p-3.5 transition-colors">
                    {/* Entry Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getActionBadgeColor(
                            entry.action
                          )}`}
                        >
                          {entry.action}
                        </span>
                        {entry.receiptNumber && (
                          <span className="text-[11px] font-mono font-semibold text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                            {entry.receiptNumber}
                          </span>
                        )}
                        <span className="text-xs font-semibold text-slate-800">
                          {entry.reason || 'Ledger entry recorded'}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{entry.date}</span>
                      </div>
                    </div>

                    {/* Numeric Impact / Financial Delta */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-2 px-2.5 bg-white rounded-lg border border-slate-200 text-xs font-mono my-2">
                      {entry.installmentAmount !== undefined && (
                        <div>
                          <div className="text-[9px] text-slate-400 uppercase font-sans">Installment Received</div>
                          <div className="font-bold text-blue-700">
                            +PKR {entry.installmentAmount.toLocaleString()}
                          </div>
                        </div>
                      )}

                      {entry.newPaidAmount !== undefined && (
                        <div>
                          <div className="text-[9px] text-slate-400 uppercase font-sans">Cumulative Paid</div>
                          <div className="font-bold text-emerald-700">
                            PKR {entry.newPaidAmount.toLocaleString()}
                            {entry.previousPaidAmount !== undefined && entry.previousPaidAmount !== entry.newPaidAmount && (
                              <span className="text-[10px] text-slate-400 block font-normal">
                                was {entry.previousPaidAmount.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {entry.newTotalFee !== undefined && (
                        <div>
                          <div className="text-[9px] text-slate-400 uppercase font-sans">Total Agreed Fee</div>
                          <div className="font-bold text-slate-800">
                            PKR {entry.newTotalFee.toLocaleString()}
                            {entry.previousTotalFee !== undefined && entry.previousTotalFee !== entry.newTotalFee && (
                              <span className="text-[10px] text-purple-600 block font-normal">
                                was {entry.previousTotalFee.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {entry.newRemaining !== undefined && (
                        <div>
                          <div className="text-[9px] text-slate-400 uppercase font-sans">Remaining Baqaya</div>
                          <div className={`font-bold ${entry.newRemaining > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                            {entry.newRemaining > 0 ? `PKR ${entry.newRemaining.toLocaleString()}` : 'Cleared (0)'}
                          </div>
                        </div>
                      )}

                      {entry.newMethod && (
                        <div className="col-span-2 sm:col-span-4 border-t border-slate-100 pt-1 text-[11px] text-slate-600 font-sans flex items-center gap-1.5">
                          <CreditCard className="w-3 h-3 text-slate-400" />
                          <span>Mode of Payment: <strong>{entry.newMethod}</strong></span>
                        </div>
                      )}
                    </div>

                    {/* Notes & Advocate Signature */}
                    {entry.notes && (
                      <p className="text-[11px] text-slate-600 italic bg-slate-100/60 p-2 rounded border border-slate-200/60">
                        "{entry.notes}"
                      </p>
                    )}

                    <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between">
                      <span>Logged by: <strong>{entry.changedBy}</strong> {entry.userRole && `(${entry.userRole})`}</span>
                      <span>Verified Digital Audit Record</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <div className="text-[11px] text-slate-500">
            Official Wakalat Pro Chamber Fee Ledger System
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
