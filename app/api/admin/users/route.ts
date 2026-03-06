import { NextResponse } from "next/server";
import { prismadb } from "@/lib/prismadb";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const { getRoles, getUser } = getKindeServerSession();
        const [roles, user] = await Promise.all([getRoles(), getUser()]);

        if (!user) return new NextResponse("Unauthorized", { status: 401 });

        // Check DB Role
        const dbUser = await prismadb.user.findUnique({
            where: { id: user.id },
            select: { role: true }
        });

        const hasAdminRole = roles?.some(role => role.key === 'admin');
        const isOwnerEmail = user?.email === 'oserasoft@gmail.com';
        const isDbAdmin = dbUser?.role === "ADMIN";

        const isAdmin = hasAdminRole || isOwnerEmail || isDbAdmin;

        if (!isAdmin) {
            return new NextResponse("Unauthorized", { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const search = searchParams.get("search") || "";
        const page = parseInt(searchParams.get("page") || "1", 10);
        const limit = parseInt(searchParams.get("limit") || "20", 10);
        const skip = (page - 1) * limit;

        const where: any = {};
        if (search) {
            where.OR = [
                { email: { contains: search, mode: "insensitive" } },
                { firstName: { contains: search, mode: "insensitive" } }
            ];
        }

        const [users, total] = await Promise.all([
            prismadb.user.findMany({
                where,
                orderBy: {
                    createdAt: "desc"
                },
                skip,
                take: limit
            }),
            prismadb.user.count({ where })
        ]);

        return NextResponse.json({
            data: users,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error("[ADMIN_USERS_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
