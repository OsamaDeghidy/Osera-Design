import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { prismadb } from "@/lib/prismadb";
import { NextResponse } from "next/server";
import { generateProjectName } from "@/app/action/action";
import { inngest } from "@/inngest/client";

export async function GET() {
  try {
    const session = await getKindeServerSession();
    const user = await session.getUser();

    if (!user) throw new Error("Unauthorized");

    const projects = await prismadb.project.findMany({
      where: {
        userId: user.id,
      },
      take: 10,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: projects,
    });
  } catch (error) {
    console.log("Error occured ", error);
    return NextResponse.json(
      {
        error: "Failed to fetch projects",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, imageBase64, mode, language, projectType } = body;
    console.log("[PROJECT_POST] Received request for type:", projectType);

    const session = await getKindeServerSession();
    const user = await session.getUser();

    if (!user) {
      console.warn("[PROJECT_POST] Unauthorized access attempt.");
      throw new Error("Unauthorized");
    }
    if (!prompt) {
      console.warn("[PROJECT_POST] Missing prompt.");
      throw new Error("Missing Prompt");
    }

    const userId = user.id;
    console.log("[PROJECT_POST] Generating project name for prompt:", prompt.substring(0, 30));
    const projectName = await generateProjectName(prompt);

    console.log("[PROJECT_POST] Creating project in DB for type:", projectType);
    // Explicitly cast to any to bypass the lint error if it's a generator sync issue, 
    // but ensure the values are correct per schema.
    const project = await (prismadb.project as any).create({
      data: {
        userId,
        name: projectName,
        type: projectType === "WEB" ? "WEB" : "MOBILE",
      },
    });

    console.log("[PROJECT_POST] Project created with ID:", project.id);
    try {
      if (projectType === "WEB") {
        console.log("[PROJECT_POST] Sending ui/generate.web event...");
        await inngest.send({
          name: "ui/generate.web",
          data: {
            userId,
            projectId: project.id,
            prompt: prompt || "Generate a responsive Web UI based on the image",
            imageBase64: imageBase64,
            mode: mode || "creative",
            language: language || "en",
          },
        });
        console.log("[PROJECT_POST] Inngest event ui/generate.web sent.");
      } else {
        console.log("[PROJECT_POST] Sending ui/generate.screens event...");
        await inngest.send({
          name: "ui/generate.screens",
          data: {
            userId,
            projectId: project.id,
            prompt: prompt || "Generate a UI based on the image",
            imageBase64: imageBase64,
            mode: mode || "creative",
            language: language || "en",
          },
        });
        console.log("[PROJECT_POST] Inngest event ui/generate.screens sent.");
      }
    } catch (inngestError) {
      console.error("[PROJECT_POST] Inngest send error:", inngestError);
      // We don't throw here to avoid failing project creation if only Inngest trigger fails
    }

    return NextResponse.json({
      success: true,
      data: project,
    });
  } catch (error: any) {
    console.error("[PROJECT_POST_FATAL_ERROR]", error);
    return NextResponse.json(
      {
        error: "Failed to create project",
        message: error?.message || "Unknown error",
        stack: process.env.NODE_ENV === "development" ? error?.stack : undefined
      },
      { status: 500 }
    );
  }
}
