// Generate a day's dialogues (text + TTS + R2 upload + MongoDB upsert).
//
//   npm run generate            # today
//   npm run generate 2026-08-02 # a specific date
//   npm run generate -- --force # regenerate today (overwrites + re-bills)
//
import { generateForDate } from "../src/lib/generate";
import { todayIso } from "../src/lib/data";

const args = process.argv.slice(2);
const force = args.includes("--force");
const dateArg = args.find((a) => /^\d{4}-\d{2}-\d{2}$/.test(a));
const date = dateArg ?? todayIso();

console.log(`▶ 생성 시작: ${date}${force ? " (force)" : ""}`);

generateForDate(date, { force })
  .then((r) => {
    if (!r.created) {
      console.log(`↷ 이미 존재함 (${date}, 대화 ${r.dialogues}개). 덮어쓰려면 --force`);
    } else {
      console.log(`✅ 완료: 대화 ${r.dialogues}개 · 문장 ${r.lines}개 (음성 R2 업로드 + DB 저장)`);
    }
    process.exit(0);
  })
  .catch((e) => {
    console.error("❌ 생성 실패:", e?.message ?? e);
    process.exit(1);
  });
