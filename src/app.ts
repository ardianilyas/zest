import express from "express";
import cookieParser from "cookie-parser";
import authRouter from "./features/auth/auth.route";
import { errorHandler } from "./common/error-handler";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.get("/", (_, res) => {
  res.send("Hello World!");
});

app.use("/auth", authRouter);

app.use(errorHandler);

export default app;
