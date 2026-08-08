export interface Line {
  who: string;
  en: string;
  kr: string;
  /**
   * Pre-generated TTS audio URL (Cloudflare R2) — filled in phase 2.
   * When present, the player streams this file; otherwise it falls back
   * to the browser's speechSynthesis.
   */
  audioUrl?: string;
}

export interface Dialogue {
  title: string;
  lines: Line[];
  /** "verse" renders as the daily Bible passage (4th tab) instead of an A/B dialogue. */
  kind?: "dialogue" | "verse";
  /** Scripture reference for verse items, e.g. "John 3:16". */
  reference?: string;
}

export interface TodayResponse {
  /** ISO date (YYYY-MM-DD) the dialogues belong to. */
  date: string;
  dialogues: Dialogue[];
}

/** A single past dialogue in the "지난 대화" strip, with its cumulative number. */
export interface DialogueRef {
  n: number; // cumulative number across all days, 1-based (oldest = 1)
  title: string;
  date: string; // the day it belongs to
  index: number; // position within that day's tabs (for selecting it)
}

/** A single past verse for the separate 말씀 track. */
export interface VerseRef {
  reference: string;
  date: string;
  index: number;
}

/** Everything the "지난 대화" strip + progress counter + archive need. */
export interface HistoryData {
  total: number; // total dialogues generated so far (drives the counter)
  dialogues: DialogueRef[]; // newest first
  verses: VerseRef[]; // newest first
}

/** One MongoDB document per day, in the `dialogues` collection. */
export interface DialogueDoc {
  date: string; // YYYY-MM-DD, unique
  dialogues: Dialogue[];
  generatedAt: Date;
}
