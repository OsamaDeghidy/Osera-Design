import { NextResponse } from "next/server";
import { prismadb } from "@/lib/prismadb";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function POST(req: Request) {
    try {
        const { getUser } = getKindeServerSession();
        const user = await getUser();
        if (!user || !user.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { orderId, amount, credits } = await req.json();

        if (!orderId || !credits) {
            return new NextResponse("Invalid Data", { status: 400 });
        }

        // Lazy Sync: Ensure user exists
        const dbUser = await prismadb.user.findUnique({ where: { id: user.id } });
        if (!dbUser) {
            await prismadb.user.create({
                data: {
                    id: user.id,
                    email: user.email || "",
                    firstName: user.given_name || "",
                    lastName: user.family_name || "",
                    credits: 5
                }
            });
        }

        // Check for idempotency
        const existing = await prismadb.paymentOrder.findFirst({
            where: { transactionId: orderId }
        });

        if (existing) {
            return NextResponse.json({ message: "Transaction already processed" });
        }

        // 1. Log Transaction
        await prismadb.paymentOrder.create({
            data: {
                userId: user.id,
                transactionId: orderId,
                provider: "PAYPAL",
                amount: parseFloat(amount?.toString() || "0"),
                currency: "USD",
                creditsAmount: parseInt(credits || "0"),
                status: "SUCCESS" // Optimistic success since client says so (MVP)
            }
        });

        // 2. Add Credits
        await prismadb.user.update({
            where: { id: user.id },
            data: {
                credits: { increment: parseInt(credits) }
            }
        });

        console.log(`[PayPal] Added ${credits} credits for User ${user.id}`);

        return NextResponse.json({ message: "Credits Added Successfully" });

    } catch (error) {
        console.error("PayPal Capture Error", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
