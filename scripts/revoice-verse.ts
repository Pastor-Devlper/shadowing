// Re-synthesize ONLY the daily verse audio for the currently-shown document,
// leaving the dialogues (text + audio) and the verse text untouched.
//
// Use this to swap the verse voice (e.g. British "fable" -> US "echo") without
// a full --force regenerate, which would also produce new dialogues and advance
// to the next verse.
//
//   npm run revoice:verse                 # latest doc shown today (KST)
//   npm run revoice:verse 2026-07-31      # the doc as-of a specific date
//   npm run revoice:verse -- --voice onyx # pick a different US voice
//
import type { DialogueDoc } from "../src/lib/types";
import { getDb } from "../src/lib/mongodb";
import { getOpenAI, TTS_MODEL } from "../src/lib/openai";
import { uploadObject } from "../src/lib/r2";
import { todayIso } from "../src/lib/data";

const args = process.argv.slice(2);
const asOf = args.find((a) => /^\d{4}-\d{2}-\d{2}$/.test(a)) ?? todayIso();
const voice = (() => {
  const i = args.indexOf("--voice");
  return i >= 0 && args[i + 1] ? args[i + 1] : "echo";
})();

async function synthesize(text: string): Promise<Buffer> {
  const res = await getOpenAI().audio.speech.create({
    model: TTS_MODEL,
    voice: voice as never,
    input: text,
    response_format: "mp3",
  });
  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  const db = await getDb();
  const col = db.collection<DialogueDoc>("dialogues");

  // Same lookup the app uses: the most recent doc with date <= asOf.
  const doc = await col
    .find({ date: { $lte: asOf } })
    .sort({ date: -1 })
    .limit(1)
    .next();
  if (!doc) throw new Error(`${asOf} 이전에 생성된 문서가 없습니다`);

  const di = doc.dialogues.findIndex((d) => d.kind === "verse");
  if (di < 0) throw new Error(`문서(${doc.date})에 말씀(verse) 탭이 없습니다`);

  const verse = doc.dialogues[di];
  console.log(`▶ 재음성: ${doc.date} · ${verse.reference ?? "말씀"} · ${verse.lines.length}줄 · voice=${voice}`);

  const newLines = await Promise.all(
    verse.lines.map(async (line, li) => {
      const audio = await synthesize(line.en);
      // New key (voice suffix) so the public URL changes — avoids serving the
      // old cached audio from the browser/CDN.
      const key = `audio/${doc.date}/${di}-${li}-${voice}.mp3`;
      const audioUrl = await uploadObject(key, audio, "audio/mpeg");
      console.log(`  ✓ ${li + 1}/${verse.lines.length}  ${key}`);
      return { ...line, audioUrl };
    })
  );

  // Update only the verse dialogue's lines; everything else stays as-is.
  await col.updateOne(
    { date: doc.date },
    { $set: { [`dialogues.${di}.lines`]: newLines } }
  );
  console.log(`✅ 완료: ${doc.date} 말씀 음성을 ${voice}(미국식)로 교체했습니다`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("❌ 실패:", e?.message ?? e);
    process.exit(1);
  });
