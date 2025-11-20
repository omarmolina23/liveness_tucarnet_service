// controllers/liveness.controller.js
import {
  createLivenessSession,
  getLivenessResults
} from "../services/rekognition.service.js";

import { getTemporaryCredentials } from "../services/sts.service.js";
import {
  uploadPhoto,
  getSignedPhotoUrl
} from "../services/s3.service.js";

export async function startLiveness(req, res) {
  try {
    const sessionId = await createLivenessSession();
    const credentials = await getTemporaryCredentials(sessionId);

    console.log("Liveness session started:", sessionId);

    return res.json({
      sessionId,
      credentials
    });
  } catch (error) {
    console.error("Error in startLiveness:", error);
    return res.status(500).json({ error: "Failed to start liveness session" });
  }
}

export async function getResult(req, res) {
  try {
    const { sessionId } = req.params;

    const result = await getLivenessResults(sessionId);

    if (!result.ReferenceImage) {
      return res.json({ status: "processing" });
    }

    const buffer = Buffer.from(result.ReferenceImage.Bytes);
    const photoKey = `liveness/${sessionId}.jpg`;

    //await uploadPhoto(buffer, photoKey);

    return res.json({
      status: "done",
      photoKey,
      confidenceScore: result.ConfidenceScore
    });
  } catch (error) {
    console.error("Error in getResult:", error);
    return res.status(500).json({ error: "Failed to retrieve result" });
  }
}

export async function getPhoto(req, res) {
  try {
    const { photoKey } = req.params;

    const url = await getSignedPhotoUrl(photoKey);

    return res.json({ url });
  } catch (error) {
    console.error("Error in getPhoto:", error);
    return res.status(500).json({ error: "Failed to generate photo URL" });
  }
}
