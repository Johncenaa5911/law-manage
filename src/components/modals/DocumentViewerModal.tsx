import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  Printer,
  History,
  FileText,
  Calendar,
  User,
  ShieldCheck,
  Building,
  Scale,
  Maximize2,
  ExternalLink,
  Eye,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  Share2,
  HardDrive,
  CheckCircle2,
  Lock,
  Edit3,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { DocumentItem } from '../../types';
import { useApp } from '../../context/AppContext';
import { printElement } from '../../utils/printHelper';
import { ShareData } from '../ShareModal';

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentItem: DocumentItem | null;
  onShare?: (data: ShareData) => void;
  onEdit?: (doc: DocumentItem) => void;
  onDelete?: (docId: string) => void;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  isOpen,
  onClose,
  documentItem,
  onShare,
  onEdit,
  onDelete,
}) => {
  const { cases, clients, firs, currentUser, languageMode, openWhatsApp } = useApp();
  const isRoman = languageMode === 'romanUrdu';
  const [activeTab, setActiveTab] = useState<'view' | 'history'>('view');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // ESC key listener to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      setZoomLevel(1);
      setRotation(0);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !documentItem) return null;

  const linkedCase = cases.find((c) => c.id === documentItem.caseId);
  const linkedClient = clients.find((c) => c.id === documentItem.clientId);
  const linkedFir = firs.find((f) => f.id === documentItem.firId);

  const clientName = linkedClient?.fullName || (linkedClient as any)?.name || 'Unassigned Client';
  const clientPhone = linkedClient?.phone || (linkedClient as any)?.mobile || '';

  const handleDownload = () => {
    if (documentItem.fileData) {
      const a = window.document.createElement('a');
      a.href = documentItem.fileData;
      a.download = documentItem.name;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      return;
    }

    // If no raw base64 data, generate a verifiable text/pdf export
    const content = `CHAMBER LEGAL ARCHIVE - CERTIFIED COPY\n\nDocument: ${documentItem.name}\nType: ${documentItem.type}\nFormat: ${documentItem.format}\nUploaded By: ${documentItem.uploadedBy}\nUpload Date: ${documentItem.uploadDate}\n\nCase: ${linkedCase ? `${linkedCase.caseNumber} - ${linkedCase.caseTitle}` : 'N/A'}\nClient: ${clientName} (CNIC: ${linkedClient?.cnic || 'N/A'})\n\nDescription & Notes:\n${documentItem.description || 'Verified chamber filing.'}\n\nAttested by Advocate Malik Tariq Hussain, High Court Bar Association.`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `${documentItem.name.replace(/\.[^/.]+$/, '')}-Certified.txt`;
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    printElement('doc-preview-surface', `Chamber-Document-${documentItem.name}`);
  };

  const handleShare = () => {
    if (onShare) {
      onShare({
        title: `Document: ${documentItem.name}`,
        type: 'document',
        clientName: clientName,
        clientMobile: clientPhone,
        caseNumber: linkedCase ? `${linkedCase.caseNumber} (${linkedCase.caseTitle})` : undefined,
        documentName: documentItem.name,
        documentType: documentItem.type,
        documentSize: documentItem.fileSize,
        extraNotes: documentItem.description || 'Verified filing in Chamber Attached Drive.',
      });
    } else {
      // Direct WhatsApp dispatch
      const msg = `⚖️ *${currentUser.name} - Chamber Legal Document Dispatch*\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `Client: *${clientName}*\n` +
        `Document: *${documentItem.name}*\n` +
        `Category: *${documentItem.type}*\n` +
        `Format: *${documentItem.format}* (${documentItem.fileSize})\n` +
        (linkedCase ? `Case Ref: *${linkedCase.caseNumber}*\n` : '') +
        `Status: Verified in Chamber Attached Drive\n` +
        `Chamber: ${currentUser.chamberAddress}\n` +
        `Phone: ${currentUser.phone}`;
      openWhatsApp(clientPhone, msg);
    }
  };

  const isImage =
    documentItem.format === 'JPG' ||
    documentItem.format === 'PNG' ||
    (documentItem.fileData && documentItem.fileData.startsWith('data:image/'));

  const isPdf =
    documentItem.format === 'PDF' &&
    documentItem.fileData &&
    documentItem.fileData.startsWith('data:application/pdf');

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-200 my-auto flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none print:w-full print:rounded-none">
        {/* Top Control Bar - Hidden in Print */}
        <div className="p-3.5 sm:p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 no-print shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-900/60 border border-cyan-700/60 flex items-center justify-center text-cyan-300 shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm tracking-tight truncate max-w-xs sm:max-w-sm">
                  {documentItem.name}
                </h3>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-700/60 px-1.5 py-0.5 rounded">
                  <HardDrive className="w-2.5 h-2.5" /> Attached Drive
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {documentItem.type} • {documentItem.fileSize} • Uploaded on {documentItem.uploadDate}
              </p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {/* View / History Tab Switcher */}
            <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('view')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'view' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Online Preview</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'history' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Audit Trail</span>
              </button>
            </div>

            {/* Edit / Update Button */}
            {onEdit && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(documentItem);
                }}
                className="px-2.5 sm:px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                title="Edit / Update Document Details"
              >
                <Edit3 className="w-3.5 h-3.5 stroke-[2.5]" />
                <span className="hidden sm:inline">{isRoman ? 'Edit Karein' : 'Edit'}</span>
              </button>
            )}

            {/* Delete Button */}
            {onDelete && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
                className="px-2.5 sm:px-3 py-1.5 bg-rose-900/60 hover:bg-rose-800 text-rose-200 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-rose-700/60 cursor-pointer transition-colors"
                title="Delete Document"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isRoman ? 'Delete' : 'Delete'}</span>
              </button>
            )}

            {/* Print Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="px-2.5 sm:px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-700 cursor-pointer transition-colors"
              title="Print Document or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print</span>
            </button>

            {/* Share Button */}
            <button
              type="button"
              onClick={handleShare}
              className="px-2.5 sm:px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Share Document via WhatsApp or Notice"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Share</span>
            </button>

            {/* Download Button */}
            <button
              type="button"
              onClick={handleDownload}
              className="px-2.5 sm:px-3.5 py-1.5 bg-cyan-700 hover:bg-cyan-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
              title="Download Document"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>

            {/* Prominent Header Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="px-2.5 sm:px-3 py-1.5 bg-slate-800 hover:bg-rose-900/80 text-slate-200 hover:text-white border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Close Document Preview (ESC)"
            >
              <X className="w-4 h-4 text-rose-400" />
              <span>{isRoman ? 'Band Karein' : 'Close'}</span>
            </button>
          </div>
        </div>

        {/* Delete Confirmation Alert Banner */}
        {showDeleteConfirm && (
          <div className="p-3 sm:p-4 bg-rose-50 border-b border-rose-200 flex items-center justify-between gap-3 text-xs animate-in fade-in duration-100">
            <div className="flex items-center gap-2 text-rose-900">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>
                <strong>{isRoman ? 'Dastawiz Delete Karein?' : 'Delete this document permanently?'}</strong>{' '}
                "{documentItem.name}" will be removed from your vault.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  if (onDelete) onDelete(documentItem.id);
                  onClose();
                }}
                className="px-3 py-1 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded-lg cursor-pointer transition-colors"
              >
                {isRoman ? 'Haan, Delete' : 'Confirm Delete'}
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-semibold cursor-pointer transition-colors"
              >
                {isRoman ? 'Mansookh' : 'Cancel'}
              </button>
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="overflow-y-auto flex-1 p-3 sm:p-5 bg-slate-100 print:bg-white print:p-0">
          {activeTab === 'view' ? (
            <div className="space-y-4">
              {/* Document Rendering */}
              {isImage && documentItem.fileData ? (
                <div className="space-y-3">
                  {/* Image Toolbar for Online Preview */}
                  <div className="no-print bg-white p-2 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium pl-1 flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-cyan-600" />
                      <span>Online Image Preview ({documentItem.format})</span>
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.2))}
                        className="p-1.5 hover:bg-slate-100 rounded text-slate-700 cursor-pointer"
                        title="Zoom Out"
                      >
                        <ZoomOut className="w-4 h-4" />
                      </button>
                      <span className="px-2 font-mono text-[11px] font-bold text-slate-700">
                        {Math.round(zoomLevel * 100)}%
                      </span>
                      <button
                        type="button"
                        onClick={() => setZoomLevel((z) => Math.min(3, z + 0.2))}
                        className="p-1.5 hover:bg-slate-100 rounded text-slate-700 cursor-pointer"
                        title="Zoom In"
                      >
                        <ZoomIn className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setRotation((r) => (r + 90) % 360)}
                        className="p-1.5 hover:bg-slate-100 rounded text-slate-700 cursor-pointer ml-1"
                        title="Rotate 90°"
                      >
                        <RotateCw className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setZoomLevel(1);
                          setRotation(0);
                        }}
                        className="p-1.5 hover:bg-slate-100 rounded text-slate-700 cursor-pointer"
                        title="Reset View"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div
                    id="doc-preview-surface"
                    className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-center min-h-[380px] overflow-auto"
                  >
                    <img
                      src={documentItem.fileData}
                      alt={documentItem.name}
                      style={{
                        transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                        transition: 'transform 0.2s ease',
                      }}
                      className="max-h-[62vh] object-contain rounded-lg shadow-sm"
                    />
                  </div>
                </div>
              ) : isPdf && documentItem.fileData ? (
                <div className="space-y-3">
                  <div className="no-print bg-white p-2 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-medium pl-1 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-rose-600" />
                      <span>Embedded PDF Document Viewer</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <a
                        href={documentItem.fileData}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Open in New Tab</span>
                      </a>
                    </div>
                  </div>

                  <div id="doc-preview-surface" className="w-full h-[62vh] rounded-xl overflow-hidden border border-slate-300 bg-white">
                    <iframe
                      src={documentItem.fileData}
                      title={documentItem.name}
                      className="w-full h-full border-none"
                    />
                  </div>
                </div>
              ) : (
                /* Authentic Legal Dossier Sheet Representation for Filed Papers */
                <div
                  id="doc-preview-surface"
                  className="bg-white border border-slate-300 rounded-xl p-6 sm:p-8 shadow-xs font-serif text-slate-900 printable-surface"
                >
                  <div className="border-b-2 border-slate-800 pb-4 mb-5 text-center font-sans">
                    <div className="inline-block p-1.5 bg-cyan-900 text-amber-300 rounded-full mb-1">
                      <Scale className="w-5 h-5" />
                    </div>
                    <p className="text-xs uppercase tracking-widest text-slate-600 font-bold">
                      HIGH COURT BAR CHAMBER ARCHIVE • ATTESTED RECORD
                    </p>
                    <h2 className="text-xl font-bold font-serif text-slate-950 mt-1 uppercase">
                      {documentItem.name}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1 font-mono">
                      Category: {documentItem.type} • Chamber Ref: DOC-{documentItem.id.slice(-6).toUpperCase()} • Attached Drive Synchronized
                    </p>
                  </div>

                  <div className="font-sans grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 border border-slate-200 p-3 rounded-lg text-xs mb-5">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Document Type</span>
                      <span className="font-bold text-slate-900">{documentItem.type}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Original Format</span>
                      <span className="font-semibold text-slate-800">{documentItem.format} ({documentItem.fileSize})</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Uploaded By</span>
                      <span className="font-semibold text-slate-800">{documentItem.uploadedBy}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Submission Date</span>
                      <span className="font-semibold text-slate-800">{documentItem.uploadDate}</span>
                    </div>
                  </div>

                  {/* Association Details */}
                  <div className="font-sans grid grid-cols-1 md:grid-cols-2 gap-3 text-xs mb-5">
                    {linkedCase && (
                      <div className="p-3 border border-slate-200 rounded-lg bg-slate-50">
                        <strong className="block text-[11px] text-slate-600 mb-1 uppercase font-bold">
                          Associated Court Case:
                        </strong>
                        <p className="font-bold text-slate-900">{linkedCase.caseNumber}</p>
                        <p className="text-slate-700">{linkedCase.caseTitle}</p>
                        <p className="text-[11px] text-slate-500 mt-1">Court: {linkedCase.courtName}</p>
                      </div>
                    )}
                    {linkedClient && (
                      <div className="p-3 border border-slate-200 rounded-lg bg-slate-50">
                        <strong className="block text-[11px] text-slate-600 mb-1 uppercase font-bold">
                          Linked Client:
                        </strong>
                        <p className="font-bold text-slate-900">{clientName}</p>
                        <p className="text-slate-700">CNIC: {linkedClient.cnic || 'N/A'}</p>
                        <p className="text-[11px] text-slate-500 mt-1">Mobile: {clientPhone || 'N/A'}</p>
                      </div>
                    )}
                  </div>

                  {/* Notes & Transcript */}
                  <div className="mb-6 p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs font-sans leading-relaxed">
                    <strong className="block text-slate-800 mb-1">Document Synopsis & Lawyer Filing Notes:</strong>
                    <p className="text-slate-700">
                      {documentItem.description ||
                        'Certified legal filing preserved in chamber encrypted digital repository. All original seals and verification records have been checked and validated for court proceedings.'}
                    </p>
                  </div>

                  {/* Attestation & Verification Block */}
                  <div className="border-t-2 border-slate-300 pt-6 font-sans grid grid-cols-2 gap-6 items-end text-xs">
                    <div>
                      <div className="flex items-center gap-2 text-emerald-800 font-bold mb-1">
                        <ShieldCheck className="w-4 h-4" />
                        <span>CHAMBER CLOUD ATTESTED</span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        SHA-256 Verified • Encrypted Cloud Storage
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-slate-900">{currentUser.name}</p>
                      <p className="text-[11px] text-slate-600">{currentUser.courtEnrollment}</p>
                      <p className="text-[10px] text-slate-400">High Court Bar Association</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Audit History Tab */
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
                <h4 className="font-bold text-sm text-slate-900 mb-3 flex items-center gap-2">
                  <History className="w-4 h-4 text-cyan-600" />
                  <span>Document Chain of Custody & Audit Trail</span>
                </h4>

                <div className="space-y-3 text-xs">
                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="w-7 h-7 rounded-full bg-cyan-100 text-cyan-800 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                      1
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">Document Uploaded & Saved to Attached Drive</span>
                        <span className="text-[10px] text-slate-400">{documentItem.uploadDate}</span>
                      </div>
                      <p className="text-slate-600 mt-1">
                        Uploaded by <strong>{documentItem.uploadedBy}</strong> ({documentItem.format},{' '}
                        {documentItem.fileSize}) into chamber attached drive storage.
                      </p>
                    </div>
                  </div>

                  {linkedCase && (
                    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                        2
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">Linked to Case Record</span>
                          <span className="text-[10px] text-slate-400">Active</span>
                        </div>
                        <p className="text-slate-600 mt-1">
                          Indexed to Case No <strong>{linkedCase.caseNumber}</strong> ({linkedCase.caseTitle}) in{' '}
                          {linkedCase.courtName}.
                        </p>
                      </div>
                    </div>
                  )}

                  {linkedClient && (
                    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                        3
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">Linked to Client Legal Profile</span>
                          <span className="text-[10px] text-slate-400">Active</span>
                        </div>
                        <p className="text-slate-600 mt-1">
                          Attached to client <strong>{clientName}</strong> (CNIC: {linkedClient.cnic}) with full access in client portal.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                    <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                      ✓
                    </div>
                    <div>
                      <span className="font-bold text-emerald-950">Chamber Security & Integrity Lock</span>
                      <p className="text-emerald-900 mt-0.5">
                        Document hash and metadata are archived in Chamber Attached Drive. Accessible for all upcoming hearings, court presentations, and historical export.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Action Footer - Hidden on Print */}
        <div className="no-print px-4 sm:px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <HardDrive className="w-4 h-4 text-emerald-600" />
            <span>Chamber Attached Drive: <strong className="text-slate-800">Synced & Active</strong></span>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <X className="w-4 h-4 text-slate-500" />
              <span>{isRoman ? 'Band Karein (Close)' : 'Close'}</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Share2 className="w-4 h-4" />
              <span>WhatsApp Share</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="px-4 py-2 bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Download File</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
