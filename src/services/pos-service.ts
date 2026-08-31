
'use client';

import { AdapterFactory } from '@/infra/database/adapter-factory';
import { DB_COMMANDS } from '@/infra/database/adapter';

/**
 * @fileOverview POS Service for DUBSAR 2.0 Desktop.
 * Uses Unified Adapter Pattern for both Preview and Production.
 */
export class POSService {
  private static adapter = AdapterFactory.getAdapter();

  static async processSale(cart: any[], customer: any, payment: any, user: any) {
    // 1. Execute via Adapter (Tauri/Rust or Mock)
    const result = await this.adapter.execute(DB_COMMANDS.PROCESS_SALE, {
      cart,
      customer,
      payment,
      userName: user?.displayName || 'مدير'
    });

    // 2. Log Action Locally
    await this.adapter.execute(DB_COMMANDS.LOG_AUDIT, {
      action: 'عملية بيع',
      details: `فاتورة رقم ${result.invoiceNo} بقيمة ${payment.paidAmount}`,
      user: user?.displayName || 'مدير'
    });

    return result;
  }

  static async getRecentSales() {
    return await this.adapter.query('get_sales');
  }
}
