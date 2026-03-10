import { generateObject, generateText } from "ai";
import { inngest } from "../client";
import { z } from "zod";
import { gemini } from "@/lib/gemini";
import { FrameType } from "@/types/project";
import prisma from "@/lib/prisma";
import { prismadb } from "@/lib/prismadb";
import { BASE_VARIABLES, THEME_LIST } from "@/lib/themes";

console.log("[INNGEST] Module loaded: Web Generator.");

const WebAnalysisSchema = z.object({
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
                        "Unique identifier for the page (e.g., 'landing-page', 'pricing-tier', 'dashboard'). Use kebab-case."
                    ),
                name: z
                    .string()
                    .describe(
                        "Short, descriptive name of the page (e.g., 'Landing Page', 'Pricing', 'User Dashboard')"
                    ),
                purpose: z
                    .string()
                    .describe(
                        "One clear sentence explaining what this page accomplishes for the user and its role in the website"
                    ),
                visualDescription: z
                    .string()
                    .describe(
                        "A dense, high-fidelity visual directive for a DESKTOP WEB layout. MUST explicitly define a complete page architecture: 1. Navigation Bar, 2. Hero Section, 3. At least 2-3 detailed content/feature sections, 4. A comprehensive Footer. Describe the responsive structure, desktop-specific components (e.g., 'Multi-column grid'), and how it should look on wide screens."
                    ),
            })
        )
        .min(1)
        .max(10),
});

