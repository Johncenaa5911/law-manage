import React, { useState, useEffect } from 'react';
import {
  X,
  CreditCard,
  DollarSign,
  PlusCircle,
  Edit3,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Receipt,
  FileText,
  User,
  Briefcase,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PaymentMethod, PaymentRecord } from '../../types';

export interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentToEdit?: PaymentRecord | null;
  mode?: 'create' | 'edit' | 'installment';
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  paymentToEdit,
  mode = 'create',
}) => {
  const {
    addPayment,
    updatePayment,
    addPaymentInstallment,
    cases,
    clients,
    todayDateStr,
    languageMode,
  } = useApp();

  const isEditMode = mode === 'edit' && !!paymentToEdit;
  const isInstallmentMode = mode === 'installment' && !!paymentToEdit;

  // Form States
  const [clientId, setClientId] = useState('');
  const [caseId, setCaseId] = useState('');
  const [totalFee, setTotalFee] = useState<number>(100000);
  const [paidAmount, setPaidAmount] = useState<number>(50000);
  const [installmentAmount, setInstallmentAmount] = useState<number>(25000);
  const [paymentDate, setPaymentDate] = useState(todayDateStr);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Bank Transfer');
  const [notes, setNotes] = useState('');
  const [modificationReason, setModificationReason] = useState('Fee structure revised by advocate');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize or reset when modal opens or target changes
  useEffect(() => {
    if (isOpen) {
      if (isEditMode && paymentToEdit) {
        setClientId(paymentToEdit.clientId);
        setCaseId(paymentToEdit.caseId);
        setTotalFee(paymentToEdit.totalFee);
        setPaidAmount(paymentToEdit.paidAmount);
        setPaymentDate(paymentToEdit.paymentDate || todayDateStr);
        setPaymentMethod(paymentToEdit.paymentMethod || 'Bank Transfer');
        setNotes(paymentToEdit.notes || '');
        setModificationReason('Fee details modified in chamber ledger');
      } else if (isInstallmentMode && paymentToEdit) {
        setClientId(paymentToEdit.clientId);
        setCaseId(paymentToEdit.caseId);
        setTotalFee(paymentToEdit.totalFee);
        setPaidAmount(paymentToEdit.paidAmount);
        // Default installment suggestion: either the remaining amount or half of it
        const remaining = Math.max(0, paymentToEdit.totalFee - paymentToEdit.paidAmount);
        setInstallmentAmount(remaining > 0 ? (remaining > 50000 ? 50000 : remaining) : 10000);
        setPaymentDate(todayDateStr);
        setPaymentMethod('Cash');
        setNotes('Installment payment received at chamber');
      } else {
        // Create mode
        setClientId(clients[0]?.id || '');
        setCaseId(cases[0]?.id || '');
        setTotalFee(100000);
        setPaidAmount(50000);
        setInstallmentAmount(25000);
        setPaymentDate(todayDateStr);
        setPaymentMethod('Bank Transfer');
        setNotes('Chamber advance retainer fee');
      }
    }
  }, [isOpen, mode, paymentToEdit, clients, cases, todayDateStr, isEditMode, isInstallmentMode]);

  if (!isOpen) return null;

  // Real-time calculations
  const remainingInCreateOrEdit = Math.max(0, Number(totalFee) - Number(paidAmount));
  const newCumulativePaidInInstallment = paymentToEdit ? paymentToEdit.paidAmount + Number(installmentAmount) : 0;
  const newRemainingInInstallment = paymentToEdit
    ? Math.max(0, paymentToEdit.totalFee - newCumulativePaidInInstallment)
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !caseId) {
      alert('Please choose Client and Case.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isInstallmentMode && paymentToEdit) {
        if (Number(installmentAmount) <= 0) {
          alert('Installment amount must be greater than zero.');
          setIsSubmitting(false);
          return;
        }
        await addPaymentInstallment(
          paymentToEdit.id,
          Number(installmentAmount),
          paymentDate,
          paymentMethod,
          notes.trim() || `Installment received on ${paymentDate}`
        );
      } else if (isEditMode && paymentToEdit) {
        updatePayment(
          paymentToEdit.id,
          {
            clientId,
            caseId,
            totalFee: Number(totalFee),
            paidAmount: Number(paidAmount),
            paymentDate,
            paymentMethod,
            notes: notes.trim(),
          },
          modificationReason.trim() || 'Payment details modified in ledger'
        );
      } else {
        // Create mode
        addPayment({
          clientId,
          caseId,
          totalFee: Number(totalFee),
          paidAmount: Number(paidAmount),
          paymentDate,
          paymentMethod,
          receiptNumber: `RCPT-${Math.floor(1000 + Math.random() * 9000)}/${new Date().getFullYear()}`,
          notes: notes.trim(),
        });
      }
      onClose();
    } catch (err) {
      console.error('Error saving fee payment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const clientItem = clients.find((c) => c.id === clientId);
  const caseItem = cases.find((c) => c.id === caseId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200 my-6">
        {/* Header */}
        <div
          className={`p-4 text-white flex items-center justify-between ${
            isInstallmentMode
              ? 'bg-blue-800'
              : isEditMode
              ? 'bg-amber-800'
              : 'bg-emerald-900'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-xl ${
                isInstallmentMode
                  ? 'bg-blue-700'
                  : isEditMode
                  ? 'bg-amber-700'
                  : 'bg-emerald-800'
              }`}
            >
              {isInstallmentMode ? (
                <PlusCircle className="w-5 h-5 text-blue-200" />
              ) : isEditMode ? (
                <Edit3 className="w-5 h-5 text-amber-200" />
              ) : (
                <CreditCard className="w-5 h-5 text-emerald-200" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm">
                  {isInstallmentMode
                    ? languageMode === 'romanUrdu'
                      ? 'Fee Qist / Wasooli Darj Karein'
                      : 'Record Fee Installment'
                    : isEditMode
                    ? languageMode === 'romanUrdu'
                      ? 'Fee Record Edit & Modify Karein'
                      : 'Edit & Modify Fee Record'
                    : languageMode === 'romanUrdu'
                    ? 'Naya Fee Record & Receipt Banayein'
                    : 'Record Fee Payment & Issue Receipt'}
                </h3>
                {paymentToEdit && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white/20 text-white">
                    {paymentToEdit.receiptNumber}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-white/80 mt-0.5">
                {isInstallmentMode
                  ? 'Record incremental client payment and update outstanding balance'
                  : isEditMode
                  ? 'Adjust agreed fees, payment amounts, and record audit reason'
                  : 'Register initial fee contract and retainer receipt'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs">
          {/* If Installment Mode: Display Target Case & Outstanding Summary */}
          {isInstallmentMode && paymentToEdit && (
            <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-700" />
                  <span className="font-bold text-slate-900 text-xs">{clientItem?.fullName || 'Client'}</span>
                </div>
                <div className="text-[11px] text-slate-600 flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                  <span className="font-semibold">{caseItem?.caseNumber}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-blue-200/80 font-mono text-center">
                <div className="bg-white p-2 rounded-lg border border-blue-100">
                  <div className="text-[9px] text-slate-500 uppercase font-sans">Total Fee</div>
                  <div className="font-bold text-slate-800">PKR {paymentToEdit.totalFee.toLocaleString()}</div>
                </div>
                <div className="bg-white p-2 rounded-lg border border-blue-100">
                  <div className="text-[9px] text-emerald-700 uppercase font-sans">Already Paid</div>
                  <div className="font-bold text-emerald-800">PKR {paymentToEdit.paidAmount.toLocaleString()}</div>
                </div>
                <div className="bg-white p-2 rounded-lg border border-blue-100">
                  <div className="text-[9px] text-rose-700 uppercase font-sans">Current Baqaya</div>
                  <div className="font-bold text-rose-800">PKR {paymentToEdit.remainingAmount.toLocaleString()}</div>
                </div>
              </div>
            </div>
          )}

          {/* Client & Case Pickers (Only in Create & Edit modes) */}
          {!isInstallmentMode && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Client *</label>
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name || c.fullName} (CNIC: {c.cnic || 'N/A'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Case *</label>
                <select
                  value={caseId}
                  onChange={(e) => setCaseId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  {cases.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.caseNumber} - {c.caseTitle}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Fee Amounts */}
          {isInstallmentMode ? (
            /* Installment Input */
            <div className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  {languageMode === 'romanUrdu' ? 'Nayi Qist / Wasooli Raqam (PKR) *' : 'New Installment Amount (PKR) *'}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 font-bold text-slate-400 font-mono">PKR</span>
                  <input
                    type="number"
                    min="1"
                    max={paymentToEdit ? paymentToEdit.totalFee : 10000000}
                    required
                    value={installmentAmount}
                    onChange={(e) => setInstallmentAmount(Number(e.target.value))}
                    className="w-full pl-13 pr-3 py-2.5 bg-blue-50/50 border border-blue-300 rounded-lg text-slate-900 font-mono font-bold text-base focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Installment Impact Preview */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-sans block">
                    After this payment:
                  </span>
                  <span className="text-xs text-slate-800 block">
                    Total Paid: <strong>PKR {newCumulativePaidInInstallment.toLocaleString()}</strong>
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 uppercase font-sans block">
                    New Baqaya (Remaining):
                  </span>
                  <span
                    className={`text-sm font-bold block ${
                      newRemainingInInstallment === 0 ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {newRemainingInInstallment === 0 ? 'CLEARED ✓' : `PKR ${newRemainingInInstallment.toLocaleString()}`}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Create or Edit: Total Fee and Paid Amount */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {isEditMode ? 'Total Agreed Fee (PKR) *' : 'Total Professional Fee (PKR) *'}
                </label>
                <input
                  type="number"
                  required
                  value={totalFee}
                  onChange={(e) => setTotalFee(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {isEditMode ? 'Cumulative Paid Amount (PKR) *' : 'Advance / Amount Paid (PKR) *'}
                </label>
                <input
                  type="number"
                  required
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono font-bold text-emerald-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>
          )}

          {/* Dynamic Balance Display for Create/Edit */}
          {!isInstallmentMode && (
            <div
              className={`p-3 rounded-xl border flex items-center justify-between font-mono ${
                remainingInCreateOrEdit === 0
                  ? 'bg-emerald-50/70 border-emerald-200'
                  : 'bg-rose-50/60 border-rose-200'
              }`}
            >
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-sans">
                  Calculated Remaining Baqaya:
                </div>
                <div
                  className={`text-base font-bold ${
                    remainingInCreateOrEdit === 0 ? 'text-emerald-800' : 'text-rose-800'
                  }`}
                >
                  {remainingInCreateOrEdit === 0 ? 'Cleared in Full ✓' : `PKR ${remainingInCreateOrEdit.toLocaleString()}`}
                </div>
              </div>
              <div className="text-right">
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase font-sans ${
                    remainingInCreateOrEdit === 0
                      ? 'bg-emerald-200 text-emerald-900'
                      : 'bg-rose-200 text-rose-900'
                  }`}
                >
                  Auto-Calculated
                </span>
              </div>
            </div>
          )}

          {/* Date & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {isInstallmentMode ? 'Installment Date *' : 'Payment Date *'}
              </label>
              <input
                type="date"
                required
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Payment Method *</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium"
              >
                <option value="Cash">Cash at Chamber</option>
                <option value="Bank Transfer">Bank Transfer (Meezan/HBL/Allied)</option>
                <option value="Cheque">Crossed Cheque</option>
                <option value="EasyPaisa / JazzCash">EasyPaisa / JazzCash</option>
                <option value="Online Card">Online / Card Payment</option>
              </select>
            </div>
          </div>

          {/* Edit Mode: Reason for Modification (Critical for History Audit) */}
          {isEditMode && (
            <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 space-y-1.5">
              <label className="block font-semibold text-amber-900">
                {languageMode === 'romanUrdu'
                  ? 'Tarmeem ki Wajah (Reason for Modification) *'
                  : 'Reason for Modification (Audit Trail) *'}
              </label>
              <input
                type="text"
                required
                value={modificationReason}
                onChange={(e) => setModificationReason(e.target.value)}
                placeholder="e.g. Senior Advocate approved 10% concession, corrected typo in paid amount"
                className="w-full p-2 bg-white border border-amber-300 rounded-lg text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-amber-500 focus:outline-hidden text-xs"
              />
              <p className="text-[10px] text-amber-700">
                Yeh wajah fee history audit log mein advocate ke naam ke sath permanently record hogi.
              </p>
            </div>
          )}

          {/* Notes / Description */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {isInstallmentMode
                ? 'Installment Remarks / Stage Notes'
                : 'Payment Description / Remarks'}
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                isInstallmentMode
                  ? 'e.g. Paid at stage of charge framing / witness evidence'
                  : 'e.g. Retainer fee for interim bail and High Court filing'
              }
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
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
              className={`px-5 py-2 text-white rounded-xl font-semibold shadow-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer disabled:opacity-50 ${
                isInstallmentMode
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : isEditMode
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {isInstallmentMode ? (
                <>
                  <PlusCircle className="w-4 h-4" />
                  <span>{isSubmitting ? 'Recording...' : 'Record Installment & Sync'}</span>
                </>
              ) : isEditMode ? (
                <>
                  <Edit3 className="w-4 h-4" />
                  <span>{isSubmitting ? 'Saving...' : 'Save Changes & Update History'}</span>
                </>
              ) : (
                <>
                  <Receipt className="w-4 h-4" />
                  <span>{isSubmitting ? 'Issuing...' : 'Issue Receipt & Save'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
