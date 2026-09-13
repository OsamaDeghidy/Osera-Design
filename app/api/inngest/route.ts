import { serve } from "inngest/next";
import { inngest } from "../../../inngest/client";
import { helloWorld } from "@/inngest/functions/helloWorld";
import { generateScreens } from "@/inngest/functions/generateScreens";
import { generateWeb } from "@/inngest/functions/generateWeb";
import { regenerateFrame } from "@/inngest/functions/regenerateFrame";

// Allow long-running execution on Vercel (up to 60 seconds)
export const maxDuration = 60;

console.log("[INNGEST_ROUTE] Initializing Inngest serve with functions:", [
  "helloWorld",
  "generateScreens",
  "generateWeb",
  "regenerateFrame",
]);

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    helloWorld,
    generateScreens,
    generateWeb,
    regenerateFrame,
  ],
  streaming: true,
});
