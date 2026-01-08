import { generateText, stepCountIs } from "ai";
import { inngest } from "../client";
import { gemini } from "@/lib/gemini";
import { GENERATION_SYSTEM_PROMPT } from "@/lib/prompt";
import prisma from "@/lib/prisma";
import { BASE_VARIABLES, THEME_LIST } from "@/lib/themes";
import { unsplashTool } from "../tool";

export const regenerateFrame = inngest.createFunction(
  { id: "regenerate-frame" },
  { event: "ui/regenerate.frame" },
  async ({ event, step, publish }) => {
    const {
      userId,
      projectId,
      frameId,
      prompt,
      imageBase64,
      mode,
      theme: themeId,
      frame,
    } = event.data;
    const CHANNEL = `user:${userId}`;

    await publish({
      channel: CHANNEL,
      topic: "generation.start",
      data: {
        status: "generating",
        projectId: projectId,
      },
    });

    // Generate new frame with the user's prompt
    await step.run("regenerate-screen", async () => {
      const selectedTheme = THEME_LIST.find((t) => t.id === themeId);

      //Combine the Theme Styles + Base Variable
      const fullThemeCSS = `
        ${BASE_VARIABLES}
        ${selectedTheme?.style || ""}
      `;

      const systemInstruction = mode === "precise"
        ? `
      You are a PIXEL-PERFECT implementation assistant.
      - Your goal is EXTREME ADHERENCE to the user's instructions.
      - Do NOT add "creative" flair or decorative elements unless explicitly requested.
      - If the user provides an image, COPY IT EXACTLY.
      - If the user asks for a simple white screen, give a simple white screen.
      - IGNORE "dribbble-quality" rules if they conflict with simplicity or the user's specific request.
      `.trim()
        : GENERATION_SYSTEM_PROMPT;

      const result = await generateText({
        model: gemini("gemini-2.0-flash"),
        system: systemInstruction,
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
        USER REQUEST: ${prompt}

        ORIGINAL SCREEN TITLE: ${frame.title}
        ORIGINAL SCREEN HTML: ${frame.htmlContent}

        THEME VARIABLES (Reference ONLY - already defined in parent, do NOT redeclare these): ${fullThemeCSS}


        CRITICAL REQUIREMENTS A MUST - READ CAREFULLY:
        1. **PRESERVE the overall structure and layout - ONLY modify what the user explicitly requested**
          - Keep all existing components, styling, and layout that are NOT mentioned in the user request
          - Only change the specific elements the user asked for
          - Do not add or remove sections unless requested
          - Maintain the exact same HTML structure and CSS classes except for requested changes
          
        🛑 CRITICAL OVERRIDE:
          - The USER INSTRUCTION ABOVE is the absolute truth.
          - If the user asks to "Change the navbar to blue", DO IT, even if it breaks the theme.
          - If the user asks to "Remove the shadow", DO IT.
          - **If the user asks for "images", "photos", or "pictures", you MUST use the 'searchUnsplash' tool to find real-looking ones. Do NOT use colored divs.**
          - Do not be "smart". Be "obedient". Apply the diff exactly as requested.

        2. **Generate ONLY raw HTML markup for this mobile app screen using Tailwind CSS.**
          Use Tailwind classes for layout, spacing, typography, shadows, etc.
          Use theme CSS variables ONLY for color-related properties (bg-[var(--background)], text-[var(--foreground)], border-[var(--border)], ring-[var(--ring)], etc.)
        3. **All content must be inside a single root <div> that controls the layout.**
          - No overflow classes on the root.
          - All scrollable content must be in inner containers with hidden scrollbars: [&::-webkit-scrollbar]:hidden scrollbar-none
        4. **For absolute overlays (maps, bottom sheets, modals, etc.):**
          - Use \`relative w-full h-screen\` on the top div of the overlay.
        5. **For regular content:**
          - Use \`w-full h-full min-h-screen\` on the top div.
        6. **Do not use h-screen on inner content unless absolutely required.**
          - Height must grow with content; content must be fully visible inside an iframe.
        7. **For z-index layering:**
          - Ensure absolute elements do not block other content unnecessarily.
        8. **Output raw HTML only, starting with <div>.**
          - Do not include markdown, comments, <html>, <body>, or <head>.
        9. **Ensure iframe-friendly rendering:**
            - All elements must contribute to the final scrollHeight so your parent iframe can correctly resize.

        ${imageBase64 ? `
        🛑 STOP AND LISTEN CAREFULLY - VISION MODE ACTIVATED:
        - The user has provided an EXACT reference image.
        - Your PRIMARY JOB is to INJECT/MODIFY the area requested based on the image.
        - If the user says "Change header to this", COPY the header from the image.
        - IGNORE "Theme" layout rules if they conflict with the image.
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

      // Update the frame
      const updatedFrame = await prisma.frame.update({
        where: {
          id: frameId,
        },
        data: {
          htmlContent: finalHtml,
        },
      });

      await publish({
        channel: CHANNEL,
        topic: "frame.created",
        data: {
          frame: updatedFrame,
          screenId: frameId,
          projectId: projectId,
        },
      });

      return { success: true, frame: updatedFrame };
    });

    await publish({
      channel: CHANNEL,
      topic: "generation.complete",
      data: {
        status: "completed",
        projectId: projectId,
      },
    });
  }
);
