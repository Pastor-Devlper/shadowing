import OpenAI from "openai";

let client: OpenAI | null = null;

export function getOpenAI(): OpenAI {
  if (!client) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY is not set (see .env.local)");
    client = new OpenAI({ apiKey });
  }
  return client;
}

export const TEXT_MODEL = process.env.OPENAI_TEXT_MODEL || "gpt-4o-mini";
export const TTS_MODEL = process.env.OPENAI_TTS_MODEL || "gpt-4o-mini-tts";
export const TTS_VOICE = process.env.OPENAI_TTS_VOICE || "alloy";
