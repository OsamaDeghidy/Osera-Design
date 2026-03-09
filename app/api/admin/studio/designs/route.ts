import { NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { prismadb } from "@/lib/prismadb";

export async function GET() {
    try {
        const { getUser, getRoles } = getKindeServerSession();
        const [user, roles] = await Promise.all([getUser(), getRoles()]);

        if (!user) return new NextResponse("Unauthorized", { status: 401 });

        const dbUser = await prismadb.user.findUnique({ where: { id: user.id } });
        const hasAdminRole = roles?.some(role => role.key === 'admin');
        const isOwnerEmail = user?.email === 'oserasoft@gmail.com';
        const isDbAdmin = dbUser?.role === "ADMIN";

        if (!(hasAdminRole || isOwnerEmail || isDbAdmin)) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const designs = await prismadb.studioDesign.findMany({
            orderBy: {
                createdAt: "desc"
            },
            take: 200
        });

        console.log(`[ADMIN_GALLERY] Found ${designs.length} designs`);

        return NextResponse.json(designs);
    } catch (error) {
        console.error("[ADMIN_STUDIO_DESIGNS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const { getUser, getRoles } = getKindeServerSession();
        const [user, roles] = await Promise.all([getUser(), getRoles()]);

        if (!user) return new NextResponse("Unauthorized", { status: 401 });

        const dbUser = await prismadb.user.findUnique({ where: { id: user.id } });
        const hasAdminRole = roles?.some(role => role.key === 'admin');
        const isOwnerEmail = user?.email === 'oserasoft@gmail.com';
        const isDbAdmin = dbUser?.role === "ADMIN";

        if (!(hasAdminRole || isOwnerEmail || isDbAdmin)) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const body = await req.json();
        const { id, isPublic } = body;

        if (!id) {
            return new NextResponse("Missing ID", { status: 400 });
        }

        const design = await prismadb.studioDesign.update({
            where: { id },
            data: { isPublic }
        });

        return NextResponse.json(design);
    } catch (error) {
        console.error("[ADMIN_STUDIO_DESIGNS_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
