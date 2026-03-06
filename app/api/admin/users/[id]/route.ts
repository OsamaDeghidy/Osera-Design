import { NextResponse } from "next/server";
import { prismadb } from "@/lib/prismadb";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const routeParams = await params;
        const userId = routeParams.id;

        const { getRoles, getUser } = getKindeServerSession();
        const [roles, user] = await Promise.all([getRoles(), getUser()]);

        const hasAdminRole = roles?.some(role => role.key === 'admin');
        const isOwnerEmail = user?.email === 'oserasoft@gmail.com';

        const isAdmin = hasAdminRole || isOwnerEmail;

        if (!isAdmin) {
            return new NextResponse("Unauthorized", { status: 403 });
        }

        if (!userId) {
            return new NextResponse("User ID is required", { status: 400 });
        }

        const targetUser = await prismadb.user.findUnique({
            where: {
                id: userId
            }
        });

        if (!targetUser) {
            return new NextResponse("User Not Found", { status: 404 });
        }

        const projects = await prismadb.project.findMany({
            where: {
                userId: userId
            },
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                frames: {
                    select: {
                        id: true,
                    }
                }
            }
        });

        const feedback = await prismadb.feedback.findMany({
            where: {
                userId: userId
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json({
            user: targetUser,
            projects,
            feedback
        });

    } catch (error) {
        console.error("[USER_ACTIVITY_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
