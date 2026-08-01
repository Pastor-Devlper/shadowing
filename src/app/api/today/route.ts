import { NextResponse } from "next/server";
import { getToday } from "@/lib/data";

// Always compute fresh (date-dependent). In phase 2 this hits MongoDB.
export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getToday();
  return NextResponse.json(data);
}
