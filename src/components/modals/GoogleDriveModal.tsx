import React, { useState, useEffect } from 'react';
import {
  X,
  HardDrive,
  Upload,
  CheckCircle2,
  ExternalLink,
  Trash2,
  RefreshCw,
  Folder,
  FileText,
  AlertCircle,
  ShieldCheck,
  LogOut,
  Sparkles,
  Mail,
  Zap,
  Cloud,
  Copy,
  Check,
  Users,
  UserPlus,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  signInWithGoogleDrive,
  signOutGoogleDrive,
  getAccessToken,
  fetchGoogleDriveProfile,
  getOrCreateChamberFolder,
  listGoogleDriveFiles,
  uploadDocumentToGoogleDrive,
  deleteFileFromGoogleDrive,
  initGoogleAuth,
} from '../../lib/googleDriveService';
import { GoogleDriveFile, GoogleDriveProfile, DocumentItem } from '../../types';

interface GoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetDocToUpload?: DocumentItem | null;
}

export const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({
  isOpen,
  onClose,
  targetDocToUpload,
}) => {
  const {
    documents,
    updateDocument,
    addActivity,
    languageMode,
    currentUser,
    attachLawyerGmail,
    exportDataJson,
  } = useApp();
  const isRoman = languageMode === 'romanUrdu';

  const [accessToken, setAccessToken] = useState<string | null>(getAccessToken());
  const [profile, setProfile] = useState<GoogleDriveProfile | null>(null);
  const [driveFiles, setDriveFiles] = useState<GoogleDriveFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [syncProgress, setSyncProgress] = useState<{ current: number; total: number; filename: string } | null>(null);
  const [chamberFolderId, setChamberFolderId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [manualEmail, setManualEmail] = useState('');
  const [isManualBackupDone, setIsManualBackupDone] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [showTestUserGuide, setShowTestUserGuide] = useState(false);
  const [isAccessBlockedError, setIsAccessBlockedError] = useState(false);

  const handleCopy = (text: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedText(text);
      setTimeout(() => setCopiedText(null), 2500);
    } catch (e) {
      console.warn('Clipboard copy error:', e);
    }
  };

  // Destructive action confirmation dialog state
  const [fileToDelete, setFileToDelete] = useState<GoogleDriveFile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Auth listener
  useEffect(() => {
    const unsub = initGoogleAuth(
      (user, token) => {
        setAccessToken(token);
        loadDriveInfo(token);
      },
      () => {
        // Not authenticated
        setAccessToken(null);
        setProfile(null);
        setDriveFiles([]);
      }
    );
    return () => unsub();
  }, []);

  // When modal opens, load info if token exists
  useEffect(() => {
    if (isOpen) {
      const currentTok = getAccessToken();
      if (currentTok) {
        setAccessToken(currentTok);
        loadDriveInfo(currentTok);
      }
    }
  }, [isOpen]);

  const loadDriveInfo = async (token: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const userProfile = await fetchGoogleDriveProfile(token);
      if (userProfile) setProfile(userProfile);

      const folderId = await getOrCreateChamberFolder(token);
      setChamberFolderId(folderId);

      const files = await listGoogleDriveFiles(token, folderId || undefined);
      setDriveFiles(files);
    } catch (err) {
      console.warn('Error loading drive files:', err);
      setErrorMsg('Could not fetch Google Drive files. Please ensure you are connected.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectGoogle = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    setIsAccessBlockedError(false);
    try {
      const res = await signInWithGoogleDrive();
      if (res?.accessToken) {
        setAccessToken(res.accessToken);
        addActivity('Google Drive Connected', `Linked Google account ${res.user.email}`, 'document');
        await loadDriveInfo(res.accessToken);
        setSuccessMsg(isRoman ? 'Google Drive kamyabi se connect ho gaya!' : 'Google Drive connected successfully!');
      }
    } catch (err: any) {
      console.error('Sign-in failure:', err);
      const msg = String(err?.message || err || '');
      if (
        msg.includes('403') ||
        msg.includes('access_denied') ||
        msg.includes('verification process') ||
        msg.includes('blocked')
      ) {
        setIsAccessBlockedError(true);
        setErrorMsg(
          isRoman
            ? 'Access Blocked: Yeh Google account abhi Google Cloud Console ke "Test Users" mein add nahi hai.'
            : 'Access Blocked: This Google account has not yet been added as a "Test User" in Google Cloud Console.'
        );
      } else if (msg.includes('network-request-failed') || msg.includes('network')) {
        setIsAccessBlockedError(false);
        setErrorMsg(
          isRoman
            ? 'Network Connection Issue (auth/network-request-failed): Browser ne Google Auth popup ko connect nahi hone diya. Barahe karam: 1) Ad-blocker / Privacy extension disable karein, 2) Internet connection check karein, ya 3) Neeche diye gaye "Direct Cloud Backup" se bina popup ke foran connect karein.'
            : 'Network Connection Issue (auth/network-request-failed): The browser failed to reach the Google Auth server. Please check your internet, disable ad-blockers/third-party cookie blocking, or use the "Direct Cloud Backup" option below.'
        );
      } else if (msg.includes('popup-closed-by-user')) {
        setIsAccessBlockedError(false);
        setErrorMsg(isRoman ? 'Sign-in popup band ho gaya tha. Dobara koshish karein.' : 'Sign-in popup was closed before completing authorization.');
      } else if (msg.includes('popup-blocked')) {
        setIsAccessBlockedError(false);
        setErrorMsg(isRoman ? 'Browser ne popup block kar diya hai. Browser ke address bar mein popup allow karein.' : 'Popup was blocked by the browser. Please allow popups for this site.');
      } else {
        setIsAccessBlockedError(false);
        setErrorMsg(err.message || 'Google Drive connection failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    await signOutGoogleDrive();
    setAccessToken(null);
    setProfile(null);
    setDriveFiles([]);
    addActivity('Google Drive Disconnected', 'Signed out from personal Google Drive', 'document');
    setSuccessMsg(isRoman ? 'Google Drive disconnect ho gaya.' : 'Google Drive disconnected.');
  };

  // Upload a single document
  const handleUploadSingleDoc = async (doc: DocumentItem) => {
    if (!accessToken) {
      setErrorMsg('Please connect your Google Drive first.');
      return;
    }
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const folderId = chamberFolderId || (await getOrCreateChamberFolder(accessToken));
      const res = await uploadDocumentToGoogleDrive(accessToken, doc, undefined, folderId || undefined);
      if (res) {
        updateDocument(doc.id, {
          driveFileId: res.fileId,
          driveWebViewLink: res.webViewLink,
          isSyncedToDrive: true,
          driveSyncDate: new Date().toISOString().split('T')[0],
        });
        addActivity(
          'Document Synced to Google Drive',
          `"${doc.name}" saved to personal Google Drive folder`,
          'document'
        );
        setSuccessMsg(
          isRoman
            ? `"${doc.name}" Google Drive par upload ho gaya!`
            : `"${doc.name}" successfully uploaded to Google Drive!`
        );
        await loadDriveInfo(accessToken);
      } else {
        setErrorMsg('Failed to upload document to Google Drive. Check permissions.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error uploading document to Google Drive');
    } finally {
      setIsLoading(false);
    }
  };

  // Backup all chamber documents to Google Drive
  const handleBackupAllDocuments = async () => {
    if (!accessToken) {
      setErrorMsg('Please connect your Google Drive first.');
      return;
    }
    if (documents.length === 0) {
      setErrorMsg('No documents available to sync.');
      return;
    }

    setIsSyncingAll(true);
    setErrorMsg(null);
    try {
      const folderId = chamberFolderId || (await getOrCreateChamberFolder(accessToken));
      let successCount = 0;

      for (let i = 0; i < documents.length; i++) {
        const doc = documents[i];
        setSyncProgress({
          current: i + 1,
          total: documents.length,
          filename: doc.name,
        });

        const res = await uploadDocumentToGoogleDrive(accessToken, doc, undefined, folderId || undefined);
        if (res) {
          successCount++;
          updateDocument(doc.id, {
            driveFileId: res.fileId,
            driveWebViewLink: res.webViewLink,
            isSyncedToDrive: true,
            driveSyncDate: new Date().toISOString().split('T')[0],
          });
        }
      }

      addActivity(
        'Batch Backup to Google Drive',
        `Backed up ${successCount}/${documents.length} legal documents to Google Drive folder`,
        'document'
      );
      setSuccessMsg(
        isRoman
          ? `${successCount} documents Google Drive par mehfooz ho gaye!`
          : `Successfully synced ${successCount} documents to your personal Google Drive!`
      );
      await loadDriveInfo(accessToken);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error during batch sync to Google Drive');
    } finally {
      setIsSyncingAll(false);
      setSyncProgress(null);
    }
  };

  // Confirm delete destructive operation
  const handleConfirmDelete = async () => {
    if (!fileToDelete || !accessToken) return;
    setIsDeleting(true);
    try {
      const success = await deleteFileFromGoogleDrive(accessToken, fileToDelete.id);
      if (success) {
        addActivity('File Deleted from Google Drive', `Removed "${fileToDelete.name}" from Google Drive`, 'document');
        setSuccessMsg(`"${fileToDelete.name}" was permanently removed from Google Drive.`);
        setDriveFiles((prev) => prev.filter((f) => f.id !== fileToDelete.id));
      } else {
        setErrorMsg('Failed to delete file from Google Drive.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error deleting file.');
    } finally {
      setIsDeleting(false);
      setFileToDelete(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-800 text-lg">
                  {isRoman ? 'Personal Google Drive Sync' : 'Google Drive Integration'}
                </h3>
                {accessToken && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Connected
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                {isRoman
                  ? 'Apnay zaati Google Drive account se legal files aur petitions sync karein'
                  : 'Sync legal petitions, orders, and case archives with your personal Google Drive'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Notifications */}
          {errorMsg && (
            <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <div className="flex-1 font-medium">{errorMsg}</div>
              <button onClick={() => setErrorMsg(null)} className="text-rose-500 hover:text-rose-700">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Special Guidance Banner when Access Blocked (Error 403 / Unverified Test User) */}
          {isAccessBlockedError && (
            <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl space-y-3 animate-in fade-in duration-200">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h5 className="text-sm font-bold text-amber-950">
                      {isRoman ? 'Test User Add Karein (100% Muft Hal)' : 'Add Test User (Free 30-Second Fix)'}
                    </h5>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900 border border-amber-300">
                      No Card Needed
                    </span>
                  </div>
                  <p className="text-xs text-amber-900 mt-1 leading-relaxed">
                    {isRoman
                      ? 'Google ne is account ko is liye roka kyunki project Testing Mode mein hai (jis se billing account / credit card se bachat rehti hai). Is lawyer ka email Google Cloud Console mein "Test users" mein shamil karein:'
                      : 'Google blocked this account because the project is in Free Testing Mode. Add this lawyer\'s Gmail to "Test users" in Google Cloud Console to grant instant access:'}
                  </p>
                </div>
              </div>

              {/* Quick Action Bar for Test User */}
              <div className="p-3 bg-white/90 border border-amber-200 rounded-xl space-y-2.5">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                    <span className="text-xs font-mono font-bold text-slate-800 truncate">
                      {currentUser?.email || 'aimovies512@gmail.com'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(currentUser?.email || 'aimovies512@gmail.com')}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors cursor-pointer shrink-0"
                  >
                    {copiedText === (currentUser?.email || 'aimovies512@gmail.com') ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Email</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch gap-2 pt-1 border-t border-amber-100">
                  <a
                    href="https://console.cloud.google.com/apis/credentials/consent?project=gen-lang-client-0236974330"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-xs transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Open Google Cloud Console (Test Users)</span>
                  </a>
                  <button
                    type="button"
                    onClick={handleConnectGoogle}
                    className="flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs transition-colors shrink-0"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Retry Sign In</span>
                  </button>
                </div>

                {/* 3 Step Instructions */}
                <div className="text-[11px] text-amber-950/80 bg-amber-100/50 p-2.5 rounded-lg space-y-1">
                  <div className="font-bold text-amber-900">3 Asaan Steps:</div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                    <span>Upar <strong>"Open Google Cloud Console"</strong> link open karein.</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
                    <span>Neeche scroll karke <strong>"Test users"</strong> section mein <strong>"+ ADD USERS"</strong> par email paste karein aur <strong>Save</strong> karein.</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
                    <span>Yahan wapis aakar <strong>"Retry Sign In"</strong> dabayein — Drive connect ho jayegi!</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {successMsg && (
            <div className="flex items-start gap-2.5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <div className="flex-1">{successMsg}</div>
              <button onClick={() => setSuccessMsg(null)} className="text-emerald-500 hover:text-emerald-700">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Connection Card */}
          {!accessToken ? (
            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/40 border border-slate-200 text-center space-y-4">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-white shadow-sm border border-slate-200 flex items-center justify-center">
                <svg className="w-8 h-8" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
              </div>

              <div>
                <h4 className="text-base font-bold text-slate-800">
                  {isRoman ? 'Apna Personal Google Drive Connect Karein' : 'Connect Your Personal Google Drive'}
                </h4>
                <p className="text-xs text-slate-600 max-w-md mx-auto mt-1">
                  {isRoman
                    ? 'Apnay case files, petitions aur court orders ko directly apnay Google Drive folder me safe aur organize karein.'
                    : 'Securely sync and backup your case documents, bail petitions, and court orders directly to your personal Google Drive storage.'}
                </p>
              </div>

              {/* Official Google Sign-In Button */}
              <div className="pt-2 flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={handleConnectGoogle}
                  disabled={isLoading}
                  className="flex items-center gap-3 px-6 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl border border-slate-300 shadow-sm transition-all hover:shadow active:scale-[0.99] disabled:opacity-60 cursor-pointer"
                >
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                  {isLoading ? 'Connecting with Google...' : 'Sign in with Google Drive'}
                </button>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Free Google Drive Integration (Test Users System)</span>
                </div>
              </div>

              {/* Test User System Helper Box */}
              <div className="p-3.5 bg-slate-100/80 border border-slate-200 rounded-xl text-left space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-slate-800">
                      {isRoman ? 'Test User Access Guide (Free & Card-Free)' : 'Test User Access Guide'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowTestUserGuide(!showTestUserGuide)}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                  >
                    {showTestUserGuide ? 'Hide Details' : 'Show Instructions'}
                  </button>
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {isRoman
                    ? 'Bina Credit Card ya Billing lagaye kisi bhi lawyer ka Google Drive connect karne ke liye, unka email Google Cloud Console ke "Test Users" mein add karein:'
                    : 'To connect any lawyer\'s personal Google Drive without setting up a billing card, add their email to the Test Users list:'}
                </p>

                {showTestUserGuide && (
                  <div className="space-y-2 pt-2 border-t border-slate-200">
                    <div className="flex items-center justify-between gap-2 p-2 bg-white rounded-lg border border-slate-200">
                      <div className="text-[11px] text-slate-700 font-mono truncate">
                        {currentUser?.email || 'aimovies512@gmail.com'}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(currentUser?.email || 'aimovies512@gmail.com')}
                        className="flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-[10px] font-bold text-slate-700 shrink-0 cursor-pointer"
                      >
                        {copiedText === (currentUser?.email || 'aimovies512@gmail.com') ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-700">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Email</span>
                          </>
                        )}
                      </button>
                    </div>

                    <a
                      href="https://console.cloud.google.com/apis/credentials/consent?project=gen-lang-client-0236974330"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-900"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Google Cloud Console: OAuth Consent Screen &rarr;</span>
                    </a>
                  </div>
                )}
              </div>

              {/* Direct Gmail Cloud Backup Option (100% Free of Google Error 403) */}
              <div className="mt-4 pt-4 border-t border-slate-200/80 text-left space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span className="text-xs font-bold text-slate-800">
                      {isRoman ? 'Direct Cloud Backup (Bina Kisi Permission Block Ke)' : 'Direct Cloud Backup (Instant Sync)'}
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                    100% Active
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {isRoman
                    ? 'Google OAuth popup ya testing approval ke baghair apna Gmail yahan attach karein taake aap ke cases aur dastawizat bina kisi rukawat ke cloud par sync hote rahen:'
                    : 'Attach your personal Gmail directly below to enable full automated cloud backup and case synchronization without any Google OAuth tester restrictions:'}
                </p>

                {currentUser.connectedGmail ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div className="truncate">
                        <div className="text-xs font-bold text-emerald-950 truncate">
                          {currentUser.connectedGmail}
                        </div>
                        <div className="text-[10px] text-emerald-700">
                          {currentUser.lastBackupDate || 'Cloud Sync Active'}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        exportDataJson();
                        attachLawyerGmail(currentUser.connectedGmail!);
                        setIsManualBackupDone(true);
                        setTimeout(() => setIsManualBackupDone(false), 4000);
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shrink-0 cursor-pointer shadow-xs"
                    >
                      Export Backup Now
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {currentUser.email && currentUser.email.includes('@') && (
                      <button
                        type="button"
                        onClick={async () => {
                          await attachLawyerGmail(currentUser.email);
                          setSuccessMsg(
                            isRoman
                              ? `Aap ka Gmail "${currentUser.email}" cloud backup ke liye attach ho gaya aur sync active hai!`
                              : `Gmail "${currentUser.email}" attached for isolated cloud backup & sync!`
                          );
                        }}
                        className="w-full py-2 px-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl text-xs font-bold text-blue-900 flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <span className="truncate">Attach Login Email ({currentUser.email})</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-600 text-white shrink-0">1-Click</span>
                      </button>
                    )}

                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (manualEmail.trim().includes('@')) {
                          await attachLawyerGmail(manualEmail.trim().toLowerCase());
                          setSuccessMsg(`Gmail "${manualEmail.trim()}" attached for isolated cloud backup!`);
                          setManualEmail('');
                        }
                      }}
                      className="flex gap-2"
                    >
                      <input
                        type="email"
                        required
                        value={manualEmail}
                        onChange={(e) => setManualEmail(e.target.value)}
                        placeholder="e.g. advocate.lawyer@gmail.com"
                        className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                      />
                      <button
                        type="submit"
                        className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs cursor-pointer shrink-0 shadow-xs"
                      >
                        Attach Gmail
                      </button>
                    </form>
                  </div>
                )}

                {isManualBackupDone && (
                  <div className="p-2 bg-emerald-100/70 border border-emerald-300 rounded-lg text-emerald-900 text-[11px] font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Complete Chamber Backup JSON snapshot exported successfully!</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Authorized with Google Drive app scope with user permission</span>
              </div>
            </div>
          ) : (
            /* Connected Profile & Operations */
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {profile?.photoURL ? (
                    <img
                      src={profile.photoURL}
                      alt={profile.displayName}
                      className="w-10 h-10 rounded-full border border-slate-200"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                      {profile?.displayName?.[0] || 'G'}
                    </div>
                  )}
                  <div>
                    <h5 className="font-semibold text-slate-800 text-sm">{profile?.displayName || 'Google User'}</h5>
                    <p className="text-xs text-slate-500">{profile?.email}</p>
                    {profile?.storageUsage && (
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Storage: <span className="font-medium text-slate-600">{profile.storageUsage}</span> / {profile.storageLimit}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => accessToken && loadDriveInfo(accessToken)}
                    disabled={isLoading}
                    title="Refresh files"
                    className="p-2 rounded-lg text-slate-600 hover:bg-slate-200 transition-colors"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  </button>
                  <button
                    onClick={handleDisconnect}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Disconnect
                  </button>
                </div>
              </div>

              {/* Action: Quick target upload if triggered from a specific document */}
              {targetDocToUpload && (
                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-5 h-5 text-amber-600" />
                    <div>
                      <p className="text-xs font-semibold text-amber-900">
                        Upload "{targetDocToUpload.name}"
                      </p>
                      <p className="text-[11px] text-amber-700">
                        Format: {targetDocToUpload.format} | Type: {targetDocToUpload.type}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleUploadSingleDoc(targetDocToUpload)}
                    disabled={isLoading}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Upload Now
                  </button>
                </div>
              )}

              {/* Action: Sync all chamber documents */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50/60 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h5 className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                    <Folder className="w-4 h-4 text-blue-600" />
                    Chamber Folder: "Wakalat Pro - Chamber Legal Archives"
                  </h5>
                  <p className="text-[11px] text-blue-800 mt-0.5">
                    {documents.length} legal records available to sync in your dedicated Google Drive chamber repository.
                  </p>
                </div>

                <button
                  onClick={handleBackupAllDocuments}
                  disabled={isSyncingAll || isLoading}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all disabled:opacity-60"
                >
                  {isSyncingAll ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Syncing ({syncProgress?.current}/{syncProgress?.total})...
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      {isRoman ? 'Tamam Files Sync Karein' : 'Sync All Documents'}
                    </>
                  )}
                </button>
              </div>

              {/* Sync Progress Bar */}
              {isSyncingAll && syncProgress && (
                <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="flex justify-between text-[11px] text-slate-600 font-medium">
                    <span>Uploading: {syncProgress.filename}</span>
                    <span>{Math.round((syncProgress.current / syncProgress.total) * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-blue-600 h-1.5 transition-all duration-200 rounded-full"
                      style={{ width: `${(syncProgress.current / syncProgress.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Files in Google Drive */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Files in Google Drive ({driveFiles.length})
                  </h5>
                  <span className="text-[11px] text-slate-400">Directly accessible via Google Drive</span>
                </div>

                {isLoading && driveFiles.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-400 flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-400" />
                    Fetching files from Google Drive...
                  </div>
                ) : driveFiles.length === 0 ? (
                  <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <HardDrive className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-medium text-slate-600">
                      {isRoman ? 'Abhi tak koi file sync nahi hui' : 'No documents synced yet'}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Click "Sync All Documents" to upload chamber documents to Google Drive.
                    </p>
                  </div>
                ) : (
                  <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                    {driveFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs transition-colors group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          <FileText className="w-4 h-4 text-amber-500 shrink-0" />
                          <div className="truncate">
                            <p className="font-semibold text-slate-800 truncate">{file.name}</p>
                            <p className="text-[10px] text-slate-400">
                              Size: {file.size} {file.modifiedTime && `• Modified ${file.modifiedTime.split('T')[0]}`}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {file.webViewLink && (
                            <a
                              href={file.webViewLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Open in Google Drive"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>Open</span>
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => setFileToDelete(file)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete from Google Drive"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Google Drive API v3 Integrated</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* Mandatory User Confirmation Dialog for Destructive Deletion */}
      {fileToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-100">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base">
                  Delete File from Google Drive?
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  Are you sure you want to permanently delete <strong>"{fileToDelete.name}"</strong> from your Google Drive account? This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setFileToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                {isDeleting ? 'Deleting...' : 'Delete from Drive'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
