import { NextRequest, NextResponse } from "next/server";
import { prismadb } from "@/lib/prismadb";

export async function GET(req: NextRequest) {
    try {
        const categories = await prismadb.trendCategory.findMany({
            include: {
                prompts: true
            }
        });

        // If no categories exist, return empty or dummy for now (admin will populate later)
        return NextResponse.json(categories);
    } catch (error: any) {
        console.error("[STUDIO_TRENDS_FETCH_ERROR]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
