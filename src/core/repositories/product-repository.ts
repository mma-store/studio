
import { Product } from '@/core/entities/product';

/**
 * @fileOverview Interface for Product Data Access.
 * This allows swapping between SQLite (Local) and Firebase (Cloud).
 */
export interface IProductRepository {
  getAll(): Promise<Product[]>;
  getById(id: string): Promise<Product | null>;
  create(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<string>;
  update(id: string, product: Partial<Product>): Promise<void>;
  delete(id: string): Promise<void>;
  updateStock(id: string, quantity: number): Promise<void>;
}
