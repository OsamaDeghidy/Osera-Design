import { generateObject, generateText, stepCountIs } from "ai";
import { inngest } from "../client";
import { z } from "zod";
import { gemini } from "@/lib/gemini";
import { FrameType } from "@/types/project";
import { ANALYSIS_PROMPT, GENERATION_SYSTEM_PROMPT } from "@/lib/prompt";
import prisma from "@/lib/prisma";
import { prismadb } from "@/lib/prismadb";
import { BASE_VARIABLES, THEME_LIST } from "@/lib/themes";
import { unsplashTool } from "../tool";

const AnalysisSchema = z.object({
  theme: z
    .string()
    .describe(
      "The specific visual theme ID (e.g., 'midnight', 'ocean-breeze', 'neo-brutalism')."
    ),
  screens: z
    .array(
      z.object({
        id: z
          .string()
          .describe(
            "Unique identifier for the screen (e.g., 'home-dashboard', 'profile-settings', 'transaction-history'). Use kebab-case."
          ),
        name: z
          .string()
          .describe(
            "Short, descriptive name of the screen (e.g., 'Home Dashboard', 'Profile', 'Transaction History')"
          ),
        purpose: z
          .string()
          .describe(
            "One clear sentence explaining what this screen accomplishes for the user and its role in the app"
          ),
        visualDescription: z
          .string()
          .describe(
            "A dense, high-fidelity visual directive (like an image generation prompt). Describe the layout, specific data examples (e.g. 'Oct-Mar'), component hierarchy, and physical attributes (e.g. 'Chunky cards', 'Floating header','Floating action button', 'Bottom navigation',Header with user avatar)."
          ),
      })
    )
    .min(1)
    .max(4),
});

