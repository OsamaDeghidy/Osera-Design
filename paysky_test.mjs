import axios from 'axios';
import crypto from 'crypto';

/**
 * PaySky Payment Gateway Integration Test
 * 
 * Credentials provided:
 * Merchant Name: Osara- AI
 * Merchant ID (MID): 26736208588
 * Terminal ID (TID): 42479896
 * Secret Key: 9c23cb825b950bf64f0de9684ed5bafb
 * OTP: 1111
 * 
 * Test Cards:
 * Mastercard: 5123 4567 8901 2346, EXP 01/32, CVV 100
 * Visa: 4440 0000 4220 0014, EXP 01/32, CVV 100
 */

const MERCHANT_ID = "26736208588";
const TERMINAL_ID = "42479896";
const SECRET_KEY = "9c23cb825b950bf64f0de9684ed5bafb";
const BASE_URL = "https://red3.paysky.io:3001"; // Dashboard provided: https://red3.paysky.io:3001/Portal/

/**
 * Generates the SecureHash for PaySky OMNI Gateway
 * Parameters must be sorted alphabetically and concatenated: Param1=Value1&Param2=Value2...
 * Then hashed with HMAC-SHA256 using the Secret Key (hex decoded).
 */
function generateSecureHash(params, secretKey) {
    const sortedKeys = Object.keys(params).sort();
    const queryString = sortedKeys.map(key => `${key}=${params[key]}`).join('&');
    
    console.log("\n--- SecureHash Generation ---");
    console.log("1. Raw parameters (sorted):", JSON.stringify(params, null, 2));
    console.log("2. Concatenated String:", queryString);
    
    // PaySky require hex decoded secret key for HMAC
    const hmac = crypto.createHmac('sha256', Buffer.from(secretKey, 'hex'));
    hmac.update(queryString);
    const hash = hmac.digest('hex').toUpperCase();
    
    console.log("3. Generated SecureHash:", hash);
    return hash;
}

async function runPaySkyTest() {
    console.log("=========================================");
    console.log("🚀 STARTING PAYSKY INTEGRATION TEST");
    console.log("=========================================\n");

    const amount = "1000"; // 10.00 EGP (in piasters/smallest unit)
    const currency = "818"; // EGP ISO Code
    
    // DateTime format: DDMMYYYYHHMMSS
    const now = new Date();
    const dateTimeLocal = 
        String(now.getDate()).padStart(2, '0') +
        String(now.getMonth() + 1).padStart(2, '0') +
        now.getFullYear() +
        String(now.getHours()).padStart(2, '0') +
        String(now.getMinutes()).padStart(2, '0') +
        String(now.getSeconds()).padStart(2, '0');
        
    const merchantReference = "OSARA_TEST_" + Date.now();
    
    // Parameters used in the hash calculation
    const hashParams = {
        Amount: amount,
        DateTimeLocalTrxn: dateTimeLocal,
        MerchantId: MERCHANT_ID,
        MerchantReference: merchantReference,
        TerminalId: TERMINAL_ID
    };
    
    const secureHash = generateSecureHash(hashParams, SECRET_KEY);
    
    // Full payload for the API request
    const payload = {
        ...hashParams,
        CurrencyISO: currency,
        SecureHash: secureHash,
        ReturnURL: "https://osara-ai.com/api/payment/callback", 
        CallBackURL: "https://osara-ai.com/api/payment/callback"
    };

    try {
        console.log("\n4. Sending POST request to PaySky...");
        console.log(`URL: ${BASE_URL}/Payment/api/Acceptor/PostProcess`);
        
        const response = await axios.post(`${BASE_URL}/Payment/api/Acceptor/PostProcess`, payload);
        
        console.log("\n--- PaySky API Response ---");
        console.log(JSON.stringify(response.data, null, 2));
        
        if (response.data.Success === true || response.data.StatusCode === "000") {
            console.log("\n✅ SUCCESS: PaySky session initialized.");
            if (response.data.RedirectURL) {
                console.log("🔗 Payment Page URL:", response.data.RedirectURL);
                console.log("\n👉 TEST CARD DETAILS:");
                console.log("Mastercard: 5123 4567 8901 2346 | EXP: 01/32 | CVV: 100");
                console.log("Visa: 4440 0000 4220 0014 | EXP: 01/32 | CVV: 100");
                console.log("OTP (if asked): 1111");
            }
        } else {
            console.log("\n❌ FAILED: PaySky returned an error.");
            console.log("Message:", response.data.Message || "No message provided");
            console.log("StatusCode:", response.data.StatusCode);
        }
    } catch (error) {
        console.error("\n❌ ERROR: Request failed!");
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", JSON.stringify(error.response.data, null, 2));
        } else {
            console.error("Message:", error.message);
        }
        
        console.log("\n💡 Possible causes:");
        console.log("- Wrong API endpoint (might be /Payment/api/Acceptor/PostProcessPayment)");
        console.log("- Incorrect parameter order in SecureHash");
        console.log("- SecretKey format issues");
    }
}

runPaySkyTest();
