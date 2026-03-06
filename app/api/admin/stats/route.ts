import { NextResponse } from "next/server";
import { prismadb } from "@/lib/prismadb";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const { getPermission } = getKindeServerSession();
        // The user created a role, but we need to check if the role gives them a specific permission, 
        // or check the roles directly. Kinde's SDK checks permissions easier.
        // If "admin" is the key of the role, we could use `getRoles()` or `getPermission('admin')` depending on how it's mapped.
        // Let's use getRoles() which is safer for the "admin" role key.
        const { getRoles, getUser } = getKindeServerSession();
        const [roles, user] = await Promise.all([getRoles(), getUser()]);

        const hasAdminRole = roles?.some(role => role.key === 'admin');
        const isOwnerEmail = user?.email === 'oserasoft@gmail.com';

        const isAdmin = hasAdminRole || isOwnerEmail;

        if (!isAdmin) {
            return new NextResponse("Unauthorized", { status: 403 });
        }

        // 1. Total Users
        const totalUsers = await prismadb.user.count();

        // 2. Total Projects (AI Generations)
        const totalProjects = await prismadb.project.count();

        // 3. Total Revenue
        const paidOrders = await prismadb.paymentOrder.findMany({
            where: {
                status: "PAID",
                currency: "EGP" // Assuming main revenue is EGP for now, can separate later
            },
            select: { amount: true }
        });
        const totalRevenueEGP = paidOrders.reduce((acc, order) => acc + order.amount, 0);

        // 4. Feedback Stats
        const feedbacks = await prismadb.feedback.findMany();
        const averageRating = feedbacks.length > 0
            ? feedbacks.reduce((acc, f) => acc + f.rating, 0) / feedbacks.length
            : 0;

        return NextResponse.json({
            totalUsers,
            totalProjects,
            totalRevenueEGP,
            totalFeedback: feedbacks.length,
            averageRating: averageRating.toFixed(1)
        });
    } catch (error) {
        console.error("[ADMIN_STATS_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
