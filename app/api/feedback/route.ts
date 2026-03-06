import { NextResponse } from "next/server";
import { prismadb } from "@/lib/prismadb";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        const { getUser } = getKindeServerSession();
        const user = await getUser();

        if (!user || !user.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { rating, comment, projectId } = body;

        if (!rating || !projectId) {
            return new NextResponse("Missing rating or projectId", { status: 400 });
        }

        const feedback = await prismadb.feedback.create({
            data: {
                userId: user.id,
                projectId,
                rating,
                comment
            }
        });

        return NextResponse.json(feedback);
    } catch (error) {
        console.error("[FEEDBACK_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function GET() {
    try {
        const { getRoles, getUser } = getKindeServerSession();
        const [roles, user] = await Promise.all([getRoles(), getUser()]);

        const hasAdminRole = roles?.some(role => role.key === 'admin');
        const isOwnerEmail = user?.email === 'oserasoft@gmail.com';

        const isAdmin = hasAdminRole || isOwnerEmail;

        if (!isAdmin) {
            return new NextResponse("Unauthorized", { status: 403 });
        }

        const feedbacks = await prismadb.feedback.findMany({
            orderBy: {
                createdAt: "desc"
            },
            take: 20
        });

        return NextResponse.json(feedbacks);
    } catch (error) {
        console.error("[ADMIN_FEEDBACK_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
