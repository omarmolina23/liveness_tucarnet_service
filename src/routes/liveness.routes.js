import express from "express";
import {
  startLiveness,
  getResult,
  getPhoto
} from "../controllers/liveness.controller.js";

const router = express.Router();

router.post("/start", startLiveness);
router.get("/result/:sessionId", getResult);
router.get("/photo/:photoKey", getPhoto);

export default router;
