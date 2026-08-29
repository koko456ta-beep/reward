import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  writeBatch,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { Award, AppUser, ActivityLog, AcademicYear, SystemSettings, DepartmentId } from '../types';
import { 
  INITIAL_AWARDS, 
  INITIAL_USERS, 
  INITIAL_LOGS, 
  INITIAL_ACADEMIC_YEARS, 
  INITIAL_SETTINGS 
} from '../data/mockData';

// Firestore Error Handling Types
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const currentUser = getStoredCurrentUser();
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentUser?.uid || null,
      email: currentUser?.email || null,
    },
    operationType,
    path
  };
  console.warn('Firestore Error (falling back to cache/local):', JSON.stringify(errInfo));
  return errInfo;
}

const STORAGE_KEYS = {
  AWARDS: 'school_awards_data_v1',
  USERS: 'school_awards_users_v1',
  LOGS: 'school_awards_logs_v1',
  YEARS: 'school_awards_years_v1',
  SETTINGS: 'school_awards_settings_v1',
  CURRENT_USER: 'school_awards_curr_user_v1'
};

// -------------------------------------------------------------
// Local Cache Accessors (Instant load & Offline Resilience)
// -------------------------------------------------------------
export function getStoredAwards(): Award[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AWARDS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.AWARDS, JSON.stringify(INITIAL_AWARDS));
      return INITIAL_AWARDS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Clean any legacy Google Drive URLs from existing client localStorage
      const cleaned = parsed.map((a: Award) => {
        let cert = a.certificateUrl || a.imageUrl || '';
        let img = a.imageUrl || a.certificateUrl || '';
        if (cert.includes('drive.google.com')) {
          cert = img.includes('drive.google.com') ? 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=1200&auto=format&fit=crop&q=85' : img;
        }
        if (img.includes('drive.google.com')) {
          img = cert.includes('drive.google.com') ? 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=1200&auto=format&fit=crop&q=85' : cert;
        }
        return {
          ...a,
          certificateUrl: cert,
          imageUrl: img,
          allowDownload: a.allowDownload !== false
        };
      });
      return cleaned;
    }
    return INITIAL_AWARDS;
  } catch {
    return INITIAL_AWARDS;
  }
}

export function saveStoredAwards(awards: Award[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.AWARDS, JSON.stringify(Array.isArray(awards) ? awards : []));
  } catch (err) {
    console.error('Failed to save awards locally', err);
  }
}

export function getStoredUsers(): AppUser[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    return INITIAL_USERS;
  } catch {
    return INITIAL_USERS;
  }
}

export function saveStoredUsers(users: AppUser[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(Array.isArray(users) ? users : []));
  } catch (err) {
    console.error('Failed to save users locally', err);
  }
}

export function getStoredLogs(): ActivityLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LOGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(INITIAL_LOGS));
      return INITIAL_LOGS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return INITIAL_LOGS;
  } catch {
    return INITIAL_LOGS;
  }
}

export function getStoredAcademicYears(): AcademicYear[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.YEARS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.YEARS, JSON.stringify(INITIAL_ACADEMIC_YEARS));
      return INITIAL_ACADEMIC_YEARS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return INITIAL_ACADEMIC_YEARS;
  } catch {
    return INITIAL_ACADEMIC_YEARS;
  }
}

export function saveStoredAcademicYears(years: AcademicYear[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.YEARS, JSON.stringify(Array.isArray(years) ? years : []));
  } catch (err) {
    console.error('Failed to save years locally', err);
  }
}

export function getStoredSettings(): SystemSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
      return INITIAL_SETTINGS;
    }
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      return { ...INITIAL_SETTINGS, ...parsed };
    }
    return INITIAL_SETTINGS;
  } catch {
    return INITIAL_SETTINGS;
  }
}

export function saveStoredSettings(settings: SystemSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings locally', err);
  }
}

export function getStoredCurrentUser(): AppUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredCurrentUser(user: AppUser | null): void {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  } catch (err) {
    console.error('Failed to set current user', err);
  }
}

// Helper to sanitize objects before sending to Firestore (removes any undefined properties)
export function sanitizeForFirestore<T extends Record<string, any>>(obj: T): T {
  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        result[key] = sanitizeForFirestore(value);
      } else {
        result[key] = value;
      }
    }
  }
  return result;
}

