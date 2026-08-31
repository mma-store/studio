
'use server';

import { Product } from '@/core/entities/product';
import { SqliteProductRepository } from '@/infra/repositories/sqlite-product-repository';
import { initializeFirebase } from '@/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

/**
 * @fileOverview Product Service Layer v2.0.
 * يقوم هذا الملف بالتنسيق بين قاعدة البيانات المحلية (الخيار الأول) والسحابة (للمزامنة).
 */

const localRepo = new SqliteProductRepository();

export class ProductService {
  /**
   * جلب المنتجات. 
   * في DUBSAR 2.0، يتم البحث دائماً في SQLite المحلي أولاً لضمان السرعة والعمل بدون إنترنت.
   */
  static async getAllProducts(tenantId?: string): Promise<Product[]> {
    try {
      // 1. محاولة القراءة من SQLite (المصدر الحقيقي للبيانات في 2.0)
      const localProducts = await localRepo.getAll();
      
      if (localProducts.length > 0) {
        console.log(`[ProductService] Loaded ${localProducts.length} products from SQLite.`);
        return localProducts;
      }

      // 2. التحول لـ Firebase فقط في حال كانت القاعدة المحلية فارغة (لأغراض الهجرة أو التزامن الأولي)
      if (tenantId) {
        console.log(`[ProductService] Local empty, checking Cloud for tenant: ${tenantId}`);
        const { firestore } = initializeFirebase();
        const q = query(collection(firestore, 'products'), where('tenantId', '==', tenantId));
        const snap = await getDocs(q);
        
        const cloudProducts = snap.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        } as any));

        // اختيارياً: يمكن هنا حقن البيانات السحابية في القاعدة المحلية آلياً
        return cloudProducts;
      }

      return [];
    } catch (error) {
      console.error("[ProductService] Error fetching products:", error);
      return [];
    }
  }

  static async createProduct(data: any) {
    // الحفظ المحلي الفوري
    const id = await localRepo.create(data);
    return id;
  }

  static async updateStock(productId: string, quantity: number) {
    await localRepo.updateStock(productId, quantity);
  }
}
