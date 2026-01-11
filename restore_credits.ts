import { prismadb } from "./lib/prismadb";

// @ts-nocheck

async function main() {
    const userId = "kp_7ed5db559cbf44f98382f22febdf5c88";

    console.log("Restoring Data to New Database (osera-design)...");

    // 1. Ensure User Exists (Lazy Sync)
    let user = await prismadb.user.findUnique({ where: { id: userId } });
    if (!user) {
        console.log("User not found (Fresh DB). Creating...");
        user = await prismadb.user.create({
            data: {
                id: userId,
                email: "osamadeghidey@gmail.com",
                firstName: "Osama",
                lastName: "Deghidy",
                credits: 5
            }
        });
        console.log("User created.");
    }

    // 2. Restore Manual Transaction & Fix Profile Crash
    const transactionId = "MANUAL_RECOVERY_RESTORED";

    const existingOrder = await prismadb.paymentOrder.findFirst({
        where: { transactionId: transactionId }
    });

    if (!existingOrder) {
        console.log("Restoring Payment Record ($5 / 60 Credits)...");
        await prismadb.paymentOrder.create({
            data: {
                userId: userId,
                amount: 5,
                creditsAmount: 60,
                currency: "USD",
                status: "SUCCESS",
                provider: "PAYPAL",
                transactionId: transactionId,
                paymobOrderId: "N/A", // Prevent Profile Crash
                details: "Restored after DB rename"
            }
        });

        // 3. Update Credits (5 + 60 = 65)
        await prismadb.user.update({
            where: { id: userId },
            data: { credits: { increment: 60 } }
        });
        console.log("Credits Restored. Total Balance should be 65.");
    } else {
        console.log("Payment Record already restored.");
    }
}

main();
