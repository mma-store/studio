
/**
 * @fileOverview Interface for Database operations.
 * Allows switching between Tauri (Production) and Mock (Browser Preview).
 */
export interface DatabaseAdapter {
  execute(command: string, args?: any): Promise<any>;
  query(command: string, args?: any): Promise<any[]>;
}

export const DB_COMMANDS = {
  LOGIN: 'login_user',
  GET_PRODUCTS: 'get_products',
  SAVE_PRODUCT: 'save_product',
  DELETE_PRODUCT: 'delete_product',
  GET_CATEGORIES: 'get_categories',
  SAVE_CATEGORY: 'save_category',
  PROCESS_SALE: 'process_sale',
  LOG_AUDIT: 'log_audit'
};
