import { NextResponse } from "next/server";
import { prismadb } from "@/lib/prismadb";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { subDays, format } from "date-fns";

export const dynamic = "force-dynamic";

export async function GET() {
    console.time("stats_api_total");
    try {
        const { getRoles, getUser } = getKindeServerSession();
        const [roles, user] = await Promise.all([getRoles(), getUser()]);

        const hasAdminRole = roles?.some(role => role.key === 'admin');
        const isOwnerEmail = user?.email === 'oserasoft@gmail.com';

        const isAdmin = hasAdminRole || isOwnerEmail;

        if (!isAdmin) {
            return new NextResponse("Unauthorized", { status: 403 });
        }

        console.time("db_parallel_queries");
        const [
            totalUsers,
            totalProjects,
            paidOrders,
            allFrames,
            recentProjects,
            feedbacks,
            projectsList
        ] = await Promise.all([
            prismadb.user.count(),
            prismadb.project.count(),
            prismadb.paymentOrder.findMany({
                where: {
                    status: { in: ["PAID", "SUCCESS"] }
                },
                select: { amount: true, currency: true }
            }),
            prismadb.frame.findMany({
                select: { projectId: true }
            }),
            prismadb.project.findMany({
                where: {
                    createdAt: { gte: subDays(new Date(), 30) }
                },
                select: { createdAt: true }
            }),
            prismadb.feedback.findMany(),
            prismadb.project.findMany({
                select: { id: true }
            })
        ]);
        console.timeEnd("db_parallel_queries");

        // 1. Revenue Calculation
        const totalRevenueEGP = paidOrders
            .filter((o: any) => o.currency === "EGP")
            .reduce((acc: number, order: any) => acc + order.amount, 0);

        const totalRevenueUSD = paidOrders
            .filter((o: any) => o.currency === "USD")
            .reduce((acc: number, order: any) => acc + order.amount, 0);

        // 2. Project Size Breakdown (Robust manual counting)
        const frameCounts: Record<string, number> = {};
        projectsList.forEach((p: any) => {
            frameCounts[p.id] = 0;
        });

        allFrames.forEach((f: any) => {
            if (frameCounts[f.projectId] !== undefined) {
                frameCounts[f.projectId]++;
            }
        });

        const projectBreakdown = {
            '0_screens': 0,
            '1_screen': 0,
            '2_screens': 0,
            '3_screens': 0,
            '4_screens': 0,
            '5_screens': 0,
            '6_to_9_screens': 0,
            '10_screens': 0,
            'gt_10_screens': 0,
        };

        Object.values(frameCounts).forEach(count => {
            if (count === 0) projectBreakdown['0_screens']++;
            else if (count === 1) projectBreakdown['1_screen']++;
            else if (count === 2) projectBreakdown['2_screens']++;
            else if (count === 3) projectBreakdown['3_screens']++;
            else if (count === 4) projectBreakdown['4_screens']++;
            else if (count === 5) projectBreakdown['5_screens']++;
            else if (count >= 6 && count <= 9) projectBreakdown['6_to_9_screens']++;
            else if (count === 10) projectBreakdown['10_screens']++;
            else if (count > 10) projectBreakdown['gt_10_screens']++;
        });

        // 3. Daily Project Stats (Last 30 Days)
        const dailyStatsMap = new Map();
        for (let i = 0; i < 30; i++) {
            const dateStr = format(subDays(new Date(), i), 'yyyy-MM-dd');
            dailyStatsMap.set(dateStr, 0);
        }

        recentProjects.forEach((p: any) => {
            const dateStr = format(p.createdAt, 'yyyy-MM-dd');
            if (dailyStatsMap.has(dateStr)) {
                dailyStatsMap.set(dateStr, dailyStatsMap.get(dateStr) + 1);
            }
        });

        const dailyData = Array.from(dailyStatsMap.entries())
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => a.date.localeCompare(b.date));

        // 4. Feedback Stats
        const averageRating = feedbacks.length > 0
            ? feedbacks.reduce((acc: number, f: any) => acc + f.rating, 0) / feedbacks.length
            : 0;

        const feedbackDistribution = {
            1: feedbacks.filter((f: any) => f.rating === 1).length,
            2: feedbacks.filter((f: any) => f.rating === 2).length,
            3: feedbacks.filter((f: any) => f.rating === 3).length,
            4: feedbacks.filter((f: any) => f.rating === 4).length,
            5: feedbacks.filter((f: any) => f.rating === 5).length,
        };

        console.timeEnd("stats_api_total");
        return NextResponse.json({
            totalUsers,
            totalProjects,
            totalRevenueEGP,
            totalRevenueUSD,
            projectBreakdown,
            dailyData,
            feedbackDistribution,
            totalFeedback: feedbacks.length,
            averageRating: averageRating.toFixed(1)
        });
    } catch (error) {
        console.timeEnd("stats_api_total");
        console.error("[ADMIN_STATS_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
