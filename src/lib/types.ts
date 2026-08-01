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
}

export interface TodayResponse {
  /** ISO date (YYYY-MM-DD) the dialogues belong to. */
  date: string;
  dialogues: Dialogue[];
}

/** One MongoDB document per day, in the `dialogues` collection. */
export interface DialogueDoc {
  date: string; // YYYY-MM-DD, unique
  dialogues: Dialogue[];
  generatedAt: Date;
}
