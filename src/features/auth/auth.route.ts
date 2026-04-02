import { Router } from "express";
import { db } from "../../config/database";
import { validate } from "../../common/validate";
import { AUTH_ROUTES } from "./auth.constant";
import { authGuard } from "./auth.middleware";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { registerSchema, loginSchema } from "./auth.dto";

const authService = new AuthService(db);
const authController = new AuthController(authService);

const router = Router();

router.post(AUTH_ROUTES.REGISTER, validate(registerSchema), authController.register);
router.post(AUTH_ROUTES.LOGIN, validate(loginSchema), authController.login);
router.post(AUTH_ROUTES.LOGOUT, authController.logout);
router.get(AUTH_ROUTES.ME, authGuard, authController.me);

export default router;
