import { NextResponse } from "next/server";
import { getDialogueHistory } from "@/lib/data";

// Numbered dialogue list + verse track for the "지난 대화" strip and archive.
// Date-dependent, so never cache.
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getDialogueHistory());
}
