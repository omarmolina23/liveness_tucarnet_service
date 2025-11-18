import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

import livenessRoutes from "./routes/liveness.routes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/liveness", livenessRoutes);

export default app;
