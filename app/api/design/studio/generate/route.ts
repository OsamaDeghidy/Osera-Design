import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { prismadb } from "@/lib/prismadb";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");

export const maxDuration = 60; // Set timeout to 60 seconds (Pro tier)

export async function POST(req: Request) {
    try {
        const { getUser } = getKindeServerSession();
        const user = await getUser();

        if (!user || !user.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const {
            prompt,
            aspectRatio = "1:1",
            negativePrompt = "",
            modelType = "fast",
            imageBase64, // Can be string or string[]
            projectLink
        } = await req.json();

        if (!prompt) {
            return new NextResponse("Prompt is required", { status: 400 });
        }

        // --- Credit Check (2 Credits per generation) ---
        const dbUser = await prismadb.user.findUnique({ where: { id: user.id } });
        if (!dbUser) {
            return new NextResponse("User record not found", { status: 404 });
        }

        const cost = 2;
        if (dbUser.credits < cost && !dbUser.isUnlimited) {
            return new NextResponse(`Insufficient credits. Each studio generation costs ${cost} credits.`, { status: 403 });
        }

        // --- Deep Project Context Fetching & Visual Style Extraction ---
        let projectContext = "";
        let visualStyle = "";
        if (projectLink && projectLink.includes("/view/")) {
            try {
                const projectId = projectLink.split("/view/")[1];
                if (projectId && projectId.length >= 24) {
                    const project = await prismadb.project.findUnique({
                        where: { id: projectId },
                        include: { frames: { take: 3, orderBy: { createdAt: 'asc' } } }
                    });

                    if (project) {
                        const p = project as any;
                        // Cleaning: Remove known platform boilerplate that might confuse the stylist
                        const framesData = (p.frames || [])
                            .map((f: any) => f.htmlContent)
                            .join("\n\n")
                            .replace(/Osara AI|Design Studio|Project Editor|Logout|Account|Pricing|Dashboard|osara-ai\.com/gi, "[BUILDER_ELEMENT]");

                        // Extract Deep Visual Style using Gemini 1.5 Flash
                        if (framesData) {
                            const flashModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
                            const extractionPrompt = `Act as a senior UI/UX designer. Analyze the following HTML code snippets specifically for the USER'S PROJECT content. 
                            
                            CRITICAL RULES:
                            1. IGNORE any text related to the "Osara AI" platform itself (e.g., "Pricing", "Dashboard", "Logout", "Studio", "Editor").
                            2. FOCUS ONLY on the interior UI of the app being developed. Extract Hex codes and component styles.
                            
                            HTML Snippets: ${framesData.substring(0, 15000)}
                            
                            Output: Provide a dense, comma-separated list of visual style keywords only.`;

                            const extractionResult = await flashModel.generateContent(extractionPrompt);
                            visualStyle = extractionResult.response.text();
                        }

                        projectContext = `\n[MANDATORY BRAND DNA]\nProject Name: ${p.name}\nDesign Language: ${visualStyle}\nFramework: ${p.type}\nINSTRUCTION: Your design MUST be a perfect visual extension of the "Design Language" above. Use the exact color palette and UI aesthetic detected. Do NOT include any platform elements like 'Osara AI' logos.`;
                    }
                }
            } catch (err) {
                console.error("[STUDIO_CONTEXT_ERROR]", err);
            }
        }


        // Using Nano Banana Pro for high-fidelity graphic design posters
        const modelId = "nano-banana-pro-preview";

        console.log(`[STUDIO] generating poster using ${modelId} for user: ${user.id}`);

        const model = genAI.getGenerativeModel({ model: modelId });

        let combinedPrompt = `Task: Professional Brand Identity Poster. 
Instructions: Create a high-fidelity marketing poster that is an exact VISUAL EXTENSION of the project UI. 
Subject: ${prompt}
[MANDATORY BRAND DNA]
${visualStyle}
${projectContext}

Technical Specs:
- Lighting: Matches the project's color palette (${visualStyle.match(/#[0-9A-Fa-f]{6}/g)?.join(", ") || "extracted colors"}).
- Layout: Balanced, high-tech, commercial grade.
- Style: Sharp, hyper-realistic, professional lighting, photorealistic materials but UI-focused.
- NO HALLUCINATIONS: Do not add unrelated people, generic stock settings, or colors not mentioned in the DNA.

Aspect Ratio: ${aspectRatio}`;

        if (negativePrompt) {
            combinedPrompt += `\n\nAvoid these elements: ${negativePrompt}, generic stock photos, unrelated people, cluttered backgrounds, low quality, distorted text, messy layout, mismatched colors.`;
        } else {
            combinedPrompt += `\n\nAvoid: generic stock photos, unrelated people, cluttered backgrounds, low quality, distorted text, messy layout, mismatched colors.`;
        }

        const parts: any[] = [{ text: combinedPrompt }];

        // --- Handle Multi-Image Uploads ---
        if (imageBase64) {
            const images = Array.isArray(imageBase64) ? imageBase64 : [imageBase64];

            for (const imgBase64 of images) {
                if (!imgBase64) continue;
                const [mimePart, base64Data] = imgBase64.split(";base64,");
                const mimeType = mimePart.split(":")[1] || "image/png";
                parts.push({
                    inlineData: {
                        data: base64Data,
                        mimeType: mimeType
                    }
                });
            }
        }

        const result = await model.generateContent({
            contents: [{ role: "user", parts }],
            // Add safety settings if needed, but for design we usually want standard
        });

        const response = await result.response;
        console.log("[STUDIO_RESPONSE_CANDIDATES]", response.candidates?.length);

        const candidate = response.candidates?.[0];
        // Nano Banana or Gemini 3.x models might return image in different part structures
        // It often includes a "thought" part and then the actual image part.
        const imagePart = candidate?.content?.parts?.find((p: any) => (p.inlineData || p.data) && !p.thought) as any;

        if (!imagePart) {
            console.error("[STUDIO] Failed to get image data from response. Structure:", JSON.stringify(response, null, 2));
            throw new Error("The AI didn't return an image. Try refining your prompt.");
        }

        let base64Image = "";
        const imageSource = imagePart.inlineData || imagePart.data;

        if (imageSource && imageSource.data) {
            const mimeType = imageSource.mimeType || "image/png";
            base64Image = `data:${mimeType};base64,${imageSource.data}`;
        } else {
            console.error("[STUDIO] Image part found but data is missing", imagePart);
            throw new Error("AI returned an empty image part.");
        }

        // --- Persistence: Save to Works ---
        let savedId = "";
        try {
            const design = await prismadb.studioDesign.create({
                data: {
                    userId: user.id,
                    prompt: prompt,
                    imageUrl: base64Image,
                    aspectRatio: aspectRatio,
                }
            });
            savedId = design.id;
            console.log("[STUDIO] Design saved to database for user:", user.id);
        } catch (saveErr) {
            console.error("[STUDIO_SAVE_ERROR] Failed to save design:", saveErr);
        }

        // --- Deduct Credits after success ---
        if (!dbUser.isUnlimited) {
            await prismadb.user.update({
                where: { id: user.id },
                data: { credits: { decrement: cost } }
            });
        }

        return NextResponse.json({
            url: base64Image,
            id: savedId,
            success: true
        });

    } catch (error: any) {
        console.error("[STUDIO_GENERATE_ERROR]", error);
        return new NextResponse(error.message || "Internal Server Error", { status: 500 });
    }
}
