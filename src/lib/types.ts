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

/** One entry in the "지난 대화" strip — a past day's date and lead title. */
export interface HistoryEntry {
  date: string;
  title: string;
}

/** One MongoDB document per day, in the `dialogues` collection. */
export interface DialogueDoc {
  date: string; // YYYY-MM-DD, unique
  dialogues: Dialogue[];
  generatedAt: Date;
}
