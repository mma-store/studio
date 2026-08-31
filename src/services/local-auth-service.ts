
'use server';

import { db } from '@/infra/database/sqlite/client';
import { users, auditLogs } from '@/infra/database/sqlite/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { webcrypto } from 'node:crypto';

/**
 * @fileOverview نظام التوثيق المحلي لـ DUBSAR 2.0 (Server Side).
 */

export interface LocalUser {
  id: string;
  username: string;
  displayName: string;
  role: string;
  permissions: string[];
}

export class LocalAuthService {
  /**
   * توليد Hash لرمز الـ PIN باستخدام Node.js Crypto
   */
  private static async hashPIN(pin: string): Promise<string> {
    const msgUint8 = new TextEncoder().encode(pin);
    const hashBuffer = await webcrypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * التأكد من وجود مستخدم Owner (عند أول تشغيل)
   */
  static async ensureOwnerExists() {
    const existing = await db.select().from(users).where(eq(users.role, 'owner')).get();
    if (!existing) {
      const pinHash = await this.hashPIN('1234'); // Default PIN
      await db.insert(users).values({
        id: uuidv4(),
        username: 'admin',
        displayName: 'المدير العام',
        pinHash,
        role: 'owner',
        permissions: JSON.stringify(['*']), // كل الصلاحيات
        createdAt: Date.now()
      });
      console.log("[LocalAuth] Default Owner Created: admin / 1234");
    }
  }

  /**
   * تسجيل الدخول المحلي
   */
  static async login(username: string, pin: string): Promise<LocalUser | null> {
    const user = await db.select().from(users).where(eq(users.username, username)).get();
    if (!user || !user.active) return null;

    const pinHash = await this.hashPIN(pin);
    if (user.pinHash !== pinHash) return null;

    // تحديث وقت الدخول
    await db.update(users).set({ lastLogin: Date.now() }).where(eq(users.id, user.id));

    // تسجيل في Audit Log
    await db.insert(auditLogs).values({
      userId: user.id,
      userName: user.displayName,
      action: 'تسجيل دخول',
      module: 'auth',
      details: 'تم الدخول إلى النظام محلياً',
      timestamp: Date.now()
    });

    return {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      role: user.role,
      permissions: JSON.parse(user.permissions || '[]')
    };
  }

  /**
   * إضافة مستخدم جديد
   */
  static async createUser(data: {
    username: string, 
    displayName: string, 
    pin: string, 
    role: string, 
    permissions: string[]
  }) {
    const id = uuidv4();
    const pinHash = await this.hashPIN(data.pin);
    
    await db.insert(users).values({
      id,
      username: data.username,
      displayName: data.displayName,
      pinHash,
      role: data.role,
      permissions: JSON.stringify(data.permissions),
      createdAt: Date.now()
    });

    return id;
  }

  static async getUsers() {
    return await db.select().from(users);
  }

  static async deleteUser(id: string) {
    await db.delete(users).where(eq(users.id, id));
  }
}
