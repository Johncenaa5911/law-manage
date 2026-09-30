import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  Plus,
  Search,
  Printer,
  Share2,
  CheckCircle,
  Clock,
  ArrowUpRight,
  Receipt,
  Download,
  Building2,
  DollarSign,
  TrendingUp,
  Trash2,
  Edit3,
  PlusCircle,
  History,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ArrowUpDown,
  Sparkles,
  FileText,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PaymentRecord } from '../types';
import { ShareData } from './ShareModal';
import { printElement } from '../utils/printHelper';
import { PaymentHistoryModal } from './modals/PaymentHistoryModal';
import { PaymentModal } from './modals/PaymentModal';
import { DeletePaymentConfirmModal } from './modals/DeletePaymentConfirmModal';

interface PaymentsViewProps {
  onOpenPaymentModal: () => void;
  onOpenShareModal: (data: ShareData) => void;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({
  onOpenPaymentModal,
  onOpenShareModal,
}) => {
  const {
    payments,
    cases,
    clients,
    currentUser,
    currentRole,
    deletePayment,
    languageMode,
    totalPendingFees,
    totalPaidFees,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentRecord | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'cleared'>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'remaining-desc' | 'total-desc' | 'paid-desc'>('date-desc');

  // Modal states for History, Edit, Installment, Delete
  const [historyTarget, setHistoryTarget] = useState<PaymentRecord | null>(null);
  const [editTarget, setEditTarget] = useState<PaymentRecord | null>(null);
  const [installmentTarget, setInstallmentTarget] = useState<PaymentRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PaymentRecord | null>(null);

  const totalBilled = useMemo(() => {
    return payments.reduce((acc, p) => acc + (p.totalFee || 0), 0);
  }, [payments]);

  const pendingPaymentsCount = useMemo(() => {
    return payments.filter((p) => p.remainingAmount > 0).length;
  }, [payments]);

  const clearedPaymentsCount = useMemo(() => {
    return payments.filter((p) => p.remainingAmount === 0).length;
  }, [payments]);

  const filteredPayments = useMemo(() => {
    return payments
      .filter((p) => {
        // Status tab filtering
        if (statusFilter === 'pending' && p.remainingAmount <= 0) return false;
        if (statusFilter === 'cleared' && p.remainingAmount > 0) return false;

        // Search text filtering
        const q = searchTerm.toLowerCase().trim();
        if (!q) return true;

        const client = clients.find((c) => c.id === p.clientId);
        const linkedCase = cases.find((c) => c.id === p.caseId);

        return (
          p.receiptNumber.toLowerCase().includes(q) ||
          p.paymentMethod.toLowerCase().includes(q) ||
          (p.notes || '').toLowerCase().includes(q) ||
          (client && (client.fullName || client.name || '').toLowerCase().includes(q)) ||
          (client && (client.cnic || '').toLowerCase().includes(q)) ||
          (client && (client.phone || '').toLowerCase().includes(q)) ||
          (linkedCase && (linkedCase.caseNumber || '').toLowerCase().includes(q)) ||
          (linkedCase && (linkedCase.caseTitle || '').toLowerCase().includes(q))
        );
      })
      .sort((a, b) => {
        if (sortBy === 'remaining-desc') {
          return (b.remainingAmount || 0) - (a.remainingAmount || 0);
        }
        if (sortBy === 'total-desc') {
          return (b.totalFee || 0) - (a.totalFee || 0);
        }
        if (sortBy === 'paid-desc') {
          return (b.paidAmount || 0) - (a.paidAmount || 0);
        }
        // default: date-desc
        return new Date(b.paymentDate || b.createdAt).getTime() - new Date(a.paymentDate || a.createdAt).getTime();
      });
  }, [payments, statusFilter, searchTerm, clients, cases, sortBy]);

  const getClient = (clientId: string) => clients.find((c) => c.id === clientId);
  const getCase = (caseId: string) => cases.find((c) => c.id === caseId);

  const handleDeleteConfirm = (id: string, reason: string) => {
    deletePayment(id, reason);
    setDeleteTarget(null);
  };

  return (
    <div className="p-3 sm:p-5 md:p-8 max-w-7xl mx-auto space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-950/60 rounded-xl text-emerald-700">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Fee Management & Chamber Ledger</span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {payments.length} Records
                </span>
              </h1>
              <p className="text-xs md:text-sm text-slate-500 mt-0.5">
                {languageMode === 'romanUrdu'
                  ? 'Client fees, installment history, tarmeem, deletion audit aur printable tax receipts'
                  : 'Multi-installment legal billing ledger, modification audit trail, and client receipts'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => printElement('payments-ledger-table', 'Chamber-Fee-Ledger')}
            className="px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Ledger</span>
          </button>
          <button
            id="btn-add-payment-record"
            onClick={onOpenPaymentModal}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs md:text-sm font-semibold flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Record Fee Payment</span>
          </button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Billed */}
        <div
          onClick={() => setStatusFilter('all')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'all'
              ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-800'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-semibold uppercase tracking-wider ${
                statusFilter === 'all' ? 'text-slate-300' : 'text-slate-500'
              }`}
            >
              Total Billed Fees
            </span>
            <DollarSign className={`w-4 h-4 ${statusFilter === 'all' ? 'text-emerald-400' : 'text-slate-400'}`} />
          </div>
          <div
            className={`text-2xl font-bold font-mono mt-1 ${
              statusFilter === 'all' ? 'text-white' : 'text-slate-900'
            }`}
          >
            PKR {totalBilled.toLocaleString()}
          </div>
          <div className="flex items-center justify-between mt-1 text-[11px]">
            <span className={statusFilter === 'all' ? 'text-slate-300' : 'text-slate-400'}>
              Across {payments.length} legal fee contracts
            </span>
            <span
              className={`font-semibold ${
                statusFilter === 'all' ? 'text-emerald-400' : 'text-slate-600'
              }`}
            >
              View All →
            </span>
          </div>
        </div>

        {/* Wasool Shuda (Paid) */}
        <div
          onClick={() => setStatusFilter('cleared')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'cleared'
              ? 'bg-emerald-800 text-white border-emerald-900 shadow-md ring-2 ring-emerald-600'
              : 'bg-emerald-50/40 border-emerald-200 hover:border-emerald-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-semibold uppercase tracking-wider ${
                statusFilter === 'cleared' ? 'text-emerald-100' : 'text-emerald-800'
              }`}
            >
              Wasool Shuda (Paid)
            </span>
            <CheckCircle className={`w-4 h-4 ${statusFilter === 'cleared' ? 'text-white' : 'text-emerald-600'}`} />
          </div>
          <div
            className={`text-2xl font-bold font-mono mt-1 ${
              statusFilter === 'cleared' ? 'text-white' : 'text-emerald-900'
            }`}
          >
            PKR {totalPaidFees.toLocaleString()}
          </div>
          <div className="flex items-center justify-between mt-1 text-[11px]">
            <span className={statusFilter === 'cleared' ? 'text-emerald-200' : 'text-emerald-600'}>
              {clearedPaymentsCount} fully cleared contracts
            </span>
            <span className={`font-semibold ${statusFilter === 'cleared' ? 'text-white' : 'text-emerald-700'}`}>
              Filter Paid →
            </span>
          </div>
        </div>

        {/* Baqaya Raqam (Pending) */}
        <div
          onClick={() => setStatusFilter('pending')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'pending'
              ? 'bg-rose-800 text-white border-rose-900 shadow-md ring-2 ring-rose-600'
              : 'bg-rose-50/40 border-rose-200 hover:border-rose-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-semibold uppercase tracking-wider ${
                statusFilter === 'pending' ? 'text-rose-100' : 'text-rose-800'
              }`}
            >
              Baqaya Raqam (Pending)
            </span>
            <Clock className={`w-4 h-4 ${statusFilter === 'pending' ? 'text-white' : 'text-rose-600'}`} />
          </div>
          <div
            className={`text-2xl font-bold font-mono mt-1 ${
              statusFilter === 'pending' ? 'text-white' : 'text-rose-900'
            }`}
          >
            PKR {totalPendingFees.toLocaleString()}
          </div>
          <div className="flex items-center justify-between mt-1 text-[11px]">
            <span className={statusFilter === 'pending' ? 'text-rose-200' : 'text-rose-600'}>
              {pendingPaymentsCount} pending client balances
            </span>
            <span className={`font-semibold ${statusFilter === 'pending' ? 'text-white' : 'text-rose-700'}`}>
              Filter Outstanding →
            </span>
          </div>
        </div>
      </div>

      {/* Control Bar: Filter Tabs, Search & Sort */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Fee Invoices ({payments.length})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              statusFilter === 'pending'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-rose-700 hover:text-rose-900 hover:bg-rose-50'
            }`}
          >
            <span>Outstanding Baqaya</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${statusFilter === 'pending' ? 'bg-rose-700' : 'bg-rose-200 text-rose-800'}`}>
              {pendingPaymentsCount}
            </span>
          </button>
          <button
            onClick={() => setStatusFilter('cleared')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              statusFilter === 'cleared'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50'
            }`}
          >
            <span>Cleared (Wasool)</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${statusFilter === 'cleared' ? 'bg-emerald-700' : 'bg-emerald-200 text-emerald-800'}`}>
              {clearedPaymentsCount}
            </span>
          </button>
        </div>

        {/* Search & Sort Dropdown */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search receipt #, client, case, method..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2.5 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="py-2 px-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              <option value="date-desc">Newest First</option>
              <option value="remaining-desc">Highest Baqaya First</option>
              <option value="total-desc">Highest Total Fee</option>
              <option value="paid-desc">Highest Paid Amount</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payment Ledger Table */}
      <div id="payments-ledger-table" className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs printable-surface">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
              <tr>
                <th className="p-3.5">Receipt #</th>
                <th className="p-3.5">Client & Case</th>
                <th className="p-3.5">Date & Method</th>
                <th className="p-3.5">Total Agreed Fee</th>
                <th className="p-3.5">Paid Amount</th>
                <th className="p-3.5">Remaining (Baqaya)</th>
                <th className="p-3.5">Audit History</th>
                <th className="p-3.5 text-right no-print">Actions (Edit / Modify / Delete)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    <div className="max-w-xs mx-auto space-y-2">
                      <Receipt className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="font-semibold text-slate-700">Koi fee record nahi mila</p>
                      <p className="text-[11px] text-slate-400">
                        {searchTerm ? 'Search filters reset karein.' : 'Naya fee payment record darj karne ke liye upar button dabayein.'}
                      </p>
                      {searchTerm && (
                        <button
                          onClick={() => {
                            setSearchTerm('');
                            setStatusFilter('all');
                          }}
                          className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold text-slate-700 cursor-pointer"
                        >
                          Clear Filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => {
                  const client = getClient(p.clientId);
                  const linkedCase = getCase(p.caseId);
                  const historyCount = p.history ? p.history.length : 1;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors group">
                      {/* Receipt Number */}
                      <td className="p-3.5 font-mono font-bold text-slate-900 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span>{p.receiptNumber}</span>
                        </div>
                      </td>

                      {/* Client & Case */}
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">
                          {client?.fullName || client?.name || 'N/A'}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-xs">
                          {linkedCase ? `${linkedCase.caseNumber} - ${linkedCase.caseTitle}` : 'General Retainer'}
                        </div>
                      </td>

                      {/* Date & Method */}
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="text-slate-700 font-medium">{p.paymentDate || p.createdAt}</div>
                        <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {p.paymentMethod}
                        </span>
                      </td>

                      {/* Total Fee */}
                      <td className="p-3.5 font-semibold text-slate-800 font-mono whitespace-nowrap">
                        PKR {p.totalFee.toLocaleString()}
                      </td>

                      {/* Paid Amount */}
                      <td className="p-3.5 font-bold text-emerald-700 font-mono whitespace-nowrap">
                        PKR {p.paidAmount.toLocaleString()}
                      </td>

                      {/* Remaining Baqaya */}
                      <td className="p-3.5 font-bold font-mono whitespace-nowrap">
                        {p.remainingAmount > 0 ? (
                          <div className="space-y-0.5">
                            <span className="text-rose-700 block">
                              PKR {p.remainingAmount.toLocaleString()}
                            </span>
                            <span className="text-[10px] text-rose-500 font-sans font-medium block">
                              Pending Baqaya
                            </span>
                          </div>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                            Cleared in Full ✓
                          </span>
                        )}
                      </td>

                      {/* History Badge Button */}
                      <td className="p-3.5 whitespace-nowrap">
                        <button
                          onClick={() => setHistoryTarget(p)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
                          title="View Complete Fee Timeline & Audit Log"
                        >
                          <History className="w-3.5 h-3.5 text-slate-500" />
                          <span>History ({historyCount})</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right no-print whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Printable Receipt */}
                          <button
                            onClick={() => setSelectedReceipt(p)}
                            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                            title="Print Legal Fee Receipt"
                          >
                            <Receipt className="w-3 h-3 text-amber-700" />
                            <span className="hidden sm:inline">Receipt</span>
                          </button>

                          {/* Add Installment (Quick Action if pending) */}
                          {p.remainingAmount > 0 && (
                            <button
                              onClick={() => setInstallmentTarget(p)}
                              className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                              title="Record Installment / Wasooli"
                            >
                              <PlusCircle className="w-3 h-3 text-blue-600" />
                              <span className="hidden sm:inline">+ Qist</span>
                            </button>
                          )}

                          {/* Edit / Modify Option */}
                          <button
                            onClick={() => setEditTarget(p)}
                            className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg cursor-pointer transition-colors border border-slate-200"
                            title="Edit & Modify Fee Record (Tarmeem)"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* WhatsApp Share */}
                          <button
                            onClick={() => {
                              onOpenShareModal({
                                title: `Fee Receipt: ${p.receiptNumber}`,
                                type: 'receipt',
                                clientName: client?.fullName || client?.name,
                                clientMobile: client?.phone,
                                clientEmail: client?.email,
                                caseNumber: linkedCase?.caseNumber,
                                receiptNumber: p.receiptNumber,
                                paidAmount: p.paidAmount,
                                remainingAmount: p.remainingAmount,
                                extraNotes: p.notes,
                              });
                            }}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer transition-colors border border-slate-200"
                            title="Share Receipt on WhatsApp"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Option with Safe In-App Confirmation Modal */}
                          <button
                            onClick={() => setDeleteTarget(p)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors border border-slate-200"
                            title="Delete Fee Record (Safe Confirm)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Printable Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 my-6">
            {/* Action Bar */}
            <div className="p-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between no-print">
              <span className="text-xs font-bold text-slate-700">Official Legal Fee Tax Receipt</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => printElement('legal-fee-receipt-content', `Receipt-${selectedReceipt.receiptNumber}`)}
                  className="px-3 py-1 bg-slate-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer hover:bg-slate-800"
                >
                  <Printer className="w-3 h-3" />
                  <span>Print Receipt</span>
                </button>
                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="px-2 py-1 text-slate-500 hover:text-slate-800 text-xs font-bold rounded"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Printable Receipt Body */}
            <div id="legal-fee-receipt-content" className="p-6 space-y-4 text-xs font-serif print:p-0 bg-white">
              <div className="text-center border-b pb-4">
                <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wide">
                  {currentUser.name}
                </h2>
                <div className="text-[11px] text-slate-600">{currentUser.courtEnrollment}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{currentUser.chamberAddress}</div>
                <div className="text-[10px] text-slate-500">Contact: {currentUser.phone}</div>
                <div className="mt-2 inline-block px-3 py-0.5 border border-slate-800 text-slate-900 text-[11px] font-bold uppercase tracking-wider">
                  Payment Acknowledgment Receipt
                </div>
              </div>

              <div className="flex justify-between text-xs">
                <div>
                  <strong>Receipt No:</strong> <span className="font-mono">{selectedReceipt.receiptNumber}</span>
                </div>
                <div>
                  <strong>Date:</strong> {selectedReceipt.paymentDate}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1.5">
                <div>
                  <strong>Received with thanks from:</strong>{' '}
                  <span className="font-bold text-slate-900">
                    {getClient(selectedReceipt.clientId)?.fullName || getClient(selectedReceipt.clientId)?.name}
                  </span>
                </div>
                <div>
                  <strong>CNIC:</strong> {getClient(selectedReceipt.clientId)?.cnic || 'N/A'}
                </div>
                <div>
                  <strong>On account of Case:</strong>{' '}
                  {getCase(selectedReceipt.caseId)?.caseNumber} (
                  {getCase(selectedReceipt.caseId)?.caseTitle})
                </div>
                <div>
                  <strong>Payment Mode:</strong> {selectedReceipt.paymentMethod}
                </div>
              </div>

              {/* Financial Ledger Breakdown */}
              <div className="space-y-1.5 border-t border-b py-3 font-mono">
                <div className="flex justify-between">
                  <span>Total Professional Agreed Fee:</span>
                  <strong>PKR {selectedReceipt.totalFee.toLocaleString()}</strong>
                </div>
                <div className="flex justify-between text-emerald-800 font-bold">
                  <span>Amount Received (Paid):</span>
                  <span>PKR {selectedReceipt.paidAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-rose-800">
                  <span>Balance Outstanding (Baqaya):</span>
                  <span>PKR {selectedReceipt.remainingAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Installment History Breakdown in Receipt if multiple entries */}
              {selectedReceipt.history && selectedReceipt.history.length > 1 && (
                <div className="border border-slate-200 rounded p-2.5 bg-slate-50 font-sans space-y-1.5">
                  <div className="text-[10px] font-bold uppercase text-slate-600 tracking-wider">
                    Installment & Payment History Statement
                  </div>
                  <div className="space-y-1 text-[11px]">
                    {selectedReceipt.history.map((h, i) => (
                      <div key={h.id || i} className="flex justify-between items-center border-b border-slate-200/60 pb-1">
                        <div>
                          <span className="font-semibold text-slate-800">{h.action}</span>
                          <span className="text-[10px] text-slate-500 ml-1.5">({h.date})</span>
                        </div>
                        <div className="font-mono text-slate-700">
                          {h.installmentAmount ? (
                            <span className="text-blue-700 font-bold">+PKR {h.installmentAmount.toLocaleString()}</span>
                          ) : (
                            <span>Paid: PKR {h.newPaidAmount?.toLocaleString()}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedReceipt.notes && (
                <div className="text-[11px] text-slate-600 italic">
                  Note: {selectedReceipt.notes}
                </div>
              )}

              <div className="pt-6 flex justify-between items-end">
                <div className="text-[10px] text-slate-400">
                  Wakalat Case Management System • Computer Generated
                </div>
                <div className="text-center">
                  <div className="border-t border-slate-400 w-36 pt-1 text-[11px] font-sans font-bold">
                    Advocate Signature / Seal
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      <PaymentHistoryModal
        isOpen={!!historyTarget}
        onClose={() => setHistoryTarget(null)}
        payment={historyTarget}
        onOpenEditModal={(p) => setEditTarget(p)}
        onOpenInstallmentModal={(p) => setInstallmentTarget(p)}
      />

      {/* Edit / Modify Modal */}
      <PaymentModal
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        paymentToEdit={editTarget}
        mode="edit"
      />

      {/* Add Installment Modal */}
      <PaymentModal
        isOpen={!!installmentTarget}
        onClose={() => setInstallmentTarget(null)}
        paymentToEdit={installmentTarget}
        mode="installment"
      />

      {/* Safe Delete Confirmation Modal */}
      <DeletePaymentConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        payment={deleteTarget}
        onConfirmDelete={handleDeleteConfirm}
      />
    </div>
  );
};
