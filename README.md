# 말하기 박자 — 영어 섀도잉 웹앱

매일 상황별 대화 3개(각 4~6줄)를 문장마다 3번 들려주고, 반복마다 따라 말할 간격을 주는 개인용 섀도잉 학습 앱.

## 스택

- **Next.js (App Router)** — Vercel 배포
- **MongoDB** — 대화 텍스트 저장 *(phase 2)*
- **Cloudflare R2** — 음성 파일 저장, egress 무료 *(phase 2)*
- **OpenAI** — 매일 대화 자동 생성 + TTS 음성 *(phase 2)*

## 개발 단계

### Phase 1 — 프론트엔드 + 목업 (현재)

백엔드/키 없이 완전히 동작한다. 대화는 `src/lib/mockData.ts`의 목업이고,
음성은 브라우저 `speechSynthesis`로 재생한다.

```bash
npm install
npm run dev   # http://localhost:3000
```

### Phase 2 — 백엔드 (구현됨)

`.env.example`를 `.env.local`로 복사해 키를 채운 뒤:

```bash
npm run check:setup           # Mongo / OpenAI / R2 연결 점검
npm run generate              # 오늘(KST) 대화 3개 생성 → TTS → R2 → Mongo
npm run generate 2026-08-02   # 특정 날짜
npm run generate -- --force   # 이미 있어도 재생성 (재과금 주의)
```

- `getToday()`가 MongoDB에서 그날 문서를 읽고, 없거나 DB 장애 시 목업으로 폴백한다.
- 각 `line.audioUrl`이 R2 URL이라 플레이어가 자동으로 파일 재생으로 전환된다.
- **DB 이름은 `Shadowing`** (대문자 S) — 클러스터 기존 DB와 대소문자 충돌 방지.

#### 자동 생성 (Vercel Cron)

`vercel.json`의 크론은 **월·수·금 05:00 KST**에 `/api/generate`를 호출한다.
Vercel 크론은 UTC 기준이라 `0 20 * * 0,2,4`(일·화·목 20:00 UTC)로 설정 —
그 시각의 KST가 각각 월·수·금이라 그 날짜로 생성된다.
Vercel 프로젝트 env에 모든 `.env.local` 값 + `CRON_SECRET`을 등록하면,
크론이 `Authorization: Bearer $CRON_SECRET`로 인증된다.

생성하지 않는 날에는 `getToday()`가 **가장 최근 생성분**(`date <= 오늘` 중 최신)을
그대로 보여주므로, 다음 생성일까지 직전 대화가 유지된다.

## 구조

| 경로 | 역할 |
| --- | --- |
| `src/app/page.tsx` | 서버 컴포넌트, `getToday()`로 데이터를 받아 플레이어에 전달 |
| `src/app/api/today/route.ts` | 오늘의 대화 API (phase 2에서 외부 사용) |
| `src/components/ShadowingPlayer.tsx` | 재생 엔진 (3회 반복 + 간격, 리듬 링) |
| `src/lib/data.ts` | `getToday()` — Mongo 조회 + 목업 폴백, `todayIso()`(KST) |
| `src/lib/audio.ts` | `speak()` — audioUrl 있으면 파일, 없으면 speechSynthesis |
| `src/lib/generate.ts` | 생성 파이프라인: OpenAI 텍스트 → TTS → R2 → Mongo upsert |
| `src/lib/mongodb.ts` · `openai.ts` · `r2.ts` | 지연 초기화 클라이언트 |
| `src/app/api/generate/route.ts` | 일일 생성 엔드포인트 (CRON_SECRET 보호) |
| `scripts/generate.ts` | `npm run generate` CLI |
| `scripts/check-setup.mjs` | `npm run check:setup` 연결 점검 |
| `src/lib/mockData.ts` | 목업 대화 3개 (폴백용) |
| `src/lib/types.ts` | `Dialogue` / `Line` / `DialogueDoc` 타입 |
