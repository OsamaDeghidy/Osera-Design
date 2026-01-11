import axios from "axios";

const PAYMOB_API_KEY = process.env.PAYMOB_API_KEY;
const PAYMOB_HMAC = process.env.PAYMOB_HMAC;

export const paymob = axios.create({
    baseURL: "https://accept.paymob.com/api",
    headers: {
        "Content-Type": "application/json",
    },
});

export async function getAuthToken() {
    const apiKey = process.env.PAYMOB_API_KEY;
    console.log("[Paymob] Authenticating...");
    console.log("[Paymob] API Key Loaded:", !!apiKey);
    console.log("[Paymob] API Key Length:", apiKey?.length);
    console.log("[Paymob] API Key Preview:", apiKey?.substring(0, 5) + "...");

    try {
        const response = await paymob.post("/auth/tokens", {
            api_key: apiKey,
        });
        return response.data.token;
    } catch (error: any) {
        console.error("[Paymob] Auth Failed. Status:", error.response?.status);
        console.error("[Paymob] Response Data:", JSON.stringify(error.response?.data, null, 2));
        throw new Error("Failed to authenticate with Paymob");
    }
}

export async function createOrder(token: string, amountCents: number) {
    try {
        const response = await paymob.post("/ecommerce/orders", {
            auth_token: token,
            delivery_needed: "false",
            amount_cents: amountCents.toString(),
            currency: "EGP",
            items: [], // Optional
        });
        return response.data;
    } catch (error: any) {
        console.error("Paymob Create Order Error:", error.response?.data || error.message);
        throw new Error("Failed to create Paymob order");
    }
}

export async function generatePaymentKey(
    token: string,
    orderId: string,
    amountCents: number,
    integrationId: string,
    billingData: any
) {
    try {
        const response = await paymob.post("/acceptance/payment_keys", {
            auth_token: token,
            amount_cents: amountCents.toString(),
            expiration: 3600,
            order_id: orderId,
            billing_data: billingData,
            currency: "EGP",
            integration_id: integrationId,
            lock_order_when_paid: "false",
        });
        return response.data.token;
    } catch (error: any) {
        console.error("Paymob Payment Key Error:", error.response?.data || error.message);
        throw new Error("Failed to generate payment key");
    }
}

export function verifyHmac(data: any): boolean {
    const {
        amount_cents,
        created_at,
        currency,
        error_occured,
        has_parent_transaction,
        id,
        integration_id,
        is_3d_secure,
        is_auth,
        is_capture,
        is_refunded,
        is_standalone_payment,
        is_voided,
        order,
        owner,
        pending,
        source_data_pan,
        source_data_sub_type,
        source_data_type,
        success,
    } = data;

    const lexicalString =
        amount_cents +
        created_at +
        currency +
        error_occured +
        has_parent_transaction +
        id +
        integration_id +
        is_3d_secure +
        is_auth +
        is_capture +
        is_refunded +
        is_standalone_payment +
        is_voided +
        order +
        owner +
        pending +
        source_data_pan +
        source_data_sub_type +
        source_data_type +
        success;

    const crypto = require("crypto");
    const hmac = crypto.createHmac("sha512", PAYMOB_HMAC!);
    hmac.update(lexicalString);
    const signature = hmac.digest("hex");

    return signature === data.hmac;
}
