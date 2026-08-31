
'use server';

import { SqliteSaleRepository } from '@/infra/repositories/sqlite-sale-repository';
import { SqliteCustomerRepository } from '@/infra/repositories/sqlite-customer-repository';

const saleRepo = new SqliteSaleRepository();
const customerRepo = new SqliteCustomerRepository();

/**
 * @fileOverview خدمة نقطة البيع (Server Actions).
 */
export class POSService {
  static async processSale(cart: any[], customer: any, payment: any, user: any) {
    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const unpaid = total - payment.paidAmount;

    const result = await saleRepo.create({
      customerId: customer.id,
      customerName: customer.name,
      items: cart,
      totalAmount: total,
      paidAmount: payment.paidAmount,
      paymentMethod: payment.method,
      userName: user?.displayName || 'مدير',
    });

    // If there's debt, update customer balance
    if (customer.id && unpaid > 0) {
      await customerRepo.updateBalance(customer.id, unpaid);
    }

    return result;
  }

  static async getRecentSales() {
    return await saleRepo.getAll();
  }
}
