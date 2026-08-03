// 저장된 생성분과 말씀 커서 상태를 그대로 출력한다. 읽기 전용 — 아무것도 바꾸지 않는다.
//
// "대화는 그대로인데 말씀만 바뀌었다" 같은 증상을 진단할 때 쓴다.
// 어떤 날짜의 문서가 있고, 각 문서의 대화 제목과 말씀이 무엇이며,
// 지금 화면에 어떤 문서가 나가고 있는지 한 번에 보여준다.
//
//   npm run inspect
//
import type { DialogueDoc } from "../src/lib/types";
import { getDb } from "../src/lib/mongodb";
import { todayIso } from "../src/lib/data";
import { verses } from "../src/lib/verses";

async function main() {
  const db = await getDb();
  const today = todayIso();

  const docs = await db
    .collection<DialogueDoc>("dialogues")
    .find({})
    .sort({ date: 1 })
    .toArray();

  console.log(`오늘(KST): ${today}`);
  console.log(`저장된 문서: ${docs.length}개`);

  for (const doc of docs) {
    const verse = doc.dialogues.find((d) => d.kind === "verse");
    const titles = doc.dialogues
      .filter((d) => d.kind !== "verse")
      .map((d) => d.title);
    const at = doc.generatedAt ? new Date(doc.generatedAt).toISOString() : "?";
    // 음성이 실제로 붙었는지도 같이 본다 (audioUrl 없으면 브라우저 TTS로 폴백된다).
    const total = doc.dialogues.reduce((n, d) => n + d.lines.length, 0);
    const withAudio = doc.dialogues.reduce(
      (n, d) => n + d.lines.filter((l) => l.audioUrl).length,
      0
    );

    console.log(`\n── ${doc.date}  (생성: ${at})`);
    console.log(`   대화: ${titles.length ? titles.join(" / ") : "(없음)"}`);
    console.log(`   말씀: ${verse?.reference ?? "(말씀 탭 없음)"}`);
    console.log(`   음성: ${withAudio}/${total}줄`);
  }

  const cursor = await db
    .collection<{ _id: string; next: number }>("meta")
    .findOne({ _id: "verseCursor" });
  const next = cursor?.next ?? 0;
  const nextVerse = verses[((next % verses.length) + verses.length) % verses.length];
  console.log(`\n말씀 커서: next=${next} → 다음 생성 시 ${nextVerse.reference}`);

  // getToday()와 똑같은 규칙: date <= 오늘 중 가장 최신.
  const shown = docs.filter((d) => d.date <= today).at(-1);
  console.log(
    shown
      ? `지금 화면에 나가는 문서: ${shown.date}`
      : `지금 화면에 나가는 문서: 없음 → 목업(mockData.ts) 폴백 중`
  );

  const future = docs.filter((d) => d.date > today);
  if (future.length) {
    console.log(
      `⚠️  미래 날짜 문서 ${future.length}개(${future.map((d) => d.date).join(", ")}) — 그 날짜가 될 때까지 화면에 안 나온다`
    );
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("❌ 실패:", e?.message ?? e);
    process.exit(1);
  });
