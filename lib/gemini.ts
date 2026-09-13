import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText, generateObject, GenerateTextResult, GenerateObjectResult } from "ai";

// Extract all valid keys from multiple possible environment variables
export function loadApiKeys(): string[] {
  const sources = [
    process.env.GEMINI_API_KEYS,
    process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    process.env.GEMINI_API_KEY,
  ];

  const keys: string[] = [];

  for (const src of sources) {
    if (src) {
      const parts = src.split(",").map((k) => k.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
      for (const p of parts) {
        if (!keys.includes(p)) {
          keys.push(p);
        }
      }
    }
  }

  return keys;
}

let currentIndex = 0;

// Dynamic model resolver with Key Pool & Round-Robin Rotation
// Automatically maps experimental/overloaded models (like gemini-3.8-flash with 503 spikes) to stable gemini-3.7-flash
export const gemini = (modelName: string = "gemini-3.7-flash") => {
  const keys = loadApiKeys();

  if (keys.length === 0) {
    throw new Error(
      "No Gemini API keys found. Please set GEMINI_API_KEYS in your environment."
    );
  }

  // gemini-3.8-flash currently suffers from 503 High Demand spikes and free tier limit of 20
  // gemini-3.7-flash is the stable flagship model with immediate availability
  const effectiveModel = modelName === "gemini-3.8-flash" ? "gemini-3.7-flash" : modelName;

  const selectedKey = keys[currentIndex % keys.length];
  currentIndex = (currentIndex + 1) % keys.length;

  const provider = createGoogleGenerativeAI({
    apiKey: selectedKey,
    headers: {
      "Referer": "https://www.osara-ai.com",
    },
  });

  return provider(effectiveModel);
};

// Resilient wrapper for generateText with Multi-Key and Multi-Model failover
export async function safeGenerateText(
  params: any
): Promise<any> {
  const keys = loadApiKeys();
  if (keys.length === 0) {
    throw new Error("No Gemini API keys found. Please set GEMINI_API_KEYS.");
  }

  const modelCandidates = [
    params.preferredModel || "gemini-3.7-flash",
    "gemini-3.7-flash",
    "gemini-3.5-flash",
  ].map((m) => (m === "gemini-3.8-flash" ? "gemini-3.7-flash" : m))
   .filter((v, i, a) => a.indexOf(v) === i);

  let lastError: any = null;

  for (const model of modelCandidates) {
    for (let i = 0; i < keys.length; i++) {
      const keyIndex = (currentIndex + i) % keys.length;
      const key = keys[keyIndex];

      try {
        const provider = createGoogleGenerativeAI({
          apiKey: key,
          headers: { "Referer": "https://www.osara-ai.com" },
        });

        const result = await generateText({
          ...params,
          model: provider(model),
        });

        currentIndex = (keyIndex + 1) % keys.length;
        return result;
      } catch (err: any) {
        lastError = err;
        console.warn(
          `[GEMINI_AUTO_FAILOVER] Model ${model} on Key #${keyIndex + 1} failed: ${err.message?.slice(0, 120)}. Trying next candidate...`
        );
      }
    }
  }

  throw lastError;
}

// Resilient wrapper for generateObject with Multi-Key and Multi-Model failover
export async function safeGenerateObject<T = any>(
  params: any
): Promise<{ object: T; [key: string]: any }> {
  const keys = loadApiKeys();
  if (keys.length === 0) {
    throw new Error("No Gemini API keys found. Please set GEMINI_API_KEYS.");
  }

  const modelCandidates = [
    params.preferredModel || "gemini-3.7-flash",
    "gemini-3.7-flash",
    "gemini-3.5-flash",
  ].map((m) => (m === "gemini-3.8-flash" ? "gemini-3.7-flash" : m))
   .filter((v, i, a) => a.indexOf(v) === i);

  let lastError: any = null;

  for (const model of modelCandidates) {
    for (let i = 0; i < keys.length; i++) {
      const keyIndex = (currentIndex + i) % keys.length;
      const key = keys[keyIndex];

      try {
        const provider = createGoogleGenerativeAI({
          apiKey: key,
          headers: { "Referer": "https://www.osara-ai.com" },
        });

        const result = await generateObject({
          ...params,
          model: provider(model),
        });

        currentIndex = (keyIndex + 1) % keys.length;
        return result as any;
      } catch (err: any) {
        lastError = err;
        console.warn(
          `[GEMINI_AUTO_FAILOVER] Model ${model} on Key #${keyIndex + 1} failed: ${err.message?.slice(0, 120)}. Trying next candidate...`
        );
      }
    }
  }

  throw lastError;
}
