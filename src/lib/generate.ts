import type { Db } from "mongodb";
import { getOpenAI, TEXT_MODEL, TTS_MODEL, TTS_VOICE } from "./openai";
import { uploadObject } from "./r2";
import { getDb } from "./mongodb";
import { verses, type Verse } from "./verses";
import type { Dialogue, DialogueDoc, Line } from "./types";

// Speaker A uses the configured voice; speaker B gets a contrasting one so the
// two sides of a conversation sound like different people. The daily verse gets
// its own calm voice — "echo" (US accent); avoid "fable", which is British.
const VOICE_A = TTS_VOICE;
const VOICE_B = process.env.OPENAI_TTS_VOICE_B || "nova";
const VOICE_VERSE = process.env.OPENAI_TTS_VOICE_VERSE || "echo";

const SYSTEM_PROMPT = `You generate short English shadowing-practice dialogues for a Korean learner (intermediate, everyday conversational American English).

Return ONLY a JSON object of this exact shape:
{
  "dialogues": [
    {
      "title": "<짧은 한국어 상황 제목>",
      "lines": [
        { "who": "A", "en": "<natural English>", "kr": "<자연스러운 한국어 번역>" },
        { "who": "B", "en": "...", "kr": "..." }
      ]
    }
  ]
}

Rules:
- Exactly 3 dialogues.
- Each dialogue has exactly 5 lines.
- Speakers strictly alternate, starting with "A".
- Everyday, high-frequency situations (ordering, small talk, asking for help, phone calls, shopping, work, travel, etc.). Make the 3 situations distinct from each other.
- English: natural, spoken, contractions welcome, 1 sentence per line, not textbook-stiff.
- "kr": natural Korean that a native would actually say, not a literal gloss.
- "title": a short Korean phrase.
- Output valid JSON only. No markdown, no commentary.`;

interface RawLine {
  who?: string;
  en?: string;
  kr?: string;
}
interface RawDialogue {
  title?: string;
  lines?: RawLine[];
}

function normalize(raw: unknown): Dialogue[] {
  const dialogues = (raw as { dialogues?: RawDialogue[] })?.dialogues;
  if (!Array.isArray(dialogues) || dialogues.length === 0) {
    throw new Error("모델이 dialogues 배열을 반환하지 않았습니다");
  }
  return dialogues.map((d, di) => {
    const lines = Array.isArray(d.lines) ? d.lines : [];
    if (lines.length === 0) throw new Error(`대화 ${di + 1}에 lines가 없습니다`);
    return {
      title: String(d.title ?? `대화 ${di + 1}`).trim(),
      lines: lines.map((l, li): Line => {
        const en = String(l.en ?? "").trim();
        const kr = String(l.kr ?? "").trim();
        if (!en) throw new Error(`대화 ${di + 1} ${li + 1}번째 줄에 영어 문장이 없습니다`);
        // Enforce strict A/B alternation starting with A.
        const who = li % 2 === 0 ? "A" : "B";
        return { who, en, kr };
      }),
    };
  });
}

async function generateDialogueText(date: string): Promise<Dialogue[]> {
  const res = await getOpenAI().chat.completions.create({
    model: TEXT_MODEL,
    temperature: 0.9,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `오늘 날짜는 ${date} 입니다. 오늘의 섀도잉 대화 3개를 만들어 주세요. 매번 새로운 상황과 표현이 나오도록 다양하게.`,
      },
    ],
  });
  const content = res.choices[0]?.message?.content ?? "{}";
  return normalize(JSON.parse(content));
}

async function synthesize(text: string, voice: string): Promise<Buffer> {
  const res = await getOpenAI().audio.speech.create({
    model: TTS_MODEL,
    voice: voice as never,
    input: text,
    response_format: "mp3",
  });
  return Buffer.from(await res.arrayBuffer());
}

async function attachAudio(dialogues: Dialogue[], date: string): Promise<Dialogue[]> {
  return Promise.all(
    dialogues.map(async (d, di) => ({
      ...d,
      lines: await Promise.all(
        d.lines.map(async (line, li): Promise<Line> => {
          const voice =
            d.kind === "verse" ? VOICE_VERSE : line.who === "A" ? VOICE_A : VOICE_B;
          const audio = await synthesize(line.en, voice);
          const key = `audio/${date}/${di}-${li}.mp3`;
          const audioUrl = await uploadObject(key, audio, "audio/mpeg");
          return { ...line, audioUrl };
        })
      ),
    }))
  );
}

function verseCursor(db: Db) {
  return db.collection<{ _id: string; next: number }>("meta");
}

/**
 * Sequential cursor over `verses`. Reading and advancing are split on purpose:
 * TTS/R2/timeouts can fail after the verse is chosen, and an advance that
 * happened anyway would silently skip that verse forever. See `advanceVerse`.
 */
async function peekVerse(db: Db): Promise<Verse> {
  const cursor = await verseCursor(db).findOne({ _id: "verseCursor" });
  const index = cursor?.next ?? 0;
  return verses[((index % verses.length) + verses.length) % verses.length];
}

/** Move past the verse we just published. Only call once the day is saved. */
async function advanceVerse(db: Db): Promise<void> {
  await verseCursor(db).updateOne(
    { _id: "verseCursor" },
    { $inc: { next: 1 } },
    { upsert: true }
  );
}

function toVerseDialogue(v: Verse): Dialogue {
  return {
    kind: "verse",
    title: "오늘의 말씀",
    reference: v.reference,
    lines: v.lines.map((l) => ({ who: v.reference, en: l.en, kr: l.kr })),
  };
}

export interface GenerateResult {
  date: string;
  created: boolean;
  dialogues: number;
  lines: number;
}

/**
 * Generate (or regenerate with `force`) a day's dialogues end to end:
 * OpenAI text -> per-line TTS -> upload to R2 -> upsert into MongoDB.
 */
export async function generateForDate(
  date: string,
  opts: { force?: boolean } = {}
): Promise<GenerateResult> {
  const db = await getDb();
  const col = db.collection<DialogueDoc>("dialogues");
  await col.createIndex({ date: 1 }, { unique: true });

  const existing = await col.findOne({ date });
  if (existing && !opts.force) {
    return { date, created: false, dialogues: existing.dialogues.length, lines: 0 };
  }

  const text = await generateDialogueText(date);
  const verse = await peekVerse(db);
  const withAudio = await attachAudio([...text, toVerseDialogue(verse)], date);

  await col.updateOne(
    { date },
    { $set: { date, dialogues: withAudio, generatedAt: new Date() } },
    { upsert: true }
  );

  // The day's content is safely stored, so this verse is genuinely spent.
  await advanceVerse(db);

  const lines = withAudio.reduce((n, d) => n + d.lines.length, 0);
  return { date, created: true, dialogues: withAudio.length, lines };
}
