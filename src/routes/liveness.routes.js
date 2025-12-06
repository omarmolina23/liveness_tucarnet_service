import express from "express";
import {
  startLiveness,
  getResult,
  getPhoto,
  compareFaces
} from "../controllers/liveness.controller.js";

const router = express.Router();

router.post("/start", startLiveness);
router.post("/compare", compareFaces);
router.get("/result/:sessionId", getResult);
router.get("/photo/:photoKey", getPhoto);

export default router;
