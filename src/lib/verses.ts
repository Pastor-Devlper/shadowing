// Curated Bible verses for the daily "오늘의 말씀" tab.
// English: World English Bible (WEB) — public domain.
// Korean: natural rendering for learning (not a copyrighted translation).
//
// Split into short phrases (`lines`) for shadowing: each phrase is played 3x
// with a follow-along gap, same as dialogue lines.
//
// ✏️ Freely edit: add, remove, reorder, or fix wording. The daily pick walks
// this list in order (sequential cursor stored in Mongo), so order = rotation.

export interface Verse {
  reference: string; // "John 3:16"
  referenceKr: string; // "요한복음 3:16"
  lines: { en: string; kr: string }[];
}

export const verses: Verse[] = [
  {
    reference: "John 3:16",
    referenceKr: "요한복음 3:16",
    lines: [
      { en: "For God so loved the world,", kr: "하나님이 세상을 이처럼 사랑하셔서," },
      { en: "that he gave his one and only Son,", kr: "하나뿐인 아들을 주셨으니," },
      { en: "that whoever believes in him should not perish, but have eternal life.", kr: "그를 믿는 사람은 누구든지 멸망하지 않고 영원한 생명을 얻게 하려는 것입니다." },
    ],
  },
  {
    reference: "Philippians 4:13",
    referenceKr: "빌립보서 4:13",
    lines: [
      { en: "I can do all things through Christ,", kr: "나는 모든 것을 할 수 있습니다, 그리스도를 통하여," },
      { en: "who strengthens me.", kr: "나에게 힘을 주시는 그분을 통하여." },
    ],
  },
  {
    reference: "Proverbs 3:5",
    referenceKr: "잠언 3:5",
    lines: [
      { en: "Trust in Yahweh with all your heart,", kr: "네 마음을 다하여 여호와를 신뢰하고," },
      { en: "and don't lean on your own understanding.", kr: "네 자신의 명철을 의지하지 말아라." },
    ],
  },
  {
    reference: "Joshua 1:9",
    referenceKr: "여호수아 1:9",
    lines: [
      { en: "Be strong and courageous.", kr: "강하고 담대하여라." },
      { en: "Don't be afraid. Don't be dismayed,", kr: "두려워하지 말고 놀라지 말아라," },
      { en: "for Yahweh your God is with you wherever you go.", kr: "네가 어디로 가든지 네 하나님 여호와가 너와 함께하기 때문이다." },
    ],
  },
  {
    reference: "Matthew 11:28",
    referenceKr: "마태복음 11:28",
    lines: [
      { en: "Come to me, all you who labor and are heavily burdened,", kr: "수고하고 무거운 짐을 진 사람들아, 다 내게로 오너라," },
      { en: "and I will give you rest.", kr: "내가 너희를 쉬게 하겠다." },
    ],
  },
  {
    reference: "Romans 8:28",
    referenceKr: "로마서 8:28",
    lines: [
      { en: "We know that all things work together for good", kr: "우리는 모든 것이 합력하여 선을 이룬다는 것을 압니다," },
      { en: "for those who love God,", kr: "하나님을 사랑하는 사람들," },
      { en: "to those who are called according to his purpose.", kr: "그분의 뜻대로 부르심을 받은 사람들에게는." },
    ],
  },
  {
    reference: "Isaiah 41:10",
    referenceKr: "이사야 41:10",
    lines: [
      { en: "Don't be afraid, for I am with you.", kr: "두려워하지 말아라, 내가 너와 함께한다." },
      { en: "Don't be dismayed, for I am your God.", kr: "놀라지 말아라, 내가 네 하나님이다." },
      { en: "I will strengthen you. Yes, I will help you.", kr: "내가 너를 굳세게 하고, 참으로 너를 도와주겠다." },
    ],
  },
  {
    reference: "Philippians 4:6",
    referenceKr: "빌립보서 4:6",
    lines: [
      { en: "In nothing be anxious,", kr: "아무것도 염려하지 말고," },
      { en: "but in everything, by prayer and petition with thanksgiving,", kr: "모든 일에 감사함으로 기도와 간구를 통하여," },
      { en: "let your requests be made known to God.", kr: "너희 구할 것을 하나님께 아뢰어라." },
    ],
  },
  {
    reference: "Jeremiah 29:11",
    referenceKr: "예레미야 29:11",
    lines: [
      { en: "For I know the thoughts that I think toward you, says Yahweh,", kr: "내가 너희를 향한 내 생각을 안다, 여호와의 말이다," },
      { en: "thoughts of peace, and not of evil,", kr: "평안의 생각이요, 재앙의 생각이 아니니," },
      { en: "to give you hope and a future.", kr: "너희에게 소망과 미래를 주려는 것이다." },
    ],
  },
  {
    reference: "Psalm 23:1",
    referenceKr: "시편 23:1",
    lines: [
      { en: "Yahweh is my shepherd;", kr: "여호와는 나의 목자시니," },
      { en: "I shall lack nothing.", kr: "내게 부족함이 없습니다." },
    ],
  },
  {
    reference: "Psalm 46:1",
    referenceKr: "시편 46:1",
    lines: [
      { en: "God is our refuge and strength,", kr: "하나님은 우리의 피난처요 힘이시며," },
      { en: "a very present help in trouble.", kr: "환난 중에 만날 큰 도움이십니다." },
    ],
  },
  {
    reference: "Matthew 6:33",
    referenceKr: "마태복음 6:33",
    lines: [
      { en: "But seek first God's Kingdom and his righteousness;", kr: "먼저 하나님의 나라와 그분의 의를 구하여라," },
      { en: "and all these things will be given to you as well.", kr: "그러면 이 모든 것을 너희에게 더하여 주실 것이다." },
    ],
  },
  {
    reference: "1 Corinthians 13:4",
    referenceKr: "고린도전서 13:4",
    lines: [
      { en: "Love is patient and is kind.", kr: "사랑은 오래 참고 친절합니다." },
      { en: "Love doesn't envy.", kr: "사랑은 시기하지 않습니다." },
      { en: "Love doesn't brag, is not proud.", kr: "사랑은 자랑하지 않고 교만하지 않습니다." },
    ],
  },
  {
    reference: "John 14:6",
    referenceKr: "요한복음 14:6",
    lines: [
      { en: "I am the way, the truth, and the life.", kr: "내가 곧 길이요 진리요 생명이다." },
      { en: "No one comes to the Father, except through me.", kr: "나를 통하지 않고는 아무도 아버지께 갈 수 없다." },
    ],
  },
  {
    reference: "Galatians 5:22",
    referenceKr: "갈라디아서 5:22",
    lines: [
      { en: "But the fruit of the Spirit is love, joy, peace,", kr: "그러나 성령의 열매는 사랑과 기쁨과 평화와," },
      { en: "patience, kindness, goodness, faith.", kr: "인내와 친절과 선함과 신실함입니다." },
    ],
  },
  {
    reference: "Psalm 119:105",
    referenceKr: "시편 119:105",
    lines: [
      { en: "Your word is a lamp to my feet,", kr: "주의 말씀은 내 발의 등불이요," },
      { en: "and a light for my path.", kr: "내 길의 빛입니다." },
    ],
  },
  {
    reference: "2 Corinthians 5:17",
    referenceKr: "고린도후서 5:17",
    lines: [
      { en: "Therefore if anyone is in Christ, he is a new creation.", kr: "그러므로 누구든지 그리스도 안에 있으면 새로운 피조물입니다." },
      { en: "The old things have passed away.", kr: "옛것은 지나갔으니," },
      { en: "Behold, all things have become new.", kr: "보십시오, 모든 것이 새롭게 되었습니다." },
    ],
  },
  {
    reference: "Ephesians 2:8",
    referenceKr: "에베소서 2:8",
    lines: [
      { en: "For by grace you have been saved through faith,", kr: "너희는 믿음을 통하여 은혜로 구원을 받았으니," },
      { en: "and that not of yourselves; it is the gift of God,", kr: "이것은 너희에게서 난 것이 아니라 하나님의 선물입니다." },
    ],
  },
  {
    reference: "Romans 12:2",
    referenceKr: "로마서 12:2",
    lines: [
      { en: "Don't be conformed to this world,", kr: "이 세상을 본받지 말고," },
      { en: "but be transformed by the renewing of your mind.", kr: "마음을 새롭게 함으로 변화를 받아라." },
    ],
  },
  {
    reference: "1 Peter 5:7",
    referenceKr: "베드로전서 5:7",
    lines: [
      { en: "Casting all your worries on him,", kr: "너희의 모든 염려를 그분께 맡겨라," },
      { en: "because he cares for you.", kr: "그분이 너희를 돌보시기 때문이다." },
    ],
  },
  {
    reference: "Isaiah 40:31",
    referenceKr: "이사야 40:31",
    lines: [
      { en: "But those who wait for Yahweh will renew their strength.", kr: "그러나 여호와를 바라는 사람은 새 힘을 얻으리니," },
      { en: "They will mount up with wings like eagles.", kr: "독수리처럼 날개 치며 올라갈 것이요," },
      { en: "They will run, and not be weary.", kr: "달려가도 지치지 않을 것입니다." },
    ],
  },
  {
    reference: "Psalm 27:1",
    referenceKr: "시편 27:1",
    lines: [
      { en: "Yahweh is my light and my salvation.", kr: "여호와는 나의 빛이요 나의 구원이시니," },
      { en: "Whom shall I fear?", kr: "내가 누구를 두려워하겠습니까?" },
    ],
  },
  {
    reference: "Psalm 37:4",
    referenceKr: "시편 37:4",
    lines: [
      { en: "Also delight yourself in Yahweh,", kr: "또한 여호와를 기뻐하여라," },
      { en: "and he will give you the desires of your heart.", kr: "그리하면 네 마음의 소원을 이루어 주실 것이다." },
    ],
  },
  {
    reference: "Matthew 5:16",
    referenceKr: "마태복음 5:16",
    lines: [
      { en: "Even so, let your light shine before men,", kr: "이와 같이 너희 빛을 사람들 앞에 비추어," },
      { en: "that they may see your good works,", kr: "그들이 너희의 착한 행실을 보고," },
      { en: "and glorify your Father who is in heaven.", kr: "하늘에 계신 너희 아버지께 영광을 돌리게 하여라." },
    ],
  },
  {
    reference: "Romans 5:8",
    referenceKr: "로마서 5:8",
    lines: [
      { en: "But God commends his own love toward us,", kr: "그러나 하나님은 우리를 향한 자신의 사랑을 나타내셨으니," },
      { en: "in that while we were yet sinners, Christ died for us.", kr: "우리가 아직 죄인이었을 때에 그리스도께서 우리를 위해 죽으신 것입니다." },
    ],
  },
  {
    reference: "Hebrews 11:1",
    referenceKr: "히브리서 11:1",
    lines: [
      { en: "Now faith is assurance of things hoped for,", kr: "믿음은 바라는 것들의 확신이요," },
      { en: "proof of things not seen.", kr: "보이지 않는 것들의 증거입니다." },
    ],
  },
  {
    reference: "1 John 4:19",
    referenceKr: "요한일서 4:19",
    lines: [
      { en: "We love him,", kr: "우리가 그분을 사랑하는 것은," },
      { en: "because he first loved us.", kr: "그분이 먼저 우리를 사랑하셨기 때문입니다." },
    ],
  },
  {
    reference: "Psalm 118:24",
    referenceKr: "시편 118:24",
    lines: [
      { en: "This is the day that Yahweh has made.", kr: "이 날은 여호와께서 만드신 날이니," },
      { en: "We will rejoice and be glad in it!", kr: "우리가 이 날에 기뻐하고 즐거워하겠습니다!" },
    ],
  },
  {
    reference: "Colossians 3:23",
    referenceKr: "골로새서 3:23",
    lines: [
      { en: "And whatever you do, work heartily,", kr: "무슨 일을 하든지 마음을 다해 하여라," },
      { en: "as for the Lord, and not for men.", kr: "사람에게 하듯 하지 말고 주님께 하듯." },
    ],
  },
  {
    reference: "Micah 6:8",
    referenceKr: "미가 6:8",
    lines: [
      { en: "He has shown you, O man, what is good.", kr: "사람아, 그분이 무엇이 선한지 네게 보이셨다." },
      { en: "What does Yahweh require of you,", kr: "여호와께서 네게 요구하시는 것은," },
      { en: "but to act justly, to love mercy, and to walk humbly with your God?", kr: "정의를 행하고 인자를 사랑하며 겸손히 네 하나님과 함께 걷는 것이 아니냐?" },
    ],
  },
];
