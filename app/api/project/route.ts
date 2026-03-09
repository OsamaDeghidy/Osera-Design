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
    const rawBody = await request.text();
    console.log("[PROJECT_POST] Raw body received:", rawBody.substring(0, 100));

    let body;
    try {
      body = JSON.parse(rawBody);
    } catch (e) {
      console.error("[PROJECT_POST] Failed to parse JSON body");
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { prompt, imageBase64, mode, language, projectType } = body;
    console.log("[PROJECT_POST] Parsed request - Type:", projectType, "Lang:", language);

    const session = await getKindeServerSession();
    const user = await session.getUser();

    if (!user) {
      console.warn("[PROJECT_POST] Unauthorized access attempt.");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!prompt) {
      console.warn("[PROJECT_POST] Missing prompt.");
      return NextResponse.json({ error: "Missing Prompt" }, { status: 400 });
    }

    const userId = user.id;
    console.log("[PROJECT_POST] Generating project name...");
    const projectName = await generateProjectName(prompt);

    const finalType = (projectType === "WEB" || projectType === "web") ? "WEB" : "MOBILE";
    console.log("[PROJECT_POST] Creating project in DB. Final Type:", finalType);

    let project;
    try {
      project = await (prismadb.project as any).create({
        data: {
          userId,
          name: projectName,
          type: finalType,
        },
      });
      console.log("[PROJECT_POST] Project DB Success. ID:", project.id);
    } catch (dbError: any) {
      console.error("[PROJECT_POST] DB Creation Error:", dbError);
      return NextResponse.json({ error: "DB Error", details: dbError.message }, { status: 500 });
    }

    try {
      console.log("[PROJECT_POST] Sending Inngest event for type:", finalType);
      const eventName = finalType === "WEB" ? "ui/gen-web" : "ui/generate.screens";

      await inngest.send({
        name: eventName,
        data: {
          userId,
          projectId: project.id,
          prompt: prompt,
          imageBase64: imageBase64,
          mode: mode || "creative",
          language: language || "en",
        },
      });
      console.log("[PROJECT_POST] Inngest send successful:", eventName);
    } catch (inngestError: any) {
      console.error("[PROJECT_POST] Inngest error (Non-fatal):", inngestError);
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
        message: error?.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
