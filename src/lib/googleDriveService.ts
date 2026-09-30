import {
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut,
} from 'firebase/auth';
import { auth } from './firebase';
import { GoogleDriveFile, GoogleDriveProfile, DocumentItem } from '../types';

// Desired scopes configured via OAuth setup
export const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

const provider = new GoogleAuthProvider();
SCOPES.forEach((scope) => provider.addScope(scope));
// Prompt for consent when reconnecting or ensuring permissions
provider.setCustomParameters({
  prompt: 'select_account',
});

// Flag to track sign-in state
let isSigningIn = false;

// IN-MEMORY TOKEN CACHE (Never stored in localStorage or sessionStorage per skill security rules)
let cachedAccessToken: string | null = null;
let cachedUser: User | null = null;

/**
 * Initialize auth listener to monitor Google sign-in state
 */
export const initGoogleAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      cachedUser = user;
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // Token must be acquired via user interaction popup
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedUser = null;
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

/**
 * Trigger official Google Sign-In with Google Drive scope
 */
export const signInWithGoogleDrive = async (): Promise<{
  user: User;
  accessToken: string;
} | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to acquire OAuth access token for Google Drive');
    }

    cachedAccessToken = credential.accessToken;
    cachedUser = result.user;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error) {
    console.error('Google Drive sign-in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Get current in-memory access token
 */
export const getAccessToken = (): string | null => {
  return cachedAccessToken;
};

/**
 * Get cached Google Auth user
 */
export const getGoogleUser = (): User | null => {
  return cachedUser;
};

/**
 * Sign out and clear in-memory tokens
 */
export const signOutGoogleDrive = async (): Promise<void> => {
  await signOut(auth);
  cachedAccessToken = null;
  cachedUser = null;
};

/**
 * Fetch user's Google Drive storage quota and profile
 */
export const fetchGoogleDriveProfile = async (
  token: string
): Promise<GoogleDriveProfile | null> => {
  try {
    const res = await fetch(
      'https://www.googleapis.com/drive/v3/about?fields=user,storageQuota',
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!res.ok) {
      if (res.status === 401) {
        cachedAccessToken = null;
      }
      return null;
    }

    const data = await res.json();
    const bytesToGB = (bytes?: string) => {
      if (!bytes) return '0 GB';
      const num = parseInt(bytes, 10);
      return (num / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    };

    return {
      email: data.user?.emailAddress || cachedUser?.email || '',
      displayName: data.user?.displayName || cachedUser?.displayName || 'Advocate User',
      photoURL: data.user?.photoLink || cachedUser?.photoURL || '',
      storageUsage: bytesToGB(data.storageQuota?.usage),
      storageLimit: data.storageQuota?.limit ? bytesToGB(data.storageQuota?.limit) : 'Unlimited',
    };
  } catch (err) {
    console.warn('Unable to load Google Drive profile:', err);
    return null;
  }
};

/**
 * Locate or create the chamber folder in Google Drive:
 * "Wakalat Pro - Chamber Legal Archives"
 */
export const getOrCreateChamberFolderDetails = async (
  token: string,
  folderName = 'Wakalat Pro - Chamber Legal Archives'
): Promise<{ id: string; webViewLink?: string } | null> => {
  try {
    // Search for existing folder created by this app
    const query = `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
    const searchRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,webViewLink)`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (searchRes.ok) {
      const searchData = await searchRes.json();
      if (searchData.files && searchData.files.length > 0) {
        return {
          id: searchData.files[0].id,
          webViewLink: searchData.files[0].webViewLink,
        };
      }
    }

    // Create folder if not found
    const createRes = await fetch('https://www.googleapis.com/drive/v3/files?fields=id,name,webViewLink', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        description: 'Designated legal repository for Wakalat Pro Chamber Management System',
      }),
    });

    if (createRes.ok) {
      const folderData = await createRes.json();
      return {
        id: folderData.id,
        webViewLink: folderData.webViewLink,
      };
    }
    return null;
  } catch (err) {
    console.error('Error creating chamber folder in Google Drive:', err);
    return null;
  }
};

/**
 * Locate or create the chamber folder in Google Drive (returns folderId)
 */
