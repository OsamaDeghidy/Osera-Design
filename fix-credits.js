const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixCredits() {
    try {
        console.log("Fixing missing credits for Paymob orders...");

        // These are the specific Order IDs you provided from Paymob dashboard and MongoDB logs
        const orderIdsToFix = ["481112801", "451229390", "451229250", "451228274"];

        for (const orderId of orderIdsToFix) {
            const localOrder = await prisma.paymentOrder.findFirst({
                where: { paymobOrderId: orderId, status: "PENDING" }
            });

            if (localOrder) {
                console.log(`[FOUND] Pending order ${orderId} for User: ${localOrder.userId}`);
                const creditsToAdd = localOrder.creditsAmount || 0;

                // Mark order as PAID
                await prisma.paymentOrder.update({
                    where: { id: localOrder.id },
                    data: { status: "PAID" }
                });

                // Increment User Credits
                if (creditsToAdd > 0) {
                    await prisma.user.update({
                        where: { id: localOrder.userId },
                        data: { credits: { increment: creditsToAdd } }
                    });
                    console.log(`✅ [SUCCESS] Added ${creditsToAdd} credits to user!`);
                }
            } else {
                console.log(`[SKIP] Order ${orderId} is either not in DB or already marked as PAID.`);
            }
        }
        console.log("Finished script.");
    } catch (e) {
        console.error("Error updating DB:", e);
    } finally {
        await prisma.$disconnect();
    }
}

fixCredits();
