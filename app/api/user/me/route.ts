import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextResponse } from "next/server";
import { prismadb } from "@/lib/prismadb";

export async function GET() {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user || !user.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    let dbUser = await prismadb.user.findUnique({
        where: {
            id: user.id,
        },
        select: {
            credits: true,
            firstName: true,
            lastName: true,
            email: true
        }
    });

    if (!dbUser) {
        // Fallback: Create user if not found (Lazy Sync)
        try {
            dbUser = await prismadb.user.create({
                data: {
                    id: user.id,
                    email: user.email || "",
                    firstName: user.given_name || "",
                    lastName: user.family_name || ""
                }
            });
        } catch (e) {
            console.error("Failed to lazy-create user", e);
            return new NextResponse("User sync failed", { status: 500 });
        }
    }

    return NextResponse.json(dbUser);
}
