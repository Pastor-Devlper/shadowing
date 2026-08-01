import type { DialogueDoc, TodayResponse } from "./types";
import { mockDialogues } from "./mockData";
import { getDb } from "./mongodb";

/**
 * Single source of truth for "today's dialogues".
 *
 * Reads the day's document from MongoDB (lines already carry R2 `audioUrl`s
 * produced by the generation pipeline). Falls back to the mock set if the DB
 * is unreachable or no document exists yet for `date`, so the app never breaks.
 */
export async function getToday(date = todayIso()): Promise<TodayResponse> {
  try {
    const db = await getDb();
    const doc = await db.collection<DialogueDoc>("dialogues").findOne({ date });
    if (doc && doc.dialogues.length > 0) {
      return { date, dialogues: doc.dialogues };
    }
  } catch (err) {
    console.error("[getToday] DB read failed, using mock:", (err as Error).message);
  }
  return { date, dialogues: mockDialogues };
}

export function todayIso(): string {
  // Key content by Korea Standard Time so the day flips at KST midnight,
  // not UTC — keeps generation (cron) and lookups (getToday) on the same date.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
