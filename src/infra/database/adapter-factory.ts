
'use client';

import { DatabaseAdapter, DB_COMMANDS } from './adapter';

/**
 * Mock Adapter for Browser Preview (Development)
 * Uses localStorage to persist data across refreshes in the browser.
 */
class MockAdapter implements DatabaseAdapter {
  private async getStore(key: string): Promise<any[]> {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(`dubsar_mock_${key}`);
    return data ? JSON.parse(data) : [];
  }

  private async setStore(key: string, data: any[]) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`dubsar_mock_${key}`, JSON.stringify(data));
    }
  }

  async execute(command: string, args?: any): Promise<any> {
    console.log(`[MockDB Exec] ${command}`, args);
    
    // Simple logic for products
    if (command === DB_COMMANDS.SAVE_PRODUCT) {
      const products = await this.getStore('products');
      const index = products.findIndex(p => p.id === args.id);
      if (index > -1) products[index] = args;
      else products.push({ ...args, id: Math.random().toString(36).substring(2, 11) });
      await this.setStore('products', products);
    }

    // Simple logic for users
    if (command === DB_COMMANDS.CREATE_USER) {
      const users = await this.getStore('users');
      users.push({ ...args, id: Math.random().toString(36).substring(2, 11) });
      await this.setStore('users', users);
    }

    return { success: true };
  }

  async query(command: string, args?: any): Promise<any[]> {
    console.log(`[MockDB Query] ${command}`, args);
    if (command === DB_COMMANDS.GET_PRODUCTS) return this.getStore('products');
    if (command === DB_COMMANDS.GET_CATEGORIES) return this.getStore('categories');
    if (command === DB_COMMANDS.GET_USERS) return this.getStore('users');
    return [];
  }
}

/**
 * Singleton factory to provide the correct database adapter.
 */
export class AdapterFactory {
  private static instance: DatabaseAdapter | null = null;

  static getAdapter(): DatabaseAdapter {
    // If instance already created, return it (works for MockAdapter)
    if (this.instance) return this.instance;

    // Detect environment
    const isTauri = typeof window !== 'undefined' && (window as any).__TAURI_INTERNALS__;

    if (isTauri) {
      // Lazy-loading the Tauri adapter using a proxy or a wrapper to avoid build errors.
      // Since execute/query are async, we can resolve the real adapter inside them.
      return new TauriProxyAdapter();
    }

    // Default to Mock for Browser Preview
    this.instance = new MockAdapter();
    return this.instance;
  }
}

/**
 * A proxy class that handles dynamic import of Tauri APIs only when called.
 */
class TauriProxyAdapter implements DatabaseAdapter {
  private realAdapter: DatabaseAdapter | null = null;

  private async getRealAdapter(): Promise<DatabaseAdapter> {
    if (this.realAdapter) return this.realAdapter;
    
    // Dynamic import of the actual Tauri implementation
    // This hides the '@tauri-apps/api' from the browser's initial bundle parsing.
    const { TauriDatabaseAdapter } = await import('./tauri-adapter');
    this.realAdapter = new TauriDatabaseAdapter();
    return this.realAdapter;
  }

  async execute(command: string, args?: any): Promise<any> {
    const adapter = await this.getRealAdapter();
    return await adapter.execute(command, args);
  }

  async query(command: string, args?: any): Promise<any[]> {
    const adapter = await this.getRealAdapter();
    return await adapter.query(command, args);
  }
}
