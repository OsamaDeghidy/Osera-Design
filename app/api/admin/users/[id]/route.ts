import { NextResponse } from "next/server";
import { prismadb } from "@/lib/prismadb";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
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
export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { getRoles, getUser } = getKindeServerSession();
        const [roles, currentUser] = await Promise.all([getRoles(), getUser()]);

        const hasAdminRole = roles?.some(role => role.key === 'admin');
        const isOwnerEmail = currentUser?.email === 'oserasoft@gmail.com';

        if (!(hasAdminRole || isOwnerEmail)) {
            return new NextResponse("Unauthorized", { status: 403 });
        }

        const routeParams = await params;
        const targetUserId = routeParams.id;
        const body = await req.json();
        const { title, message, type, channels } = body; // channels: ['notification', 'email']

        if (!title || !message) {
            return new NextResponse("Title and Message are required", { status: 400 });
        }

        // 1. Create In-App Notification if requested
        let notification = null;
        if (channels.includes('notification')) {
            notification = await prismadb.notification.create({
                data: {
                    userId: targetUserId,
                    title,
                    message,
                    type: type || "INFO",
                }
            });
        }

        // 2. Handle Email (Simulation since no provider found)
        if (channels.includes('email')) {
            console.log(`[SIMULATED_EMAIL] To: ${targetUserId}, Title: ${title}, Message: ${message}`);
            // Note: To enable real emails, install 'resend' or 'nodemailer' 
            // and configure your API keys in .env
        }

        return NextResponse.json({
            success: true,
            notification
        });

    } catch (error) {
        console.error("[USER_MESSAGE_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { getRoles, getUser } = getKindeServerSession();
        const [roles, currentUser] = await Promise.all([getRoles(), getUser()]);

        const hasAdminRole = roles?.some(role => role.key === 'admin');
        const isOwnerEmail = currentUser?.email === 'oserasoft@gmail.com';

        if (!(hasAdminRole || isOwnerEmail)) {
            return new NextResponse("Unauthorized", { status: 403 });
        }

        const routeParams = await params;
        const targetUserId = routeParams.id;
        const body = await req.json();
        const { credits, isUnlimited, role } = body;

        const updateData: any = {};
        if (typeof credits === "number") {
            if (credits < 0) return new NextResponse("Credits cannot be negative", { status: 400 });
            updateData.credits = credits;
        }
        if (typeof isUnlimited === "boolean") {
            updateData.isUnlimited = isUnlimited;
        }
        if (role && (role === "USER" || role === "ADMIN")) {
            updateData.role = role;
        }

        if (Object.keys(updateData).length === 0) {
            return new NextResponse("No valid update data provided", { status: 400 });
        }

        const updatedUser = await prismadb.user.update({
            where: { id: targetUserId },
            data: updateData
        });

        console.log(`[ADMIN_CREDIT_UPDATE] User ${targetUserId} updated: ${JSON.stringify(updateData)} by ${currentUser?.email}`);

        return NextResponse.json(updatedUser);

    } catch (error) {
        console.error("[USER_UPDATE_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
