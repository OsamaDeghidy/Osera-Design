import { NextResponse } from "next/server";
import axios from "axios";
import { getAuthToken, createOrder, generatePaymentKey, createPaymentIntention } from "@/lib/paymob";
import { prismadb } from "@/lib/prismadb";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const { getUser } = getKindeServerSession();
        const user = await getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { amount = 10, type = "wallet", phoneNumber, credits = 0 } = await req.json();

        // 1. Authenticate
        const token = await getAuthToken();

        // 2. Create Order
        const order = await createOrder(token, amount * 100);

        // 3. Define Integration ID
        let integrationId = process.env.PAYMOB_WALLET_INTEGRATION_ID;
        if (type === "card" && process.env.PAYMOB_CARD_INTEGRATION_ID) {
            integrationId = process.env.PAYMOB_CARD_INTEGRATION_ID;
        }

        if (!integrationId) {
            console.error("[API Route] Integration ID is missing!");
            return NextResponse.json({ error: "Integration ID missing in Vercel Environment Variables." }, { status: 500 });
        }

        // 4. Define Billing Data
        const billingData = {
            apartment: "NA",
            email: user.email || "test@test.com",
            floor: "NA",
            first_name: user.given_name || "Test",
            street: "NA",
            building: "NA",
            phone_number: "+201010101010",
            shipping_method: "NA",
            postal_code: "NA",
            city: "Cairo",
            country: "EG",
            last_name: user.family_name || "User",
            state: "NA",
        };

        // 6. Generate Payment Key
        const paymentKey = await generatePaymentKey(
            token,
            order.id,
            amount * 100,
            integrationId,
            billingData
        );

        // 7. Return Response (Card uses Intention API / Flash)
        if (type === "card") {
            const customerData = {
                first_name: user.given_name || "Guest",
                last_name: user.family_name || "User",
                email: user.email!,
            };

            const intention = await createPaymentIntention(
                Math.round(amount * 100),
                parseInt(integrationId),
                billingData,
                customerData
            );

            // 5. Create Database Record for Card (Intention)
            try {
                await prismadb.paymentOrder.create({
                    data: {
                        userId: user.id,
                        transactionId: intention.id.toString(),
                        paymobOrderId: intention.id.toString(), 
                        provider: "PAYMOB",
                        amount: parseFloat(amount),
                        currency: "EGP",
                        creditsAmount: parseInt(credits),
                        status: "PENDING"
                    }
                });
            } catch (err) {
                console.error("DB Create Error (Intention):", err);
            }

            const publicKey = process.env.PAYMOB_PUBLIC_KEY || "YOUR_PUBLIC_KEY";

            return NextResponse.json({
                orderId: intention.id,
                clientSecret: intention.client_secret,
                iframeUrl: `https://accept.paymob.com/unifiedcheckout/?pulse=${intention.client_secret}&public_key=${publicKey}`
            });
        } else {
            // 5. Create Database Record for Wallet (Legacy Order)
            try {
                await prismadb.paymentOrder.create({
                    data: {
                        userId: user.id,
                        transactionId: order.id.toString(),
                        paymobOrderId: order.id.toString(),
                        provider: "PAYMOB",
                        amount: parseFloat(amount),
                        currency: "EGP",
                        creditsAmount: parseInt(credits),
                        status: "PENDING"
                    }
                });
            } catch (dbError) {
                console.error("DB Create Error (Legacy):", dbError);
            }

            // 6. Generate Payment Key for Wallet
            const paymentKey = await generatePaymentKey(
                token,
                order.id,
                amount * 100,
                integrationId,
                billingData
            );

            if (!phoneNumber) {
                return NextResponse.json({
                    paymentKey,
                    error: "Wallet payment requires a phone number.",
                    needPhone: true
                });
            }

            const payResponse = await axios.post("https://accept.paymob.com/api/acceptance/payments/pay", {
                source: {
                    identifier: phoneNumber,
                    subtype: "WALLET"
                },
                payment_token: paymentKey
            });

            console.log("[API Route] Paymob Pay Response:", JSON.stringify(payResponse.data, null, 2));

            const redirectUrl = payResponse.data.redirect_url;
            const isPending = payResponse.data.pending;
            const paymobMessage = payResponse.data.data?.message;

            if (!redirectUrl && isPending === false) {
                return NextResponse.json({
                    paymentKey,
                    error: paymobMessage || "Payment Declined by Provider (Wallet Error)",
                    details: payResponse.data
                }, { status: 400 });
            }

            return NextResponse.json({
                paymentKey,
                orderId: order.id,
                redirectUrl: redirectUrl,
                message: "Redirecting to Wallet..."
            });
        }

    } catch (error: any) {
        console.error("[PAYMENT_ERROR]", error.message);
        return NextResponse.json({ error: error.message || "Internal Error" }, { status: 500 });
    }
}
