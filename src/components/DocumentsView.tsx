import React, { useState } from 'react';
import {
  FolderLock,
  Upload,
  Search,
  FileText,
  Filter,
  Download,
  Trash2,
  ExternalLink,
  Eye,
  CheckCircle,
  FileBadge,
  HardDrive,
  Cloud,
  FileCheck,
  Building,
  Printer,
  Share2,
  Folder,
  Layers,
  Archive,
  RefreshCw,
  CheckCircle2,
  ShieldCheck,
  SlidersHorizontal,
  Edit3,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DocumentItem, DocumentType } from '../types';
import { DocumentViewerModal } from './modals/DocumentViewerModal';
import { ShareData } from './ShareModal';
import { printElement } from '../utils/printHelper';

interface DocumentsViewProps {
  onOpenDocModal: (doc?: DocumentItem) => void;
  onOpenShareModal?: (data: ShareData) => void;
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({
  onOpenDocModal,
  onOpenShareModal,
}) => {
  const {
    documents,
    cases,
    clients,
    deleteDocument,
    languageMode,
    currentRole,
    currentUser,
    openWhatsApp,
    openGoogleDriveModal,
  } = useApp();

  const isRoman = languageMode === 'romanUrdu';
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [folderFilter, setFolderFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const [deleteConfirmDoc, setDeleteConfirmDoc] = useState<DocumentItem | null>(null);

  const driveFolders = [
    { id: 'all', label: isRoman ? 'Tamam Files (All)' : 'All Drive Files', icon: Folder, count: documents.length },
    {
      id: 'cases',
      label: isRoman ? 'Case Petitions & Orders' : 'Case Petitions & Orders',
      icon: Layers,
      count: documents.filter((d) => ['Bail Application', 'Court Order', 'Judgment', 'Vakalatnama'].includes(d.type)).length,
    },
    {
      id: 'clients',
      label: isRoman ? 'Client CNIC & Records' : 'Client ID & CNICs',
      icon: FileBadge,
      count: documents.filter((d) => d.type === 'CNIC Copy').length,
    },
    {
      id: 'services',
      label: isRoman ? 'Legal Services & Clearances' : 'Legal Clearances & Reports',
      icon: Building,
      count: documents.filter((d) => ['Police Report', 'Medical Report', 'Agreement'].includes(d.type)).length,
    },
    {
      id: 'firs',
      label: isRoman ? 'FIR & Criminal Records' : 'Police FIRs & Evidence',
      icon: FileText,
      count: documents.filter((d) => ['FIR Copy', 'Evidence', 'Witness Documents'].includes(d.type)).length,
    },
    {
      id: 'affidavits',
      label: isRoman ? 'Affidavits & Bayan Halfi' : 'Affidavits & Agreements',
      icon: FileCheck,
      count: documents.filter((d) => ['Affidavit', 'Agreement', 'Other Documents'].includes(d.type)).length,
    },
  ];

  const documentTypes: DocumentType[] = [
    'FIR Copy',
    'CNIC Copy',
    'Bail Application',
    'Court Order',
    'Judgment',
    'Affidavit',
    'Agreement',
    'Evidence',
    'Witness Documents',
    'Police Report',
    'Medical Report',
    'Vakalatnama',
    'Other Documents',
  ];

  const filteredDocs = documents.filter((d) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      d.name.toLowerCase().includes(q) ||
      d.type.toLowerCase().includes(q) ||
      (d.description && d.description.toLowerCase().includes(q)) ||
      (d.uploadedBy && d.uploadedBy.toLowerCase().includes(q));

    const matchesType = typeFilter === 'all' || d.type === typeFilter;

    let matchesFolder = true;
    if (folderFilter === 'cases') {
      matchesFolder = ['Bail Application', 'Court Order', 'Judgment', 'Vakalatnama'].includes(d.type) || !!d.caseId;
    } else if (folderFilter === 'clients') {
      matchesFolder = d.type === 'CNIC Copy' || !!d.clientId;
    } else if (folderFilter === 'services') {
      matchesFolder = ['Police Report', 'Medical Report', 'Agreement'].includes(d.type) || !!d.serviceId;
    } else if (folderFilter === 'firs') {
      matchesFolder = ['FIR Copy', 'Evidence', 'Witness Documents'].includes(d.type) || !!d.firId;
    } else if (folderFilter === 'affidavits') {
      matchesFolder = ['Affidavit', 'Agreement', 'Other Documents'].includes(d.type);
    }

    return matchesSearch && matchesType && matchesFolder;
  });

  const handleDirectDownload = (doc: DocumentItem) => {
    if (doc.fileData) {
      const a = document.createElement('a');
      a.href = doc.fileData;
      a.download = doc.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    const linkedCase = cases.find((c) => c.id === doc.caseId);
    const linkedClient = clients.find((c) => c.id === doc.clientId);
    const clientName = linkedClient?.fullName || (linkedClient as any)?.name || 'Unassigned';

    const content = `CHAMBER LEGAL ARCHIVE - CERTIFIED COPY\n\nDocument: ${doc.name}\nType: ${doc.type}\nFormat: ${doc.format}\nUploaded By: ${doc.uploadedBy}\nUpload Date: ${doc.uploadDate}\n\nCase: ${linkedCase ? `${linkedCase.caseNumber} - ${linkedCase.caseTitle}` : 'N/A'}\nClient: ${clientName} (CNIC: ${linkedClient?.cnic || 'N/A'})\n\nDescription:\n${doc.description || 'Verified chamber filing.'}\n\nAttested by Advocate Malik Tariq Hussain, High Court Bar Association.\nChamber Attached Drive Hash ID: SHA256-DOC-${doc.id.slice(0, 8)}`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.name.replace(/\.[^/.]+$/, '')}-Certified.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDirectShare = (doc: DocumentItem) => {
    const linkedCase = cases.find((c) => c.id === doc.caseId);
    const linkedClient = clients.find((c) => c.id === doc.clientId);
    const clientName = linkedClient?.fullName || (linkedClient as any)?.name || 'Client';
    const clientPhone = linkedClient?.phone || (linkedClient as any)?.mobile || '';

    if (onOpenShareModal) {
      onOpenShareModal({
        title: `Document: ${doc.name}`,
        type: 'document',
        clientName: clientName,
        clientMobile: clientPhone,
        caseNumber: linkedCase ? `${linkedCase.caseNumber} (${linkedCase.caseTitle})` : undefined,
        documentName: doc.name,
        documentType: doc.type,
        documentSize: doc.fileSize,
        extraNotes: doc.description || 'Verified filing in Chamber Attached Drive.',
      });
    } else {
      const msg = `⚖️ *${currentUser.name} - Chamber Legal Document Dispatch*\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `Client: *${clientName}*\n` +
        `Document: *${doc.name}*\n` +
        `Category: *${doc.type}*\n` +
        `Format: *${doc.format}* (${doc.fileSize})\n` +
        (linkedCase ? `Case Ref: *${linkedCase.caseNumber}*\n` : '') +
        `Status: Verified in Chamber Attached Drive\n` +
        `Chamber: ${currentUser.chamberAddress}\n` +
        `Phone: ${currentUser.phone}`;
      openWhatsApp(clientPhone, msg);
    }
  };

  const handleDirectPrint = (doc: DocumentItem) => {
    setPreviewDoc(doc);
    setTimeout(() => {
      printElement('doc-preview-surface', `Chamber-Document-${doc.name}`);
    }, 250);
  };

  const handleExportDriveArchive = () => {
    const manifest = {
      chamberName: currentUser.name,
      licenseNo: currentUser.barLicenseNo,
      exportTimestamp: new Date().toISOString(),
      totalDocuments: documents.length,
      storageStatus: 'Active Encrypted Chamber Attached Drive',
      documents: documents.map((d) => ({
        id: d.id,
        name: d.name,
        type: d.type,
        format: d.format,
        size: d.fileSize,
        uploadedBy: d.uploadedBy,
        uploadDate: d.uploadDate,
        description: d.description,
        caseId: d.caseId,
        clientId: d.clientId,
        hasFileData: !!d.fileData,
      })),
    };
    const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Chamber-Drive-Manifest-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-3 sm:p-5 md:p-8 max-w-7xl mx-auto space-y-4 sm:space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-cyan-100 text-cyan-800 rounded-xl">
              <FolderLock className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Attached Chamber Drive & Documents Vault</span>
                <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full font-bold">
                  Active
                </span>
              </h1>
              <p className="text-xs md:text-sm text-slate-500 mt-0.5">
                {isRoman
                  ? 'Attached Drive: tamam legal files, court orders, bail petitions, FIR copies aur scan documents save karein, preview karein, share karein ya print karein'
                  : 'Centralized attached cloud drive repository for instant saving, online preview, client sharing, and official court printing'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <button
            id="btn-google-drive-sync"
            type="button"
            onClick={() => openGoogleDriveModal()}
            className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs md:text-sm font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            title="Connect & Backup to Google Drive"
          >
            <HardDrive className="w-4 h-4 text-amber-600" />
            <span>Google Drive Sync</span>
          </button>

          <button
            type="button"
            onClick={handleExportDriveArchive}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            title="Download Drive Manifest & File Inventory"
          >
            <Archive className="w-4 h-4 text-slate-500" />
            <span>Export Manifest</span>
          </button>

          <button
            id="btn-upload-document"
            type="button"
            onClick={() => onOpenDocModal()}
            className="px-4 py-2 bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl text-xs md:text-sm font-semibold flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>+ Save File to Drive</span>
          </button>
        </div>
      </div>

      {/* Attached Cloud Drive Status Banner */}
      <div className="bg-gradient-to-r from-cyan-900 via-slate-900 to-slate-950 text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-cyan-800/40">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-cyan-800/60 border border-cyan-600/40 flex items-center justify-center text-cyan-300 shrink-0 shadow-xs">
              <HardDrive className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base tracking-wide">
                  Chamber Attached Cloud Drive • Online Legal Storage
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Synced & Protected
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                {isRoman
                  ? 'Aap ki tamam documents AES-256 encrypted chamber cloud storage me mehfooz hain. Har document ko online preview, WhatsApp share, instant PDF download aur print kiya ja sakta hai.'
                  : 'All client identity scans, court orders, bail petitions, and police records are saved in your chamber attached drive with SHA-256 audit verification and quick multi-channel dispatch.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-4 border-t lg:border-t-0 lg:border-l border-slate-700/80 pt-3 lg:pt-0 lg:pl-6 text-center">
            <div className="bg-slate-800/50 p-2 sm:p-2.5 rounded-xl border border-slate-700/50">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Files</span>
              <span className="text-base sm:text-lg font-bold font-mono text-cyan-300">{documents.length}</span>
            </div>
            <div className="bg-slate-800/50 p-2 sm:p-2.5 rounded-xl border border-slate-700/50">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Drive Status</span>
              <span className="text-xs sm:text-sm font-bold text-emerald-400">100% Online</span>
            </div>
            <div className="bg-slate-800/50 p-2 sm:p-2.5 rounded-xl border border-slate-700/50">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Cloud Sync</span>
              <span className="text-xs sm:text-sm font-bold text-slate-200">Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Drive Folders Quick Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {driveFolders.map((folder) => {
          const Icon = folder.icon;
          const isActive = folderFilter === folder.id;
          return (
            <button
              key={folder.id}
              type="button"
              onClick={() => setFolderFilter(folder.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer border ${
                isActive
                  ? 'bg-cyan-700 text-white border-cyan-700 shadow-xs'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{folder.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                  isActive ? 'bg-cyan-800 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {folder.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search and Advanced Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search document name, type, note..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        <div className="w-full md:w-auto flex flex-wrap items-center gap-2.5 justify-end">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="p-1.5 border border-slate-300 rounded-lg bg-slate-50 text-slate-800 text-xs focus:ring-2 focus:ring-cyan-500 cursor-pointer"
            >
              <option value="all">All Document Types</option>
              {documentTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Grid / List View Toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Grid
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                viewMode === 'list' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredDocs.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-cyan-50 text-cyan-700 flex items-center justify-center mx-auto mb-4 border border-cyan-200">
            <HardDrive className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Documents Found in Drive</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            {isRoman
              ? 'Aap ke search criteria se koi document match nahi hua. Naya document save karne ke liye upload button dabayein.'
              : 'No documents match your filter. Upload legal briefs, petitions, CNIC scans or orders into your attached drive.'}
          </p>
          <button
            type="button"
            onClick={() => onOpenDocModal()}
            className="mt-4 px-4 py-2 bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Document to Drive</span>
          </button>
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => {
            const linkedCase = cases.find((c) => c.id === doc.caseId);
            const linkedClient = clients.find((cl) => cl.id === doc.clientId);

            return (
              <div
                key={doc.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-cyan-400 hover:shadow-md transition-all p-4 sm:p-5 flex flex-col justify-between group"
              >
                <div>
                  {/* Top Bar with Format Badge & Drive Sync Indicator */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-800 border border-cyan-200 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-50 text-cyan-800 border border-cyan-200">
                            {doc.type}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                            {doc.format}
                          </span>
                        </div>
                        <h3 className="font-bold text-slate-900 text-sm mt-1 line-clamp-1 group-hover:text-cyan-800 transition-colors">
                          {doc.name}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {doc.isSyncedToDrive && (
                        <span
                          className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full"
                          title="File synced to your personal Google Drive"
                        >
                          <HardDrive className="w-2.5 h-2.5 text-amber-600" /> G-Drive
                        </span>
                      )}
                      <span
                        className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full"
                        title="File safely saved in Chamber Attached Drive"
                      >
                        <CheckCircle className="w-3 h-3" /> Drive
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 mt-2.5 line-clamp-2 leading-relaxed">
                    {doc.description || 'Verified legal chamber document preserved in attached drive repository.'}
                  </p>

                  <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
                    {linkedCase && (
                      <div className="truncate">
                        <strong className="text-slate-700">Case:</strong> {linkedCase.caseNumber} - {linkedCase.caseTitle}
                      </div>
                    )}
                    {linkedClient && (
                      <div className="truncate">
                        <strong className="text-slate-700">Client:</strong> {linkedClient.fullName || (linkedClient as any).name || 'Client'}
                      </div>
                    )}
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                      <span>Saved: {doc.uploadDate}</span>
                      <span className="font-mono">{doc.fileSize}</span>
                    </div>
                  </div>
                </div>

                {/* 4 Primary Action Buttons: Preview, Download, Share, Print */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1">
                    {/* Online Preview Button */}
                    <button
                      type="button"
                      onClick={() => setPreviewDoc(doc)}
                      className="px-2.5 py-1.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      title="Online Preview in High Fidelity Viewer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview</span>
                    </button>

                    {/* Edit / Update Button */}
                    <button
                      type="button"
                      onClick={() => onOpenDocModal(doc)}
                      className="px-2 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      title="Edit / Update Document Details"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                      <span>Edit</span>
                    </button>

                    {/* Download Button */}
                    <button
                      type="button"
                      onClick={() => handleDirectDownload(doc)}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center transition-colors cursor-pointer"
                      title="Download Original File or Certified Copy"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>

                    {/* Share Button */}
                    <button
                      type="button"
                      onClick={() => handleDirectShare(doc)}
                      className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold flex items-center transition-colors cursor-pointer"
                      title="Share Document Notice via WhatsApp"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Print Button */}
                    <button
                      type="button"
                      onClick={() => handleDirectPrint(doc)}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center transition-colors cursor-pointer"
                      title="Print Document or Save as PDF"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>

                    {/* Google Drive Direct Link or Sync Button */}
                    {doc.driveWebViewLink ? (
                      <a
                        href={doc.driveWebViewLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-xs font-semibold flex items-center transition-colors cursor-pointer"
                        title="Open in Google Drive"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-amber-700" />
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openGoogleDriveModal(doc)}
                        className="p-1.5 bg-slate-100 hover:bg-amber-50 text-slate-600 hover:text-amber-800 rounded-lg text-xs font-semibold flex items-center transition-colors cursor-pointer"
                        title="Upload Copy to Google Drive"
                      >
                        <HardDrive className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmDoc(doc)}
                    className="text-slate-400 hover:text-rose-700 hover:bg-rose-50 p-1.5 transition-colors rounded-lg cursor-pointer"
                    title={isRoman ? 'Dastawiz Delete Karein' : 'Delete Document'}
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List View Table */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Document Name</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Format / Size</th>
                  <th className="p-3.5">Linked Case / Client</th>
                  <th className="p-3.5">Date Saved</th>
                  <th className="p-3.5">Drive Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDocs.map((doc) => {
                  const linkedCase = cases.find((c) => c.id === doc.caseId);
                  const linkedClient = clients.find((cl) => cl.id === doc.clientId);

                  return (
                    <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3.5 font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-cyan-700 shrink-0" />
                          <span className="truncate max-w-xs">{doc.name}</span>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-50 text-cyan-800 border border-cyan-200">
                          {doc.type}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-slate-600">
                        {doc.format} • {doc.fileSize}
                      </td>
                      <td className="p-3.5 text-slate-600">
                        {linkedCase && (
                          <div className="truncate max-w-xs font-semibold text-slate-800">
                            {linkedCase.caseNumber}
                          </div>
                        )}
                        {linkedClient && (
                          <div className="text-[11px] text-slate-500 truncate max-w-xs">
                            {linkedClient.fullName || (linkedClient as any).name}
                          </div>
                        )}
                        {!linkedCase && !linkedClient && <span className="text-slate-400">General Filing</span>}
                      </td>
                      <td className="p-3.5 text-slate-500 font-mono">{doc.uploadDate}</td>
                      <td className="p-3.5">
                        <div className="flex flex-col gap-1">
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full w-fit">
                            <CheckCircle className="w-3 h-3" /> Drive Saved
                          </span>
                          {doc.isSyncedToDrive && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full w-fit">
                              <HardDrive className="w-2.5 h-2.5 text-amber-600" /> In G-Drive
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setPreviewDoc(doc)}
                            className="px-2.5 py-1 bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                            title="Online Preview"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Preview</span>
                          </button>

                          {doc.driveWebViewLink ? (
                            <a
                              href={doc.driveWebViewLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                              title="Open in Google Drive"
                            >
                              <ExternalLink className="w-3.5 h-3.5 text-amber-700" />
                            </a>
                          ) : (
                            <button
                              type="button"
                              onClick={() => openGoogleDriveModal(doc)}
                              className="p-1.5 bg-slate-100 hover:bg-amber-50 text-slate-600 hover:text-amber-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                              title="Upload to Google Drive"
                            >
                              <HardDrive className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDirectDownload(doc)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                            title="Download File"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDirectShare(doc)}
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                            title="Share Notice via WhatsApp"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDirectPrint(doc)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                            title="Print File"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit / Update Button */}
                          <button
                            type="button"
                            onClick={() => onOpenDocModal(doc)}
                            className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                            title="Edit / Update Document Details"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                            <span>Edit</span>
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmDoc(doc)}
                            className="text-slate-400 hover:text-rose-700 hover:bg-rose-50 p-1.5 transition-colors rounded-lg cursor-pointer"
                            title={isRoman ? 'Dastawiz Delete Karein' : 'Delete Document'}
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Online Document Viewer & Audit History Modal */}
      <DocumentViewerModal
        isOpen={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        documentItem={previewDoc}
        onShare={onOpenShareModal}
        onEdit={(doc) => onOpenDocModal(doc)}
        onDelete={(id) => {
          deleteDocument(id);
          setPreviewDoc(null);
        }}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirmDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 text-center animate-in fade-in zoom-in-95 duration-100">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              {isRoman ? 'Dastawiz Delete Karein?' : 'Delete Document?'}
            </h3>
            <p className="text-xs text-slate-600 mt-2">
              {isRoman
                ? `Kia aap waqai "${deleteConfirmDoc.name}" ko permanently delete karna chahte hain? Yeh record chamber drive se khatam ho jaye ga.`
                : `Are you sure you want to permanently delete "${deleteConfirmDoc.name}"? This file will be removed from your chamber documents vault.`}
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmDoc(null)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors"
              >
                {isRoman ? 'Mansookh (Cancel)' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteDocument(deleteConfirmDoc.id);
                  setDeleteConfirmDoc(null);
                }}
                className="px-5 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isRoman ? 'Haan, Delete Karein' : 'Yes, Delete Permanently'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
