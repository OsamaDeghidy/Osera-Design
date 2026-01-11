import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Fetch project WITHOUT checking userId (Ownership)
        // But check VISIBILITY
        const project = await prisma.project.findFirst({
            where: {
                id: id,
                // Allow PUBLIC or UNLISTED
                // NOTE: We assume visibility field exists. If schema update failed, this might error until applied.
                OR: [
                    { visibility: "PUBLIC" },
                    { visibility: "UNLISTED" }
                ]
            },
            include: {
                frames: true,
            },
        });

        if (!project) {
            return NextResponse.json(
                {
                    error: "Project not found or is private",
                },
                { status: 404 }
            );
        }

        return NextResponse.json(project);
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            {
                error: "Fail to fetch public project",
            },
            { status: 500 }
        );
    }
}
