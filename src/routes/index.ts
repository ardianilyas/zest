import { Router } from "express";
import authRouter from "../features/auth/auth.route";
import categoryRouter from "../features/category/category.route";
import ticketRouter from "../features/ticket/ticket.route";
import userRouter from "../features/user/user.route";

const router = Router();

router.use("/auth", authRouter);
router.use("/categories", categoryRouter);
router.use("/tickets", ticketRouter);
router.use("/users", userRouter);

export default router;
