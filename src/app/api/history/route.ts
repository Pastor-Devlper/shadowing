import { NextResponse } from "next/server";
import { getHistory } from "@/lib/data";

// Recent-days list for the "지난 대화" strip. Date-dependent, so never cache.
export const dynamic = "force-dynamic";

export async function GET() {
  const items = await getHistory();
  return NextResponse.json({ items });
}
