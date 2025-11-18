import { AssumeRoleCommand } from "@aws-sdk/client-sts";
import { stsClient } from "../config/aws.js";

export async function getTemporaryCredentials(sessionId) {
  const cmd = new AssumeRoleCommand({
    RoleArn: process.env.AWS_LIVENESS_ROLE_ARN,
    RoleSessionName: `liveness-${sessionId}`,
    DurationSeconds: 3600
  });

  const res = await stsClient.send(cmd);
  return res.Credentials;
}
