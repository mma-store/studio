
/**
 * @fileOverview Utilities for exporting and importing Firestore data as JSON.
 * Enhanced for SaaS production with batching, validation, and progress tracking.
 */

import { 
  collection, 
  getDocs, 
  writeBatch, 
  doc, 
  Firestore,
  DocumentData,
  query,
  where
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
  tenantId?: string;
  scope: 'full' | 'tenant';
  data: Record<string, DocumentData[]>;
}

/**
 * Generates a backup for a specific tenant or the entire platform.
 */
export async function generateBackup(db: Firestore, userName: string, tenantId?: string): Promise<BackupPackage> {
  const backup: BackupPackage = {
    version: "2.1.0",
    timestamp: Date.now(),
    generatedBy: userName,
    tenantId,
    scope: tenantId ? 'tenant' : 'full',
    data: {}
  };

  for (const collectionName of COLLECTIONS_TO_BACKUP) {
    let q = query(collection(db, collectionName));
    if (tenantId) {
      q = query(collection(db, collectionName), where('tenantId', '==', tenantId));
    }
    
    const querySnapshot = await getDocs(q);
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
  return true;
}

/**
 * Restores data from a backup package with batch management.
 */
export async function restoreFromBackup(
  db: Firestore, 
  backup: BackupPackage, 
  onProgress?: (percent: number) => void
) {
  const collections = Object.keys(backup.data);
  let totalDocs = 0;
  collections.forEach(c => totalDocs += backup.data[c].length);
  
  if (totalDocs === 0) return;
  
  let processedDocs = 0;

  for (const collectionName of collections) {
    const docs = backup.data[collectionName];
    
    // Firestore batch limit is 500 operations. We use 400 for safety.
    for (let i = 0; i < docs.length; i += 400) {
      const batch = writeBatch(db);
      const chunk = docs.slice(i, i + 400);
      
      chunk.forEach(item => {
        const { id, ...data } = item;
        // If it's a tenant backup, we ensure tenantId is preserved or overwritten correctly
        if (backup.tenantId) data.tenantId = backup.tenantId;
        
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
 * Triggers a download of the backup file.
 */
export function downloadBackupFile(backup: BackupPackage) {
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const date = new Date().toISOString().split('T')[0];
  const prefix = backup.scope === 'full' ? 'PLATFORM' : (backup.tenantId || 'TENANT');
  
  a.href = url;
  a.download = `${prefix}-Backup-${date}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
