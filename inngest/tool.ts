import { tool } from "ai";
import { z } from "zod";

export const unsplashTool = tool({
  description:
    "MANDATORY: Generates a real URL for an image. You MUST call this tool for EVERY <img> tag. Do not invent URLs.",
  inputSchema: z.object({
    query: z
      .string()
      .describe("Image search query (e.g. 'modern loft', 'finance graph')")
      .optional(),
    orientation: z
      .enum(["landscape", "portrait", "squarish"])
      .default("landscape"),
  }),
  execute: async (args) => {
    // 0. Safe argument parsing (handle undefined/null args)
    const { query, orientation } = args || {};
    console.log(`📸 [Tool] searchUnsplash called. Query: "${query || 'UNDEFINED'}"`);

    try {
      // 1. Handle missing/undefined query
      const searchTerm = query || "business";
      console.log(`   🔎 Using search term: "${searchTerm}"`);

      const orient = orientation || "landscape";
      const accessKey = process.env.UNSPLASH_ACCESS_KEY;

      // 2. Try Unsplash if key exists
      if (accessKey) {
        console.log("   🔑 Access Key found. Querying Unsplash API...");
        const res = await fetch(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
            searchTerm
          )}&orientation=${orient}&per_page=1&client_id=${accessKey}`
        );

        if (res.ok) {
          const { results } = await res.json();
          const url = results?.[0]?.urls?.regular;
          if (url) {
            console.log("   ✅ Unsplash Image Found:", url);
            return url;
          } else {
            console.log("   ⚠️ Unsplash returned no results.");
          }
        } else {
          console.log(`   ❌ Unsplash API Error: ${res.status} ${res.statusText}`);
        }
      } else {
        console.log("   ⚠️ No UNSPLASH_ACCESS_KEY in env.");
      }

      // 3. Failsafe: Fallback to reliable placeholder services if Unsplash fails/no key
      console.log("   🛡️ Activating Failsafe Backup (Picsum)...");
      // Using npoint or picsum with consistent seeds based on query length for stability
      const seed = searchTerm.length;
      return `https://picsum.photos/seed/${seed}/800/600`;

    } catch (e) {
      console.error("   💥 Tool Exception:", e);
      // 4. Ultimate backup
      return `https://picsum.photos/800/600?grayscale`;
    }
  },
});
