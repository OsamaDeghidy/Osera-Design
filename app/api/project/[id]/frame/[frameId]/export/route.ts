import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateText } from "ai";
import { google as gemini } from "@ai-sdk/google";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string, frameId: string }> }
) {
    try {
        const { id: projectId, frameId } = await params;
        const { target, html } = await request.json();

        const session = await getKindeServerSession();
        const user = await session.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Verify ownership
        const project = await prisma.project.findFirst({
            where: {
                id: projectId,
                userId: user.id,
            },
        });

        if (!project) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        if (!target || !html) {
            return NextResponse.json({ error: "Missing target or html" }, { status: 400 });
        }

        let systemInstruction = "";

        if (target === "flutter") {
            systemInstruction = `
        You are an expert Flutter Developer. 
        Your task is to convert the provided Tailwind CSS HTML code into a clean, modern, and production-ready Flutter Page.
        - Use standard widgets like Container, Column, Row, Stack, Image.network, etc.
        - Preserve the color palette (hex codes) and approximate spacing from the CSS.
        - Ensure the output is a single, complete Dart class.
        - DO NOT explain anything. Only output the raw Dart code.
      `;
        } else if (target === "react-native") {
            systemInstruction = `
        You are an expert React Native Developer. 
        Your task is to convert the provided Tailwind CSS HTML code into a clean, modern React Native component using TypeScript.
        - Use standard components from 'react-native' like View, Text, Image, StyleSheet.
        - Preserve the responsive layout and colors.
        - Ensure the output is a single, complete TSX file.
        - DO NOT explain anything. Only output the raw TSX code.
      `;
        } else {
            return NextResponse.json({ error: "Invalid target" }, { status: 400 });
        }

        const { text } = await generateText({
            model: gemini("gemini-2.5-pro"),
            system: systemInstruction,
            prompt: `Translate this HTML to ${target}:\n\n${html}`,
        });

        // Clean up code markers
        let code = text.trim();
        if (code.startsWith("```")) {
            code = code.replace(/^```[a-z]*\n/i, "").replace(/\n```$/g, "");
        }

        return NextResponse.json({ code });
    } catch (error) {
        console.error("Export error:", error);
        return NextResponse.json(
            { error: "Failed to export code" },
            { status: 500 }
        );
    }
}
