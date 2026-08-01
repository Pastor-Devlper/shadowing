// Verifies MongoDB, OpenAI, and Cloudflare R2 connectivity from .env.local.
// Prints only success/failure — never the secret values themselves.
//
//   npm run check:setup
//
import { MongoClient } from "mongodb";
import OpenAI from "openai";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

const results = [];
const record = (name, ok, detail) => {
  results.push({ name, ok });
  console.log(`${ok ? "✅" : "❌"} ${name}${detail ? " — " + detail : ""}`);
};

const need = (keys) => {
  const missing = keys.filter((k) => !process.env[k]);
  if (missing.length) throw new Error(`빠진 값: ${missing.join(", ")}`);
};

// ── MongoDB ────────────────────────────────────────────────
async function checkMongo() {
  try {
    need(["MONGODB_URI"]);
    const dbName = process.env.MONGODB_DB || "shadowing";
    const client = new MongoClient(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 8000,
    });
    await client.connect();
    await client.db(dbName).command({ ping: 1 });
    await client.close();
    record("MongoDB", true, `ping OK (db: ${dbName})`);
  } catch (e) {
    record("MongoDB", false, e.message);
  }
}

// ── OpenAI ─────────────────────────────────────────────────
async function checkOpenAI() {
  try {
    need(["OPENAI_API_KEY"]);
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const list = await openai.models.list();
    const count = list.data?.length ?? 0;
    record("OpenAI", true, `인증 OK (${count} models)`);
  } catch (e) {
    record("OpenAI", false, e.status ? `HTTP ${e.status}` : e.message);
  }
}

// ── Cloudflare R2 ──────────────────────────────────────────
async function checkR2() {
  try {
    need([
      "R2_ACCOUNT_ID",
      "R2_ACCESS_KEY_ID",
      "R2_SECRET_ACCESS_KEY",
      "R2_BUCKET",
      "R2_PUBLIC_BASE_URL",
    ]);
    const s3 = new S3Client({
      region: "auto",
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
    });
    const bucket = process.env.R2_BUCKET;
    const key = "_setup-check.txt";

    // Write a tiny object.
    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: "ok",
        ContentType: "text/plain",
      })
    );
    record("R2 write", true, `버킷 "${bucket}"에 업로드 OK`);

    // Verify the public base URL actually serves it.
    const base = process.env.R2_PUBLIC_BASE_URL.replace(/\/$/, "");
    try {
      const res = await fetch(`${base}/${key}`);
      const body = await res.text();
      if (res.ok && body.trim() === "ok") {
        record("R2 public URL", true, "공개 접근 OK");
      } else {
        record("R2 public URL", false, `HTTP ${res.status} — 공개 접근/URL 확인 필요`);
      }
    } catch (e) {
      record("R2 public URL", false, e.message);
    }

    // Clean up.
    await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
  } catch (e) {
    record("R2", false, e.message);
  }
}

await checkMongo();
await checkOpenAI();
await checkR2();

const failed = results.filter((r) => !r.ok);
console.log("\n" + (failed.length ? `⚠️  ${failed.length}개 항목 실패` : "🎉 모든 연결 정상"));
process.exit(failed.length ? 1 : 0);
