import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut,
  User 
} from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import appletConfig from '../../firebase-applet-config.json';

export const firebaseConfig = {
  apiKey: appletConfig.apiKey,
  authDomain: appletConfig.authDomain,
  projectId: appletConfig.projectId,
  storageBucket: appletConfig.storageBucket,
  messagingSenderId: appletConfig.messagingSenderId,
  appId: appletConfig.appId,
  oAuthClientId: appletConfig.oAuthClientId,
};

// Initialize Firebase safely
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Google OAuth Provider for Google Drive
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/drive.file');

let cachedAccessToken: string | null = null;
let isSigningIn = false;

// Initialize auth state listener
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

/**
 * Request OAuth token using Google Identity Services (GIS)
 * Seamless fallback when Firebase Auth popup encounters domain restriction
 */
export const requestGisToken = async (): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const google = (window as any).google;
      if (!google || !google.accounts || !google.accounts.oauth2) {
        // Wait or load script if not ready
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.onload = () => {
          try {
            const g = (window as any).google;
            const client = g.accounts.oauth2.initTokenClient({
              client_id: firebaseConfig.oAuthClientId,
              scope: 'https://www.googleapis.com/auth/drive.file',
              callback: (response: any) => {
                if (response.error) {
                  reject(new Error(response.error_description || response.error));
                } else if (response.access_token) {
                  cachedAccessToken = response.access_token;
                  resolve(response.access_token);
                } else {
                  reject(new Error('ไม่พบ Access Token'));
                }
              },
            });
            client.requestAccessToken();
          } catch (e) {
            reject(e);
          }
        };
        script.onerror = () => reject(new Error('ไม่สามารถโหลด Google Identity Services ได้'));
        document.head.appendChild(script);
        return;
      }

      const client = google.accounts.oauth2.initTokenClient({
        client_id: firebaseConfig.oAuthClientId,
        scope: 'https://www.googleapis.com/auth/drive.file',
        callback: (response: any) => {
          if (response.error) {
            reject(new Error(response.error_description || response.error));
          } else if (response.access_token) {
            cachedAccessToken = response.access_token;
            resolve(response.access_token);
          } else {
            reject(new Error('ไม่พบ Access Token'));
          }
        },
      });
      client.requestAccessToken();
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * Perform Google Sign-In with popup or GIS to get access token for Google Drive
 */
export const googleSignIn = async (): Promise<{ user: User | null; accessToken: string }> => {
  try {
    isSigningIn = true;
    
    // First attempt: Firebase Auth with Google Provider
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        cachedAccessToken = credential.accessToken;
        return { user: result.user, accessToken: cachedAccessToken };
      }
    } catch (popupErr: any) {
      console.warn('Firebase Popup sign-in fallback triggered:', popupErr?.code || popupErr?.message);
    }

    // Direct GIS Token Client with clear error feedback
    const token = await requestGisToken();
    cachedAccessToken = token;

    // Fetch user profile info from Google UserInfo API
    let userInfo: any = null;
    try {
      const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (profileRes.ok) {
        userInfo = await profileRes.json();
      }
    } catch {
      // ignore
    }

    const mockUserObj: any = auth.currentUser || {
      uid: userInfo?.sub || 'google_' + Date.now(),
      displayName: userInfo?.name || 'ผู้ใช้ Google Drive',
      email: userInfo?.email || '',
      photoURL: userInfo?.picture || undefined
    };

    return { user: mockUserObj, accessToken: token };
  } catch (error: any) {
    console.error('Google Sign In error:', error);
    throw new Error(error?.message || 'ไม่สามารถยืนยันตัวตน Google ได้ กรุณาลองใหม่อีกครั้ง');
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const setAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

export const logoutGoogle = async () => {
  try {
    await signOut(auth);
  } catch {
    // ignore
  }
  cachedAccessToken = null;
};
