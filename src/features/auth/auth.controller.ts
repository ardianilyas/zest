import type { Request, Response, NextFunction } from "express";
import { COOKIE_NAME, COOKIE_MAX_AGE_MS } from "./auth.constant";
import type { AuthService } from "./auth.service";
import type { LoginDto, RegisterDto } from "./auth.dto";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = req.body as RegisterDto;
      const result = await this.authService.register(dto);
      this.setTokenCookie(res, result.token);
      res.status(201).json({ user: result.user });
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = req.body as LoginDto;
      const result = await this.authService.login(dto);
      this.setTokenCookie(res, result.token);
      res.status(200).json({ user: result.user });
    } catch (error) {
      next(error);
    }
  };

  logout = (_req: Request, res: Response) => {
    res.clearCookie(COOKIE_NAME);
    res.status(200).json({ message: "Logged out successfully" });
  };

  me = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.authService.getUserById(req.user!.userId);
      res.status(200).json({ user });
    } catch (error) {
      next(error);
    }
  };

  private setTokenCookie(res: Response, token: string): void {
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: COOKIE_MAX_AGE_MS,
    });
  }
}
