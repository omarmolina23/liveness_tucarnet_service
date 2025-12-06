// controllers/liveness.controller.js
import {
  createLivenessSession,
  getLivenessResults,
  compareFacesBase64
} from "../services/rekognition.service.js";

import { getTemporaryCredentials } from "../services/sts.service.js";
import {
  uploadPhoto,
  getSignedPhotoUrl,
} from "../services/s3.service.js";

import crypto from "crypto";


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
    return res.status(500).json({ error: "Falló el inicio de liveness" });
  }
}

export async function getResult(req, res) {
  try {
    const { sessionId } = req.params;

    const result = await getLivenessResults(sessionId);

    console.log("Liveness result retrieved for session:", result);
    if (!result.ReferenceImage) {
      return res.json({ status: "processing" });
    }

    const buffer = Buffer.from(result.ReferenceImage.Bytes);
    const photoKey = `liveness/${sessionId}.jpg`;

    const uint8 = result.ReferenceImage.Bytes;
    const base64 = Buffer.from(uint8).toString("base64");

    //console.log("Uploading photo to S3 bucket:", process.env.S3_BUCKET);

    //await uploadPhoto(buffer, photoKey);

    return res.json({
      status: "done",
      photoKey,
      confidenceScore: result.ConfidenceScore,
      referenceImageBase64: base64
    });
  } catch (error) {
    console.error("Error in getResult:", error);
    return res.status(500).json({ error: "Falló el resultado de liveness" });
  }
}

export async function getPhoto(req, res) {
  try {
    const { photoKey } = req.body;

    const url = await getSignedPhotoUrl(photoKey);

    return res.json({ url });
  } catch (error) {
    console.error("Error in getPhoto:", error);
    return res.status(500).json({ error: "Falló obtener la foto" });
  }
}

export async function uploadPhotoBase64(req, res) {
  try {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({
        error: "imageBase64 es requerida"
      });
    }

    // ✅ detectar content-type desde base64
    const matches = imageBase64.match(/^data:(image\/\w+);base64,(.+)$/);

    if (!matches) {
      return res.status(400).json({
        error: "Formato base64 inválido"
      });
    }

    const contentType = matches[1];       // image/png, image/jpeg...
    const base64Data = matches[2];

    const buffer = Buffer.from(base64Data, "base64");

    // ✅ límite 10MB
    const maxSize = 10 * 1024 * 1024;
    if (buffer.length > maxSize) {
      return res.status(413).json({
        error: "La imagen supera los 10MB"
      });
    }

    // ✅ extensión según content-type
    const ext = contentType.split("/")[1]; // png, jpeg, webp...

    const photoKey = `liveness/${crypto.randomUUID()}.${ext}`;

    await uploadPhoto(buffer, photoKey);

    return res.status(201).json({
      message: "Imagen subida correctamente",
      photoKey
    });

  } catch (error) {
    console.error("Error in uploadPhotoController:", error);
    return res.status(500).json({
      error: "Falló la subida de la imagen"
    });
  }
}


export async function compareFaces(req, res) {
  try {
    const { sourceImageBase64, targetImageBase64 } = req.body;

    if (!sourceImageBase64 || !targetImageBase64) {
      return res.status(400).json({ error: "Ambas imagenes son requeridas" });
    }

    // 💡 Validación de tamaño (base64 más de 10MB)
    const maxSize = 10 * 1024 * 1024; // 10 MB en bytes

    const sizeSource = Buffer.from(sourceImageBase64.split(",")[1] || "", "base64").length;
    const sizeTarget = Buffer.from(targetImageBase64.split(",")[1] || "", "base64").length;

    if (sizeSource > maxSize || sizeTarget > maxSize) {
      return res.status(413).json({
        error: "La imagen supera el tamaño máximo permitido de 10MB"
      });
    }

    const result = await compareFacesBase64(sourceImageBase64, targetImageBase64);

    console.log("Face comparison result:", result);

    const matches = result.FaceMatches?.map(face => ({
      similarity: face.Similarity,
      boundingBox: face.Face.BoundingBox
    })) || [];

    return res.json({
      matches,
      unmatched: result.UnmatchedFaces?.length || 0
    });

  } catch (error) {
    console.error("Error in compareFaces:", error);
    return res.status(500).json({ error: "Falló comparar las caras" });
  }
}

