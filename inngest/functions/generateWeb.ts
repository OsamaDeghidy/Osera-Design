import { generateObject, generateText } from "ai";
import { inngest } from "../client";
import { z } from "zod";
import { gemini } from "@/lib/gemini";
import { FrameType } from "@/types/project";
import prisma from "@/lib/prisma";
import { prismadb } from "@/lib/prismadb";
import { BASE_VARIABLES, THEME_LIST } from "@/lib/themes";

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
                        "A dense, high-fidelity visual directive for a DESKTOP WEB layout. Describe the responsive structure, header/footer layout, desktop-specific components (e.g., 'Multi-column grid', 'Sticky sidebar', 'Hero section with split content'), and how it should look on wide screens."
                    ),
            })
        )
        .min(1)
        .max(4),
});

export const generateWeb = inngest.createFunction(
    { id: "generate-ui-web" },
    { event: "ui/generate.web" },
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
        const CHANNEL = `user:${userId}`;
        const isExistingGeneration = Array.isArray(frames) && frames.length > 0;

        // 1. Check Credits
        const dbUser = await prismadb.user.findUnique({ where: { id: userId } });
        if (!dbUser) {
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
                model: gemini("gemini-2.5-pro"), // Planner needs deep reasoning
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

            return { ...object, themeToUse };
        });

        // 3. Agent 2: The Coder (Execution) - Using cheaper, high-rate model
        const generatedFrames: typeof frames = isExistingGeneration ? [...frames] : [];

        for (let i = 0; i < analysis.screens.length; i++) {
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

                // --- AGENT 2: The Designer ---
                const designPrompt = `
                You are a Senior Web Designer (Awwwards-level). 
                Your job is to write a highly detailed design specification for the "Developer" to implement.
                
                Page Name: ${pagePlan.name}
                Purpose: ${pagePlan.purpose}
                Architect's Vision: ${pagePlan.visualDescription}
                
                Write a 4-5 paragraph blueprint detailing:
                1. The exact layout structure (e.g. Asymmetric split hero, 3-column feature grid).
                2. Spacing guidelines (e.g., generous padding py-24, gap-12) to ensure a premium, uncrowded feel.
                3. Typography styling (e.g., oversized tracking-tight headings, muted readable body text).
                4. Interactive & Premium elements (e.g., glassmorphic navbars, subtle hover scale transformations, modern soft shadows).
                5. Contextual Image Keywords (Specify exactly what subjects the images should have, e.g. "modern office, technology").
                
                Make the specification extremely detailed so the Developer writes premium Tailwind code.
                `;

                const designResult = await generateText({
                    model: gemini("gemini-2.5-pro"),
                    system: "Focus entirely on creating a premium, modern web aesthetic specification.",
                    messages: [{ role: "user", content: designPrompt }],
                });
                const designSpec = designResult.text;


                // --- AGENT 3: The Developer ---
                let generationSystemInstruction = `
        You are an elite Frontend Web Developer. Your task is strictly to generate pristine, production-ready raw HTML using Tailwind CSS based on the Senior Designer's specification.
        
        CRITICAL WEB DESIGN RULES (MUST FOLLOW):
        - Layout: Design for Desktop elegance (min-w-[1024px] visually). Use complex Flexbox/CSS Grids. Build sections with <section>, <header>, <footer>.
        - Spacing: Give elements breathing room (use larger padding/margins like py-24, px-8, gap-12).
        - Colors: You MUST strictly use standard Tailwind color classes mapped to our theme: 'primary', 'secondary', 'muted', 'accent', 'destructive', 'card', 'popover', 'background', 'foreground', 'border', 'input', 'ring'. Example: "bg-primary text-primary-foreground", "bg-card text-card-foreground", "border-border".
        - Images: You MUST use relevant, contextual placeholder images from LoremFlickr using this format: "https://loremflickr.com/1200/800/{keyword1},{keyword2}?lock={randomNumber}" (replace keywords based on the page context, e.g., business,office. DO NOT use spaces in keywords).
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
                    model: gemini("gemini-2.5-flash"), // The Coder - Upgraded to flash for better DOM building
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

                let finalHtml = result.text ?? "";
                const match = finalHtml.match(/<div[\s\S]*<\/div>/);
                finalHtml = match ? match[0] : finalHtml;
                finalHtml = finalHtml.replace(/```/g, "");

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

        await publish({
            channel: CHANNEL,
            topic: "generation.complete",
            data: {
                status: "completed",
                projectId: projectId,
            },
        });

        if (!isUnlimited && dbUser) {
            await prismadb.user.update({
                where: { id: userId },
                data: { credits: { decrement: 1 } }
            });
        }
    }
);
