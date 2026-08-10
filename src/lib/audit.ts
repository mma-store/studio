import { collection, addDoc, getFirestore } from "firebase/firestore";
import { initializeFirebase } from "@/firebase";

/**
 * Utility to log administrative actions to the system audit log.
 * Updated to use centralized firebase initialization.
 */
export async function logAction(data: {
  userId: string;
  userName: string;
  action: string;
  target: string;
  details: string;
  tenantId?: string;
}) {
  try {
    const { firestore } = initializeFirebase();
    await addDoc(collection(firestore, 'auditLogs'), {
      ...data,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
  }
}
