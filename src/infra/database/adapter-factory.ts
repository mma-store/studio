
'use client';

import { DatabaseAdapter, DB_COMMANDS } from './adapter';

/**
 * Mock Adapter for Browser Preview (Development)
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
    if (command === DB_COMMANDS.SAVE_PRODUCT) {
      const products = await this.getStore('products');
      const index = products.findIndex(p => p.id === args.id);
      if (index > -1) products[index] = args;
      else products.push({ ...args, id: Math.random().toString(36).substr(2, 9) });
      await this.setStore('products', products);
    }
    return { success: true };
  }

  async query(command: string, args?: any): Promise<any[]> {
    console.log(`[MockDB Query] ${command}`, args);
    if (command === DB_COMMANDS.GET_PRODUCTS) return this.getStore('products');
    if (command === DB_COMMANDS.GET_CATEGORIES) return this.getStore('categories');
    return [];
  }
}

/**
 * Tauri Adapter for Production Desktop
 */
class TauriAdapter implements DatabaseAdapter {
  private async invokeTauri(command: string, args?: any) {
    if (typeof window !== 'undefined' && (window as any).__TAURI_INTERNALS__) {
      const { invoke } = await import('@tauri-apps/api/core');
      return await invoke(command, args);
    }
    throw new Error('Not in Tauri environment');
  }

  async execute(command: string, args?: any): Promise<any> {
    return this.invokeTauri(command, args);
  }

  async query(command: string, args?: any): Promise<any[]> {
    return this.invokeTauri(command, args);
  }
}

export class AdapterFactory {
  static getAdapter(): DatabaseAdapter {
    if (typeof window !== 'undefined' && (window as any).__TAURI_INTERNALS__) {
      return new TauriAdapter();
    }
    return new MockAdapter();
  }
}
