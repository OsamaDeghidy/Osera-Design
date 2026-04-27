import { NextResponse } from "next/server";
import { prismadb } from "@/lib/prismadb";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export const dynamic = 'force-dynamic';

export async function GET() {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user || !user.id) {
        return NextResponse.json({ error: "يجب تسجيل الدخول في الموقع أولاً لنتمكن من إضافة البيانات لحسابك." }, { status: 401 });
    }

    try {
        // 1. Ensure User exists in DB
        await prismadb.user.upsert({
            where: { id: user.id },
            update: {},
            create: {
                id: user.id,
                email: user.email || "guest@example.com",
                firstName: user.given_name || "Guest",
                lastName: user.family_name || "",
                credits: 100, // Give some free credits too
            }
        });

        // 2. Add Fake Projects
        await prismadb.project.create({
            data: {
                userId: user.id,
                name: "تطبيق متجر إلكتروني حديث",
                type: "MOBILE",
                thumbnail: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=500&auto=format&fit=crop",
                visibility: "PUBLIC",
                frames: {
                    create: [
                        { title: "الشاشة الرئيسية", htmlContent: "<div style='padding: 20px; font-family: sans-serif; background: #f8f9fa; height: 100%;'><h1 style='color: #333;'>متجري</h1><div style='background: white; padding: 15px; border-radius: 10px; margin-top: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);'><p>🛒 مرحباً بك في المتجر الإلكتروني. اكتشف أحدث العروض.</p></div></div>" },
                        { title: "سلة المشتريات", htmlContent: "<div style='padding: 20px; font-family: sans-serif; background: #f8f9fa; height: 100%;'><h1 style='color: #333;'>السلة</h1><p style='color: #666;'>لا توجد عناصر في السلة حالياً.</p></div>" }
                    ]
                }
            }
        });

        await prismadb.project.create({
            data: {
                userId: user.id,
                name: "تطبيق لياقة بدنية",
                type: "MOBILE",
                thumbnail: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=500&auto=format&fit=crop",
                visibility: "PRIVATE",
                frames: {
                    create: [
                        { title: "لوحة التحكم", htmlContent: "<div style='padding: 20px; font-family: sans-serif; background: #111; color: white; height: 100%;'><h1 style='color: #4ade80;'>نشاطك اليوم</h1><div style='margin-top: 30px; padding: 20px; background: #222; border-radius: 15px;'><h3>🔥 500 سعرة حرارية</h3><p style='color: #aaa;'>تم حرقها اليوم! استمر يا بطل.</p></div></div>" }
                    ]
                }
            }
        });

        // 3. Add Fake Studio Designs
        await prismadb.studioDesign.createMany({
            data: [
                {
                    userId: user.id,
                    prompt: "واجهة تطبيق مطعم بخلفية داكنة وتفاصيل ذهبية أنيقة",
                    imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=500&auto=format&fit=crop",
                    aspectRatio: "16:9",
                    isPublic: true,
                },
                {
                    userId: user.id,
                    prompt: "تصميم شاشة تسجيل دخول ميني ماليست لتطبيق عقارات",
                    imageUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=500&auto=format&fit=crop",
                    aspectRatio: "9:16",
                    isPublic: true,
                }
            ]
        });

        return NextResponse.json({ 
            success: true, 
            message: "✅ تم إضافة البيانات الوهمية (مشاريع، وتصميمات أستوديو) لحسابك بنجاح!" 
        });
    } catch (error: any) {
        console.error("Seeding Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
