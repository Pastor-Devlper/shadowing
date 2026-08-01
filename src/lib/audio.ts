import type { Line } from "./types";

export interface Speaker {
  speak(line: Line, onEnd: () => void): void;
  stop(): void;
}

/**
 * Audio abstraction — the seam between phase 1 and phase 2.
 *
 * - If a line has `audioUrl` (phase 2, R2-hosted OpenAI TTS), stream that file.
 * - Otherwise (phase 1) fall back to the browser's speechSynthesis so the app
 *   is fully usable with zero backend.
 *
 * Callers only ever see `speak(line, onEnd)` / `stop()`, so switching to real
 * audio requires no change to the player.
 */
export function createSpeaker(): Speaker {
  let audio: HTMLAudioElement | null = null;

  const stopAudio = () => {
    if (audio) {
      audio.pause();
      audio.onended = null;
      audio.onerror = null;
    }
  };

  const stopSpeech = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  };

  return {
    speak(line, onEnd) {
      stopAudio();
      stopSpeech();

      if (line.audioUrl) {
        if (!audio) audio = new Audio();
        audio.src = line.audioUrl;
        audio.onended = onEnd;
        audio.onerror = () => onEnd();
        audio.play().catch(() => onEnd());
        return;
      }

      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        onEnd();
        return;
      }
      const u = new SpeechSynthesisUtterance(line.en);
      u.lang = "en-US";
      u.rate = 0.88;
      u.pitch = 1;
      u.onend = onEnd;
      u.onerror = () => onEnd();
      window.speechSynthesis.speak(u);
    },
    stop() {
      stopAudio();
      stopSpeech();
    },
  };
}
