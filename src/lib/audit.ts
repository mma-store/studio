
import { collection, addDoc } from "firebase/firestore";
import { db } from "./firebase/config";

/**
 * Utility to log administrative actions to the system audit log.
 */
export async function logAction(data: {
  userId: string;
  userName: string;
  action: string;
  target: string;
  details: string;
}) {
  try {
    await addDoc(collection(db, 'auditLogs'), {
      ...data,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
  }
}
