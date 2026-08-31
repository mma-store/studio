
'use client';

import { AdapterFactory } from '@/infra/database/adapter-factory';
import { DB_COMMANDS } from '@/infra/database/adapter';

/**
 * @fileOverview Local Authentication Service v2.1.
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
    // Initial check for 'admin' user
    if (!(typeof window !== 'undefined' && (window as any).__TAURI_INTERNALS__)) {
      console.log("[LocalAuth] Mock Owner Check for Browser");
    }
  }

  static async login(username: string, pin: string): Promise<LocalUser | null> {
    try {
      const user = await this.adapter.execute(DB_COMMANDS.LOGIN, { username, pin });
      
      if (user) {
        // Log successful login
        await this.adapter.execute(DB_COMMANDS.LOG_AUDIT, {
          action: 'تسجيل دخول',
          details: `المستخدم: ${username}`,
          user: user.displayName
        });
      }
      
      return user;
    } catch (error) {
      console.error("Login failed:", error);
      return null;
    }
  }

  static async getUsers() {
    return await this.adapter.query(DB_COMMANDS.GET_USERS);
  }

  static async createUser(data: any) {
    return await this.adapter.execute(DB_COMMANDS.CREATE_USER, data);
  }

  static async deleteUser(id: string) {
    return await this.adapter.execute(DB_COMMANDS.DELETE_USER, { id });
  }
}
