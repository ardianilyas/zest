import { Router } from "express";
import { db } from "../../config/database";
import { AUTH_ROUTES } from "./auth.constant";
import { authGuard } from "../../middlewares/auth.middleware";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";

const authService = new AuthService(db);
const authController = new AuthController(authService);

const router = Router();

router.post(AUTH_ROUTES.REGISTER, authController.register);
router.post(AUTH_ROUTES.LOGIN, authController.login);
router.post(AUTH_ROUTES.LOGOUT, authController.logout);
router.get(AUTH_ROUTES.ME, authGuard, authController.me);

export default router;
