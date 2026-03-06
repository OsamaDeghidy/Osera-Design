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

        const isAdmin = hasAdminRole || isOwnerEmail;

        if (!isAdmin) {
            return new NextResponse("Unauthorized", { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1", 10);
        const limit = parseInt(searchParams.get("limit") || "20", 10);
        const skip = (page - 1) * limit;

        const userId = searchParams.get("userId");
        const userQuery = searchParams.get("userQuery"); // Email search
        const search = searchParams.get("search"); // Project name
        const theme = searchParams.get("theme"); // Theme/Specialization
        const screenCount = searchParams.get("screenCount"); // Exactly N screens
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");

        const where: any = {};

        if (userId) {
            where.userId = userId;
        } else if (userQuery) {
            const users = await prismadb.user.findMany({
                where: { email: { contains: userQuery, mode: 'insensitive' } },
                select: { id: true }
            });
            where.userId = { in: users.map(u => u.id) };
        }

        if (search) {
            where.name = { contains: search, mode: 'insensitive' };
        }

        if (theme) {
            where.theme = { contains: theme, mode: 'insensitive' };
        }

        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) where.createdAt.gte = new Date(startDate);
            if (endDate) where.createdAt.lte = new Date(endDate);
        }

        // --- ROBUST SCREEN COUNT FILTERING ---
        if (screenCount !== null && screenCount !== "") {
            const targetCount = parseInt(screenCount, 10);

            if (targetCount === 0) {
                // Method: Find IDs of projects that HAVE at least one frame
                const framesData = await prismadb.frame.findMany({
                    select: { projectId: true }
                });

                // Get unique project IDs that have frames
                const allProjectIdsWithFrames = framesData.map(f => f.projectId);

                // CRITICAL: MongoDB/Prisma will crash with "Malformed ObjectID" if we pass 
                // a string that isn't a 24-char hex string to a field marked as @db.ObjectId.
                // We must filter out any non-ObjectID strings (like CUIDs or trash data).
                const validObjectIdRegex = /^[0-9a-fA-F]{24}$/;
                const validIds = Array.from(new Set(allProjectIdsWithFrames)).filter(id =>
                    id && validObjectIdRegex.test(id)
                );

                // We want projects NOT in this list
                if (validIds.length > 0) {
                    where.id = { notIn: validIds };
                }
            }
        }

        let [allProjects, totalCount] = await Promise.all([
            prismadb.project.findMany({
                where,
                orderBy: { createdAt: "desc" },
                // If filtering by specific non-zero count, we fetch a larger set to filter
                skip: (screenCount && screenCount !== "0") ? 0 : skip,
                take: (screenCount && screenCount !== "0") ? 1000 : limit,
                include: {
                    frames: { select: { id: true } }
                }
            }),
            prismadb.project.count({ where })
        ]);

        let filteredProjects = allProjects;
        let finalTotal = totalCount;

        // Post-fetch filtering for non-zero counts
        if (screenCount !== null && screenCount !== "" && screenCount !== "0") {
            const targetCount = parseInt(screenCount, 10);
            filteredProjects = allProjects.filter(p => p.frames.length === targetCount);

            // Adjust pagination for the filtered subset
            finalTotal = filteredProjects.length;
            filteredProjects = filteredProjects.slice(skip, skip + limit);
        }

        return NextResponse.json({
            data: filteredProjects,
            total: finalTotal,
            page,
            totalPages: Math.ceil(finalTotal / limit)
        });
    } catch (error: unknown) {
        console.error("[ADMIN_PROJECT_GET_ERROR]", error);
        let errorMessage = "An unknown error occurred.";
        if (error instanceof Error) {
            errorMessage = error.message;
        } else if (typeof error === 'string') {
            errorMessage = error;
        }
        return new NextResponse(
            JSON.stringify({
                error: "Internal Error",
                message: errorMessage,
                hint: "Ensure screenCount filter is a valid number."
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
