import { NextResponse } from "next/server";
import { generateForDate } from "@/lib/generate";
import { todayIso } from "@/lib/data";

// TTS + uploads take a while; run on the Node runtime with a generous budget.
export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

/**
 * Daily generation endpoint, meant to be hit by Vercel Cron.
 *
 * Protected by CRON_SECRET: Vercel Cron sends `Authorization: Bearer <secret>`
 * automatically when CRON_SECRET is set in project env. Manual calls must send
 * the same header.
 */
function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false; // fail closed if not configured
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

async function run(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const url = new URL(req.url);
  const date = url.searchParams.get("date") ?? todayIso();
  const force = url.searchParams.get("force") === "1";
  try {
    const result = await generateForDate(date, { force });
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("[api/generate] failed:", err);
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}

// Vercel Cron issues GET; POST allowed for manual triggering.
export const GET = run;
export const POST = run;
