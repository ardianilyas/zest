import { Router } from "express";
import authRouter from "../features/auth/auth.route";
import categoryRouter from "../features/category/category.route";

const router = Router();

router.use("/auth", authRouter);
router.use("/categories", categoryRouter);

export default router;