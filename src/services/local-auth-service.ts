
'use client';

import { AdapterFactory } from '@/infra/database/adapter-factory';
import { DB_COMMANDS } from '@/infra/database/adapter';

/**
 * @fileOverview Local Authentication Service.
 * Uses Adapter Pattern to work in both Browser Preview and Tauri Desktop.
 */

export interface LocalUser {
  id: string;
  username: string;
  displayName: string;
  role: string;
  permissions: string[];
}

export class LocalAuthService {
  private static adapter = AdapterFactory.getAdapter();

  static async ensureOwnerExists() {
    // This is handled by Rust sidecar or Mock initialization
    if (!(typeof window !== 'undefined' && (window as any).__TAURI_INTERNALS__)) {
      console.log("[LocalAuth] Mock Owner check");
    }
  }

  static async login(username: string, pin: string): Promise<LocalUser | null> {
    try {
      if (!(typeof window !== 'undefined' && (window as any).__TAURI_INTERNALS__)) {
        // Mock Login for Preview
        if (username === 'admin' && pin === '1234') {
          return {
            id: 'owner-id',
            username: 'admin',
            displayName: 'المدير (معاينة)',
            role: 'owner',
            permissions: ['*']
          };
        }
        return null;
      }

      return await this.adapter.execute(DB_COMMANDS.LOGIN, { username, pin });
    } catch (error) {
      console.error("Login Error:", error);
      return null;
    }
  }

  static async getUsers() {
    return await this.adapter.query('get_users');
  }

  static async createUser(data: any) {
    return await this.adapter.execute('create_user', data);
  }

  static async deleteUser(id: string) {
    return await this.adapter.execute('delete_user', { id });
  }
}
