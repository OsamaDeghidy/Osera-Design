"use client";

import { Button } from "@/components/ui/button";
import { Check, ShieldCheck, Zap, Infinity, Sparkles, Globe, CreditCard } from "lucide-react";
import { useState, Suspense, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { Switch } from "@/components/ui/switch";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";

function PricingContent() {
    const { user } = useKindeBrowserClient();
    const [loading, setLoading] = useState<string | null>(null);
    const [showPhoneDialog, setShowPhoneDialog] = useState(false);
    // Added credits to pending plan state
    const [pendingPlan, setPendingPlan] = useState<{ amount: number, name: string, credits: number } | null>(null);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [currency, setCurrency] = useState<"EGP" | "USD">("EGP");

    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (searchParams.get("payment") === "success") {
            toast.success("Payment Successful! Your credits have been added. 🎉");
        } else if (searchParams.get("payment") === "failed") {
            toast.error("Payment Failed. Please try again.");
        }

        // Default stays as initialized (EGP) in the state
    }, [searchParams]);

    const handleSubscribe = async (amount: number, planName: string, credits: number, phoneOverride?: string) => {
        if (!user) {
            toast.error("Please login first to subscribe to a plan.", {
                action: {
                    label: "Login",
                    onClick: () => {
                        window.location.href = `/api/auth/login?post_login_redirect_url=/pricing?plan=${encodeURIComponent(planName)}`;
                    }
                }
            });
            return;
        }

        try {
            setLoading(planName);
            const payload: any = { amount, type: "wallet", credits };
            if (phoneOverride) payload.phoneNumber = phoneOverride;

            const { data } = await axios.post("/api/payment/test", payload);

            if (data.iframeUrl) {
                window.location.href = data.iframeUrl;
            } else if (data.redirectUrl) {
                window.location.href = data.redirectUrl;
            } else if (data.needPhone) {
                setPendingPlan({ amount, name: planName, credits });
                setShowPhoneDialog(true);
                toast.info("Please enter your wallet number.");
            } else if (data.message) {
                toast.success(data.message);
            } else {
                toast.error("Failed to initialize payment");
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Something went wrong");
        } finally {
            setLoading(null);
        }
    };

    const handleConfirmPhone = () => {
        if (!phoneNumber || phoneNumber.length < 11) {
            toast.error("Enter valid number");
            return;
        }
        if (pendingPlan) {
            handleSubscribe(pendingPlan.amount, pendingPlan.name, pendingPlan.credits, phoneNumber);
            setShowPhoneDialog(false);
        }
    };

    // Plans Data including credits
    const plansData = {
        EGP: [
            {
                name: "البداية (Starter)",
                price: 49,
                originalPrice: 250,
                credits: 20,
                features: ["٢٠ تصميم بالذكاء الاصطناعي", "سرعة عادية", "دعم مجتمعي"],
                popular: false,
                buttonLabel: "اشترك الآن",
                badge: ""
            },
            {
                name: "المحترف (Pro Creator)",
                price: 149,
                originalPrice: 750,
                credits: 100,
                features: ["١٠٠ تصميم بالذكاء الاصطناعي", "سرعة عالية", "دعم أولوية", "ترخيص تجاري", "وصول مبكر للميزات"],
                popular: true,
                buttonLabel: "اشترك الآن",
                badge: "الأكثر شهرة"
            },
            {
                name: "الوكالة (Agency)",
                price: 499,
                originalPrice: 2500,
                credits: 600,
                features: ["٦٠٠ تصميم بالذكاء الاصطناعي", "سرعة قصوى", "دعم 24/7", "وصول للـ API", "ترخيص تجاري"],
                popular: false,
                buttonLabel: "اشترك الآن",
                badge: ""
            }
        ],
        USD: [
            {
                name: "Starter",
                price: 5,
                originalPrice: 25,
                credits: 20,
                features: ["20 AI Generations", "Standard Speed", "Community Support"],
                popular: false,
                buttonLabel: "Get Started Now",
                badge: ""
            },
            {
                name: "Pro Creator",
                price: 15,
                originalPrice: 75,
                credits: 100,
                features: ["100 AI Generations", "High Speed", "Priority Support", "Commercial License", "Priority Access"],
                popular: true,
                buttonLabel: "Get Started Now",
                badge: "Most Popular"
            },
            {
                name: "Agency",
                price: 50,
                originalPrice: 250,
                credits: 600,
                features: ["600 AI Generations", "Max Speed", "24/7 Support", "API Access", "Commercial License"],
                popular: false,
                buttonLabel: "Get Started Now",
                badge: ""
            }
        ]
    };

    const plans = plansData[currency];

    const faqs = currency === "EGP" ? [
        { q: "هل تنتهي صلاحية رصيدي؟", a: "أبدًا! يظل رصيدك صالحًا للأبد حتى تستخدمه. لا توجد تواريخ انتهاء." },
        { q: "هل يمكنني استخدام التصاميم تجاريًا؟", a: "نعم! تتضمن خطط المحترف والوكالة ترخيصًا تجاريًا كاملاً لجميع تصاميمك التي تم إنشاؤها." },
        { q: "هل الدفع آمن؟", a: "آمن 100% ومُشفّر من خلال بوابة الدفع Paymob (البطاقات البنكية والمحافظ الإلكترونية)." },
        { q: "هل يمكنني شحن المزيد من الرصيد لاحقاً؟", a: "بالتأكيد. يمكنك شراء باقة جديدة في أي وقت ينفد فيه رصيدك، وتُضاف للرصيد الموجود في حسابك." }
    ] : [
        { q: "Do my credits expire?", a: "Never! Your credits remain valid forever until you use them. No expiration dates." },
        { q: "Can I use designs commercially?", a: "Yes! Pro and Agency plans include a full commercial license for all your generated designs." },
        { q: "Is payment secure?", a: "100% Secure via PayPal (Global)." },
        { q: "Can I top up more credits?", a: "Absolutely. You can buy a new package anytime you run out, without losing any existing credits." }
    ];

    const isArabic = currency === "EGP";

    return (
        <PayPalScriptProvider options={{ "clientId": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "sb", currency: "USD" }}>
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4 py-16">

                {/* Hero Section */}
                <div className={`text-center mb-10 space-y-4 max-w-2xl mx-auto ${isArabic ? 'font-arabic' : ''}`} dir={isArabic ? 'rtl' : 'ltr'}>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-2">
                        <Sparkles size={14} />
                        <span>{isArabic ? "عرض الانطلاق: خصم 80% على جميع الخطط" : "Launch Offer: 80% OFF All Plans"}</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                        {isArabic ? "اختر باقتك للدفع - Checkout" : "Checkout - Pricing Plans"}
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                        {isArabic ? "اشترِ باقات رصيد لتصميم وتوليد تطبيقات ومواقع حقيقية بالذكاء الاصطناعي. ادفع مرة واحدة، وصمم للأبد." : "Buy credit packages to generate real mobile apps and websites using AI. Pay once, design forever."}
                    </p>
                </div>

                {/* Currency Switcher */}
                <div className="flex items-center gap-4 mb-12 bg-card p-2 rounded-full border shadow-sm animate-in fade-in zoom-in duration-500">
                    <button
                        onClick={() => setCurrency("EGP")}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${currency === 'EGP' ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        🇪🇬 EGP (Egypt)
                    </button>
                    <button
                        onClick={() => setCurrency("USD")}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${currency === 'USD' ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        🌎 USD (Global)
                    </button>
                </div>

                {/* Plans Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full mb-20">
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className={`
                                relative flex flex-col p-6 rounded-2xl border bg-card transition-all duration-300
                                ${plan.popular
                                    ? 'border-primary shadow-2xl scale-105 z-10 ring-1 ring-primary/20'
                                    : 'border-border shadow-sm hover:shadow-md hover:-translate-y-1'
                                }
                            `}
                        >
                            {plan.popular && (
                                <div className="absolute top-0 right-0 left-0 -mt-4 flex justify-center">
                                    <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full shadow-lg uppercase tracking-wide">
                                        {plan.badge}
                                    </span>
                                </div>
                            )}

                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-foreground mb-2">{plan.name}</h3>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-bold">
                                        {currency === 'USD' ? '$' : ''}{plan.price}
                                        {currency === 'EGP' ? <span className="text-lg font-normal text-muted-foreground">EGP</span> : ''}
                                    </span>
                                    <span className="text-sm text-muted-foreground line-through decoration-destructive decoration-2 opacity-70">
                                        {currency === 'USD' ? '$' : ''}{plan.originalPrice}
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">
                                    {plan.credits} {isArabic ? "رصيد" : "Credits"}
                                </p>
                            </div>

                            <ul className="space-y-4 mb-8 flex-1">
                                {plan.features.map((feat) => (
                                    <li key={feat} className="flex items-start gap-3 text-sm text-foreground/90">
                                        <div className={`mt-0.5 p-0.5 rounded-full ${plan.popular ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                            <Check size={14} strokeWidth={3} />
                                        </div>
                                        <span>{feat}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-auto space-y-3 min-h-[50px]">
                                {currency === "EGP" ? (
                                    <>
                                        <Button
                                            className="w-full h-12 text-base font-semibold shadow-md transition-transform active:scale-95"
                                            variant={plan.popular ? "default" : "outline"}
                                            // Passing credits safely
                                            onClick={() => handleSubscribe(plan.price, plan.name, plan.credits)}
                                            disabled={loading === plan.name || loading !== null}
                                        >
                                            {loading === plan.name ? "Processing..." : plan.buttonLabel}
                                        </Button>
                                        <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground opacity-80" dir={isArabic ? 'rtl' : 'ltr'}>
                                            <ShieldCheck size={12} />
                                            {isArabic ? "دفع آمن عبر باى موب" : "Secured by Paymob"}
                                        </p>
                                    </>
                                ) : (
                                    <div className="w-full relative z-0">
                                        <PayPalButtons
                                            style={{ layout: "vertical", height: 48, tagline: false }}
                                            onClick={(data, actions) => {
                                                if (!user) {
                                                    toast.error("Please login first to subscribe to a plan.", {
                                                        action: {
                                                            label: "Login",
                                                            onClick: () => {
                                                                window.location.href = `/api/auth/login?post_login_redirect_url=/pricing?plan=${encodeURIComponent(plan.name)}`;
                                                            }
                                                        }
                                                    });
                                                    return actions.reject();
                                                }
                                                return actions.resolve();
                                            }}
                                            createOrder={(data, actions) => {
                                                return actions.order.create({
                                                    intent: "CAPTURE",
                                                    purchase_units: [
                                                        {
                                                            description: plan.name,
                                                            amount: {
                                                                currency_code: "USD",
                                                                value: plan.price.toString()
                                                            }
                                                        }
                                                    ]
                                                });
                                            }}
                                            onApprove={async (data, actions) => {
                                                try {
                                                    const order = await actions.order?.capture();
                                                    console.log("PayPal Success:", order);

                                                    // Backend Verification
                                                    await axios.post("/api/payment/paypal/capture", {
                                                        orderId: order?.id,
                                                        amount: plan.price,
                                                        credits: plan.credits
                                                    });

                                                    toast.success("Payment Successful! Credits will be added shortly.");
                                                    // Redirect to Profile to see credits
                                                    router.push("/profile");
                                                } catch (err) {
                                                    toast.error("PayPal transaction failed.");
                                                    console.error("PayPal Error:", err);
                                                }
                                            }}
                                        />
                                        <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground opacity-80 mt-2">
                                            <ShieldCheck size={12} />
                                            Secured by PayPal
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Trust Signals */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl w-full text-center border-t py-12 mb-16" dir={isArabic ? "rtl" : "ltr"}>
                    <div className="flex flex-col items-center gap-2">
                        <div className="p-3 bg-primary/5 rounded-full text-primary mb-2">
                            <Infinity size={24} />
                        </div>
                        <h3 className="font-semibold">{isArabic ? "رصيد لا ينتهي" : "Credits Never Expire"}</h3>
                        <p className="text-sm text-muted-foreground">{isArabic ? "رصيدك آمن للأبد." : "Your balance is safe forever."}</p>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <div className="p-3 bg-primary/5 rounded-full text-primary mb-2">
                            <Zap size={24} />
                        </div>
                        <h3 className="font-semibold">{isArabic ? "تفعيل فوري" : "Instant Activation"}</h3>
                        <p className="text-sm text-muted-foreground">{isArabic ? "ابدأ التصميم فورًا." : "Start designing immediately."}</p>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <div className="p-3 bg-primary/5 rounded-full text-primary mb-2">
                            <ShieldCheck size={24} />
                        </div>
                        <h3 className="font-semibold">{isArabic ? "دفع آمن" : "Secure Payment"}</h3>
                        <p className="text-sm text-muted-foreground">{isArabic ? "طرق دفع مشفرة وموثوقة." : "Encrypted via Paymob & PayPal."}</p>
                    </div>
                </div>

                {/* FAQs */}
                <div className="max-w-2xl w-full space-y-6" dir={isArabic ? "rtl" : "ltr"}>
                    <h2 className="text-2xl font-bold text-center">{isArabic ? "الأسئلة الشائعة" : "Frequently Asked Questions"}</h2>
                    <div className="grid gap-4">
                        {faqs.map((faq, i) => (
                            <div key={i} className="border rounded-xl p-5 bg-card/50 hover:bg-card transition-colors">
                                <h3 className="font-semibold mb-2 flex items-center gap-2 text-foreground">
                                    <span className="text-primary">Q.</span> {faq.q}
                                </h3>
                                <p className={`text-sm text-muted-foreground leading-relaxed ${isArabic ? 'pr-6' : 'pl-6'}`}>
                                    {faq.a}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                <Dialog open={showPhoneDialog} onOpenChange={setShowPhoneDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Enter Wallet Number</DialogTitle>
                            <DialogDescription>Please provide your wallet number to verify payment.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="phone" className="text-right">Phone</Label>
                                <Input id="phone" type="tel" placeholder="01xxxxxxxxx" className="col-span-3" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleConfirmPhone} disabled={loading !== null}>
                                {loading ? "Processing..." : "Pay Now"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </PayPalScriptProvider>
    );
}

export default function PricingPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">Loading...</div>}>
            <PricingContent />
        </Suspense>
    );
}
