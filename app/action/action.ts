"use server";
import { gemini, safeGenerateText } from "@/lib/gemini";
import { generateText } from "ai";

export async function generateProjectName(prompt: string) {
  try {
    const { text } = await safeGenerateText({
      preferredModel: "gemini-3.7-flash",
      system: `
        You are an AI assistant that generates exactly ONE very short project name (1 to 3 words max) based on the user's prompt.
        - Return ONLY the project name itself.
        - NEVER return bullet points, lists, quotes, or introductory text.
        - Example output: CryptoVault
      `,
      prompt: prompt,
    });
    return text?.trim().replace(/[\*\"\'\n]/g, "") || "Untitled Project";
  } catch (error) {
    console.log(error);
    return "Untitled Project";
  }
}
