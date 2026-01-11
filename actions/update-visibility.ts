"use server";

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateProjectVisibility(
    projectId: string,
    visibility: "PRIVATE" | "PUBLIC" | "UNLISTED"
) {
    const session = await getKindeServerSession();
    const user = await session.getUser();

    if (!user) {
        throw new Error("Unauthorized");
    }

    // Verify ownership
    const project = await prisma.project.findUnique({
        where: { id: projectId },
    });

    if (!project || project.userId !== user.id) {
        throw new Error("Unauthorized or Project not found");
    }

    await prisma.project.update({
        where: { id: projectId },
        data: { visibility },
    });

    revalidatePath(`/project/${projectId}`);
    revalidatePath("/gallery");
}