// -------------------------------------------------------------
// Real-time Firestore Listeners & Cloud Sync
// -------------------------------------------------------------

/**
 * Subscribes to real-time updates from Firestore for Awards.
 * Seeds initial mock data if the collection is empty.
 */
export function subscribeToAwards(onUpdate: (awards: Award[]) => void): () => void {
  const awardsCol = collection(db, 'awards');
  
  const unsubscribe = onSnapshot(
    awardsCol,
    async (snapshot) => {
      if (snapshot.empty) {
        // First time initialization: seed Firestore with INITIAL_AWARDS
        try {
          const batch = writeBatch(db);
          for (const award of INITIAL_AWARDS) {
            const docRef = doc(db, 'awards', award.id);
            batch.set(docRef, sanitizeForFirestore(award));
          }
          await batch.commit();
          console.log('[Firestore] Seeded Firestore with initial awards data');
        } catch (seedErr) {
          handleFirestoreError(seedErr, OperationType.WRITE, 'awards');
        }
        onUpdate(INITIAL_AWARDS);
        saveStoredAwards(INITIAL_AWARDS);
      } else {
        const loadedAwards: Award[] = [];
        snapshot.forEach((d) => {
          const data = d.data() as Award;
          if (data && data.id) {
            loadedAwards.push(data);
          }
        });
        saveStoredAwards(loadedAwards);
        onUpdate(loadedAwards);
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, 'awards');
      // Fallback to local storage
      onUpdate(getStoredAwards());
    }
  );

  return unsubscribe;
}

/**
 * Subscribes to real-time updates from Firestore for System Settings
 */
export function subscribeToSettings(onUpdate: (settings: SystemSettings) => void): () => void {
  const settingsDocRef = doc(db, 'settings', 'system');

  const unsubscribe = onSnapshot(
    settingsDocRef,
    async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as SystemSettings;
        const merged = { ...INITIAL_SETTINGS, ...data };
        saveStoredSettings(merged);
        onUpdate(merged);
      } else {
        // Initialize default settings doc
        try {
          await setDoc(settingsDocRef, INITIAL_SETTINGS);
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, 'settings/system');
        }
        onUpdate(INITIAL_SETTINGS);
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, 'settings/system');
      onUpdate(getStoredSettings());
    }
  );

  return unsubscribe;
}

/**
 * Subscribes to real-time updates from Firestore for Activity Logs
 */
export function subscribeToLogs(onUpdate: (logs: ActivityLog[]) => void): () => void {
  const logsCol = collection(db, 'activityLogs');
  
  const unsubscribe = onSnapshot(
    logsCol,
    async (snapshot) => {
      if (snapshot.empty) {
        onUpdate(getStoredLogs());
      } else {
        const list: ActivityLog[] = [];
        snapshot.forEach((d) => {
          list.push(d.data() as ActivityLog);
        });
        // Sort newest first
        list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        onUpdate(list);
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, 'activityLogs');
      onUpdate(getStoredLogs());
    }
  );

  return unsubscribe;
}

/**
 * Subscribes to real-time updates from Firestore for Users
 */
export function subscribeToUsers(onUpdate: (users: AppUser[]) => void): () => void {
  const usersCol = collection(db, 'users');

  const unsubscribe = onSnapshot(
    usersCol,
    async (snapshot) => {
      if (snapshot.empty) {
        try {
          const batch = writeBatch(db);
          for (const u of INITIAL_USERS) {
            const docRef = doc(db, 'users', u.uid);
            batch.set(docRef, u);
          }
          await batch.commit();
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, 'users');
        }
        onUpdate(INITIAL_USERS);
      } else {
        const loadedUsers: AppUser[] = [];
        snapshot.forEach((d) => {
          loadedUsers.push(d.data() as AppUser);
        });
        saveStoredUsers(loadedUsers);
        onUpdate(loadedUsers);
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, 'users');
      onUpdate(getStoredUsers());
    }
  );

  return unsubscribe;
}

// -------------------------------------------------------------
// Database Mutations (Firestore + Local Sync)
// -------------------------------------------------------------

