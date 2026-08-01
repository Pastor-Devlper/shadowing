import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

let client: S3Client | null = null;

function getR2(): S3Client {
  if (!client) {
    const accountId = process.env.R2_ACCOUNT_ID;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    if (!accountId || !accessKeyId || !secretAccessKey) {
      throw new Error("R2 credentials are not set (see .env.local)");
    }
    // R2 is S3-compatible; region must be "auto".
    client = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
    });
  }
  return client;
}

/** Upload a file to R2 and return its public URL. */
export async function uploadObject(
  key: string,
  body: Buffer,
  contentType: string
): Promise<string> {
  const bucket = process.env.R2_BUCKET;
  if (!bucket) throw new Error("R2_BUCKET is not set (see .env.local)");
  const base = (process.env.R2_PUBLIC_BASE_URL || "").replace(/\/$/, "");

  await getR2().send(
    new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: contentType })
  );
  return `${base}/${key}`;
}
