
import { IProductRepository } from '@/core/repositories/product-repository';
import { Product } from '@/core/entities/product';
import { db } from '../database/sqlite/client';
import { products } from '../database/sqlite/schema';
import { eq, sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

/**
 * @fileOverview SQLite Implementation of Product Repository.
 * DUBSAR 2.0 Primary Data Access.
 */
export class SqliteProductRepository implements IProductRepository {
  async getAll(): Promise<Product[]> {
    const results = await db.select().from(products);
    return results.map(r => ({
      ...r,
      stockQuantity: r.stockQuantity || 0,
      minStockLevel: r.minStockLevel || 0,
      purchasePrice: r.purchasePrice || 0,
      retailPrice: r.retailPrice || 0,
      wholesalePrice: r.wholesalePrice || 0,
      status: (r.status as any) || 'available'
    })) as Product[];
  }

  async getById(id: string): Promise<Product | null> {
    const result = await db.select().from(products).where(eq(products.id, id)).get();
    return (result as Product) || null;
  }

  async create(data: any): Promise<string> {
    const id = uuidv4();
    const now = Date.now();
    await db.insert(products).values({
      ...data,
      id,
      createdAt: now,
      updatedAt: now
    });
    return id;
  }

  async update(id: string, data: Partial<Product>): Promise<void> {
    await db.update(products)
      .set({ ...data, updatedAt: Date.now() })
      .where(eq(products.id, id));
  }

  async delete(id: string): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  async updateStock(id: string, quantity: number): Promise<void> {
    await db.update(products)
      .set({ 
        stockQuantity: sql`${products.stockQuantity} + ${quantity}`,
        updatedAt: Date.now()
      })
      .where(eq(products.id, id));
  }
}
