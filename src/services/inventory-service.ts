
'use client';

import { AdapterFactory } from '@/infra/database/adapter-factory';
import { DB_COMMANDS } from '@/infra/database/adapter';

/**
 * @fileOverview Inventory Management Service.
 */
export class InventoryService {
  private static adapter = AdapterFactory.getAdapter();

  static async getProducts() {
    return await this.adapter.query(DB_COMMANDS.GET_PRODUCTS);
  }

  static async saveProduct(data: any) {
    return await this.adapter.execute(DB_COMMANDS.SAVE_PRODUCT, data);
  }

  static async deleteProduct(id: string) {
    return await this.adapter.execute(DB_COMMANDS.DELETE_PRODUCT, { id });
  }

  static async getCategories() {
    return await this.adapter.query(DB_COMMANDS.GET_CATEGORIES);
  }

  static async saveCategory(name: string, image?: string) {
    return await this.adapter.execute(DB_COMMANDS.SAVE_CATEGORY, { name, image });
  }
}
