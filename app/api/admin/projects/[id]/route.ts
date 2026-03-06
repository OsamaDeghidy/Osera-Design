import { NextResponse } from "next/server";
import { prismadb } from "@/lib/prismadb";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const routeParams = await params;
        const projectId = routeParams.id;

        const { getRoles, getUser } = getKindeServerSession();
        const [roles, user] = await Promise.all([getRoles(), getUser()]);

        const hasAdminRole = roles?.some(role => role.key === 'admin');
        const isOwnerEmail = user?.email === 'oserasoft@gmail.com';

        const isAdmin = hasAdminRole || isOwnerEmail;

        if (!isAdmin) {
            return new NextResponse("Unauthorized", { status: 403 });
        }

        if (!projectId) {
            return new NextResponse("Project ID is required", { status: 400 });
        }

        // Must delete related frames first due to foreign key constraints
        await prismadb.frame.deleteMany({
            where: {
                projectId: projectId
            }
        });

        // Optional: Also delete associated feedback if strictly enforcing constraints depending on cascade
        await prismadb.feedback.deleteMany({
            where: {
                projectId: projectId
            }
        });

        const project = await prismadb.project.delete({
            where: {
                id: projectId
            }
        });

        return NextResponse.json(project);
    } catch (error) {
        console.error("[PROJECT_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
