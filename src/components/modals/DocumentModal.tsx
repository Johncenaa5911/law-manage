import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  FolderLock,
  Upload,
  FileText,
  CheckCircle2,
  Paperclip,
  HardDrive,
  Edit3,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DocumentItem, DocumentType } from '../../types';
import {
  getAccessToken,
  uploadDocumentToGoogleDrive,
  getOrCreateChamberFolder,
} from '../../lib/googleDriveService';

interface DocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  docToEdit?: DocumentItem | null;
  initialCaseId?: string;
  initialClientId?: string;
  initialFirId?: string;
}

export const DocumentModal: React.FC<DocumentModalProps> = ({
  isOpen,
  onClose,
  docToEdit,
  initialCaseId,
  initialClientId,
  initialFirId,
}) => {
  const { addDocument, updateDocument, deleteDocument, cases, clients, firs, languageMode } = useApp();
  const isRoman = languageMode === 'romanUrdu';

  const [name, setName] = useState('');
  const [type, setType] = useState<DocumentType>('Bail Application');
  const [caseId, setCaseId] = useState('');
  const [clientId, setClientId] = useState('');
  const [firId, setFirId] = useState('');
  const [format, setFormat] = useState<'PDF' | 'JPG' | 'PNG' | 'DOCX'>('PDF');
  const [description, setDescription] = useState('');
  const [fileSize, setFileSize] = useState('1.5 MB');
  const [fileData, setFileData] = useState<string | undefined>(undefined);
  const [attachedFileName, setAttachedFileName] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [syncToDrive, setSyncToDrive] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state whenever modal opens or docToEdit changes
  useEffect(() => {
    if (!isOpen) return;

    setShowDeleteConfirm(false);
    if (docToEdit) {
      setName(docToEdit.name || '');
      setType(docToEdit.type || 'Bail Application');
      setCaseId(docToEdit.caseId || '');
      setClientId(docToEdit.clientId || '');
      setFirId(docToEdit.firId || '');
      setFormat(docToEdit.format || 'PDF');
      setDescription(docToEdit.description || '');
      setFileSize(docToEdit.fileSize || '1.5 MB');
      setFileData(docToEdit.fileData);
      setAttachedFileName(docToEdit.name || '');
      setSyncToDrive(false);
    } else {
      setName('');
      setType('Bail Application');
      setCaseId(initialCaseId || cases[0]?.id || '');
      setClientId(initialClientId || clients[0]?.id || '');
      setFirId(initialFirId || '');
      setFormat('PDF');
      setDescription('');
      setFileSize('1.5 MB');
      setFileData(undefined);
      setAttachedFileName('');
      setSyncToDrive(true);
    }
  }, [isOpen, docToEdit, initialCaseId, initialClientId, initialFirId, cases, clients]);

  if (!isOpen) return null;

  const handleProcessFile = (file: File) => {
    const ext = file.name.split('.').pop()?.toUpperCase() || 'PDF';
    let detectedFormat: 'PDF' | 'JPG' | 'PNG' | 'DOCX' = 'PDF';
    if (ext === 'JPG' || ext === 'JPEG') detectedFormat = 'JPG';
    else if (ext === 'PNG') detectedFormat = 'PNG';
    else if (ext === 'DOCX' || ext === 'DOC') detectedFormat = 'DOCX';
    else detectedFormat = 'PDF';

    setFormat(detectedFormat);
    setAttachedFileName(file.name);

    if (!name) {
      setName(file.name.replace(/\.[^/.]+$/, ''));
    }

    if (file.size < 1024 * 1024) {
      setFileSize(`${Math.round(file.size / 1024)} KB`);
    } else {
      setFileSize(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setFileData(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleProcessFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert(isRoman ? 'Meherbani karke document ka title likhein.' : 'Please enter Document Title.');
      return;
    }

    if (docToEdit) {
      // Update existing document
      updateDocument(docToEdit.id, {
        name: name.trim(),
        type,
        caseId: caseId || undefined,
        clientId: clientId || undefined,
        firId: firId || undefined,
        format,
        fileSize,
        description: description.trim(),
        ...(fileData ? { fileData } : {}),
      });
      onClose();
    } else {
      // Add brand new document
      const newDoc = addDocument({
        name: name.trim(),
        type,
        caseId: caseId || undefined,
        clientId: clientId || undefined,
        firId: firId || undefined,
        format,
        fileSize,
        description: description.trim(),
        fileData,
      });

      const token = getAccessToken();
      if (syncToDrive && token) {
        getOrCreateChamberFolder(token).then((folderId) => {
          uploadDocumentToGoogleDrive(token, newDoc, undefined, folderId || undefined).then((res) => {
            if (res) {
              updateDocument(newDoc.id, {
                driveFileId: res.fileId,
                driveWebViewLink: res.webViewLink,
                isSyncedToDrive: true,
                driveSyncDate: new Date().toISOString().split('T')[0],
              });
            }
          });
        });
      }

      onClose();
    }
  };

  const handleDelete = () => {
    if (!docToEdit) return;
    deleteDocument(docToEdit.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200 my-auto">
        {/* Header */}
        <div className="p-4 bg-cyan-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            {docToEdit ? (
              <Edit3 className="w-5 h-5 text-amber-300" />
            ) : (
              <FolderLock className="w-5 h-5 text-cyan-300" />
            )}
            <div>
              <h3 className="font-bold text-sm">
                {docToEdit
                  ? isRoman
                    ? 'Dastawiz Update / Edit Karein'
                    : 'Edit & Update Legal Document'
                  : isRoman
                  ? 'Nai Dastawiz Upload / Save Karein'
                  : 'Upload & Add Legal Document'}
              </h3>
              <p className="text-[11px] text-cyan-200">
                {docToEdit
                  ? `ID: ${docToEdit.id} • Saved: ${docToEdit.uploadDate}`
                  : 'Store in Chamber Vault with instant viewing & sharing'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Delete Confirmation Banner inside Modal */}
        {showDeleteConfirm && (
          <div className="p-4 bg-rose-50 border-b border-rose-200 flex items-start gap-3 animate-in fade-in duration-150">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs">
              <p className="font-bold text-rose-900">
                {isRoman
                  ? 'Kia aap waqai yeh dastawiz delete karna chahte hain?'
                  : 'Are you sure you want to permanently delete this document?'}
              </p>
              <p className="text-rose-700 mt-0.5">
                "{docToEdit?.name}" will be removed from your chamber documents and cases.
              </p>
              <div className="mt-2.5 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded-lg transition-colors cursor-pointer"
                >
                  {isRoman ? 'Haan, Delete Karein' : 'Yes, Delete Permanently'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1.5 bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  {isRoman ? 'Mansookh (Cancel)' : 'Cancel'}
                </button>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 text-xs">
          {/* File Attachment / Drag & Drop Area */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-semibold text-slate-700">
                {docToEdit ? 'Attached File (Replace if needed)' : 'Select or Drop Document File (PDF, Image, DOCX) *'}
              </label>
              {attachedFileName && (
                <span className="text-[11px] text-cyan-800 font-bold">
                  {docToEdit ? 'Current File Attached' : 'Selected'}
                </span>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png,.docx,.doc,.txt"
              className="hidden"
            />
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
                isDragging
                  ? 'border-cyan-600 bg-cyan-50'
                  : attachedFileName
                  ? 'border-emerald-400 bg-emerald-50/60'
                  : 'border-slate-300 hover:bg-slate-50 bg-slate-50/50'
              }`}
            >
              {attachedFileName ? (
                <div className="flex items-center justify-center gap-2 text-emerald-800">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div className="text-left">
                    <p className="font-bold text-xs truncate max-w-xs">{attachedFileName}</p>
                    <p className="text-[10px] text-emerald-700 font-mono">
                      {format} • {fileSize} • Click to change file
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <Upload className="w-6 h-6 mx-auto text-slate-400 mb-1" />
                  <div className="text-slate-700 font-semibold text-xs">
                    Click to browse or drop file here
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Supports PDF petition copies, court orders, CNIC scans, agreements & bail orders
                  </div>
                </>
              )}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Document Title / Heading *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Certified Copy of FIR # 142/2026 or Bail Petition"
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold focus:ring-2 focus:ring-cyan-500 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Document Category</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as DocumentType)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-cyan-500 focus:outline-hidden font-medium"
              >
                <option value="FIR Copy">FIR Copy</option>
                <option value="CNIC Copy">CNIC Copy</option>
                <option value="Bail Application">Bail Application</option>
                <option value="Court Order">Court Order</option>
                <option value="Judgment">Judgment / Final Order</option>
                <option value="Affidavit">Affidavit (Bayan-e-Halfi)</option>
                <option value="Agreement">Agreement / Contract</option>
                <option value="Evidence">Evidence / Material Exhibit</option>
                <option value="Witness Documents">Witness Documents</option>
                <option value="Police Report">Police Report / Challan</option>
                <option value="Medical Report">Medical Report / MLC</option>
                <option value="Vakalatnama">Vakalatnama (Power of Attorney)</option>
                <option value="Other Documents">Other Documents</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">File Format</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-cyan-500 focus:outline-hidden"
              >
                <option value="PDF">PDF (.pdf)</option>
                <option value="JPG">JPG (.jpg / .jpeg)</option>
                <option value="PNG">PNG (.png)</option>
                <option value="DOCX">DOCX (.docx)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Link to Case Record</label>
              <select
                value={caseId}
                onChange={(e) => setCaseId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-cyan-500 focus:outline-hidden"
              >
                <option value="">-- No Case Link --</option>
                {cases.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.caseNumber} - {c.caseTitle}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Link to Client</label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-cyan-500 focus:outline-hidden"
              >
                <option value="">-- No Client Link --</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.fullName || (c as any).name} ({c.cnic})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* FIR Linkage */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Link to Police FIR Record (Optional)</label>
            <select
              value={firId}
              onChange={(e) => setFirId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-cyan-500 focus:outline-hidden"
            >
              <option value="">-- No FIR Link --</option>
              {firs.map((f) => (
                <option key={f.id} value={f.id}>
                  FIR #{f.firNumber} ({f.policeStation} • {f.sections})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Description / Court Remarks / Notes
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Attested certified copy obtained from Reader to Additional Sessions Judge..."
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-cyan-500 focus:outline-hidden"
            />
          </div>

          {/* Google Drive Option (Only when adding or if not already synced) */}
          {!docToEdit && (
            <div className="flex items-center gap-2 p-2.5 bg-amber-50/70 border border-amber-200/90 rounded-xl">
              <input
                type="checkbox"
                id="sync-google-drive-check"
                checked={syncToDrive}
                onChange={(e) => setSyncToDrive(e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500 cursor-pointer"
              />
              <label
                htmlFor="sync-google-drive-check"
                className="flex items-center gap-1.5 text-xs text-amber-900 font-medium cursor-pointer"
              >
                <HardDrive className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Also sync a certified copy to Personal Google Drive repository</span>
              </label>
            </div>
          )}

          {/* Action Buttons: Cancel, Delete (if editing), Submit */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
            <div>
              {docToEdit && !showDeleteConfirm && (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-3 py-2 text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Delete Document"
                >
                  <Trash2 className="w-4 h-4 text-rose-600" />
                  <span>{isRoman ? 'Delete Dastawiz' : 'Delete Document'}</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-xl font-semibold transition-colors cursor-pointer"
              >
                {isRoman ? 'Mansookh (Cancel)' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {docToEdit ? (
                  <>
                    <Edit3 className="w-4 h-4" />
                    <span>{isRoman ? 'Update Karein' : 'Save Changes'}</span>
                  </>
                ) : (
                  <>
                    <Paperclip className="w-4 h-4" />
                    <span>{isRoman ? 'Attach / Save Karein' : 'Submit & Attach'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
