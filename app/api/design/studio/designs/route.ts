import { NextRequest, NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { prismadb } from "@/lib/prismadb";

export async function GET(req: NextRequest) {
    try {
        const { getUser } = getKindeServerSession();
        const user = await getUser();

        if (!user || !user.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const designs = await prismadb.studioDesign.findMany({
            where: {
                userId: user.id,
            },
            orderBy: {
                createdAt: "desc",
            },
            take: 20, // Limit to recent 20 for performance
        });

        return NextResponse.json(designs);
    } catch (error: any) {
        console.error("[STUDIO_DESIGNS_FETCH_ERROR]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
