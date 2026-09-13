import { createGoogleGenerativeAI } from "@ai-sdk/google";

// Extract all valid keys from multiple possible environment variables
function loadApiKeys(): string[] {
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
export const gemini = (modelName: string) => {
  const keys = loadApiKeys();

  if (keys.length === 0) {
    throw new Error(
      "No Gemini API keys found. Please set GEMINI_API_KEYS in your environment."
    );
  }

  // Pick the next key in round-robin sequence
  const selectedKey = keys[currentIndex % keys.length];
  currentIndex = (currentIndex + 1) % keys.length;

  const provider = createGoogleGenerativeAI({
    apiKey: selectedKey,
    headers: {
      "Referer": "https://www.osara-ai.com",
    },
  });

  return provider(modelName);
};