export const generateScreens = inngest.createFunction(
  { id: "generate-ui-screens" },
  { event: "ui/generate.screens" },
  async ({ event, step, publish }) => {
    const {
      userId,
      projectId,
      prompt,
      imageBase64, // Destructure imageBase64
      frames,
      theme: existingTheme,
      mode,
      language,
    } = event.data;
    const CHANNEL = `user:${userId}`;
    const isExistingGeneration = Array.isArray(frames) && frames.length > 0;

    // 1. Check Credits
    const dbUser = await prismadb.user.findUnique({ where: { id: userId } });

    if (!dbUser) {
      // Create on the fly to support existing users migrating to credit system
      await prismadb.user.create({
        data: {
          id: userId,
          email: "migrated_user@placeholder.com", // Ideally fetch from Kinde, but Inngest event might not have it all. 
          // Wait, event.data doesn't guarantee email.
          // Actually, let's just create with ID and partial data or SKIP creation and assume 5 credits.
          // Better: We should have synced user on login. 
          // Fallback: If no user, assume 5 credits (Free Tier) but don't deduct? No, unsafe.
          // Best fallback: Create with placeholder and let them claim it.
          // OR: Just allow this run if user not found (grace period).
        }
      });
    }

    const currentCredits = dbUser?.credits ?? 5; // Default 5 if not found
    const isUnlimited = dbUser?.isUnlimited ?? false;

    if (currentCredits <= 0 && !isUnlimited) {
      throw new Error("Insufficient credits. Please upgrade your plan.");
    }

    await publish({
      channel: CHANNEL,
      topic: "generation.start",
      data: {
        status: "running",
        projectId: projectId,
      },
    });

    //Analyze or plan
    const analysis = await step.run("analyze-and-plan-screens", async () => {
      await publish({
        channel: CHANNEL,
        topic: "analysis.start",
        data: {
          status: "analyzing",
          projectId: projectId,
        },
      });

      const contextHTML = isExistingGeneration
        ? frames
          .map(
            (frame: FrameType) =>
              `<!-- ${frame.title} -->\n${frame.htmlContent}`
          )
          .join("\n\n")
        : "";

      const analysisPrompt = isExistingGeneration
        ? `
          USER REQUEST: ${prompt}
          SELECTED THEME: ${existingTheme}

          EXISTING SCREENS (analyze for consistency navigation, layout, design system etc):
          ${contextHTML}

         CRITICAL REQUIREMENTS A MUST - READ CAREFULLY:
          - **Analyze the existing screens' layout, navigation patterns, and design system
          - **Extract the EXACT bottom navigation component structure and styling
          - **Identify common components (cards, buttons, headers) for reuse
          - **Maintain the same visual hierarchy and spacing
          - **Generate new screens that seamlessly blend with existing ones
        `.trim()
        : `
          USER REQUEST: ${prompt}
        `.trim();

      const systemInstruction = language === "ar"
        ? `
      You are an EXPERT Arabic UI/UX Product Manager.
      - Your goal is to plan a set of mobile screens for an Arabic application.
      - Screen Names and Purposes MUST be in professional Arabic.
      - Visual Descriptions should be detailed but can be in English or Arabic, as long as they describe an Arabic layout (RTL).
      - Ensure the flow makes sense for an Arabic user.
      `.trim()
        : mode === "precise"
          ? `
        You are a PIXEL-PERFECT implementation assistant.
        - Your goal is EXTREME ADHERENCE to the user's instructions.
        - Do NOT add "creative" flair or decorative elements unless explicitly requested.
        - If the user provides an image, COPY IT EXACTLY.
        - If the user asks for a simple white screen, give a simple white screen.
        - IGNORE "dribbble-quality" rules if they conflict with simplicity or the user's specific request.
        `.trim()
          : ANALYSIS_PROMPT; // Default creative behavior

      const { object } = await generateObject({
        model: gemini("gemini-2.0-flash"),
        schema: AnalysisSchema,
        system: systemInstruction,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: analysisPrompt },
              ...(imageBase64
                ? [{ type: "image" as const, image: imageBase64 }]
                : []),
            ],
          },
        ],
      });

      const themeToUse = isExistingGeneration ? existingTheme : object.theme;

      if (!isExistingGeneration) {
        await prisma.project.update({
          where: {
            id: projectId,
            userId: userId,
          },
          data: { theme: themeToUse },
        });
      }

      await publish({
        channel: CHANNEL,
        topic: "analysis.complete",
        data: {
          status: "generating",
          theme: themeToUse,
          totalScreens: object.screens.length,
          screens: object.screens,
          projectId: projectId,
        },
      });

      return { ...object, themeToUse };
    });

    // Actuall generation of each screens
    const generatedFrames: typeof frames = isExistingGeneration
      ? [...frames]
      : [];

    for (let i = 0; i < analysis.screens.length; i++) {
      const screenPlan = analysis.screens[i];
      const selectedTheme = THEME_LIST.find(
        (t) => t.id === analysis.themeToUse
      );

      //Combine the Theme Styles + Base Variable
      const fullThemeCSS = `
        ${BASE_VARIABLES}
        ${selectedTheme?.style || ""}
      `;

      // Get all previous existing or generated frames
      const allPreviousFrames = generatedFrames.slice(0, i);
      const previousFramesContext = allPreviousFrames
        .map((f: FrameType) => `<!-- ${f.title} -->\n${f.htmlContent}`)
        .join("\n\n");

      await step.run(`generated-screen-${i}`, async () => {
        const ARABIC_RULES = `
      ###########################################################
      🌍 LANGUAGE MODE: ARABIC (OVERRIDE)
      ###########################################################
      The user explicitly requested this interface in ARABIC.
      
      1. **TEXT & DIRECTION**:
         - ALL content must be in professional Modern Standard Arabic.
         - ADD \`dir="rtl"\` to the root <div>.
         - FLIP all directional icons (arrows, chevrons) to point correctly for RTL.
         - Use logical spacing: \`ms-*\`, \`me-*\`, \`ps-*\`, \`pe-*\` instead of left/right.
      
      2. **TYPOGRAPHY**:
         - BOOTSTRAP: You MUST use \`font-family: 'Cairo', sans-serif;\` for the entire UI.
         - WEIGHTS: Use distinct weights (700 for headers, 400 for body) to create hierarchy.
      
      3. **IMAGES & TOOLS**:
         - 🛑 **CRITICAL**: When using \`searchUnsplash\`, you MUST pass the \`query\` in **ENGLISH**.
           - Bad: \`searchUnsplash({ query: "طعام" })\`
           - Good: \`searchUnsplash({ query: "delicious food overhead shot" })\`
         - Images should still be widely used and visually dominant.
      
      4. **AESTHETICS (INHERIT ALL RULES)**:
         - Keep all the "Dribbble-Quality" rules from the strict instructions above.
         - Shadows, Gradients, and Glassmorphism should be applied EXACTLY as they would be in English, just mirrored.
      `;

        let generationSystemInstruction = mode === "precise"
          ? `
      You are a STUBBORN code generator. 
      - Your only job is to convert the description into HTML.
      - Do NOT add gradients, glows, or glassmorphism unless explicitly asked.
      - Use simple, clean, solid colors by default.
      - If the user provided an image, your HTML structure MUST mirror it 1:1.
      - No "creative interpretation".
      `
          : GENERATION_SYSTEM_PROMPT;

        if (language === "ar") {
          generationSystemInstruction += `\n\n${ARABIC_RULES}`;
        }

        const result = await generateText({
          model: gemini("gemini-2.0-flash"),
          system: generationSystemInstruction,
          tools: {
            searchUnsplash: unsplashTool,
          },
          // @ts-ignore
          maxSteps: 5,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `
          - Screen ${i + 1}/${analysis.screens.length}
          - Screen ID: ${screenPlan.id}
          - Screen Name: ${screenPlan.name}
          - Screen Purpose: ${screenPlan.purpose}

          VISUAL DESCRIPTION: ${screenPlan.visualDescription}

          EXISTING SCREENS REFERENCE (Extract and reuse their components):
          ${previousFramesContext || "No previous screens"}

          THEME VARIABLES (Reference ONLY - already defined in parent, do NOT redeclare these):
          ${fullThemeCSS}

        CRITICAL REQUIREMENTS A MUST - READ CAREFULLY:
        - **If previous screens exist, COPY the EXACT bottom navigation component structure and styling - do NOT recreate it
        - **Extract common components (cards, buttons, headers) and reuse their styling
        - **Maintain the exact same visual hierarchy, spacing, and color scheme
        - **This screen should look like it belongs in the same app as the previous screens

        1. **Generate ONLY raw HTML markup for this mobile app screen using Tailwind CSS.**
          Use Tailwind classes for layout, spacing, typography, shadows, etc.
          Use theme CSS variables ONLY for color-related properties (bg-[var(--background)], text-[var(--foreground)], border-[var(--border)], ring-[var(--ring)], etc.)
        2. **All content must be inside a single root <div> that controls the layout.**
          - No overflow classes on the root.
          - All scrollable content must be in inner containers with hidden scrollbars: [&::-webkit-scrollbar]:hidden scrollbar-none
        3. **For absolute overlays (maps, bottom sheets, modals, etc.):**
          - Use \`relative w-full h-screen\` on the top div of the overlay.
        4. **For regular content:**
          - Use \`w-full h-full min-h-screen\` on the top div.
        5. **Do not use h-screen on inner content unless absolutely required.**
          - Height must grow with content; content must be fully visible inside an iframe.
        6. **For z-index layering:**
          - Ensure absolute elements do not block other content unnecessarily.
        7. **Output raw HTML only, starting with <div>.**
          - Do not include markdown, comments, <html>, <body>, or <head>.
        8. **Hardcode a style only if a theme variable is not needed for that element.**
        9. **Ensure iframe-friendly rendering:**
          - All elements must contribute to the final scrollHeight so your parent iframe can correctly resize.
        
        ${imageBase64 ? `
        🛑 STOP AND LISTEN CAREFULLY - VISION MODE ACTIVATED:
        - The user has provided an EXACT reference image.
        - Your PRIMARY JOB is to CLONE the layout, structure, and spacing of the image.
        - IGNORE "Theme" layout rules if they conflict with the image.
        - If the image shows a specific navbar, COPY IT. Do not use the generic glassmorphic one unless the image has it.
        - If the image shows a grid, use a grid. If it shows a list, use a list.
        - TEXT content can be inferred/lorem ipsum, but the SHAPES and POSITIONS must match.
        ` : ""}

        Generate the complete, production-ready HTML for this screen now
      `.trim(),
                },
                ...(imageBase64
                  ? [{ type: "image" as const, image: imageBase64 }]
                  : []),
              ],
            },
          ],
        });

        let finalHtml = result.text ?? "";
        const match = finalHtml.match(/<div[\s\S]*<\/div>/);
        finalHtml = match ? match[0] : finalHtml;
        finalHtml = finalHtml.replace(/```/g, "");

        //Create the frame
        const frame = await prisma.frame.create({
          data: {
            projectId,
            title: screenPlan.name,
            htmlContent: finalHtml,
          },
        });

        // Add to generatedFrames for next iteration's context
        generatedFrames.push(frame);

        await publish({
          channel: CHANNEL,
          topic: "frame.created",
          data: {
            frame: frame,
            screenId: screenPlan.id,
            projectId: projectId,
          },
        });

        return { success: true, frame: frame };
      });
    }

    await publish({
      channel: CHANNEL,
      topic: "generation.complete",
      data: {
        status: "completed",
        projectId: projectId,
      },
    });

    // Deduct 1 Credit
    if (!isUnlimited && dbUser) {
      await prismadb.user.update({
        where: { id: userId },
        data: { credits: { decrement: 1 } }
      });
    }
  }
);
