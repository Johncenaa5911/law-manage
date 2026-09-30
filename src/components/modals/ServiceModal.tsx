import React, { useState, useEffect } from 'react';
import {
  X,
  BadgeCheck,
  Building2,
  FileText,
  User,
  Calendar,
  DollarSign,
  Sparkles,
  CheckSquare,
  Plus,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { LegalServiceRecord, ServiceCategory, ServiceStatus } from '../../types';

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceToEdit?: LegalServiceRecord;
  preselectedClientId?: string;
}

export const ServiceModal: React.FC<ServiceModalProps> = ({
  isOpen,
  onClose,
  serviceToEdit,
  preselectedClientId,
}) => {
  const {
    addLegalService,
    updateLegalService,
    clients,
    serviceCatalog,
    currentUser,
    todayDateStr,
    languageMode,
  } = useApp();

  const isRoman = languageMode === 'romanUrdu';

  const [formData, setFormData] = useState({
    clientId: preselectedClientId || clients[0]?.id || '',
    serviceTitle: '',
    category: 'Taxation & FBR' as ServiceCategory,
    department: 'Federal Board of Revenue (Iris Portal)',
    tokenOrChallanNo: `SRV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    assignedLawyer: currentUser.name,
    applicationDate: todayDateStr,
    targetCompletionDate: '2026-10-05',
    completedDate: '',
    status: 'Application Received' as ServiceStatus,
    totalFee: 15000,
    paidAmount: 15000,
    deliverableSummary: '',
    notes: '',
  });

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [docList, setDocList] = useState<string[]>([
    'Original CNIC & Photocopies',
    'Bank Statement (1 Year)',
  ]);
  const [newDocInput, setNewDocInput] = useState<string>('');

  useEffect(() => {
    if (serviceToEdit) {
      setFormData({
        clientId: serviceToEdit.clientId,
        serviceTitle: serviceToEdit.serviceTitle,
        category: serviceToEdit.category,
        department: serviceToEdit.department,
        tokenOrChallanNo: serviceToEdit.tokenOrChallanNo,
        assignedLawyer: serviceToEdit.assignedLawyer,
        applicationDate: serviceToEdit.applicationDate,
        targetCompletionDate: serviceToEdit.targetCompletionDate,
        completedDate: serviceToEdit.completedDate || '',
        status: serviceToEdit.status,
        totalFee: serviceToEdit.totalFee,
        paidAmount: serviceToEdit.paidAmount,
        deliverableSummary: serviceToEdit.deliverableSummary,
        notes: serviceToEdit.notes,
      });
      setDocList(serviceToEdit.requiredDocuments || []);
    } else {
      setFormData({
        clientId: preselectedClientId || clients[0]?.id || '',
        serviceTitle: '',
        category: 'Taxation & FBR',
        department: 'Federal Board of Revenue (Iris Portal)',
        tokenOrChallanNo: `SRV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        assignedLawyer: currentUser.name,
        applicationDate: todayDateStr,
        targetCompletionDate: '2026-10-05',
        completedDate: '',
        status: 'Application Received',
        totalFee: 15000,
        paidAmount: 15000,
        deliverableSummary: '',
        notes: '',
      });
      setDocList(['Original CNIC & Photocopies', 'Bank Statement (1 Year)']);
      setSelectedTemplateId('');
    }
  }, [serviceToEdit, isOpen, preselectedClientId, clients, currentUser.name, todayDateStr]);

  if (!isOpen) return null;

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const tpl = serviceCatalog.find((t) => t.id === templateId);
    if (tpl) {
      // Calculate target date by duration
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + (tpl.typicalDurationDays || 5));
      const targetStr = targetDate.toISOString().split('T')[0];

      let prefix = 'SRV';
      if (tpl.category.includes('FBR')) prefix = 'FBR';
      else if (tpl.category.includes('Police')) prefix = 'PKM';
      else if (tpl.category.includes('NADRA')) prefix = 'NADRA';
      else if (tpl.category.includes('SECP')) prefix = 'SECP';
      else if (tpl.category.includes('Property')) prefix = 'REG';

      setFormData((prev) => ({
        ...prev,
        serviceTitle: tpl.title,
        category: tpl.category,
        department: tpl.department,
        totalFee: tpl.suggestedFee,
        paidAmount: tpl.suggestedFee,
        deliverableSummary: tpl.deliverableSummary,
        targetCompletionDate: targetStr,
        tokenOrChallanNo: `${prefix}-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
        notes: tpl.description,
      }));
      setDocList(tpl.requiredDocuments || []);
    }
  };

  const handleAddDoc = () => {
    if (newDocInput.trim()) {
      setDocList((prev) => [...prev, newDocInput.trim()]);
      setNewDocInput('');
    }
  };

  const handleRemoveDoc = (index: number) => {
    setDocList((prev) => prev.filter((_, i) => i !== index));
  };

  const remainingCalc = Math.max(0, Number(formData.totalFee || 0) - Number(formData.paidAmount || 0));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.serviceTitle.trim()) {
      alert(isRoman ? 'Baraye meherbani service ka title likhein' : 'Please provide a Service Title');
      return;
    }

    if (serviceToEdit) {
      updateLegalService(serviceToEdit.id, {
        ...formData,
        totalFee: Number(formData.totalFee),
        paidAmount: Number(formData.paidAmount),
        requiredDocuments: docList,
      });
    } else {
      addLegalService({
        ...formData,
        totalFee: Number(formData.totalFee),
        paidAmount: Number(formData.paidAmount),
        requiredDocuments: docList,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto no-print">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white flex items-center justify-between border-b border-emerald-800/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-300 rounded-xl border border-emerald-400/30">
              <BadgeCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">
                {serviceToEdit
                  ? isRoman
                    ? 'Legal Service Record Update Karein'
                    : 'Update Legal Service Intake'
                  : isRoman
                  ? 'Nayi Legal Service Record Add Karein'
                  : 'New Legal & Administrative Service Intake'}
              </h2>
              <p className="text-xs text-emerald-200/80">
                {isRoman
                  ? 'FBR Filer, Character Certificate, SECP, NADRA, ya رجسٹری سروس وغیرہ'
                  : 'FBR Tax, Character Certificate, SECP, NADRA, Property Registry & Legal Services'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Quick Template Selector */}
          {!serviceToEdit && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800/50">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  {isRoman ? 'Ready-Made Chamber Service Template (1-Click Auto-Fill)' : 'Chamber Service Template (1-Click Auto-Fill)'}
                </label>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  {serviceCatalog.length} Pre-configured Services Available
                </span>
              </div>
              <select
                value={selectedTemplateId}
                onChange={(e) => handleTemplateSelect(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 rounded-lg text-sm text-slate-800 dark:text-slate-100 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              >
                <option value="">-- Choose a standard service template to autofill --</option>
                {serviceCatalog.map((item) => (
                  <option key={item.id} value={item.id}>
                    [{item.category}] {item.title} — Est: PKR {item.suggestedFee.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Client & Service Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Client Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-500" />
                {isRoman ? 'Client Select Karein *' : 'Select Client *'}
              </label>
              <select
                required
                value={formData.clientId}
                onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white py-1">
                    {c.fullName || c.name} ({c.cnic}) — {c.phone || c.mobile}
                  </option>
                ))}
              </select>
            </div>

            {/* Service Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {isRoman ? 'Service Category *' : 'Service Category *'}
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as ServiceCategory })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              >
                <option value="Taxation & FBR" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Taxation & FBR (انکم ٹیکس و فائلر)</option>
                <option value="Police & Verification" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Police & Verification (کریکٹر سرٹیفکیٹ)</option>
                <option value="NADRA & Succession" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">NADRA & Succession (وراثت و فوتیدگی)</option>
                <option value="Corporate & SECP" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Corporate & SECP (کمپنی رجسٹریشن)</option>
                <option value="Property & Registry" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Property & Registry (بیعنامہ و رجسٹری)</option>
                <option value="Power of Attorney & Affidavits" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Power of Attorney & Affidavits (مختار نامہ)</option>
                <option value="Family & Matrimonial" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Family & Matrimonial (نکاح نامہ و طلاق)</option>
                <option value="Trademark & IPO" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Trademark & IPO (ٹریڈ مارک)</option>
                <option value="Legal Notice & Opinion" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Legal Notice & Opinion (قانونی نوٹس)</option>
              </select>
            </div>
          </div>

          {/* Service Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              {isRoman ? 'Service Title / Details *' : 'Service Title & Specific Description *'}
            </label>
            <input
              type="text"
              required
              placeholder="e.g. FBR Annual Tax Return & Active Taxpayer List (ATL) 2025-2026"
              value={formData.serviceTitle}
              onChange={(e) => setFormData({ ...formData, serviceTitle: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          {/* Department, Token & Lawyer */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                {isRoman ? 'Govt Department / Portal' : 'Department / Authority'}
              </label>
              <input
                type="text"
                placeholder="e.g. FBR Iris / CPO Office / Sub-Registrar"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {isRoman ? 'Token / Challan / File No.' : 'Token / Application / Challan #'}
              </label>
              <input
                type="text"
                placeholder="e.g. FBR-ATL-99214 or PKM-2026-44"
                value={formData.tokenOrChallanNo}
                onChange={(e) => setFormData({ ...formData, tokenOrChallanNo: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-mono text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {isRoman ? 'Assigned Lawyer' : 'Assigned Advocate'}
              </label>
              <input
                type="text"
                value={formData.assignedLawyer}
                onChange={(e) => setFormData({ ...formData, assignedLawyer: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Dates & Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                {isRoman ? 'Application / Filing Date' : 'Application Date'}
              </label>
              <input
                type="date"
                value={formData.applicationDate}
                onChange={(e) => setFormData({ ...formData, applicationDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                {isRoman ? 'Target Completion Date' : 'Target Completion Date'}
              </label>
              <input
                type="date"
                value={formData.targetCompletionDate}
                onChange={(e) => setFormData({ ...formData, targetCompletionDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {isRoman ? 'Processing Status *' : 'Current Status *'}
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ServiceStatus })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              >
                <option value="Application Received" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Application Received (درخواست موصول)</option>
                <option value="Documents Verified" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Documents Verified (کاغذات تصدیق شدہ)</option>
                <option value="Under Department Processing" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Under Department Processing (محکمہ میں زیر کاروائی)</option>
                <option value="Department Objection" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Department Objection (محکمانہ اعتراض)</option>
                <option value="Clearance / Approval Granted" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Clearance / Approval Granted (کلیئرنس منظور)</option>
                <option value="Completed & Delivered" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Completed & Delivered (مکمل و موکل کو حوالہ)</option>
                <option value="Cancelled" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Cancelled (منسوخ)</option>
              </select>
            </div>
          </div>

          {/* Fees & Payment Breakdown */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                {isRoman ? 'Chamber Professional Fee & Payment Status' : 'Chamber Professional Fee & Payment'}
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">
                  {isRoman ? 'Total Agreed Fee (PKR)' : 'Total Fee (PKR)'}
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.totalFee}
                  onChange={(e) => setFormData({ ...formData, totalFee: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-semibold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">
                  {isRoman ? 'Advance / Paid Amount (PKR)' : 'Paid Amount (PKR)'}
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.paidAmount}
                  onChange={(e) => setFormData({ ...formData, paidAmount: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-semibold text-emerald-600 dark:text-emerald-400"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">
                  {isRoman ? 'Baqaya / Remaining Balance' : 'Remaining Balance'}
                </label>
                <div
                  className={`px-3 py-2 rounded-lg text-sm font-bold border ${
                    remainingCalc > 0
                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800'
                      : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                  }`}
                >
                  PKR {remainingCalc.toLocaleString()}
                  {remainingCalc === 0 ? ' (Fully Paid)' : ''}
                </div>
              </div>
            </div>
          </div>

          {/* Deliverable & Deliverable Summary */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5 text-slate-500" />
              {isRoman ? 'Deliverable Certificate / Final Document' : 'Official Deliverable Certificate / Document'}
            </label>
            <input
              type="text"
              placeholder="e.g. Official Character Certificate with SSP QR Verification & Digital Attestation"
              value={formData.deliverableSummary}
              onChange={(e) => setFormData({ ...formData, deliverableSummary: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          {/* Required Documents Checklist */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                {isRoman ? 'Required Documents Checklist (کاغذات کی فہرست)' : 'Required Documents Checklist'}
              </label>
              <span className="text-xs text-slate-500">{docList.length} documents attached</span>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              {docList.map((doc, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700"
                >
                  <CheckSquare className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  {doc}
                  <button
                    type="button"
                    onClick={() => handleRemoveDoc(idx)}
                    className="p-0.5 text-slate-400 hover:text-red-500 rounded transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder={isRoman ? 'Naya document add karein...' : 'Add document requirement (e.g. Utility Bill, Passport copy)...'}
                value={newDocInput}
                onChange={(e) => setNewDocInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddDoc();
                  }
                }}
                className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
              <button
                type="button"
                onClick={handleAddDoc}
                className="px-3 py-1.5 bg-slate-800 text-white dark:bg-slate-700 text-xs font-medium rounded-lg hover:bg-slate-700 flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>
          </div>

          {/* Notes & Instructions */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-slate-500" />
              {isRoman ? 'Chamber Internal Notes & Instructions' : 'Notes & Instructions'}
            </label>
            <textarea
              rows={3}
              placeholder={
                isRoman
                  ? 'Koi khas hidayat, objection details ya biometric appointment date...'
                  : 'Special instructions, department remarks, objection notes, or biometric appointment details...'
              }
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              {isRoman ? 'Cancel Karein' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <BadgeCheck className="w-4 h-4" />
              {serviceToEdit
                ? isRoman
                  ? 'Record Update Karein'
                  : 'Save Changes'
                : isRoman
                ? 'Service Record Save Karein'
                : 'Confirm & Save Intake'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
