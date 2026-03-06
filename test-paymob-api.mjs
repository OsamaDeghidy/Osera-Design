import * as dotenv from "dotenv";
import axios from "axios";

// Load environment variables from .env file
dotenv.config();

const apiKey = process.env.PAYMOB_API_KEY;
const integrationIdWallet = process.env.PAYMOB_WALLET_INTEGRATION_ID;
const integrationIdCard = process.env.PAYMOB_CARD_INTEGRATION_ID;

const paymob = axios.create({
    baseURL: "https://accept.paymob.com/api",
    headers: { "Content-Type": "application/json" }
});

async function testPaymobAPI() {
    console.log("=========================================");
    console.log("🚀 STARTING PAYMOB API TEST");
    console.log("=========================================\n");

    if (!apiKey) {
        console.error("❌ ERROR: PAYMOB_API_KEY is not defined in .env file.");
        return;
    }

    try {
        // STEP 1: Authentication
        console.log("1️⃣ Testing Authentication...");
        const authRes = await paymob.post("/auth/tokens", { api_key: apiKey });
        const token = authRes.data.token;
        console.log(`✅ Authentication Successful! Token retrieved (Length: ${token.length})`);

        // STEP 2: Create a Dummy Order (10 EGP = 1000 Cents)
        console.log("\n2️⃣ Testing Order Creation...");
        const orderRes = await paymob.post("/ecommerce/orders", {
            auth_token: token,
            delivery_needed: "false",
            amount_cents: "1000",
            currency: "EGP",
            items: []
        });
        const orderId = orderRes.data.id;
        console.log(`✅ Order Creation Successful! Order ID: ${orderId}`);

        // STEP 3: Payment Key Generation (Testing Wallet Integration)
        console.log(`\n3️⃣ Testing Payment Key Generation (Integration ID: ${integrationIdWallet})...`);
        if (!integrationIdWallet) {
            console.log("⚠️ Skipping... PAYMOB_WALLET_INTEGRATION_ID is missing.");
        } else {
            const billingData = {
                apartment: "NA", email: "test@test.com", floor: "NA",
                first_name: "Test", street: "NA", building: "NA",
                phone_number: "+201010101010", shipping_method: "NA",
                postal_code: "NA", city: "Cairo", country: "EG",
                last_name: "User", state: "NA"
            };

            const keyRes = await paymob.post("/acceptance/payment_keys", {
                auth_token: token,
                amount_cents: "1000",
                expiration: 3600,
                order_id: orderId,
                billing_data: billingData,
                currency: "EGP",
                integration_id: integrationIdWallet,
                lock_order_when_paid: "false"
            });
            const paymentKey = keyRes.data.token;
            console.log(`✅ Payment Key Generated Successfully! Key begins with: ${paymentKey.substring(0, 10)}...`);
            console.log(`\n🌐 Wallet Test Iframe URL Example: `);
            console.log(`https://accept.paymob.com/api/acceptance/iframes/YOUR_IFRAME_ID?payment_token=${paymentKey}`);
        }

        console.log("\n✅ ALL PAYMOB TESTS PASSED SUCCCESSFULLY!");
    } catch (error) {
        console.error("\n❌ PAYMOB API TEST FAILED!");
        if (error.response) {
            console.error(JSON.stringify(error.response.data, null, 2));
        } else {
            console.error(error.message);
        }
    }
}

testPaymobAPI();
