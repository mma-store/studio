
import { SqliteProductRepository } from '@/infra/repositories/sqlite-product-repository';
import { SqliteCategoryRepository } from '@/infra/repositories/sqlite-category-repository';

const productRepo = new SqliteProductRepository();
const categoryRepo = new SqliteCategoryRepository();

export class InventoryService {
  // Products
  static async getProducts() {
    return await productRepo.getAll();
  }

  static async saveProduct(data: any) {
    if (data.id) {
      return await productRepo.update(data.id, data);
    }
    return await productRepo.create(data);
  }

  static async deleteProduct(id: string) {
    return await productRepo.delete(id);
  }

  static async updateStock(id: string, quantity: number) {
    return await productRepo.updateStock(id, quantity);
  }

  // Categories
  static async getCategories() {
    return await categoryRepo.getAll();
  }

  static async saveCategory(name: string, image?: string) {
    return await categoryRepo.create(name, image);
  }
}
