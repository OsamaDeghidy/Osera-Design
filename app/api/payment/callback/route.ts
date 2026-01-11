import { NextResponse } from "next/server";
import { verifyHmac } from "@/lib/paymob";

// Paymob sends GET for Transaction Callbacks (Redirection) and POST for Transaction Response (Webhook)
// We will handle GET to show success/fail page to user.
import { prismadb } from "@/lib/prismadb";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const success = searchParams.get("success");
    const hmac = searchParams.get("hmac");
    const id = searchParams.get("id");

    // In a real app, we MUST verify HMAC here to prevent fraud.
    // For this POC, we trust the callback but skipping verification for speed as requested.
    // (We should uncomment the verification logic later).

    if (success === "true") {
        try {
            // Find the order in our DB using the Paymob Order ID
            // Note: 'id' param from callback is usually the Transaction ID, but sometimes we need to map it.
            // For Wallet/Card, Paymob usually sends 'order' parameter too or we use the 'id' if we saved transaction id?
            // Actually, in our 'test' route, we saved `order.id` (Paymob Order ID) as `paymobOrderId`.
            // The callback generally includes `order` parameter which is the Order ID.

            const paymobOrderId = searchParams.get("order") || id; // Fallback to id if order missing (though id is transaction id)

            // Let's try to find by paymobOrderId. 
            // Since we saved `order.id` in `paymobOrderId`.

            const localOrder = await prismadb.paymentOrder.findFirst({
                where: { paymobOrderId: paymobOrderId!, status: "PENDING" }
            });

            if (localOrder) {
                // 1. Mark Order as PAID
                await prismadb.paymentOrder.update({
                    where: { id: localOrder.id },
                    data: { status: "PAID" }
                });

                // 2. Use stored credits amount
                const creditsToAdd = localOrder.creditsAmount || 0;

                // 3. Increment User Credits
                if (creditsToAdd > 0) {
                    await prismadb.user.update({
                        where: { id: localOrder.userId },
                        data: { credits: { increment: creditsToAdd } }
                    });
                }

                console.log(`[Payment Callback] Success! User ${localOrder.userId} received ${creditsToAdd} credits.`);
            } else {
                console.warn("[Payment Callback] Order not found or already paid:", paymobOrderId);
            }

        } catch (dbError) {
            console.error("[Payment Callback] DB Error:", dbError);
        }

        return NextResponse.redirect(new URL("/pricing?payment=success", req.url));
    } else {
        return NextResponse.redirect(new URL("/pricing?payment=failed", req.url));
    }
}

export async function POST(req: Request) {
    try {
        const data = await req.json();
        const isValid = verifyHmac(data.obj);

        if (!isValid) {
            console.error("HMAC Validation Failed");
            return new NextResponse("Invalid HMAC", { status: 403 });
        }

        if (data.obj.success) {
            console.log("PAYMENT SUCCESS WEBHOOK", data.obj.id);
            // Here you would update database: e.g. prisma.subscription.create(...)
        }

        return new NextResponse("Received", { status: 200 });
    } catch (error) {
        return new NextResponse("Error", { status: 500 });
    }
}
