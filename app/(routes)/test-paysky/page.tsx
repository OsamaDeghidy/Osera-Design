"use client";

import { useState } from "react";
import Script from "next/script";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

/**
 * PaySky Integration Test Page
 * Credentials provided by user.
 */

const PAYS_CREDENTIALS = {
    MID: "26736208588",
    TID: "42479896",
    SecretKey: "9c23cb825b950bf64f0de9684ed5bafb",
};

export default function TestPayskyPage() {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const generateSecureHash = (time: string, amount: string, merchRef: string, merchantId: string, terminalId: string, secretKey: string) => {
        const CryptoJS = (window as any).CryptoJS;
        if (!CryptoJS) return "";

        // Construct hashing string based on provided sample
        const hashing = `Amount=${amount}&DateTimeLocalTrxn=${time}&MerchantId=${merchantId}&MerchantReference=${merchRef}&TerminalId=${terminalId}`;
        
        console.log("Hashing string:", hashing);
        console.log("TrxDateTime:", time);
        
        // Convert the hexadecimal secret key to a WordArray
        const secretKeyWordArray = CryptoJS.enc.Hex.parse(secretKey);
        
        // Create an HMAC using SHA-256
        const hmac = CryptoJS.HmacSHA256(hashing, secretKeyWordArray);
        
        // Convert the HMAC to a hexadecimal string
        const mac = hmac.toString(CryptoJS.enc.Hex).toUpperCase();
        
        console.log("Generated MAC:", mac);
        return mac;
    };

    const handlePayment = () => {
        if (!(window as any).Lightbox || !(window as any).CryptoJS) {
            setMessage("PaySky scripts not fully loaded yet.");
            return;
        }

        setLoading(true);
        setMessage("Initializing PaySky Lightbox...");

        try {
            const amount = "1000"; // 10.00 EGP
            const merchantReference = "OSARA_" + Date.now();
            const trxDateTime = (new Date() as any).toGMTString();
            
            const secureHash = generateSecureHash(
                trxDateTime,
                amount,
                merchantReference,
                PAYS_CREDENTIALS.MID,
                PAYS_CREDENTIALS.TID,
                PAYS_CREDENTIALS.SecretKey
            );

            const Lightbox = (window as any).Lightbox;

            Lightbox.Checkout.configure = {
                MID: PAYS_CREDENTIALS.MID,
                TID: PAYS_CREDENTIALS.TID,
                AmountTrxn: amount,
                SecureHash: secureHash,
                MerchantReference: merchantReference,
                TrxDateTime: trxDateTime,
                completeCallback: function (data: any) {
                    console.log('Payment Completed:', data);
                    setLoading(false);
                    setMessage("✅ Payment Successful! Check console for details.");
                },
                errorCallback: function (error: any) {
                    console.error('Payment Error:', error);
                    setLoading(false);
                    setMessage("❌ Payment Error: " + error);
                },
                cancelCallback: function () {
                    console.log('Payment Canceled');
                    setLoading(false);
                    setMessage("⚠️ Payment Canceled.");
                }
            };

            Lightbox.Checkout.showLightbox();
        } catch (err: any) {
            console.error(err);
            setLoading(false);
            setMessage("Error: " + err.message);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4">
            <Script 
                src="https://red3.paysky.io:3011/LB/js/Lightbox.js" 
                strategy="afterInteractive" 
                onLoad={() => console.log("PaySky Lightbox script loaded")}
            />
            <Script 
                src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js"
                strategy="afterInteractive"
                onLoad={() => console.log("CryptoJS loaded")}
            />

            <Card className="w-full max-w-md shadow-xl border-t-4 border-t-blue-600">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">PaySky Integration Test 💳</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800 space-y-1">
                        <p><strong>Merchant:</strong> Osara- AI</p>
                        <p><strong>MID:</strong> {PAYS_CREDENTIALS.MID}</p>
                        <p><strong>TID:</strong> {PAYS_CREDENTIALS.TID}</p>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-semibold text-gray-700">Test Card Details:</h3>
                        <div className="grid grid-cols-1 gap-2 text-xs">
                            <div className="p-2 border rounded bg-white">
                                <p className="font-bold text-slate-500">Mastercard</p>
                                <p>5123 4567 8901 2346</p>
                                <p>Exp: 01/32 | CVV: 100</p>
                            </div>
                            <div className="p-2 border rounded bg-white">
                                <p className="font-bold text-slate-500">Visa</p>
                                <p>4440 0000 4220 0014</p>
                                <p>Exp: 01/32 | CVV: 100</p>
                            </div>
                        </div>
                    </div>

                    <Button 
                        onClick={handlePayment} 
                        disabled={loading}
                        className="w-full h-12 text-lg font-semibold bg-blue-600 hover:bg-blue-700"
                    >
                        {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                        {loading ? "Processing..." : "Pay 10.00 EGP"}
                    </Button>

                    {message && (
                        <div className={`p-3 rounded-md text-sm text-center font-medium ${
                            message.includes("✅") ? "bg-green-100 text-green-700" : 
                            message.includes("❌") ? "bg-red-100 text-red-700" : 
                            "bg-gray-100 text-gray-700"
                        }`}>
                            {message}
                        </div>
                    )}
                </CardContent>
            </Card>

            <p className="mt-6 text-xs text-gray-400">
                Note: This uses the PaySky Lightbox integration.
            </p>
        </div>
    );
}
