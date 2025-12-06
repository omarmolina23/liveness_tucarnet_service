import express from "express";
import {
  startLiveness,
  getResult,
  getPhoto,
  uploadPhotoBase64,
  compareFaces
} from "../controllers/liveness.controller.js";

const router = express.Router();

router.post("/start", startLiveness);
router.post("/compare", compareFaces);
router.post("/photo/upload", uploadPhotoBase64);
router.get("/result/:sessionId", getResult);
router.post("/photo/signedUrl", getPhoto);


export default router;
