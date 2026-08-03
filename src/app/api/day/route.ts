import { NextRequest, NextResponse } from "next/server";
import { getByDate } from "@/lib/data";

// Fetches one exact day's dialogues for the "지난 대화" strip.
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date");
  if (!date) {
    return NextResponse.json({ error: "date required" }, { status: 400 });
  }
  const data = await getByDate(date);
  if (!data) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json(data);
}
