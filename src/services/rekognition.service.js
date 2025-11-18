import {
  CreateFaceLivenessSessionCommand,
  GetFaceLivenessSessionResultsCommand
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
