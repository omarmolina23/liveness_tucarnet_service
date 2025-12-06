import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

import livenessRoutes from "./routes/liveness.routes.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use("/liveness", livenessRoutes);

export default app;
