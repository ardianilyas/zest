import { Router } from "express";
import { CategoryService } from "./category.service";
import { CategoryController } from "./category.controller";
import { authGuard } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";

const categoryService = new CategoryService();
const categoryController = new CategoryController(categoryService);

const router = Router();

router.use(authGuard, requireRole("ADMIN"));

router.get("/", categoryController.getAllCategories);
router.get("/:id", categoryController.getCategoryById);
router.post("/", categoryController.createCategory);
router.put("/:id", categoryController.updateCategory);
router.delete("/:id", categoryController.deleteCategory);

export default router;