export const generateWeb = inngest.createFunction(
    { id: "web-generator-v1" }, // Changed to force a fresh Cloud sync
    { event: "ui/generate.web" }, // Matches ui/generate.screens pattern
    async ({ event, step, publish }) => {
        const {
            userId,
            projectId,
            prompt,
            imageBase64,
            frames,
            theme: existingTheme,
            mode,
            language,
        } = event.data;

        console.log("[INNGEST] Starting generateWeb for project:", projectId, "user:", userId);
        const CHANNEL = `user:${userId}`;
        const isExistingGeneration = Array.isArray(frames) && frames.length > 0;

        try {
            // 1. Check Credits
            console.log("[INNGEST] Checking credits for user:", userId);
            const dbUser = await prismadb.user.findUnique({ where: { id: userId } });

            if (!dbUser) {
                console.log("[INNGEST_WEB_V2] Creating new user record for:", userId);
                await prismadb.user.create({
                    data: {
                        id: userId,
                        email: "migrated_user@placeholder.com",
                    }
                });
            }

            const currentCredits = dbUser?.credits ?? 5;
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

            // 2. Agent 1: The Planner (Analysis) - Using smarter model, fast and cost-effective
            console.log("[INNGEST_WEB] Planning web pages...");
            const analysis = await step.run("analyze-and-plan-web", async () => {
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

          EXISTING PAGES (analyze for consistency navigation, layout, design system etc):
          ${contextHTML}

          CRITICAL WEB REQUIREMENTS:
          - Analyze the existing desktop layouts, navigation patterns (e.g., top bars, sidebars), and design system
          - Extract the EXACT desktop navigation component structure and styling
          - Identify common desktop components (data tables, wide cards, multi-column layouts) for reuse
          - Maintain the exact same visual hierarchy and spacing, optimized for wide screens.
          
          🛑 STRICT ANTI-DUPLICATION RULE:
          - You are ADDING NEW pages to the existing web app based on the USER REQUEST.
          - DO NOT include any of the "EXISTING PAGES" in your JSON output array.
          - Your output should ONLY contain the newly requested pages that do not exist yet.
        `.trim()
                    : `
          USER REQUEST: ${prompt}
        `.trim();

                const baseSystem = `You are an expert Frontend Architect specializing in modern, responsive Web Design. Your goal is to plan the architecture for a web application base on the user request. Plan for wide-screen desktop resolutions first, with responsiveness in mind. Focus on web-native patterns like sidebars, mega-menus, complex grids, and wide hero sections.`;

                const systemInstruction = language === "ar"
                    ? `${baseSystem}\nLANGUAGE MODE: ARABIC. Screen Names and Purposes MUST be in standard Arabic. Design for RTL layouts.`
                    : mode === "precise"
                        ? `${baseSystem}\nPRECISE MODE: Adhere strictly to user requests without unnecessary creative embellishment. Give EXACTLY what is asked.`
                        : baseSystem;

                const { object } = await generateObject({
                    model: gemini("gemini-2.0-flash"), // Standard stable model
                    schema: WebAnalysisSchema,
                    system: systemInstruction,
                    messages: [
                        {
                            role: "user",
                            content: [
                                { type: "text", text: analysisPrompt },
                                ...(imageBase64 ? [{ type: "image" as const, image: imageBase64 }] : []),
                            ],
                        },
                    ],
                });

                const themeToUse = isExistingGeneration ? existingTheme : object.theme;

                if (!isExistingGeneration) {
                    await prisma.project.update({
                        where: { id: projectId, userId: userId },
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

                console.log("[INNGEST] Analysis complete. Theme:", themeToUse, "Total screens:", object.screens.length);
                return { ...object, themeToUse };
            });

            // 3. Agent 2: The Coder (Execution) - Using cheaper, high-rate model
            const generatedFrames: typeof frames = isExistingGeneration ? [...frames] : [];

            for (let i = 0; i < analysis.screens.length; i++) {
                console.log(`[INNGEST_WEB_V2] Generating page ${i + 1}/${analysis.screens.length}: ${analysis.screens[i].id}`);
                const pagePlan = analysis.screens[i];
                const selectedTheme = THEME_LIST.find((t) => t.id === analysis.themeToUse);

                const fullThemeCSS = `
        ${BASE_VARIABLES}
        ${selectedTheme?.style || ""}
      `;

                const previousFramesContext = generatedFrames.slice(0, i)
                    .map((f: FrameType) => `<!-- ${f.title} -->\n${f.htmlContent}`)
                    .join("\n\n");

                await step.run(`generated-web-page-${i}`, async () => {
                    let finalHtml = "";

                    if (i > 0) {
                        // --- LAZY GENERATION: Generate Skeleton for i > 0 ---
                        const encodedPurpose = Buffer.from(pagePlan.purpose).toString('base64');
                        const encodedVisualDesc = Buffer.from(pagePlan.visualDescription).toString('base64');

                        finalHtml = `
<!-- SKELETON_MARKER -->
<!-- PURPOSE: ${encodedPurpose} -->
<!-- VISUAL_DESC: ${encodedVisualDesc} -->
<div data-skeleton="true" class="flex flex-col items-center justify-center h-full min-h-[600px] w-full bg-background/50 p-8 text-center" dir="${language === 'ar' ? 'rtl' : 'ltr'}">
  <div class="size-20 rounded-full bg-muted flex items-center justify-center mb-6 mx-auto shadow-sm">
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground opacity-50"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
  </div>
  <h3 class="text-3xl font-bold mb-4">${pagePlan.name}</h3>
  <p class="text-muted-foreground mb-8 max-w-md mx-auto text-base leading-relaxed">${pagePlan.purpose}</p>
  <div class="text-sm text-primary/60 border border-dashed border-primary/30 bg-primary/5 rounded-full px-6 py-2 mx-auto font-medium inline-flex items-center gap-2">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21 16-4 4-4-4"/><path d="M17 20V4"/><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/></svg>
    Click "Generate Screen" to render this layout
  </div>
</div>`.trim();
                    } else {
                        // --- FULL GENERATION: Only for the first page ---
                        // --- AGENT 2: The Designer ---
                        const designPrompt = `
                You are a Senior Web Designer (Awwwards-level). 
                Your job is to write a highly detailed design specification for the "Developer" to implement.
                
                Page Name: ${pagePlan.name}
                Purpose: ${pagePlan.purpose}
                Architect's Vision: ${pagePlan.visualDescription}
                
                Write a comprehensive, premium blueprint detailing:
                1. Layout Structure: Create a structured, content-rich layout (e.g., 2-column Grid Hero, Bento Grid features, distinct cards, clear sections). 🛑 Do NOT specify empty backgrounds. 
                2. Page Density: Ensure the page is populated with concrete UI elements (buttons, text, images, feature cards). Quality over excessive length, but NO empty sections.
                3. Spacing guidelines: Use balanced padding (e.g., py-12, py-20, gap-8). 🛑 NEVER use viewport height (vh) or full-screen heights (h-screen). Sections must wrap their content naturally.
                4. Typography styling (clean readable text, elegant headings).
                5. Aesthetics: Premium, modern, professional, sleek design (glassmorphism \`backdrop-blur\`, subtle gradients, clean borders, refined shadows). 🛑 DO NOT mention 3D effects, WebGL, or simulations.
                6. Images: Contextual Keywords for placeholders.
                
                Make the specification precise, practical, and fast to implement.
                `;

                        const designResult = await generateText({
                            model: gemini("gemini-2.5-flash"),
                            system: "Focus entirely on creating a premium, modern web aesthetic specification.",
                            messages: [{ role: "user", content: designPrompt }],
                        });
                        const designSpec = designResult.text;


                        // --- AGENT 3: The Developer ---
                        let generationSystemInstruction = `
        You are an elite Frontend Web Developer. Your task is strictly to generate pristine, production-ready raw HTML using Tailwind CSS based on the Senior Designer's specification.
        
        CRITICAL WEB DESIGN RULES (MUST FOLLOW):
        - Architecture: EVERY page MUST have a complete structure: <header> for Navigation, <main> for content (MUST include a Hero and at least 2 other distinct sections like Features, Testimonials, About, etc.), and a comprehensive <footer>. 🛑 DO NOT skip the footer or navigation.
        - Layout & Spacing: Design for Desktop elegance. Use Flexbox/CSS Grids (e.g. 2-column hero layers, Bento Box layouts). Use balanced padding (py-16, py-24). 🛑 NEVER use \`min-h-screen\`, \`h-screen\`, or \`min-h-[...vh]\` anywhere. Let content dictate the height naturally to avoid massive blank spaces.
        - Content Density: Fill the page with standard UI components. Hero sections with text on one side and an image/gallery on the other. 🛑 DO NOT create massive empty background spaces.
        - Style & Aesthetics: Modern, premium, elegant, and professional. Use subtle gradients, glassmorphism (\`bg-white/5 backdrop-blur-md\`, \`border-white/10\`), clean typography, and refined shadows (\`shadow-2xl\`). 🛑 Drop the "3D" aesthetic entirely; focus on clean premium SaaS/E-commerce UI.
        - Complexity vs Speed: Ensure the code is practical, efficient, and avoids unnecessary DOM bloat so it generates fast, BUT never sacrifice the core page structure (Hero + Content + Footer).
        - Colors: You MUST strictly use standard Tailwind color classes mapped to our theme: 'primary', 'secondary', 'muted', 'accent', 'destructive', 'card', 'popover', 'background', 'foreground', 'border', 'input', 'ring'.
        - Images: You MUST use LoremFlickr with BROAD, GENERAL English keywords (e.g. "business,office" or "food,restaurant" instead of highly specific terms) using this exact format: "https://loremflickr.com/1200/800/{keyword1},{keyword2}/all?lock={randomNumber}". If you use specific or non-English terms, it will fail and show a cat.
        `;

                        if (mode === "precise") {
                            generationSystemInstruction += `\nSTRICT MODE: Convert description exact to HTML. No unprompted gradients/glows. Simple solids. Clone reference image 1:1 if provided.`;
                        } else {
                            generationSystemInstruction += `
          - Add standard premium web touches: hover states (hover:bg-primary/90, hover:shadow-xl), smooth transitions (transition-all duration-300).
          - Use modern details: subtle ring borders, glassmorphic headers (\`backdrop-blur-md bg-background/80\`), or clean neo-brutalist shadows if the theme matches.
          `;
                        }

                        if (language === "ar") {
                            generationSystemInstruction += `
          \nLANGUAGE MODE: ARABIC (RTL). Add \`dir="rtl"\` to the root <div>. Flip directional icons. Use logical spacing (\`ms-*\`, \`me-*\`, \`pe-*\`, \`ps-*\`). Ensure typography uses 'Cairo' font family.
          `;
                        }

                        const result = await generateText({
                            model: gemini("gemini-2.0-flash"),
                            system: generationSystemInstruction,
                            messages: [
                                {
                                    role: "user",
                                    content: [
                                        {
                                            type: "text",
                                            text: `
          - Page ${i + 1}/${analysis.screens.length}
          - Page ID: ${pagePlan.id}
          - Page Name: ${pagePlan.name}
          - Page Purpose: ${pagePlan.purpose}

          SENIOR DESIGNER'S SPECIFICATION: 
          ${designSpec}

          EXISTING PAGES REFERENCE (Extract/Reuse common components like Navbars/Footers):
          ${previousFramesContext || "No previous pages"}

          INSTRUCTIONS:
          1. Generate ONLY raw HTML markup with Tailwind CSS. Use theme variables mapped to standard tailwind tags (e.g., bg-primary, text-foreground).
          2. Wrap everything in a single root <div>.
          3. Ensure it looks excellent on desktop.
          4. Output raw HTML only. No markdown, no comments, no <html> or <body> tags.
          
          ${imageBase64 ? `
          🛑 VISION MODE:
          The user provided a reference image. CLONE its layout and structure exactly for the web viewport.
          ` : ""}
          `.trim(),
                                        },
                                        ...(imageBase64 ? [{ type: "image" as const, image: imageBase64 }] : []),
                                    ],
                                },
                            ],
                        });

                        finalHtml = result.text ?? "";
                        const match = finalHtml.match(/<div[\s\S]*<\/div>/);
                        finalHtml = match ? match[0] : finalHtml;
                        finalHtml = finalHtml.replace(/```/g, "");
                    } // End of full generation else block

                    const frame = await prisma.frame.create({
                        data: {
                            projectId,
                            title: pagePlan.name,
                            htmlContent: finalHtml,
                        },
                    });

                    generatedFrames.push(frame);

                    await publish({
                        channel: CHANNEL,
                        topic: "frame.created",
                        data: {
                            frame: frame,
                            screenId: pagePlan.id,
                            projectId: projectId,
                        },
                    });

                    return { success: true, frame: frame };
                });
            }

            console.log("[INNGEST_WEB_V2] Web generation complete for project:", projectId);
            await publish({
                channel: CHANNEL,
                topic: "generation.complete",
                data: {
                    status: "completed",
                    projectId: projectId,
                },
            });

            if (!isUnlimited && dbUser) {
                await prisma.user.update({
                    where: { id: userId },
                    data: { credits: { decrement: 1 } }
                });
            }
        } catch (error: any) {
            console.error("[INNGEST_WEB_V2_CRITICAL_FAILED]", error);
            await publish({
                channel: CHANNEL,
                topic: "generation.error",
                data: {
                    status: "failed",
                    error: error.message || "Unknown error",
                    projectId: projectId,
                },
            });
        }
    }
);
