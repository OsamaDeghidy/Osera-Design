import { prismadb } from "./lib/prismadb";

// @ts-nocheck

async function main() {
  const userId = "kp_7ed5db559cbf44f98382f22febdf5c88";

  console.log("Verifying/Correcting Payment Data...");

  // 1. Find the manual transaction
  const order = await prismadb.paymentOrder.findFirst({
      where: {
          userId: userId,
          provider: "PAYPAL",
          transactionId: { startsWith: "MANUAL_RECOVERY_" }
      }
  });

  if (!order) {
      console.error("Could not find the manual transaction to correct.");
      return;
  }

  console.log(`Found Order: ${order.id}. Current Amount: ${order.amount}, Credits: ${order.creditsAmount}`);

  // 2. Calculate Difference
  const currentCredits = order.creditsAmount; 
  const correctCredits = 60; // For $5
  
  if (currentCredits === correctCredits && order.amount === 5) {
      console.log("Data is already correct. Skipping update.");
      return;
  }

  const diff = currentCredits - correctCredits; 

  console.log(`Correcting to $5 and ${correctCredits} credits (Adjusting by ${diff} credits)...`);

  // 3. Update Order
  await prismadb.paymentOrder.update({
      where: { id: order.id },
      data: {
          amount: 5,
          creditsAmount: correctCredits
      }
  });
  console.log("Payment Order updated.");

  // 4. Update User Balance
  const user = await prismadb.user.update({
      where: { id: userId },
      data: {
          credits: { decrement: diff }
      }
  });

  console.log(`User balance corrected. New Balance: ${user.credits}`);
}

main();
