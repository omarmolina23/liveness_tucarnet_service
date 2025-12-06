import {
  CreateFaceLivenessSessionCommand,
  GetFaceLivenessSessionResultsCommand,
  CompareFacesCommand
} from "@aws-sdk/client-rekognition";

import { rekognitionClient } from "../config/aws.js";
import { v4 as uuidv4 } from "uuid";

export async function createLivenessSession() {
  const command = new CreateFaceLivenessSessionCommand({
    ClientRequestToken: uuidv4(),
    Settings: { AuditImagesLimit: 1 }
  });

  const res = await rekognitionClient.send(command);
  return res.SessionId;
}

export async function getLivenessResults(sessionId) {
  const command = new GetFaceLivenessSessionResultsCommand({
    SessionId: sessionId
  });

  return await rekognitionClient.send(command);
}

export async function compareFacesBase64(sourceBase64, targetBase64) {
  try {

    // Quitar prefijo "data:image/jpeg;base64,"
    const cleanSource = sourceBase64.replace(/^data:image\/\w+;base64,/, "");
    const cleanTarget = targetBase64.replace(/^data:image\/\w+;base64,/, "");

    const params = {
      SourceImage: {
        Bytes: Buffer.from(cleanSource, "base64")
      },
      TargetImage: {
        Bytes: Buffer.from(cleanTarget, "base64")
      },
      SimilarityThreshold: 90
    };

    const command = new CompareFacesCommand(params);
    const response = await rekognitionClient.send(command);

    return response;

  } catch (err) {
    console.error("Error comparing faces:", err);
    throw err;
  }
}