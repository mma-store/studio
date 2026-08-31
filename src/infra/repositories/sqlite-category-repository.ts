
import { db } from '../database/sqlite/client';
import { categories } from '../database/sqlite/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export class SqliteCategoryRepository {
  async getAll() {
    return await db.select().from(categories);
  }

  async create(name: string, imageUrl?: string) {
    const id = uuidv4();
    await db.insert(categories).values({
      id,
      name,
      imageUrl,
      createdAt: Date.now()
    });
    return id;
  }

  async delete(id: string) {
    await db.delete(categories).where(eq(categories.id, id));
  }
}
