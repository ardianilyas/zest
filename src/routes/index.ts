import { Router } from "express";
import authRouter from "../features/auth/auth.route";
import categoryRouter from "../features/category/category.route";
import ticketRouter from "../features/ticket/ticket.route";

const router = Router();

router.use("/auth", authRouter);
router.use("/categories", categoryRouter);
router.use("/tickets", ticketRouter);

export default router;
