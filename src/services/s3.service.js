import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "../config/aws.js";

const BUCKET = process.env.S3_BUCKET;

export async function uploadPhoto(buffer, key) {
  await s3Client.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: "image/jpeg"
    })
  );

  return key;
}

export async function getSignedPhotoUrl(key) {
  const expiresIn = Number(process.env.SIGNED_URL_EXPIRATION || 600);

  const signed = await getSignedUrl(
    s3Client,
    new GetObjectCommand({
      Bucket: BUCKET,
      Key: key
    }),
    { expiresIn }
  );

  return signed;
}
