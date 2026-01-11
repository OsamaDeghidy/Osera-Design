"use client";

import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

function TestPaymentContent() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const status = searchParams.get("payment");

    const handlePayment = async () => {
        try {
            setLoading(true);
            const { data } = await axios.post("/api/payment/test", {
                amount: 10, // 5-10 EGP
                type: "card", // or wallet
            });

            if (data.iframeUrl) {
                // If direct iframe URL (Card)
                window.location.href = data.iframeUrl;
            } else if (data.paymentKey) {
                // If just key (Wallet), we might need another step or redirect
                toast.success("Payment Key Generated: " + data.paymentKey);
            }

        } catch (error: any) {
            toast.error("Payment Failed: " + (error.response?.data || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-6">
            <h1 className="text-3xl font-bold">Paymob Integration Test 💳</h1>

            {status === "success" && (
                <div className="bg-green-100 text-green-800 p-4 rounded-md">
                    ✅ Payment Successful! Transaction ID: {searchParams.get("id")}
                </div>
            )}

            {status === "failed" && (
                <div className="bg-red-100 text-red-800 p-4 rounded-md">
                    ❌ Payment Failed. Please try again.
                </div>
            )}

            <div className="p-6 border rounded-xl shadow-sm text-center max-w-md">
                <p className="mb-4 text-muted-foreground">
                    This will initiate a test transaction of <strong>10.00 EGP</strong> using your Paymob credentials.
                </p>

                <div className="flex gap-4 justify-center">
                    <Button onClick={handlePayment} disabled={loading} size="lg">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Pay 10 EGP Now
                    </Button>
                </div>

                <p className="mt-4 text-xs text-muted-foreground">
                    Using Integration ID: {process.env.NEXT_PUBLIC_PAYMOB_WALLET_INTEGRATION_ID || "Env Var"}
                </p>
            </div>
        </div>
    );
}

export default function TestPaymentPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
            <TestPaymentContent />
        </Suspense>
    );
}
