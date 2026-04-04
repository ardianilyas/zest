import { desc, eq } from "drizzle-orm";
import { db } from "../../config/database";
import { categories } from "../../db/schema";
import type { CreateCategoryDto, UpdateCategoryDto } from "./category.dto";
import { NotFoundException } from "../../common/http-exception";

const CATEGORY_NOT_FOUND = "Category not found";

export class CategoryService {
  async getAllCategories() {
    return await db.select().from(categories).orderBy(desc(categories.createdAt));
  }

  async getCategoryById(id: string) {
    return await db.select().from(categories).where(eq(categories.id, id));
  }

  async createCategroy(data: CreateCategoryDto) {
    return await db.insert(categories).values(data);
  }

  async updateCategory(id: string, data: UpdateCategoryDto) {
    const category = await db.update(categories).set(data).where(eq(categories.id, id)).returning();

    if (category.length === 0) {
      throw new NotFoundException(CATEGORY_NOT_FOUND);
    }

    return category;
  }

  async deleteCategory(id: string) {
    const category = await db.delete(categories).where(eq(categories.id, id)).returning();

    if (category.length === 0) {
      throw new NotFoundException(CATEGORY_NOT_FOUND);
    }

    return true;
  }
}