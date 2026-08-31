
import { db } from '../database/sqlite/client';
import { purchases, products, auditLogs } from '../database/sqlite/schema';
import { eq, sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export class SqlitePurchaseRepository {
  async getAll() {
    return await db.select().from(purchases).orderBy(sql`${purchases.createdAt} desc`);
  }

  async create(data: {
    supplierId: string;
    items: any[];
    totalAmount: number;
    paidAmount: number;
    userName: string;
  }) {
    const purchaseId = uuidv4();
    const purchaseNo = `PUR-${Date.now().toString().slice(-6)}`;

    return await db.transaction(async (tx) => {
      // 1. Create Purchase Record
      await tx.insert(purchases).values({
        id: purchaseId,
        purchaseNo,
        supplierId: data.supplierId,
        totalAmount: data.totalAmount,
        paidAmount: data.paidAmount,
        createdAt: Date.now(),
      });

      // 2. Update Products Cost and Stock
      for (const item of data.items) {
        await tx.update(products)
          .set({ 
            stockQuantity: sql`${products.stockQuantity} + ${item.quantity}`,
            purchasePrice: item.cost,
            updatedAt: Date.now() 
          })
          .where(eq(products.id, item.id));
      }

      // 3. Log
      await tx.insert(auditLogs).values({
        action: 'فاتورة شراء بضاعة',
        details: `رقم ${purchaseNo} بقيمة ${data.totalAmount}`,
        userName: data.userName,
        timestamp: Date.now(),
      });

      return { purchaseId, purchaseNo };
    });
  }
}
