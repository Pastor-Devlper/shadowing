import type { DialogueDoc, HistoryEntry, TodayResponse } from "./types";
import { mockDialogues } from "./mockData";
import { getDb } from "./mongodb";

/**
 * Single source of truth for the dialogues to show "as of" a given date.
 *
 * Content is generated only on some days (Mon/Wed/Fri), so this returns the
 * most recent document with `date <= asOf` — i.e. the latest generated set
 * stays on screen until the next generation day. `date` in the response is the
 * content's actual generation date (which day's dialogues these are).
 *
 * Falls back to the mock set only if the DB is unreachable or nothing has been
 * generated yet, so the app never breaks. Lines already carry R2 `audioUrl`s.
 */
export async function getToday(asOf = todayIso()): Promise<TodayResponse> {
  try {
    const db = await getDb();
    const doc = await db
      .collection<DialogueDoc>("dialogues")
      .find({ date: { $lte: asOf } })
      .sort({ date: -1 })
      .limit(1)
      .next();
    if (doc && doc.dialogues.length > 0) {
      return { date: doc.date, dialogues: doc.dialogues };
    }
  } catch (err) {
    console.error("[getToday] DB read failed, using mock:", (err as Error).message);
  }
  return { date: asOf, dialogues: mockDialogues };
}

/** Exact-date lookup for the "지난 대화" strip — unlike getToday this never falls back to a nearby day. */
export async function getByDate(date: string): Promise<TodayResponse | null> {
  try {
    const db = await getDb();
    const doc = await db.collection<DialogueDoc>("dialogues").findOne({ date });
    if (doc && doc.dialogues.length > 0) {
      return { date: doc.date, dialogues: doc.dialogues };
    }
  } catch (err) {
    console.error("[getByDate] DB read failed:", (err as Error).message);
  }
  return null;
}

/** Recent past days (title only) for the "지난 대화" strip, newest first. */
export async function getHistory(limit = 30): Promise<HistoryEntry[]> {
  try {
    const db = await getDb();
    const docs = await db
      .collection<DialogueDoc>("dialogues")
      .find({ date: { $lte: todayIso() } }, { projection: { date: 1, dialogues: 1 } })
      .sort({ date: -1 })
      .limit(limit)
      .toArray();
    return docs.map((doc) => ({
      date: doc.date,
      title: doc.dialogues.find((d) => d.kind !== "verse")?.title ?? "",
    }));
  } catch (err) {
    console.error("[getHistory] DB read failed:", (err as Error).message);
    return [];
  }
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
