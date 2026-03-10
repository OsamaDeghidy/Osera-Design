import { Inngest } from "inngest";
import { realtimeMiddleware } from "@inngest/realtime/middleware";

console.log("[INNGEST_CLIENT] Initializing Inngest client. Production:", process.env.NODE_ENV === "production");
if (process.env.NODE_ENV === "production") {
  if (!process.env.INNGEST_SIGNING_KEY) console.warn("[INNGEST_CLIENT] WARNING: INNGEST_SIGNING_KEY is missing!");
  if (!process.env.INNGEST_EVENT_KEY) console.warn("[INNGEST_CLIENT] WARNING: INNGEST_EVENT_KEY is missing!");
}

// Create a client to send and receive events
export const inngest = new Inngest({
  id: "osera-design-app",
  middleware: [realtimeMiddleware()],
});
