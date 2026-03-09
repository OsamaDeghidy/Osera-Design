import { NextResponse } from "next/server";
import { prismadb } from "@/lib/prismadb";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const publicDesigns = await prismadb.studioDesign.findMany({
            where: {
                isPublic: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Manually fetch user details for each design to avoid relation mismatch issues
        const designsWithUsers = await Promise.all(publicDesigns.map(async (design: any) => {
            const user = await prismadb.user.findUnique({
                where: { id: design.userId },
                select: { firstName: true, lastName: true }
            });
            return {
                ...design,
                user: user || { firstName: "Anonymous", lastName: "" }
            };
        }));

        return NextResponse.json(designsWithUsers);
    } catch (error) {
        console.error("[STUDIO_GALLERY_GET_ERROR]", error);
        return new NextResponse(JSON.stringify({
            error: "Internal Error",
            message: error instanceof Error ? error.message : String(error)
        }), { status: 500 });
    }
}
