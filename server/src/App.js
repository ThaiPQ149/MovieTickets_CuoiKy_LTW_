
import express from "express";
import cors from "cors";

import mainRouter from "./routes/index.js";
import errorMiddleware from "./middlewares/errorMiddleware.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", mainRouter);

app.use(errorMiddleware);

export default app;