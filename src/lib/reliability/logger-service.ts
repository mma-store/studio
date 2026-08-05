
'use client';

import { collection, addDoc, Firestore } from 'firebase/firestore';

export type LogSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface SystemLog {
  timestamp: number;
  tenantId: string | null;
  userId: string | null;
  page: string;
  action: string;
  severity: LogSeverity;
  errorCode?: string;
  message: string;
  details?: any;
}

/**
 * Global Logging Service for Platform Reliability
 */
export class LoggerService {
  private static instance: LoggerService;
  private db: Firestore | null = null;

  private constructor() {}

  static getInstance(): LoggerService {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService();
    }
    return LoggerService.instance;
  }

  setFirestore(db: Firestore) {
    this.db = db;
  }

  async log(log: Omit<SystemLog, 'timestamp'>) {
    const fullLog: SystemLog = {
      ...log,
      timestamp: Date.now(),
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      const color = log.severity === 'error' ? 'red' : log.severity === 'warning' ? 'orange' : 'blue';
      console.log(`%c[SYSTEM LOG] ${log.action}: ${log.message}`, `color: ${color}; font-weight: bold;`, log.details || '');
    }

    // Persist critical/error logs to Firestore if available
    if (this.db && (log.severity === 'error' || log.severity === 'critical')) {
      try {
        await addDoc(collection(this.db, 'systemLogs'), fullLog);
      } catch (e) {
        console.error("Failed to write to systemLogs:", e);
      }
    }
  }

  static getErrorMessage(error: any): string {
    if (typeof error === 'string') return error;
    
    // Firebase Specific Errors
    if (error.code) {
      switch (error.code) {
        case 'permission-denied': return 'عذراً، لا تمتلك الصلاحيات الكافية لإتمام هذه العملية.';
        case 'unavailable': return 'خدمة البيانات غير متوفرة حالياً، سيتم الحفظ محلياً.';
        case 'auth/network-request-failed': return 'فشل الاتصال بالخادم، يرجى التحقق من الإنترنت.';
        default: return `خطأ في النظام (${error.code})`;
      }
    }

    return error.message || 'حدث خطأ غير متوقع، يرجى المحاولة لاحقاً.';
  }
}

export const logger = LoggerService.getInstance();