export const getOrCreateChamberFolder = async (
  token: string,
  folderName = 'Wakalat Pro - Chamber Legal Archives'
): Promise<string | null> => {
  const details = await getOrCreateChamberFolderDetails(token, folderName);
  return details ? details.id : null;
};

/**
 * Fetch files from user's Google Drive (created by this app)
 */
export const listGoogleDriveFiles = async (
  token: string,
  folderId?: string
): Promise<GoogleDriveFile[]> => {
  try {
    let q = 'trashed = false';
    if (folderId) {
      q += ` and '${folderId}' in parents`;
    }

    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
        q
      )}&fields=files(id,name,mimeType,webViewLink,webContentLink,iconLink,thumbnailLink,size,createdTime,modifiedTime)&orderBy=modifiedTime desc&pageSize=50`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!res.ok) {
      if (res.status === 401) cachedAccessToken = null;
      return [];
    }

    const data = await res.json();
    return (data.files || []).map((f: any) => ({
      id: f.id,
      name: f.name,
      mimeType: f.mimeType,
      webViewLink: f.webViewLink,
      webContentLink: f.webContentLink,
      iconLink: f.iconLink,
      thumbnailLink: f.thumbnailLink,
      size: f.size ? (parseInt(f.size, 10) / 1024).toFixed(1) + ' KB' : 'Unknown',
      createdTime: f.createdTime,
      modifiedTime: f.modifiedTime,
    }));
  } catch (err) {
    console.error('Error listing Google Drive files:', err);
    return [];
  }
};

/**
 * Upload a document directly to Google Drive using multipart upload
 */
export const uploadDocumentToGoogleDrive = async (
  token: string,
  docItem: DocumentItem,
  customContent?: string,
  parentFolderId?: string
): Promise<{ fileId: string; webViewLink: string } | null> => {
  try {
    // Generate file body: either existing fileData (base64) or certified text copy
    let mimeType = 'text/plain';
    let fileBlob: Blob;

    if (docItem.fileData && docItem.fileData.startsWith('data:')) {
      // Decode data URL safely using fetch blob
      try {
        const response = await fetch(docItem.fileData);
        fileBlob = await response.blob();
        mimeType = fileBlob.type || 'application/octet-stream';
      } catch {
        const parts = docItem.fileData.split(',');
        const match = parts[0].match(/:(.*?);/);
        mimeType = match ? match[1] : 'application/octet-stream';
        const byteCharacters = atob(parts[1]);
        const byteNumbers = new Uint8Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        fileBlob = new Blob([byteNumbers.buffer as ArrayBuffer], { type: mimeType });
      }
    } else {
      // Certified plain-text chamber brief
      const text =
        customContent ||
        `CHAMBER LEGAL ARCHIVE - CERTIFIED COPY\n\nTitle: ${docItem.name}\nType: ${docItem.type}\nFormat: ${docItem.format}\nUpload Date: ${docItem.uploadDate}\nUploaded By: ${docItem.uploadedBy}\n\nDescription:\n${docItem.description || 'Verified chamber record.'}\n\nSystem Reference: Wakalat Pro Legal Chamber\nAttestation Timestamp: ${new Date().toISOString()}`;
      mimeType = 'text/plain';
      fileBlob = new Blob([text], { type: mimeType });
    }

    const metadata: Record<string, any> = {
      name: docItem.name.includes('.') ? docItem.name : `${docItem.name}.txt`,
      description: `Wakalat Pro Legal Record | Type: ${docItem.type} | ID: ${docItem.id}`,
    };

    if (parentFolderId) {
      metadata.parents = [parentFolderId];
    }

    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const metadataPart = `${delimiter}Content-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(
      metadata
    )}`;
    const mediaPartHeader = `${delimiter}Content-Type: ${mimeType}\r\n\r\n`;

    const multipartBlob = new Blob(
      [metadataPart, mediaPartHeader, fileBlob, closeDelimiter],
      { type: `multipart/related; boundary=${boundary}` }
    );

    const uploadRes = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body: multipartBlob,
      }
    );

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      console.error('Failed to upload file to Google Drive:', errText);
      return null;
    }

    const data = await uploadRes.json();
    return {
      fileId: data.id,
      webViewLink: data.webViewLink,
    };
  } catch (err) {
    console.error('Error uploading document to Google Drive:', err);
    return null;
  }
};

/**
 * Delete a file from Google Drive (Mandatory user confirmation required by caller!)
 */
export const deleteFileFromGoogleDrive = async (
  token: string,
  fileId: string
): Promise<boolean> => {
  try {
    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.ok || res.status === 204;
  } catch (err) {
    console.error('Error deleting file from Google Drive:', err);
    return false;
  }
};

/**
 * Upload a complete chamber backup JSON snapshot to Google Drive
 * Creates or places inside lawyer's personal Google Drive folder
 */
export const uploadBackupJsonToGoogleDrive = async (
  token: string,
  backupData: any,
  chamberName: string,
  lawyerEmail: string,
  parentFolderId?: string
): Promise<{ fileId: string; webViewLink: string; fileName: string } | null> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const safeChamberName = (chamberName || 'Chamber').replace(/[^a-zA-Z0-9_-]/g, '_');
    const safeEmail = (lawyerEmail || 'lawyer').split('@')[0].replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileName = `WakalatPro_${safeChamberName}_${safeEmail}_Backup_${today}.json`;
    const jsonString = JSON.stringify(backupData, null, 2);
    const fileBlob = new Blob([jsonString], { type: 'application/json' });

    const metadata: Record<string, any> = {
      name: fileName,
      description: `Wakalat Pro automated legal backup for ${chamberName} (${lawyerEmail}) created on ${new Date().toISOString()}`,
    };

    if (parentFolderId) {
      metadata.parents = [parentFolderId];
    }

    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const metadataPart = `${delimiter}Content-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(
      metadata
    )}`;
    const mediaPartHeader = `${delimiter}Content-Type: application/json\r\n\r\n`;

    const multipartBlob = new Blob(
      [metadataPart, mediaPartHeader, fileBlob, closeDelimiter],
      { type: `multipart/related; boundary=${boundary}` }
    );

    const uploadRes = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body: multipartBlob,
      }
    );

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      console.error('Failed to upload backup JSON to Google Drive:', errText);
      return null;
    }

    const data = await uploadRes.json();
    return {
      fileId: data.id,
      webViewLink: data.webViewLink,
      fileName,
    };
  } catch (err) {
    console.error('Error in uploadBackupJsonToGoogleDrive:', err);
    return null;
  }
};

/**
 * Real-time complete sync to personal Google Drive:
 * Creates designated folder, uploads complete database JSON snapshot,
 * and uploads all legal files / documents directly to lawyer's Drive.
 */
export const syncAndUploadAllToGoogleDrive = async (
  token: string,
  backupPayload: any,
  dossierTitle: string,
  lawyerEmail: string,
  documents: DocumentItem[] = []
): Promise<{
  success: boolean;
  folderId?: string;
  folderLink?: string;
  backupLink?: string;
  backupFileName?: string;
  filesUploaded: number;
  message: string;
}> => {
  try {
    const cleanTitle = (dossierTitle || 'Chamber Legal Dossier').trim();
    const folderName = `Wakalat Pro - ${cleanTitle}`;
    const folderDetails = await getOrCreateChamberFolderDetails(token, folderName);
    const folderId = folderDetails?.id;
    const folderLink = folderDetails?.webViewLink;

    // 1. Upload Database Backup JSON
    const backupRes = await uploadBackupJsonToGoogleDrive(
      token,
      backupPayload,
      cleanTitle,
      lawyerEmail,
      folderId
    );

    // 2. Upload legal documents/files to this chamber folder
    let filesUploaded = 0;
    if (folderId && documents && documents.length > 0) {
      for (const doc of documents) {
        try {
          await uploadDocumentToGoogleDrive(token, doc, undefined, folderId);
          filesUploaded++;
        } catch (e) {
          console.warn('Doc upload warning:', e);
        }
      }
    }

    return {
      success: true,
      folderId,
      folderLink: folderLink || backupRes?.webViewLink,
      backupLink: backupRes?.webViewLink,
      backupFileName: backupRes?.fileName,
      filesUploaded,
      message: `Successfully connected & saved to Google Drive in "${folderName}". Uploaded complete chamber database + ${filesUploaded} legal documents.`,
    };
  } catch (err: any) {
    console.error('syncAndUploadAllToGoogleDrive error:', err);
    return {
      success: false,
      filesUploaded: 0,
      message: err?.message || 'Google Drive sync failed.',
    };
  }
};


