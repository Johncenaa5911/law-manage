import React, { useState } from 'react';
import { AlertTriangle, Trash2, X, AlertCircle } from 'lucide-react';
import { PaymentRecord } from '../../types';
import { useApp } from '../../context/AppContext';

interface DeletePaymentConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: PaymentRecord | null;
  onConfirmDelete: (id: string, reason: string) => void;
}

export const DeletePaymentConfirmModal: React.FC<DeletePaymentConfirmModalProps> = ({
  isOpen,
  onClose,
  payment,
  onConfirmDelete,
}) => {
  const { clients, cases, languageMode } = useApp();
  const [deleteReason, setDeleteReason] = useState('Duplicate or erroneous fee entry');
  const [customReason, setCustomReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !payment) return null;

  const client = clients.find((c) => c.id === payment.clientId);
  const linkedCase = cases.find((c) => c.id === payment.caseId);

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const finalReason = deleteReason === 'Other' ? customReason.trim() || 'Fee entry deleted' : deleteReason;
    onConfirmDelete(payment.id, finalReason);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-rose-200 animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="p-4 bg-rose-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-rose-700/80 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm">
                {languageMode === 'romanUrdu' ? 'Fee Record Delete Karein?' : 'Confirm Fee Record Deletion'}
              </h3>
              <p className="text-[11px] text-rose-100">
                {payment.receiptNumber}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-rose-200 hover:text-white rounded-lg hover:bg-rose-700/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleConfirm} className="p-5 space-y-4 text-xs">
          {/* Warning Banner */}
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-900">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-rose-800">
                {languageMode === 'romanUrdu'
                  ? 'Khabardaar: Yeh record chamber ke active financial ledger se delete ho jayega!'
                  : 'Warning: This will remove the receipt from the active ledger and update financial totals.'}
              </p>
              <p className="text-[11px] text-rose-700">
                {languageMode === 'romanUrdu'
                  ? 'Audit log mein deletion record aur wajah mehfooz rahegi.'
                  : 'An audit log with your deletion timestamp and reason will be retained.'}
              </p>
            </div>
          </div>

          {/* Record Details to be deleted */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
            <div className="flex justify-between items-center text-slate-700">
              <span className="font-semibold">Receipt Number:</span>
              <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                {payment.receiptNumber}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-700">
              <span className="font-semibold">Client Name:</span>
              <span className="font-bold text-slate-900">{client?.fullName || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center text-slate-700">
              <span className="font-semibold">Case:</span>
              <span className="text-slate-600 truncate max-w-[200px]">
                {linkedCase?.caseNumber || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center border-t border-slate-200 pt-2 font-mono">
              <span className="font-sans font-semibold text-slate-700">Total Agreed Fee:</span>
              <span className="font-bold text-slate-900">PKR {payment.totalFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center font-mono">
              <span className="font-sans font-semibold text-emerald-800">Paid Amount:</span>
              <span className="font-bold text-emerald-800">PKR {payment.paidAmount.toLocaleString()}</span>
            </div>
          </div>

          {/* Deletion Reason Input */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1.5">
              {languageMode === 'romanUrdu' ? 'Delete karne ki Wajah *' : 'Reason for Deletion *'}
            </label>
            <select
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
            >
              <option value="Duplicate or erroneous fee entry">Duplicate or erroneous fee entry</option>
              <option value="Client cancelled case and fee refunded">Client cancelled case and fee refunded</option>
              <option value="Case transferred to another advocate">Case transferred to another advocate</option>
              <option value="Typographical error in fee ledger">Typographical error in fee ledger</option>
              <option value="Other">Other custom reason</option>
            </select>
          </div>

          {deleteReason === 'Other' && (
            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Wajah ki wazahat (Specify Reason) *
              </label>
              <input
                type="text"
                required
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="e.g. Mutual client settlement reached"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>
          )}

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl font-semibold flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Deleting...' : 'Delete Record'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