export async function saveAward(award: Award): Promise<boolean> {
  const sanitizedAward: Award = {
    ...award,
    awardName: award.awardName || '',
    recipientName: award.recipientName || '',
    recipientType: award.recipientType || 'student',
    department: award.department || 'academic',
    level: award.level || 'national',
    academicYear: award.academicYear || '2569',
    awardDate: award.awardDate || new Date().toISOString().slice(0, 10),
    description: award.description || '',
    organizer: award.organizer || '',
    certificateUrl: award.certificateUrl || award.imageUrl || '',
    imageUrl: award.imageUrl || award.certificateUrl || '',
    status: award.status || 'published',
    featured: Boolean(award.featured),
    allowDownload: award.allowDownload !== false,
    tags: Array.isArray(award.tags) ? award.tags : [],
    createdBy: award.createdBy || 'system',
    createdByName: award.createdByName || 'ระบบ',
    createdAt: award.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deleted: Boolean(award.deleted)
  };

  // Update local cache immediately for snappy UI
  const current = getStoredAwards();
  const index = current.findIndex(a => a.id === sanitizedAward.id);
  let updated: Award[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = sanitizedAward;
  } else {
    updated = [sanitizedAward, ...current];
  }
  saveStoredAwards(updated);

  // Sync with Firestore Cloud Database
  try {
    const docRef = doc(db, 'awards', sanitizedAward.id);
    const firestoreData = sanitizeForFirestore(sanitizedAward);
    await setDoc(docRef, firestoreData, { merge: true });
    console.log(`[Firestore] Successfully saved award ${sanitizedAward.id}`);
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `awards/${sanitizedAward.id}`);
    console.error(`[Firestore] Error saving award:`, err);
    return false;
  }
}

export async function deleteAward(awardId: string): Promise<boolean> {
  const current = getStoredAwards();
  const updated = current.map(a => a.id === awardId ? { ...a, deleted: true, updatedAt: new Date().toISOString() } : a);
  saveStoredAwards(updated);

  try {
    const docRef = doc(db, 'awards', awardId);
    await updateDoc(docRef, {
      deleted: true,
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `awards/${awardId}`);
    return false;
  }
}

export async function saveSystemSettings(settings: SystemSettings): Promise<boolean> {
  const sanitized = sanitizeForFirestore(settings);
  saveStoredSettings(settings);

  try {
    const docRef = doc(db, 'settings', 'system');
    await setDoc(docRef, sanitized, { merge: true });
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'settings/system');
    return false;
  }
}

export async function saveUser(user: AppUser): Promise<boolean> {
  const current = getStoredUsers();
  saveStoredUsers([user, ...current]);

  try {
    const docRef = doc(db, 'users', user.uid);
    await setDoc(docRef, sanitizeForFirestore(user), { merge: true });
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
    return false;
  }
}

export async function updateUser(user: AppUser): Promise<boolean> {
  const current = getStoredUsers();
  const updated = current.map(u => u.uid === user.uid ? user : u);
  saveStoredUsers(updated);

  try {
    const docRef = doc(db, 'users', user.uid);
    await setDoc(docRef, sanitizeForFirestore(user), { merge: true });
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    return false;
  }
}

export async function logActivity(params: {
  userId: string;
  userName: string;
  userRole: string;
  department: DepartmentId | 'all';
  action: ActivityLog['action'];
  recordId?: string;
  recordTitle?: string;
  details: string;
}): Promise<void> {
  const current = getStoredLogs();
  const newLog: ActivityLog = {
    id: 'log-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
    timestamp: new Date().toISOString(),
    ...params
  };

  try {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify([newLog, ...current]));
  } catch {
    // ignore
  }

  try {
    const docRef = doc(db, 'activityLogs', newLog.id);
    await setDoc(docRef, sanitizeForFirestore(newLog));
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `activityLogs/${newLog.id}`);
  }
}

export function resetToFactoryDefault(): void {
  localStorage.setItem(STORAGE_KEYS.AWARDS, JSON.stringify(INITIAL_AWARDS));
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
  localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(INITIAL_LOGS));
  localStorage.setItem(STORAGE_KEYS.YEARS, JSON.stringify(INITIAL_ACADEMIC_YEARS));
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
}

// Convenience Wrappers for Read operations
export const getAwards = getStoredAwards;
export const getUsers = getStoredUsers;
export const getActivityLogs = getStoredLogs;
export const getSystemSettings = getStoredSettings;
