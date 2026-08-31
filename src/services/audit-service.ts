
'use server';

import { db } from '@/infra/database/sqlite/client';
import { auditLogs } from '@/infra/database/sqlite/schema';
import { desc } from 'drizzle-orm';

/**
 * @fileOverview خدمة سجل التدقيق المحلي (Server Actions).
 */

export class AuditService {
  static async log(action: string, module: string, details: string, user?: { id: string, name: string }) {
    await db.insert(auditLogs).values({
      userId: user?.id || 'system',
      userName: user?.name || 'النظام',
      action,
      module,
      details,
      timestamp: Date.now()
    });
  }

  static async getRecentLogs(count = 50) {
    return await db.select().from(auditLogs).orderBy(desc(auditLogs.timestamp)).limit(count);
  }
}
