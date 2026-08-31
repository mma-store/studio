
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

/**
 * @fileOverview المخطط الشامل لقاعدة بيانات DUBSAR 2.0 المحلية.
 * تم تصميم الجداول لدعم العمليات التجارية المعقدة محلياً بالكامل.
 */

// 1. الأقسام والمنتجات
export const categories = sqliteTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  imageUrl: text('image_url'),
  createdAt: integer('created_at').notNull(),
});

export const products = sqliteTable('products', {
  id: text('id').primaryKey(),
  categoryId: text('category_id').references(() => categories.id),
  name: text('name').notNull(),
  sku: text('sku'),
  barcode: text('barcode'),
  description: text('description'),
  purchasePrice: real('purchase_price').default(0),
  retailPrice: real('retail_price').default(0),
  wholesalePrice: real('wholesale_price').default(0),
  stockQuantity: integer('stock_quantity').default(0),
  minStockLevel: integer('min_stock_level').default(5),
  storageLocation: text('storage_location'),
  imageUrl: text('image_url'),
  isFeatured: integer('is_featured', { mode: 'boolean' }).default(0),
  status: text('status').default('available'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

// 2. الزبائن والموردين
export const customers = sqliteTable('customers', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  phone: text('phone'),
  address: text('address'),
  balance: real('balance').default(0),
  createdAt: integer('created_at').notNull(),
});

export const suppliers = sqliteTable('suppliers', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  phone: text('phone'),
  address: text('address'),
  balance: real('balance').default(0),
  createdAt: integer('created_at').notNull(),
});

// 3. المبيعات والمشتريات
export const sales = sqliteTable('sales', {
  id: text('id').primaryKey(),
  invoiceNo: text('invoice_no').unique().notNull(),
  customerId: text('customer_id').references(() => customers.id),
  totalAmount: real('total_amount').notNull(),
  paidAmount: real('paid_amount').default(0),
  paymentMethod: text('payment_method'), // cash, credit, partial
  status: text('status').default('completed'),
  createdAt: integer('created_at').notNull(),
});

export const saleItems = sqliteTable('sale_items', {
  id: text('id').primaryKey(),
  saleId: text('sale_id').references(() => sales.id),
  productId: text('product_id').references(() => products.id),
  quantity: integer('quantity').notNull(),
  unitPrice: real('unit_price').notNull(),
  totalPrice: real('total_price').notNull(),
});

export const purchases = sqliteTable('purchases', {
  id: text('id').primaryKey(),
  purchaseNo: text('purchase_no').unique().notNull(),
  supplierId: text('supplier_id').references(() => suppliers.id),
  totalAmount: real('total_amount').notNull(),
  paidAmount: real('paid_amount').default(0),
  createdAt: integer('created_at').notNull(),
});

// 4. المصاريف والمالية
export const expenses = sqliteTable('expenses', {
  id: text('id').primaryKey(),
  category: text('category').notNull(),
  amount: real('amount').notNull(),
  notes: text('notes'),
  employeeName: text('employee_name'),
  timestamp: integer('timestamp').notNull(),
});

// 5. إعدادات النظام والتراخيص
export const appSettings = sqliteTable('app_settings', {
  id: text('id').primaryKey(), // 'current'
  businessName: text('business_name'),
  logo: text('logo'),
  phone: text('phone'),
  address: text('address'),
  storeSlug: text('store_slug'),
  themeConfig: text('theme_config'),
});

export const licenseInfo = sqliteTable('license_info', {
  id: text('id').primaryKey(),
  licenseKey: text('license_key').notNull(),
  activatedAt: integer('activated_at'),
  hardwareId: text('hardware_id'),
  planType: text('plan_type'),
});

export const auditLogs = sqliteTable('audit_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  action: text('action').notNull(),
  details: text('details'),
  userName: text('user_name'),
  timestamp: integer('timestamp').notNull(),
});
