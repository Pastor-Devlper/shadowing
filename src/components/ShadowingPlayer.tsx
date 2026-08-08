"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Dialogue, DialogueRef, HistoryData, TodayResponse } from "@/lib/types";
import { createSpeaker } from "@/lib/audio";

const REPEATS = 3;
const RADIUS = 26;
const CIRC = 2 * Math.PI * RADIUS;
const SCROLL_DOTS = 5;
const RECENT_CHIPS = 15;

function dayLabel(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("ko-KR", { month: "numeric", day: "numeric", weekday: "short" });
}

interface Props {
  date: string;
  dialogues: Dialogue[];
}

export default function ShadowingPlayer({ date: initialDate, dialogues: initialDialogues }: Props) {
  // Which day is on screen — changes when a "지난 대화" chip is picked.
  const [date, setDate] = useState(initialDate);
  const [dialogues, setDialogues] = useState(initialDialogues);
  const [hist, setHist] = useState<HistoryData>({ total: 0, dialogues: [], verses: [] });
  const [showArchive, setShowArchive] = useState(false);
  const chipRowRef = useRef<HTMLDivElement>(null);
  const [chipScroll, setChipScroll] = useState(0);

  // Render state (drives the DOM).
  const [dIdx, setDIdxState] = useState(0);
  const [lIdx, setLIdxState] = useState(0);
  const [rep, setRepState] = useState(0);
  const [playing, setPlayingState] = useState(false);
  const [status, setStatus] = useState("준비됨");

  // Live mirror for the async engine (timers/callbacks read the current value,
  // never a stale closure).
  const st = useRef({ dIdx: 0, lIdx: 0, rep: 0, playing: false });
  const setDIdx = (v: number) => { st.current.dIdx = v; setDIdxState(v); };
  const setLIdx = (v: number) => { st.current.lIdx = v; setLIdxState(v); };
  const setRep = (v: number) => { st.current.rep = v; setRepState(v); };
  const setPlaying = (v: boolean) => { st.current.playing = v; setPlayingState(v); };

  const ringRef = useRef<SVGCircleElement>(null);
  const gapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ringRAF = useRef<number | null>(null);
  const speaker = useRef(createSpeaker());

  const dateLabel = useMemo(
    () =>
      new Date(date + "T00:00:00").toLocaleDateString("ko-KR", {
        month: "short",
        day: "numeric",
        weekday: "short",
      }),
    [date]
  );

  // ---- Ring animation (imperative, like the prototype) ----
  const setRing = (fraction: number) => {
    const el = ringRef.current;
    if (!el) return;
    el.style.transition = "none";
    el.style.strokeDashoffset = String(CIRC * (1 - fraction));
  };

  const animateRing = (durationMs: number) => {
    if (ringRAF.current) cancelAnimationFrame(ringRAF.current);
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      setRing(t);
      if (t < 1 && st.current.playing) ringRAF.current = requestAnimationFrame(step);
    };
    ringRAF.current = requestAnimationFrame(step);
  };

  const wordGapMs = (text: string) => {
    const words = text.trim().split(/\s+/).length;
    return Math.max(2200, words * 420);
  };

  // ---- Engine ----
  const stopAll = () => {
    setPlaying(false);
    if (gapTimer.current) clearTimeout(gapTimer.current);
    if (ringRAF.current) cancelAnimationFrame(ringRAF.current);
    speaker.current.stop();
    setStatus("일시정지됨");
  };

  const playStep = () => {
    if (!st.current.playing) return;
    const line = dialogues[st.current.dIdx].lines[st.current.lIdx];
    setRep(st.current.rep + 1);
    setStatus(`말하는 중 · ${st.current.rep}회차`);

    speaker.current.speak(line, () => {
      if (!st.current.playing) return;
      const gap = wordGapMs(line.en);
      setStatus("따라 말해보세요");
      setRing(0);
      animateRing(gap);
      gapTimer.current = setTimeout(() => {
        if (!st.current.playing) return;
        if (st.current.rep < REPEATS) playStep();
        else advanceLine();
      }, gap);
    });
  };

  const advanceLine = () => {
    const total = dialogues[st.current.dIdx].lines.length;
    if (st.current.lIdx < total - 1) {
      setLIdx(st.current.lIdx + 1);
    } else if (st.current.dIdx < dialogues.length - 1) {
      setDIdx(st.current.dIdx + 1);
      setLIdx(0);
    } else {
      setPlaying(false);
      setRep(0);
      setStatus("오늘 대화 3개 완료 🎉");
      setRing(0);
      return;
    }
    setRep(0);
    setRing(0);
    if (st.current.playing) playStep();
  };

  const onPlay = () => {
    if (st.current.playing) {
      stopAll();
      return;
    }
    setPlaying(true);
    setStatus("재생 중");
    if (st.current.rep >= REPEATS) setRep(0);
    playStep();
  };

  const selectDialogue = (i: number) => {
    stopAll();
    setDIdx(i);
    setLIdx(0);
    setRep(0);
    setStatus("준비됨");
    setRing(0);
  };

  const goPrevLine = () => {
    stopAll();
    if (st.current.lIdx > 0) {
      setLIdx(st.current.lIdx - 1);
    } else if (st.current.dIdx > 0) {
      const prevD = st.current.dIdx - 1;
      setDIdx(prevD);
      setLIdx(dialogues[prevD].lines.length - 1);
    }
    setRep(0);
    setRing(0);
  };

  const goNextLine = () => {
    stopAll();
    const total = dialogues[st.current.dIdx].lines.length;
    if (st.current.lIdx < total - 1) {
      setLIdx(st.current.lIdx + 1);
    } else if (st.current.dIdx < dialogues.length - 1) {
      setDIdx(st.current.dIdx + 1);
      setLIdx(0);
    }
    setRep(0);
    setRing(0);
  };

  // Clean up any pending audio/timers on unmount.
  useEffect(() => {
    const sp = speaker.current;
    return () => {
      if (gapTimer.current) clearTimeout(gapTimer.current);
      if (ringRAF.current) cancelAnimationFrame(ringRAF.current);
      sp.stop();
    };
  }, []);

  // "지난 대화" data — fetched once; it doesn't change while the page is open.
  useEffect(() => {
    fetch("/api/history")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: HistoryData | null) => {
        if (data) setHist(data);
      })
      .catch(() => {});
  }, []);

  // Load a specific past dialogue (or verse) by day + tab index, then select it.
  const loadDialogue = async (target: string, index: number) => {
    setShowArchive(false);
    if (target === date) {
      selectDialogue(index);
      return;
    }
    stopAll();
    try {
      const res = await fetch(`/api/day?date=${target}`);
      if (!res.ok) return;
      const data: TodayResponse = await res.json();
      setDialogues(data.dialogues);
      setDate(data.date);
      setDIdx(index < data.dialogues.length ? index : 0);
      setLIdx(0);
      setRep(0);
      setStatus("준비됨");
      setRing(0);
    } catch {
      // Network hiccup — stay on the current day rather than showing an error.
    }
  };

  // Group past dialogues by day (newest day first, oldest # first within a day)
  // for the archive screen.
  const archiveGroups = useMemo(() => {
    const map = new Map<string, DialogueRef[]>();
    for (const d of hist.dialogues) {
      const list = map.get(d.date) ?? [];
      list.push(d);
      map.set(d.date, list);
    }
    return [...map.entries()].map(([date, items]) => ({
      date,
      items: [...items].sort((a, b) => a.index - b.index),
    }));
  }, [hist.dialogues]);

  const onChipScroll = () => {
    const el = chipRowRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setChipScroll(max <= 0 ? 0 : el.scrollLeft / max);
  };

  const current = dialogues[dIdx];
  const isVerse = current.kind === "verse";
  const line = current.lines[lIdx];

  return (
    <div className="app">
      <div className="topbar">
        <span className="brand">Triweekly 영어회화 & 성경구절</span>
        <span className="date">{dateLabel}</span>
      </div>

      <div className="tabs">
        {dialogues.map((d, i) => (
          <button
            key={i}
            className={"tab" + (i === dIdx ? " active" : "")}
            onClick={() => selectDialogue(i)}
          >
            <span className="num">{String(i + 1).padStart(2, "0")}</span>
            <span className="title">{d.title}</span>
          </button>
        ))}
      </div>

      <div className="stage">
        {isVerse ? (
          <>
            <div className="speaker">{current.reference ?? line.who}</div>
            <div className="passage">
              {current.lines.map((l, i) => (
                <p
                  key={i}
                  className={"passage-line" + (i === lIdx ? " active" : "")}
                >
                  {l.en}
                </p>
              ))}
            </div>
            <div className="line-kr">{line.kr}</div>
          </>
        ) : (
          <>
            <div className="speaker">{line.who}</div>
            <div className="line-en">{line.en}</div>
            <div className="line-kr">{line.kr}</div>
          </>
        )}

        <div className="rhythm-wrap">
          <div className="rhythm">
            <svg width="64" height="64" viewBox="0 0 64 64">
              <defs>
                <linearGradient id="dawnGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#e8583c" />
                  <stop offset="100%" stopColor="#f2a93c" />
                </linearGradient>
              </defs>
              <circle className="track" cx="32" cy="32" r={RADIUS} />
              <circle ref={ringRef} className="fill" cx="32" cy="32" r={RADIUS} />
            </svg>
            <div className="rhythm-count">{rep > 0 ? rep : "–"}</div>
          </div>
          <div className="rhythm-label">
            반복 <b>{rep}/{REPEATS}</b>
            <br />
            따라 말할 시간
          </div>
        </div>

        <div className="line-dots">
          {dialogues[dIdx].lines.map((_, i) => (
            <div
              key={i}
              className={"dot" + (i < lIdx ? " done" : i === lIdx ? " active" : "")}
            />
          ))}
        </div>
      </div>

      <div className="status">{status}</div>

      <div className="controls">
        <button className="ctrl-btn" onClick={goPrevLine} aria-label="이전 문장">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="19 20 9 12 19 4 19 20" />
            <line x1="5" y1="19" x2="5" y2="5" />
          </svg>
        </button>
        <button className="play-btn" onClick={onPlay} aria-label={playing ? "일시정지" : "재생"}>
          {playing ? (
            <svg viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor">
              <polygon points="6 4 20 12 6 20 6 4" />
            </svg>
          )}
        </button>
        <button className="ctrl-btn" onClick={goNextLine} aria-label="다음 문장">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="5 4 15 12 5 20 5 4" />
            <line x1="19" y1="5" x2="19" y2="19" />
          </svg>
        </button>
      </div>

      {hist.dialogues.length > 0 && (
        <div className="history">
          <div className="history-head">
            <span className="history-eyebrow">지난 대화</span>
            <span className="counter">지금까지 <b>{hist.total}</b>개</span>
            <button className="archive-link" onClick={() => setShowArchive(true)}>
              전체 보기 ›
            </button>
          </div>

          <div className="chip-row-mask">
            <div className="chip-row" ref={chipRowRef} onScroll={onChipScroll}>
              {hist.dialogues.slice(0, RECENT_CHIPS).map((d) => (
                <button
                  key={`${d.date}-${d.index}`}
                  className={"chip" + (d.date === date && d.index === dIdx ? " active" : "")}
                  onClick={() => loadDialogue(d.date, d.index)}
                >
                  <span className="cn">#{d.n}</span>
                  <span className="ct">{d.title}</span>
                </button>
              ))}
            </div>
          </div>
          {hist.dialogues.length > SCROLL_DOTS && (
            <div className="scroll-dots">
              {Array.from({ length: SCROLL_DOTS }).map((_, i) => (
                <div
                  key={i}
                  className={"scroll-dot" + (i === Math.round(chipScroll * (SCROLL_DOTS - 1)) ? " active" : "")}
                />
              ))}
            </div>
          )}

          {hist.verses.length > 0 && (
            <>
              <div className="verse-eyebrow">말씀</div>
              <div className="chip-row-mask">
                <div className="verse-row">
                  {hist.verses.slice(0, 12).map((v) => (
                    <button
                      key={`${v.date}-${v.index}`}
                      className={"verse-chip" + (v.date === date && v.index === dIdx ? " active" : "")}
                      onClick={() => loadDialogue(v.date, v.index)}
                    >
                      {v.reference}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {showArchive && (
        <div className="archive" role="dialog" aria-label="전체 기록">
          <div className="archive-head">
            <button className="archive-back" onClick={() => setShowArchive(false)} aria-label="뒤로">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <span className="archive-title">전체 기록 · {hist.total}개</span>
          </div>
          <div className="archive-body">
            {archiveGroups.map((g) => (
              <div className="archive-group" key={g.date}>
                <div className="archive-date">{dayLabel(g.date)}</div>
                {g.items.map((d) => (
                  <button
                    key={`${d.date}-${d.index}`}
                    className={"archive-item" + (d.date === date && d.index === dIdx ? " active" : "")}
                    onClick={() => loadDialogue(d.date, d.index)}
                  >
                    <span className="ai-n">#{d.n}</span>
                    <span className="ai-t">{d.title}</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
