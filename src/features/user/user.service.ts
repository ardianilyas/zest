import { desc, eq } from "drizzle-orm";
import { db } from "../../config/database";
import { users, type User } from "../../db/schema";
import { type AssignUserRoleDto, type UserResponseDto } from "./user.dto";
import { NotFoundException } from "../../common/http-exception";
import { userSelect } from "./user.select";

export class UserService {
  async getAllUsers(): Promise<UserResponseDto[]> {
    return await db.select(userSelect).from(users).orderBy(desc(users.createdAt));
  }

  async assignUserRole(data: AssignUserRoleDto): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ role: data.role })
      .where(eq(users.id, data.id))
      .returning();

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user;
  }
}