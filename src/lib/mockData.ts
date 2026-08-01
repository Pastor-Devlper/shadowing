import type { Dialogue } from "./types";
import { verses } from "./verses";

/**
 * Phase 1 mock content. In phase 2 these are generated daily by OpenAI,
 * stored in MongoDB, and each line gets an `audioUrl` (R2). The shape here
 * is exactly what `getToday()` will return from the database.
 */
export const mockDialogues: Dialogue[] = [
  {
    title: "커피 주문",
    lines: [
      { who: "A", en: "Hi, could I get a medium latte to go?", kr: "안녕하세요, 미디엄 라떼 하나 포장해주시겠어요?" },
      { who: "B", en: "Sure, would you like that hot or iced?", kr: "네, 따뜻한 걸로 드릴까요, 아이스로 드릴까요?" },
      { who: "A", en: "Iced, please, and could you make it oat milk?", kr: "아이스로 주시고, 오트밀크로 가능할까요?" },
      { who: "B", en: "No problem, that'll be ready in a few minutes.", kr: "네, 몇 분 안에 준비해드릴게요." },
      { who: "A", en: "Thanks, I appreciate it.", kr: "감사합니다." },
    ],
  },
  {
    title: "길 묻기",
    lines: [
      { who: "A", en: "Excuse me, do you know how to get to the subway station?", kr: "실례합니다, 지하철역 가는 길 아세요?" },
      { who: "B", en: "Yeah, just go straight and turn left at the light.", kr: "네, 직진하다가 신호등에서 좌회전하세요." },
      { who: "A", en: "Is it within walking distance?", kr: "걸어갈 수 있는 거리인가요?" },
      { who: "B", en: "It's about ten minutes from here.", kr: "여기서 한 10분 정도 걸려요." },
      { who: "A", en: "Great, thanks so much for your help.", kr: "좋네요, 도와주셔서 정말 감사합니다." },
    ],
  },
  {
    title: "오랜만에 만난 친구",
    lines: [
      { who: "A", en: "Wow, it's been way too long!", kr: "와, 진짜 오랜만이다!" },
      { who: "B", en: "I know, right? What have you been up to?", kr: "그러니까, 요즘 어떻게 지냈어?" },
      { who: "A", en: "Just busy with work, nothing too exciting.", kr: "그냥 일하느라 바빴어, 특별한 건 없어." },
      { who: "B", en: "We should catch up properly sometime soon.", kr: "조만간 제대로 한번 만나서 얘기하자." },
      { who: "A", en: "Definitely, let's grab dinner next week.", kr: "완전 좋지, 다음 주에 저녁 먹자." },
    ],
  },
  {
    kind: "verse",
    title: "오늘의 말씀",
    reference: verses[0].reference,
    lines: verses[0].lines.map((l) => ({ who: verses[0].reference, en: l.en, kr: l.kr })),
  },
];
