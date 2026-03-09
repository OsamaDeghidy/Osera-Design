import { NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { prismadb } from "@/lib/prismadb";

// Helper to check admin
async function checkAdmin() {
    const { getRoles } = getKindeServerSession();
    const roles = await getRoles();
    return roles?.some(role => role.key === 'admin');
}

export async function GET() {
    try {
        if (!await checkAdmin()) return new NextResponse("Unauthorized", { status: 401 });

        const categories = await prismadb.trendCategory.findMany({
            include: {
                prompts: true
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        return NextResponse.json(categories);
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        if (!await checkAdmin()) return new NextResponse("Unauthorized", { status: 401 });

        const body = await req.json();
        const { type, ...data } = body;

        if (type === "CATEGORY") {
            const category = await prismadb.trendCategory.create({
                data: {
                    nameAr: data.nameAr,
                    nameEn: data.nameEn
                }
            });
            return NextResponse.json(category);
        }

        if (type === "PROMPT") {
            const prompt = await prismadb.trendPrompt.create({
                data: {
                    titleAr: data.titleAr,
                    titleEn: data.titleEn,
                    prompt: data.prompt,
                    categoryId: data.categoryId,
                    imagePreview: data.imagePreview
                }
            });
            return NextResponse.json(prompt);
        }

        return new NextResponse("Invalid Type", { status: 400 });
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        if (!await checkAdmin()) return new NextResponse("Unauthorized", { status: 401 });

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        const type = searchParams.get("type");

        if (!id || !type) return new NextResponse("Missing params", { status: 400 });

        if (type === "CATEGORY") {
            await prismadb.trendCategory.delete({ where: { id } });
        } else {
            await prismadb.trendPrompt.delete({ where: { id } });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}
