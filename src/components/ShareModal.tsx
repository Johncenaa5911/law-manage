import React, { useState } from 'react';
import {
  Share2,
  X,
  MessageCircle,
  Mail,
  Copy,
  Check,
  Calendar,
  CreditCard,
  Briefcase,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export interface ShareData {
  title: string;
  type: 'hearing' | 'case' | 'receipt' | 'general' | 'document';
  clientName?: string;
  clientMobile?: string;
  clientEmail?: string;
  caseNumber?: string;
  courtName?: string;
  hearingDate?: string;
  hearingTime?: string;
  receiptNumber?: string;
  paidAmount?: number;
  remainingAmount?: number;
  documentName?: string;
  documentType?: string;
  documentSize?: string;
  extraNotes?: string;
}

interface ShareModalProps {
  data: ShareData | null;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ data, onClose }) => {
  const { currentUser, openWhatsApp, openEmail } = useApp();
  const [recipientPhone, setRecipientPhone] = useState(data?.clientMobile || '');
  const [recipientEmail, setRecipientEmail] = useState(data?.clientEmail || '');
  const [customUrduNote, setCustomUrduNote] = useState('');
  const [copied, setCopied] = useState(false);

  if (!data) return null;

  // Build structured Roman Urdu and English legal message
  const generateMessageBody = (): string => {
    let body = `⚖️ *${currentUser.name} (Advocate)*\n${currentUser.courtEnrollment}\nChamber: ${currentUser.chamberAddress}\n\n`;

    if (data.type === 'hearing') {
      body += `*HEARING NOTICE / عدالت میں پیشی کی اطلاع*\n`;
      body += `━━━━━━━━━━━━━━━━━━━━\n`;
      body += `Dear Client: *${data.clientName || 'Valued Client'}*,\n`;
      body += `Aap ke case ki agli peshi (court hearing) schedule ho chuki hai:\n\n`;
      body += `📌 *Case No:* ${data.caseNumber || 'N/A'}\n`;
      body += `🏛️ *Court:* ${data.courtName || 'District Courts'}\n`;
      body += `📅 *Hearing Date:* ${data.hearingDate || 'Scheduled Date'}\n`;
      body += `⏰ *Hearing Time:* ${data.hearingTime || '09:00 AM'}\n\n`;
      body += `⚠️ *Hidayat / Instruction:* Bara-e-meherbani time par court complex tashreef layein aur apne zaroori documents sath layein.\n`;
    } else if (data.type === 'receipt') {
      body += `*FEE PAYMENT RECEIPT / فیس کی رسید*\n`;
      body += `━━━━━━━━━━━━━━━━━━━━\n`;
      body += `Client: *${data.clientName}*\n`;
      body += `Case: *${data.caseNumber}*\n`;
      body += `Receipt No: *${data.receiptNumber}*\n`;
      body += `💰 *Wasool Shuda Raqam (Paid):* PKR ${(data.paidAmount || 0).toLocaleString()}\n`;
      body += `⏳ *Baqaya Raqam (Remaining):* PKR ${(data.remainingAmount || 0).toLocaleString()}\n\n`;
      body += `Payment has been successfully recorded in Wakalat legal accounts. Shukriya.\n`;
    } else if (data.type === 'document') {
      body += `*LEGAL DOCUMENT DISPATCH / تصدیق شدہ دستاویز کی ترسیل*\n`;
      body += `━━━━━━━━━━━━━━━━━━━━\n`;
      body += `Dear Client: *${data.clientName || 'Valued Client'}*,\n`;
      body += `Aap ki chamber archive se tasdeeq shuda legal document issue kar di gayi hai:\n\n`;
      body += `📄 *Document Title:* ${data.documentName || 'Chamber Filing'}\n`;
      body += `📁 *Type:* ${data.documentType || 'Official Record'}\n`;
      if (data.caseNumber) body += `⚖️ *Case Reference:* ${data.caseNumber}\n`;
      if (data.documentSize) body += `💾 *Size & Cloud Status:* ${data.documentSize} (Verified in Chamber Attached Drive)\n`;
      body += `\nYeh document High Court Bar Chamber digital archive se tasdeeq shuda hai.\n`;
    } else {
      body += `*LEGAL CASE UPDATE / کیس کی تفصیل*\n`;
      body += `━━━━━━━━━━━━━━━━━━━━\n`;
      body += `Client: *${data.clientName}*\n`;
      body += `Case: *${data.caseNumber}*\n`;
      body += `Court: *${data.courtName}*\n\n`;
      body += `Aap ke case ki legal proceedings regular basis par update ki ja rahi hain.\n`;
    }

    if (data.extraNotes) {
      body += `\n*Note:* ${data.extraNotes}\n`;
    }

    if (customUrduNote.trim()) {
      body += `\n*Special Advocate Message:* ${customUrduNote.trim()}\n`;
    }

    body += `\n━━━━━━━━━━━━━━━━━━━━\n`;
    body += `Contact Chamber: ${currentUser.phone}`;
    return body;
  };

  const fullText = generateMessageBody();

  const handleCopy = () => {
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWhatsApp = () => {
    openWhatsApp(recipientPhone, fullText);
    onClose();
  };

  const handleSendEmail = () => {
    const subject = `Legal Update: ${data.title} - ${data.caseNumber || 'Case Record'}`;
    openEmail(recipientEmail, subject, fullText);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Share Legal Record</h3>
              <p className="text-[11px] text-slate-500">WhatsApp & Email Dispatch (Section 13 & 14)</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Inputs for target recipients */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Client Mobile (WhatsApp)
              </label>
              <input
                type="text"
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value)}
                placeholder="e.g. 03001234567"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Client Email
              </label>
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="client@email.com"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Add Custom Message in Roman Urdu (Optional)
            </label>
            <input
              type="text"
              value={customUrduNote}
              onChange={(e) => setCustomUrduNote(e.target.value)}
              placeholder="e.g. Asal documents subah 9 baje lekar court pohanch jayein..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
            />
          </div>

          {/* Generated Message Preview */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-slate-700 text-[11px]">
                Prepared Message Preview:
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-[11px] text-amber-700 hover:text-amber-800 font-semibold"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>
            </div>
            <div className="p-3 bg-slate-900 text-slate-100 rounded-xl font-mono text-[11px] leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap border border-slate-800">
              {fullText}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSendEmail}
            disabled={!recipientEmail}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Send via Email</span>
          </button>
          <button
            onClick={handleSendWhatsApp}
            disabled={!recipientPhone}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Share on WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
};
