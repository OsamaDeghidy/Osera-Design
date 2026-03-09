import { generateText } from "ai";
import { load } from "cheerio";
import { inngest } from "../client";
import { gemini } from "@/lib/gemini";
import { GENERATION_SYSTEM_PROMPT } from "@/lib/prompt";
import prisma from "@/lib/prisma";
import { prismadb } from "@/lib/prismadb";
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
      language,
      theme: themeId,
      frame,
      projectType,
      targetHtml,
    } = event.data;
    const CHANNEL = `user:${userId}`;

    // 1. Check Credits
    const dbUser = await prismadb.user.findUnique({ where: { id: userId } });
    const currentCredits = dbUser?.credits ?? 5;
    const isUnlimited = dbUser?.isUnlimited ?? false;

    if (currentCredits <= 0 && !isUnlimited) {
      throw new Error("Insufficient credits. Please upgrade your plan.");
    }

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
      
      3. **IMAGES**:
         - Standardize on using LoremFlickr: https://loremflickr.com/800/600/{english-category}?lock={randomNumber}
         - 🛑 **CRITICAL RULE**: NO SPACES IN THE CATEGORY! If multiple words, use commas (e.g. \`modern,house\`).
      
      4. **AESTHETICS (INHERIT ALL RULES)**:
         - Keep all the "Dribbble-Quality" rules from the strict instructions above.
         - Shadows, Gradients, and Glassmorphism should be applied EXACTLY as they would be in English, just mirrored.
      `;

      let systemInstruction = mode === "precise"
        ? `
      You are a PIXEL-PERFECT implementation assistant.
      - Your goal is EXTREME ADHERENCE to the user's instructions.
      - Do NOT add "creative" flair or decorative elements unless explicitly requested.
      - If the user provides an image, COPY IT EXACTLY.
      - If the user asks for a simple white screen, give a simple white screen.
      - IGNORE "dribbble-quality" rules if they conflict with simplicity or the user's specific request.
      `.trim()
        : GENERATION_SYSTEM_PROMPT;

      if (language === "ar") {
        systemInstruction += `\n\n${ARABIC_RULES}`;
      }

      if (projectType === "WEB") {
        systemInstruction += `
        ###########################################################
        🌐 WEB DESIGN MODE (OVERRIDE)
        ###########################################################
        - The user is editing a DESKTOP WEB interface. Apply desktop-first strategies.
        - Architecture: EVERY page MUST have a complete structure: <header> for Navigation, <main> for content (MUST include a Hero and at least 2 other distinct sections like Features, Testimonials, About, etc.), and a comprehensive <footer>. 🛑 DO NOT skip the footer or navigation.
        - Layout & Spacing: Design for Desktop elegance. Use Flexbox/CSS Grids (e.g. 2-column hero layers, Bento Box layouts). Use balanced padding (py-16, py-24). 🛑 NEVER use \`min-h-screen\`, \`h-screen\`, or \`min-h-[...vh]\` anywhere. Let content dictate the height naturally to avoid massive blank spaces.
        - Content Density: Fill the page with standard UI components. Hero sections with text on one side and an image/gallery on the other. 🛑 DO NOT create massive empty background spaces.
        - Style & Aesthetics: Modern, premium, elegant, and professional. Use subtle gradients, glassmorphism (\`bg-white/5 backdrop-blur-md\`, \`border-white/10\`), clean typography, and refined shadows (\`shadow-2xl\`). 🛑 Drop the "3D" aesthetic entirely; focus on clean premium SaaS/E-commerce UI.
        - Complexity vs Speed: Ensure the code is practical, efficient, and avoids unnecessary DOM bloat so it generates fast, BUT never sacrifice the core page structure (Hero + Content + Footer).
        - Colors: MUST strictly use standard Tailwind theme colors ('primary', 'secondary', 'muted', 'background', 'foreground', 'card', 'popover', 'accent', 'destructive', 'border', 'ring'). Example: "bg-primary text-primary-foreground".
        - Images: If replacing an image, MUST use LoremFlickr with BROAD, GENERAL English keywords (e.g. "business,office" or "food,restaurant" instead of highly specific terms) using this exact format: "https://loremflickr.com/1200/800/{keyword1},{keyword2}/all?lock={randomNumber}". If you use specific or non-English terms, it will fail and show a cat.
        `;
      }

      if (targetHtml) {
        systemInstruction += `
        ###########################################################
        🎯 SURGICAL COMPONENT EDITING MODE
        ###########################################################
        - You are modifying a SPECIFIC COMPONENT, not the whole page.
        - The user selected a component from their screen and provided instructions.
        - Your job is to return **ONLY the updated HTML for this specific component**.
        - DO NOT wrap your response in \`<html>\`, \`<body>\`, or a main layout \`<div>\` unless the target component itself was the main layout.
        - Maintain the same root tag and structure of the requested component, applying only the styling or content changes requested.
        - **IMPORTANT**: The component provided contains a \`data-ai-target="true"\` attribute. YOU MUST KEEP THIS ATTRIBUTE exactly as it is in your returned HTML so the server can find and replace it.
        `;
      }

      const isSkeleton = frame.htmlContent.includes("<!-- SKELETON_MARKER -->");
      let skeletonPurpose = "";
      let skeletonVisualDesc = "";
      let previousFramesContext = "";

      if (isSkeleton) {
        const purposeMatch = frame.htmlContent.match(/<!-- PURPOSE: (.*?) -->/);
        const visualDescMatch = frame.htmlContent.match(/<!-- VISUAL_DESC: (.*?) -->/);
        skeletonPurpose = purposeMatch ? Buffer.from(purposeMatch[1], 'base64').toString('utf-8') : "";
        skeletonVisualDesc = visualDescMatch ? Buffer.from(visualDescMatch[1], 'base64').toString('utf-8') : "";

        // Fetch existing frames to provide style consistency context
        const existingFrames = await prisma.frame.findMany({
          where: { projectId },
          orderBy: { createdAt: 'asc' },
          take: 3
        });
        const fullFrames = existingFrames.filter((f: any) => !f.htmlContent.includes("<!-- SKELETON_MARKER -->"));
        if (fullFrames.length > 0) {
          previousFramesContext = fullFrames.map((f: any) => `<!-- ${f.title} -->\n${f.htmlContent}`).join('\n\n');
        }
      }

      let modelToUse = "gemini-2.5-flash"; // Default fast model
      if (projectType !== "WEB") {
        modelToUse = "gemini-2.5-flash-lite";
      }

      // Upgrade to Pro model for complex edits (where it's not generating from a skeleton)
      if (!isSkeleton) {
        modelToUse = "gemini-2.5-pro";
      }

      const result = await generateText({
        model: gemini(modelToUse),
        system: systemInstruction,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `
        USER REQUEST: ${prompt}

        THEME VARIABLES (Reference ONLY - already defined in parent, do NOT redeclare these): ${fullThemeCSS}

        ${targetHtml ? `
        🎯 TARGETED COMPONENT HTML (Modify ONLY this):
        ${targetHtml}
        ` : isSkeleton ? `
        🛑 SKELETON GENERATION MODE ACTIVATED (INITIALIZATION):
        ORIGINAL SCREEN TITLE: ${frame.title}
        
        The current HTML is just an empty placeholder. You MUST build this screen ENTIRELY from scratch!
        
        ARCHITECT'S PURPOSE: ${skeletonPurpose}
        VISUAL DESCRIPTION DIRECTIVE: ${skeletonVisualDesc}
        
        ${previousFramesContext ? `
        🛑 CRITICAL: STYLE CONSISTENCY REFERENCE
        You MUST extract and REUSE the exact same CSS classes, color palettes, spacing conventions, navigation bars, and footer styles from the existing pages below. Your new page MUST look like it belongs to the EXACT SAME website.
        
        \`\`\`html
        ${previousFramesContext}
        \`\`\`
        ` : ""}
        
        CRITICAL RULES:
        1. Ignore the current skeleton HTML entirely. DO NOT output skeleton HTML.
        2. Build a highly detailed, premium production-ready screen based exactly on the Architect's Purpose and Visual Description above. Ensure a modern "3D tech" aesthetic but keep layout height balanced (not overly tall).
        ` : `
        ORIGINAL SCREEN TITLE: ${frame.title}
        ORIGINAL SCREEN HTML: ${frame.htmlContent}
        
        CRITICAL REQUIREMENTS A MUST - READ CAREFULLY:
        1. **PRESERVE the overall structure and layout - ONLY modify what the user explicitly requested**
          - Keep all existing components, styling, and layout that are NOT mentioned in the user request
          - Only change the specific elements the user asked for
          - Do not add or remove sections unless requested
          - Maintain the exact same HTML structure and CSS classes except for requested changes
          
        🛑 CRITICAL OVERRIDE:
        - The USER INSTRUCTION ABOVE is the absolute truth.
        - If the user asks to "Change the navbar to blue", DO IT, even if it breaks the theme.
        - If the user asks for "images", "photos", or "pictures", you MUST use the LoremFlickr photos fallback instead of colored divs.
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
        9. **Ensure iframe-friendly rendering.**
        `}

        ${imageBase64 ? `
        🛑 STOP AND LISTEN CAREFULLY - VISION MODE ACTIVATED:
        - The user has provided an EXACT reference image.
        - Your PRIMARY JOB is to INJECT/MODIFY the area requested based on the image.
        - If the user says "Change header to this", COPY the header from the image.
        - IGNORE "Theme" layout rules if they conflict with the image.
        ` : ""}

        🛑 CHAIN OF THOUGHT REQUIRED:
        Before outputting the HTML, you MUST wrap your reasoning in a <thinking> ... </thinking> block.
        Inside this block, quickly act as a senior developer and analyze the user's request vs the current HTML.
        - What exactly needs to change?
        - Where is it located?
        - What classes or structure will I modify?
        Only AFTER the <thinking> block, output the raw HTML.

        Generate the complete, production-ready response ${targetHtml ? "for this component" : "for this screen"} now.
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

      // Strip out the Chain of Thought thinking block
      finalHtml = finalHtml.replace(/<thinking>[\s\S]*?<\/thinking>/g, "");

      finalHtml = finalHtml.replace(/```html/g, "").replace(/```/g, "").trim();

      if (targetHtml) {
        // Surgical Stitching using Cheerio
        const $ = load(frame.htmlContent);

        // Find the target element in the ORIGINAL HTML that we marked earlier
        const targetElement = $('[data-ai-target="true"]');

        if (targetElement.length > 0) {
          // Replace it with the newly generated HTML component
          targetElement.replaceWith(finalHtml);

          // The new HTML might have the data attribute (if the model followed instructions). Remove it globally.
          $('[data-ai-target="true"]').removeAttr('data-ai-target');

          finalHtml = $.html();
        } else {
          console.warn("Target element not found in original HTML, falling back to replacing entire HTML (unexpected).");
          // If we couldn't find the target, the generation is broken, but we fallback safely just in case.
        }
      } else {
        const match = finalHtml.match(/<div[\s\S]*<\/div>/);
        finalHtml = match ? match[0] : finalHtml;
      }

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

    // Deduct 1 Credit
    if (!isUnlimited && dbUser) {
      await prismadb.user.update({
        where: { id: userId },
        data: { credits: { decrement: 1 } }
      });
    }
  }
);
