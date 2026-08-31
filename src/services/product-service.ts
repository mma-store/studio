
'use server';

import { Product } from '@/core/entities/product';
import { SqliteProductRepository } from '@/infra/repositories/sqlite-product-repository';
import { initializeFirebase } from '@/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

/**
 * @fileOverview Product Service Layer v2.0.
 * Orchestrates data between Local SQLite (Primary) and Cloud (Secondary/Sync).
 */

const localRepo = new SqliteProductRepository();

export class ProductService {
  /**
   * Fetches products. 
   * In DUBSAR 2.0, this always queries the local SQLite database first.
   */
  static async getAllProducts(tenantId: string): Promise<Product[]> {
    try {
      // 1. Try Local SQLite (The "Truth" in 2.0)
      const localProducts = await localRepo.getAll();
      
      if (localProducts.length > 0) {
        return localProducts;
      }

      // 2. Fallback to Firebase for Migration/Sync purposes
      console.log(`[ProductService] Local empty, fallback to Cloud for: ${tenantId}`);
      const { firestore } = initializeFirebase();
      const q = query(collection(firestore, 'products'), where('tenantId', '==', tenantId));
      const snap = await getDocs(q);
      
      return snap.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      } as any));
    } catch (error) {
      console.error("[ProductService] Error fetching products:", error);
      return [];
    }
  }

  static async createProduct(data: any) {
    return await localRepo.create(data);
  }

  static async updateStock(productId: string, quantity: number) {
    await localRepo.updateStock(productId, quantity);
  }
}
