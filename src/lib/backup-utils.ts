
/**
 * @fileOverview Utilities for exporting and importing Firestore data as JSON.
 * Supports products, users, orders, workshop, finances, and settings.
 */

import { 
  collection, 
  getDocs, 
  writeBatch, 
  doc, 
  Firestore,
  DocumentData,
  query,
  limit
} from 'firebase/firestore';

const COLLECTIONS_TO_BACKUP = [
  'products',
  'users',
  'orders',
  'repairOrders',
  'expenses',
  'suppliers',
  'purchases',
  'receiptVouchers',
  'paymentVouchers',
  'cashShifts',
  'financialTransactions',
  'settings',
  'categories',
  'motorcycleTypes',
  'banners',
  'offers',
  'auditLogs'
];

export interface BackupPackage {
  version: string;
  timestamp: number;
  generatedBy: string;
  data: Record<string, DocumentData[]>;
}

/**
 * Exports all system data to a single JSON object.
 */
export async function generateBackup(db: Firestore, userName: string): Promise<BackupPackage> {
  const backup: BackupPackage = {
    version: "2.0.0",
    timestamp: Date.now(),
    generatedBy: userName,
    data: {}
  };

  for (const collectionName of COLLECTIONS_TO_BACKUP) {
    const querySnapshot = await getDocs(collection(db, collectionName));
    backup.data[collectionName] = querySnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    }));
  }

  return backup;
}

/**
 * Validates the integrity of a backup file.
 */
export function validateBackup(backup: any): backup is BackupPackage {
  if (!backup || typeof backup !== 'object') return false;
  if (!backup.version || !backup.data || typeof backup.data !== 'object') return false;
  
  // Check if it contains at least one of the essential collections
  const keys = Object.keys(backup.data);
  return keys.includes('products') || keys.includes('users') || keys.includes('orders');
}

/**
 * Restores data from a backup package using atomic batches.
 * Warning: This can overwrite data if IDs match.
 */
export async function restoreFromBackup(
  db: Firestore, 
  backup: BackupPackage, 
  onProgress?: (percent: number) => void
) {
  const collections = Object.keys(backup.data);
  let totalDocs = 0;
  collections.forEach(c => totalDocs += backup.data[c].length);
  
  let processedDocs = 0;

  for (const collectionName of collections) {
    const docs = backup.data[collectionName];
    
    // Firestore batch limit is 500 operations
    for (let i = 0; i < docs.length; i += 400) {
      const batch = writeBatch(db);
      const chunk = docs.slice(i, i + 400);
      
      chunk.forEach(item => {
        const { id, ...data } = item;
        const docRef = id ? doc(db, collectionName, id) : doc(collection(db, collectionName));
        batch.set(docRef, data, { merge: true });
        processedDocs++;
      });
      
      await batch.commit();
      if (onProgress) onProgress(Math.round((processedDocs / totalDocs) * 100));
    }
  }
}

/**
 * Helper to download backup as a file.
 */
export function downloadBackupFile(backup: BackupPackage) {
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const date = new Date().toISOString().split('T')[0];
  a.href = url;
  a.download = `MMA-Backup-${date}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
