import { NextResponse } from "next/server";
import { prismadb } from "@/lib/prismadb";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const { getRoles, getUser } = getKindeServerSession();
        const [roles, user] = await Promise.all([getRoles(), getUser()]);

        const hasAdminRole = roles?.some(role => role.key === 'admin');
        const isOwnerEmail = user?.email === 'oserasoft@gmail.com';

        if (!(hasAdminRole || isOwnerEmail)) {
            return new NextResponse("Unauthorized", { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1", 10);
        const limit = parseInt(searchParams.get("limit") || "20", 10);
        const skip = (page - 1) * limit;

        const status = searchParams.get("status");
        const provider = searchParams.get("provider");
        const userId = searchParams.get("userId");

        const where: any = {};
        if (status) where.status = status;
        if (provider) where.provider = provider;
        if (userId) where.userId = userId;

        const [payments, total] = await Promise.all([
            prismadb.paymentOrder.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            prismadb.paymentOrder.count({ where })
        ]);

        return NextResponse.json({
            data: payments,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error("[ADMIN_PAYMENTS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
