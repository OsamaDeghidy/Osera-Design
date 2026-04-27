"use server";

import { inngest } from "@/inngest/client";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { getSubscriptionToken } from "inngest/realtime";

export async function fetchRealtimeSubscriptionToken() {
  const session = await getKindeServerSession();
  const user = await session.getUser();
  if (!user) throw new Error("Unauthorized");

  console.log("[REALTIME] Generating token for user:", user.id);
  console.log("[REALTIME] INNGEST_SIGNING_KEY present:", !!process.env.INNGEST_SIGNING_KEY);

  try {
    // This creates a token using the Inngest API that is bound to the channel and topic:
    const token = await getSubscriptionToken(inngest, {
      channel: `user:${user.id}`,
      topics: [
        "generation.start",
        "analysis.start",
        "analysis.complete",
        "frame.created",
        "generation.complete",
      ],
    });
    console.log("[REALTIME] Token generated successfully:", !!token);
    return token;
  } catch (error) {
    console.error("[REALTIME_ERROR] Failed to get subscription token:", error);
    throw error;
  }
}
