import { Inngest, realtime } from "inngest";
import { z } from "zod";

console.log("[INNGEST_CLIENT] Initializing Inngest client. Production:", process.env.NODE_ENV === "production");

// Create a client to send and receive events
export const inngest = new Inngest({
  id: "osera-design-app",
  isDev: process.env.NODE_ENV === "development",
});

// Define the realtime channel and topics for safe publishing in v4
export const userChannel = realtime.channel({
  name: (userId: string) => `user:${userId}`,
  topics: {
    "generation.start": { schema: z.any() },
    "analysis.start": { schema: z.any() },
    "analysis.complete": { schema: z.any() },
    "frame.created": { schema: z.any() },
    "generation.complete": { schema: z.any() },
    "generation.error": { schema: z.any() },
  }
});
