import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { env } from "../../config/env";
import { users } from "../../db/schema";
import { ConflictException, NotFoundException, UnauthorizedException } from "../../common/http-exception";
import { AUTH_ERROR_MESSAGES, BCRYPT_SALT_ROUNDS, JWT_EXPIRES_IN } from "./auth.constant";
import type { JwtPayload, LoginDto, RegisterDto } from "./auth.dto";

export class AuthService {
  constructor(private readonly db: NodePgDatabase) {}

  private generateToken(payload: JwtPayload): string {
    return jwt.sign(payload, env.JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }

  async register(dto: RegisterDto) {
    const existingUser = await this.db
      .select()
      .from(users)
      .where(eq(users.email, dto.email))
      .limit(1);

    if (existingUser.length > 0) {
      throw new ConflictException(AUTH_ERROR_MESSAGES.EMAIL_ALREADY_EXISTS);
    }

    const hashedPassword = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);

    const [newUser] = await this.db
      .insert(users)
      .values({
        email: dto.email,
        password: hashedPassword,
      })
      .returning({
        id: users.id,
        email: users.email,
      });

    if (!newUser) {
      throw new Error("Failed to create user");
    }

    const token = this.generateToken({ userId: newUser.id, email: newUser.email });

    return { user: newUser, token };
  }

  async login(dto: LoginDto) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, dto.email))
      .limit(1);

    if (!user) {
      throw new UnauthorizedException(AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException(AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    const token = this.generateToken({ userId: user.id, email: user.email });

    return {
      user: { id: user.id, email: user.email },
      token,
    };
  }

  async getUserById(userId: number) {
    const [user] = await this.db
      .select({
        id: users.id,
        email: users.email,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new NotFoundException(AUTH_ERROR_MESSAGES.USER_NOT_FOUND);
    }

    return user;
  }
}
