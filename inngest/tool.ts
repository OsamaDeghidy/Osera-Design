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
      console.log("   🛡️ Activating Failsafe Backup...");

      // 3. Smart Niche Fallback (User Request: "Better Backup Library")
      let lowerQuery = searchTerm.toLowerCase();

      // OPTIONAL: Smart Keyword Mapping (Hoodie -> Clothing, Sneaker -> Shoes)
      const KEYWORD_ALIASES: Record<string, string> = {
        "hoodie": "clothing", "shirt": "clothing", "t-shirt": "clothing", "jacket": "clothing", "dress": "clothing",
        "sneakers": "shoes", "sneaker": "shoes", "boots": "shoes", "sandals": "shoes",
        "burger": "food", "pizza": "food", "sushi": "food", "coffee": "food", "drink": "food",
        "laptop": "tech", "computer": "tech", "phone": "tech", "mobile": "tech", "screen": "tech",
        "monitor": "tech", "keyboard": "tech", "mouse": "tech", "headphone": "tech", "headphones": "tech",
        "playstation": "gaming", "xbox": "gaming", "nintendo": "gaming", "controller": "gaming",
        "bitcoin": "finance", "crypto": "finance", "wallet": "finance", "bank": "finance"
      };

      for (const [alias, target] of Object.entries(KEYWORD_ALIASES)) {
        if (lowerQuery.includes(alias)) {
          console.log(`   🔄 Mapped '${alias}' -> '${target}'`);
          lowerQuery = target; // Switch query to the broad category for lookup
          break;
        }
      }

      const FALLBACK_LIBRARY: Record<string, string> = {
        "fashion": "https://images.unsplash.com/photo-1483985988355-763728e1935b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NTI2Mzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9ufGVufDB8MHx8fDE3NjgzMTgwNzB8MA&ixlib=rb-4.1.0&q=80&w=1080",
        "clothing": "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NTI2Mzd8MHwxfHNlYXJjaHwxfHxjbG90aGluZ3xlbnwwfDB8fHwxNzY4MzE4MDcxfDA&ixlib=rb-4.1.0&q=80&w=1080",
        "shoes": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NTI2Mzd8MHwxfHNlYXJjaHwxfHxzaG9lc3xlbnwwfDB8fHwxNzY4MzE4MDcxfDA&ixlib=rb-4.1.0&q=80&w=1080",
        "style": "https://images.unsplash.com/photo-1605859465655-84c45e14a0af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NTI2Mzd8MHwxfHNlYXJjaHwxfHxzdHlsZXxlbnwwfDB8fHwxNzY4MzE4MDcyfDA&ixlib=rb-4.1.0&q=80&w=1080",
        "modern": "https://images.unsplash.com/photo-1531591022136-eb8b0da1e6d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NTI2Mzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm58ZW58MHwwfHx8MTc2ODMxODA3Mnww&ixlib=rb-4.1.0&q=80&w=1080",
        "youth": "https://images.unsplash.com/photo-1506869640319-fe1a24fd76dc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NTI2Mzd8MHwxfHNlYXJjaHwxfHx5b3V0aHxlbnwwfDB8fHwxNzY4MzE4MDcyfDA&ixlib=rb-4.1.0&q=80&w=1080",
        "streetwear": "https://images.unsplash.com/photo-1586396847415-2c76ae7e79fc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NTI2Mzd8MHwxfHNlYXJjaHwxfHxzdHJlZXR3ZWFyfGVufDB8MHx8fDE3NjgzMTgwNzN8MA&ixlib=rb-4.1.0&q=80&w=1080",
        "tech": "https://images.unsplash.com/photo-1556742044-3c52d6e88c62?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NTI2Mzd8MXwxfHNlYXJjaHwxfHx0ZWNofGVufDB8MHx8fDE3NjgzMTgwNzN8MA&ixlib=rb-4.1.0&q=80&w=1080",
        "code": "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NTI2Mzd8MHwxfHNlYXJjaHwxfHxjb2RlfGVufDB8MHx8fDE3NjgzMTgwNzN8MA&ixlib=rb-4.1.0&q=80&w=1080",
        "laptop": "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NTI2Mzd8MXwxfHNlYXJjaHwxfHxsYXB0b3B8ZW58MHwwfHx8MTc2ODMxODA3NHww&ixlib=rb-4.1.0&q=80&w=1080",
        "food": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NTI2Mzd8MHwxfHNlYXJjaHwxfHxmb29kfGVufDB8MHx8fDE3NjgzMTgwNzR8MA&ixlib=rb-4.1.0&q=80&w=1080",
        "restaurant": "https://images.unsplash.com/photo-1556745750-68295fefafc5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NTI2Mzd8MXwxfHNlYXJjaHwxfHxyZXN0YXVyYW50fGVufDB8MHx8fDE3NjgzMTgwNzV8MA&ixlib=rb-4.1.0&q=80&w=1080",
        "meal": "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NTI2Mzd8MHwxfHNlYXJjaHwxfHxtZWFsfGVufDB8MHx8fDE3NjgzMTgwNzV8MA&ixlib=rb-4.1.0&q=80&w=1080",
        "fitness": "https://images.unsplash.com/photo-1627483298606-cf54c61779a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NTI2Mzd8MXwxfHNlYXJjaHwxfHxmaXRuZXNzfGVufDB8MHx8fDE3NjgzMTgwNzZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
        "gym": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NTI2Mzd8MHwxfHNlYXJjaHwxfHxneW18ZW58MHwwfHx8MTc2ODMxODA3Nnww&ixlib=rb-4.1.0&q=80&w=1080",
        "workout": "https://images.unsplash.com/photo-1599058917212-d750089bc07e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NTI2Mzd8MHwxfHNlYXJjaHwxfHx3b3Jrb3V0fGVufDB8MHx8fDE3NjgzMTgwNzZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
        "education": "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NTI2Mzd8MHwxfHNlYXJjaHwxfHxlZHVjYXRpb258ZW58MHwwfHx8MTc2ODMxODA3N3ww&ixlib=rb-4.1.0&q=80&w=1080",
        "school": "https://images.unsplash.com/photo-1580582932707-520aed937b7b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NTI2Mzd8MHwxfHNlYXJjaHwxfHxzY2hvb2x8ZW58MHwwfHx8MTc2ODMxODA3N3ww&ixlib=rb-4.1.0&q=80&w=1080",
        "book": "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NTI2Mzd8MHwxfHNlYXJjaHwxfHxib29rfGVufDB8MHx8fDE3NjgzMTgwNzd8MA&ixlib=rb-4.1.0&q=80&w=1080",
        "gaming": "https://images.unsplash.com/photo-1542751371-adc38448a05e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NTI2Mzd8MHwxfHNlYXJjaHwxfHxnYW1pbmd8ZW58MHwwfHx8MTc2ODMxODA3OHww&ixlib=rb-4.1.0&q=80&w=1080",
        "gamer": "https://images.unsplash.com/photo-1542751371-adc38448a05e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NTI2Mzd8MHwxfHNlYXJjaHwxfHxnYW1lcnxlbnwwfDB8fHwxNzY4MzE4MDc4fDA&ixlib=rb-4.1.0&q=80&w=1080",
        "console": "https://images.unsplash.com/photo-1621259182978-fbf93132d53d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NTI2Mzd8MHwxfHNlYXJjaHwxfHxjb25zb2xlfGVufDB8MHx8fDE3NjgzMTgwNzh8MA&ixlib=rb-4.1.0&q=80&w=1080",
        "music": "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NTI2Mzd8MHwxfHNlYXJjaHwxfHxtdXNpY3xlbnwwfDB8fHwxNzY4MzE4MDc5fDA&ixlib=rb-4.1.0&q=80&w=1080",
        "concert": "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NTI2Mzd8MHwxfHNlYXJjaHwxfHxjb25jZXJ0fGVufDB8MHx8fDE3NjgzMTgwNzl8MA&ixlib=rb-4.1.0&q=80&w=1080",
        "guitar": "https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NTI2Mzd8MHwxfHNlYXJjaHwxfHxndWl0YXJ8ZW58MHwwfHx8MTc2ODMxODA3OXww&ixlib=rb-4.1.0&q=80&w=1080",
        "business": "https://images.unsplash.com/photo-1556745757-8d76bdb6984b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NTI2Mzd8MXwxfHNlYXJjaHwxfHxidXNpbmVzc3xlbnwwfDB8fHwxNzY4MzE4MDgwfDA&ixlib=rb-4.1.0&q=80&w=1080",
        "office": "https://images.unsplash.com/photo-1497215728101-856f4ea42174?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NTI2Mzd8MHwxfHNlYXJjaHwxfHxvZmZpY2V8ZW58MHwwfHx8MTc2ODMxODA4MHww&ixlib=rb-4.1.0&q=80&w=1080",
        "meeting": "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NTI2Mzd8MHwxfHNlYXJjaHwxfHxtZWV0aW5nfGVufDB8MHx8fDE3NjgzMTgwODB8MA&ixlib=rb-4.1.0&q=80&w=1080",
        "travel": "https://images.unsplash.com/photo-1707343848552-893e05dba6ac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NTI2Mzd8MXwxfHNlYXJjaHwxfHx0cmF2ZWx8ZW58MHwwfHx8MTc2ODMxODA4MXww&ixlib=rb-4.1.0&q=80&w=1080",
        "nature": "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NTI2Mzd8MHwxfHNlYXJjaHwxfHxuYXR1cmV8ZW58MHwwfHx8MTc2ODMxODA4MXww&ixlib=rb-4.1.0&q=80&w=1080",
        "city": "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NTI2Mzd8MHwxfHNlYXJjaHwxfHxjaXR5fGVufDB8MHx8fDE3NjgzMTgwODF8MA&ixlib=rb-4.1.0&q=80&w=1080",
        "real estate": "https://images.unsplash.com/photo-1582407947304-fd86f028f716?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NTI2Mzd8MHwxfHNlYXJjaHwxfHxyZWFsJTIwZXN0YXRlfGVufDB8MHx8fDE3NjgzMTgwODF8MA&ixlib=rb-4.1.0&q=80&w=1080",
        "house": "https://images.unsplash.com/photo-1570129477492-45c003edd2be?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NTI2Mzd8MHwxfHNlYXJjaHwxfHxob3VzZXxlbnwwfDB8fHwxNzY4MzE4MDgyfDA&ixlib=rb-4.1.0&q=80&w=1080",
        "interior": "https://images.unsplash.com/photo-1631679706909-1844bbd07221?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NTI2Mzd8MHwxfHNlYXJjaHwxfHxpbnRlcmlvcnxlbnwwfDB8fHwxNzY4MzE4MDgyfDA&ixlib=rb-4.1.0&q=80&w=1080"
      };

      for (const [key, url] of Object.entries(FALLBACK_LIBRARY)) {
        if (lowerQuery.includes(key)) {
          console.log(`   📚 Found Niche Backup for '${key}': ${url}`);
          return url;
        }
      }

      // 4. Ultimate Random Fallback
      const seed = searchTerm.length;
      return `https://picsum.photos/seed/${seed}/800/600`;

    } catch (e) {
      console.error("   💥 Tool Exception:", e);
      // 4. Ultimate backup
      return `https://picsum.photos/800/600?grayscale`;
    }
  },
});
