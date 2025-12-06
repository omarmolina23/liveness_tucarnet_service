import { RekognitionClient } from "@aws-sdk/client-rekognition";
import { S3Client } from "@aws-sdk/client-s3";
import { STSClient } from "@aws-sdk/client-sts";

//console.log("DEBUG (aws.js) — process.env.AWS_REGION =", process.env.AWS_REGION);
//console.log("DEBUG (aws.js) — process.env.S3_BUCKET =", process.env.S3_BUCKET);

const REGION = process.env.AWS_REGION;

//console.log("DEBUG (aws.js) — REGION variable =", REGION);

export const rekognitionClient = new RekognitionClient({ region: REGION });
export const s3Client = new S3Client({ region: REGION });
export const stsClient = new STSClient({ region: REGION });
