
/**
 * @fileOverview تعريفات الهوية الرقمية الموحدة للمنصة.
 */

export type UserRole = 
  | 'super_admin'
  | 'owner' 
  | 'admin' 
  | 'sales_employee' 
  | 'workshop_technician' 
  | 'warehouse_employee' 
  | 'retail_customer' 
  | 'wholesale_customer';

export type AccountType = 'merchant' | 'super_admin' | 'customer';

/**
 * الوثيقة المرجعية الموحدة للحساب.
 * يتم تخزينها في مجموعتين: accountProfiles (المرجع الرئيسي) و users (للتوافق التاريخي).
 */
export interface UserProfile {
  uid: string;           // Firebase Auth UID
  email: string;
  displayName: string;
  accountType: AccountType;
  role: UserRole;
  tenantId: string | null;
  phoneNumber?: string;
  photoURL?: string;
  status: 'active' | 'suspended' | 'expired';
  createdAt: number;
  updatedAt?: number;
}

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  super_admin: ['all_platform'],
  admin: ['all'],
  owner: ['all'],
  sales_employee: ['view_catalog', 'create_order', 'manage_pos', 'manage_inventory'],
  workshop_technician: ['view_tasks', 'update_task_status'],
  warehouse_employee: ['manage_inventory', 'view_stock'],
  retail_customer: ['view_catalog', 'view_orders'],
  wholesale_customer: ['view_catalog', 'view_orders', 'view_wholesale_prices'],
};
