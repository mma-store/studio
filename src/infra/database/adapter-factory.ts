
'use client';

import { DatabaseAdapter, DB_COMMANDS } from './adapter';

/**
 * محول المعاينة (Browser Preview Adapter)
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
    console.log(`[MockDB Desktop] Exec: ${command}`, args);
    
    if (command === DB_COMMANDS.SAVE_PRODUCT) {
      const products = await this.getStore('products');
      const newProduct = { ...args, id: Math.random().toString(36).substring(7) };
      products.push(newProduct);
      await this.setStore('products', products);
      return newProduct;
    }

    if (command === DB_COMMANDS.LOGIN) {
      if (args.username === 'admin' && args.pin === '1234') {
        return {
          id: 'mock-owner',
          username: 'admin',
          displayName: 'المدير (معاينة)',
          role: 'owner'
        };
      }
      throw new Error("بيانات خاطئة");
    }

    return { success: true };
  }

  async query(command: string, args?: any): Promise<any[]> {
    if (command === DB_COMMANDS.GET_PRODUCTS) return this.getStore('products');
    if (command === DB_COMMANDS.GET_CATEGORIES) return this.getStore('categories');
    return [];
  }
}

/**
 * محول Tauri الفعلي (Production Desktop Adapter)
 */
class TauriProxyAdapter implements DatabaseAdapter {
  private async invokeCommand(command: string, args?: any): Promise<any> {
    // استيراد ديناميكي لمكتبة Tauri لمنع خطأ الـ Build في المتصفح
    const { invoke } = await import('@tauri-apps/api/core');
    return await invoke(command, args);
  }

  async execute(command: string, args?: any): Promise<any> {
    return await this.invokeCommand(command, args);
  }

  async query(command: string, args?: any): Promise<any[]> {
    const result = await this.invokeCommand(command, args);
    return Array.isArray(result) ? result : [];
  }
}

export class AdapterFactory {
  static getAdapter(): DatabaseAdapter {
    const isDesktop = typeof window !== 'undefined' && (window as any).__TAURI_INTERNALS__;
    
    if (isDesktop) {
      console.log("[DUBSAR 2.0] Mode: Native Desktop");
      return new TauriProxyAdapter();
    }

    console.log("[DUBSAR 2.0] Mode: Browser Preview");
    return new MockAdapter();
  }
}
