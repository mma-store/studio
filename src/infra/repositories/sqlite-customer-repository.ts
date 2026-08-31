
import { db } from '../database/sqlite/client';
import { customers } from '../database/sqlite/schema';
import { eq, sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export class SqliteCustomerRepository {
  async getAll() {
    return await db.select().from(customers);
  }

  async create(data: { name: string, phone?: string, address?: string }) {
    const id = uuidv4();
    await db.insert(customers).values({
      id,
      ...data,
      balance: 0,
      createdAt: Date.now()
    });
    return id;
  }

  async updateBalance(id: string, amount: number) {
    await db.update(customers)
      .set({ balance: sql`${customers.balance} + ${amount}` })
      .where(eq(customers.id, id));
  }
}
