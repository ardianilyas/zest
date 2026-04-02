import express from "express";
import cookieParser from "cookie-parser";
import router from "./routes";
import { errorHandler } from "./common/error-handler";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.get("/", (_, res) => {
  res.send("Hello World!");
});

app.use("/api", router);

app.use(errorHandler);

export default app;
