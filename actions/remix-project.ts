"use server";

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function remixProject(projectId: string) {
    const session = await getKindeServerSession();
    const user = await session.getUser();

    if (!user) {
        throw new Error("Unauthorized");
    }

    // 1. Fetch the Original Project
    const originalProject = await prisma.project.findUnique({
        where: { id: projectId },
        include: { frames: true },
    });

    if (!originalProject) {
        throw new Error("Project not found");
    }

    // 2. Security Check: Is it Public or Unlisted?
    // Or if I own it, I can duplicate it.
    const isOwner = originalProject.userId === user.id;
    const isPublic = originalProject.visibility === "PUBLIC" || originalProject.visibility === "UNLISTED";

    // Note: We use string comparison for visibility just in case the Enum type isn't fully generated yet
    if (!isPublic && !isOwner) {
        throw new Error("This project is private and cannot be remixed.");
    }

    // 3. Create the New Project (Clone)
    const newProject = await prisma.project.create({
        data: {
            userId: user.id,
            name: `${originalProject.name} (Remix)`,
            // prompt: originalProject.prompt || "", // Prompt not in schema yet
            // If 'prompt' isn't on Project model yet, we might skip it or it might be in the frames triggers. 
            // Based on schema view earlier, 'prompt' wasn't in Project top level, but let's check Frame data.
            // Wait, schema in Step 1334 shows `name`, `theme`, `thumbnail`. No `prompt` column on Project.
            // The prompt is usually passed to Inngest. We'll skip `prompt` field if it doesn't exist.

            theme: originalProject.theme,
            thumbnail: originalProject.thumbnail,
            forkedFromId: originalProject.id, // Attribution Link

            // Clone Frames
            frames: {
                create: originalProject.frames.map((frame) => ({
                    title: frame.title,
                    htmlContent: frame.htmlContent,
                })),
            },
        },
    });

    // 4. Redirect to the new Project
    redirect(`/project/${newProject.id}`);
}
