import { Router } from "express";
import { authGuard } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";

const router = Router();

const userService = new UserService();
const userController = new UserController(userService);

router.use(authGuard, requireRole("ADMIN"));

router.get("/", userController.getAllUsers);
router.patch("/", userController.assignUserRole);

export default router;