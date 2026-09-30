import React, { useEffect } from 'react';
import { X, Printer, CheckCircle2, Shield, QrCode, Phone, Mail, MapPin, Share2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { LegalServiceRecord } from '../../types';
import { printElement } from '../../utils/printHelper';

interface ServiceSlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: LegalServiceRecord | null;
}

export const ServiceSlipModal: React.FC<ServiceSlipModalProps> = ({
  isOpen,
  onClose,
  service,
}) => {
  const { clients, currentUser, languageMode, openWhatsApp } = useApp();
  const isRoman = languageMode === 'romanUrdu';

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !service) return null;

  const client = clients.find((c) => c.id === service.clientId);
  const clientName = client?.fullName || (client as any)?.name || 'Client';
  const clientPhone = client?.phone || (client as any)?.mobile || '';

  const handlePrint = () => {
    printElement('service-slip-content', `Legal-Service-${service.tokenOrChallanNo}`);
  };

  const handleShareWhatsApp = () => {
    const text = `⚖️ *${currentUser.name} - Chamber Legal Service Slip*\n` +
      `Chamber Ref / Token: *${service.tokenOrChallanNo}*\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `Client: *${clientName}*\n` +
      `Service: *${service.serviceTitle}*\n` +
      `Department / Authority: *${service.department}*\n` +
      `Application Date: *${service.applicationDate}*\n` +
      `Target Delivery Date: *${service.targetCompletionDate}*\n` +
      `Current Status: *${service.status}*\n` +
      `Fee Agreed: PKR ${service.totalFee.toLocaleString()}\n` +
      `Amount Deposited: PKR ${service.paidAmount.toLocaleString()}\n` +
      `Remaining Balance: PKR ${service.remainingAmount.toLocaleString()}\n` +
      `Deliverable: ${service.deliverableSummary || 'Official Certificate'}\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `Chamber: ${currentUser.chamberAddress}\n` +
      `Phone: ${currentUser.phone}`;
    openWhatsApp(clientPhone, text);
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto"
    >
      <div className="relative w-full max-w-3xl bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden my-6 border border-slate-300 flex flex-col print:border-none print:shadow-none print:m-0 print:w-full print:max-w-none">
        {/* Top Control Bar (Hidden on print) */}
        <div className="no-print px-5 py-3.5 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span className="text-xs sm:text-sm font-semibold tracking-wide">
              {isRoman ? 'Official Chamber Service Slip & Certificate Preview' : 'Chamber Legal Service Slip & Certificate'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              title="Print Service Slip or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{isRoman ? 'Print / Save PDF' : 'Print Slip'}</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-emerald-100 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Send Slip summary to Client via WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            {/* Prominent Header Close Button */}
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-slate-800 hover:bg-rose-900/80 text-slate-200 hover:text-white border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Close Service Slip (ESC)"
            >
              <X className="w-4 h-4 text-rose-400" />
              <span>{isRoman ? 'Band Karein (Close)' : 'Close Slip'}</span>
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div className="p-8 sm:p-10 font-serif print:p-6 bg-white overflow-y-auto max-h-[75vh] print:max-h-none" id="service-slip-content">
          {/* Letterhead Header */}
          <div className="border-b-2 border-slate-900 pb-5 mb-6 text-center relative">
            <div className="flex items-center justify-between mb-2">
              <div className="text-left text-xs font-sans text-slate-600">
                <p className="font-bold text-slate-800">PAKISTAN BAR COUNCIL</p>
                <p>Roll No: {currentUser.barLicenseNo}</p>
                <p>Tax Bar / HC Reg: Verified</p>
              </div>

              <div className="text-center">
                <div className="inline-flex p-2 bg-emerald-900 text-amber-400 rounded-full mb-1">
                  <Shield className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 uppercase">
                  {currentUser.name}
                </h1>
                <p className="text-xs font-sans font-semibold tracking-widest text-emerald-900 uppercase">
                  {currentUser.courtEnrollment}
                </p>
              </div>

              <div className="text-right text-xs font-sans text-slate-600">
                <p className="font-bold text-slate-800">CHAMBER REF #</p>
                <p className="font-mono text-emerald-900 font-bold">{service.tokenOrChallanNo}</p>
                <p>Date: {new Date().toLocaleDateString('en-GB')}</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-6 text-[11px] font-sans text-slate-600 mt-2 border-t border-slate-200 pt-2">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-500" /> {currentUser.chamberAddress}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-500" /> {currentUser.phone}
              </span>
              <span className="flex items-center gap-1">
                <Mail className="w-3 h-3 text-slate-500" /> {currentUser.email}
              </span>
            </div>
          </div>

          {/* Document Title Banner */}
          <div className="bg-slate-100 border border-slate-300 rounded-lg p-3 text-center mb-6">
            <h2 className="text-base font-sans font-bold uppercase tracking-wider text-slate-900">
              LEGAL & ADMINISTRATIVE SERVICE CLEARANCE SLIP
            </h2>
            <p className="text-xs font-sans text-slate-600">
              تصدیق نامہ خدماتِ وکالت و دفتری کاروائی برائے متعلقہ ادارہ جات
            </p>
          </div>

          {/* Client & Reference Details */}
          <div className="grid grid-cols-2 gap-4 font-sans text-xs mb-6 bg-slate-50/70 p-4 rounded-lg border border-slate-200">
            <div>
              <p className="text-slate-500 font-medium mb-1">CLIENT PARTICULARS (موکل کی تفصیلات):</p>
              <p className="text-sm font-bold text-slate-900">{client?.fullName || 'Client Record'}</p>
              <p className="text-slate-700">CNIC / ID: <span className="font-mono font-semibold">{client?.cnic || 'N/A'}</span></p>
              <p className="text-slate-700">Mobile: <span className="font-semibold">{client?.phone || 'N/A'}</span></p>
              <p className="text-slate-700">Address: {client?.address || 'Pakistan'}</p>
            </div>

            <div>
              <p className="text-slate-500 font-medium mb-1">OFFICIAL REFERENCE & PORTAL (محکمانہ اندراج):</p>
              <p className="text-slate-700">Service Category: <span className="font-bold text-emerald-900">{service.category}</span></p>
              <p className="text-slate-700">Department / Authority: <span className="font-semibold">{service.department}</span></p>
              <p className="text-slate-700">Token / Challan Ref: <span className="font-mono font-bold text-slate-900">{service.tokenOrChallanNo}</span></p>
              <p className="text-slate-700">Filing / Intake Date: {service.applicationDate}</p>
            </div>
          </div>

          {/* Service Title & Scope */}
          <div className="mb-6 font-sans">
            <h3 className="text-xs font-bold uppercase text-slate-600 mb-1">SERVICE TITLE & LEGAL SCOPE:</h3>
            <div className="p-3.5 bg-emerald-50/50 border border-emerald-200 rounded-lg">
              <p className="text-base font-bold text-slate-900">{service.serviceTitle}</p>
              <p className="text-xs text-slate-700 mt-1">
                <strong>Official Deliverable:</strong> {service.deliverableSummary || 'Formal Certification / Clearance'}
              </p>
            </div>
          </div>

          {/* Status & Clearance Notice */}
          <div className="grid grid-cols-3 gap-3 mb-6 font-sans text-xs">
            <div className="p-3 border border-slate-200 rounded-lg bg-white">
              <span className="text-slate-500 block mb-0.5">CURRENT STAGE</span>
              <span className="inline-flex items-center gap-1 font-bold text-emerald-800 text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {service.status}
              </span>
            </div>
            <div className="p-3 border border-slate-200 rounded-lg bg-white">
              <span className="text-slate-500 block mb-0.5">TARGET DELIVERY</span>
              <span className="font-bold text-slate-800 text-sm">
                {service.completedDate ? `Completed: ${service.completedDate}` : service.targetCompletionDate}
              </span>
            </div>
            <div className="p-3 border border-slate-200 rounded-lg bg-white">
              <span className="text-slate-500 block mb-0.5">CHAMBER COUNSEL</span>
              <span className="font-bold text-slate-800 text-sm truncate block">
                {service.assignedLawyer}
              </span>
            </div>
          </div>

          {/* Verified Document Checklist */}
          {service.requiredDocuments && service.requiredDocuments.length > 0 && (
            <div className="mb-6 font-sans text-xs">
              <h3 className="font-bold uppercase text-slate-600 mb-2">VERIFIED & SCRUTINIZED DOCUMENTS (جانچ پڑتال شدہ دستاویزات):</h3>
              <div className="grid grid-cols-2 gap-2">
                {service.requiredDocuments.map((doc, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-slate-50 rounded border border-slate-200">
                    <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold">
                      ✓
                    </span>
                    <span className="text-slate-800 font-medium">{doc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fee & Financial Statement */}
          <div className="mb-8 font-sans text-xs border border-slate-200 rounded-lg overflow-hidden">
            <div className="bg-slate-100 px-4 py-2 font-bold text-slate-700 uppercase tracking-wider flex justify-between">
              <span>LEGAL FEE & RECOVERY STATEMENT</span>
              <span>CURRENCY: PKR</span>
            </div>
            <div className="p-4 grid grid-cols-3 text-center divide-x divide-slate-200">
              <div>
                <p className="text-slate-500">Agreed Chamber Fee</p>
                <p className="text-base font-bold text-slate-900">PKR {service.totalFee.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-slate-500">Amount Deposited / Paid</p>
                <p className="text-base font-bold text-emerald-700">PKR {service.paidAmount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-slate-500">Remaining Balance</p>
                <p className={`text-base font-bold ${service.remainingAmount > 0 ? 'text-amber-700' : 'text-slate-800'}`}>
                  PKR {service.remainingAmount.toLocaleString()}
                  {service.remainingAmount === 0 && ' (Nil)'}
                </p>
              </div>
            </div>
          </div>

          {/* Remarks & Attestation */}
          {service.notes && (
            <div className="mb-8 font-sans text-xs p-3 bg-amber-50/60 border border-amber-200/80 rounded-lg text-slate-700">
              <strong>Chamber Legal Endorsement / Notes:</strong> {service.notes}
            </div>
          )}

          {/* Professional Signature Block (Authentic Legal Format) */}
          <div className="pt-8 border-t border-slate-300 font-sans grid grid-cols-3 gap-6 items-end text-xs">
            <div className="text-center">
              <div className="h-14 border-b border-slate-700 mb-2 flex items-end justify-center pb-1"></div>
              <p className="font-bold text-slate-900">Applicant / Client</p>
              <p className="text-[10px] text-slate-500">Signature & Thumb Impression</p>
            </div>

            <div className="text-center">
              <div className="h-14 border-b border-slate-700 mb-2 flex items-end justify-center pb-1"></div>
              <p className="font-bold text-slate-900">Chamber Accounts / Office</p>
              <p className="text-[10px] text-slate-500">Filing Verification & Date</p>
            </div>

            <div className="text-center">
              <div className="h-14 border-b-2 border-slate-900 mb-2 flex items-end justify-center pb-1">
                <span className="font-serif italic text-base text-slate-900 font-bold">
                  {currentUser.name.replace('Advocate ', '')}
                </span>
              </div>
              <p className="font-bold text-slate-900">{currentUser.name}</p>
              <p className="text-[10px] text-slate-600 font-semibold">{currentUser.courtEnrollment}</p>
              <p className="text-[10px] text-slate-500">Advocate High Court</p>
            </div>
          </div>
        </div>

        {/* Bottom Action Footer (Hidden on Print) */}
        <div className="no-print px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 font-sans">
            Ref: <span className="font-mono font-bold text-slate-800">{service.tokenOrChallanNo}</span> • Verified Legal Chamber Slip
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <X className="w-4 h-4 text-slate-500" />
              <span>{isRoman ? 'Band Karein (Close)' : 'Close Slip'}</span>
            </button>

            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Share2 className="w-4 h-4" />
              <span>WhatsApp Update</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>{isRoman ? 'Print / Download PDF' : 'Print / Download PDF'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
