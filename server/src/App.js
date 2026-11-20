import express from "express";
import cors from "cors";

import mainRouter from "./routes/index.js";
import errorMiddleware, { notFound } from "./middlewares/errorMiddleware.js";

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || true }));
app.use(express.json());

app.use("/api", mainRouter);

app.use(notFound);
app.use(errorMiddleware);

export default app;