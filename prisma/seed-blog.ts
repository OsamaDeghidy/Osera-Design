const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const images = {
    tech: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
    code: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
    mobile: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800&q=80",
    design: "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=800&q=80",
    ai: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80",
    business: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80",
    office: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80"
};

const posts = [
    // 1. Introduction
    {
        title: "Welcome to Osara AI: The Future of Mobile Design",
        slug: "welcome-osara-ai",
        content: `
            <h1>The Future of App Design is Here</h1>
            <p>Welcome to <strong>Osara AI</strong>, the intelligent design assistant that transforms your text descriptions into fully editable, production-ready mobile app interfaces. In a world where speed is everything, waiting weeks for a design mockup is no longer an option.</p>
            
            <h2>Why Osara AI?</h2>
            <p>Traditional design workflows are slow. You need a UI designer, iterations, approvals, and then a handover to developers. Osara cuts this process down to seconds:</p>
            <ul>
                <li><strong>Instant Generation:</strong> Describe your app (e.g., "A modern fintech app with dark mode") and get results instantly.</li>
                <li><strong>Editable Code:</strong> We don't just give you images. We provide React Native and Flutter code that you can copy and paste.</li>
                <li><strong>Smart Suggestions:</strong> Not sure what you need? Osara suggests features and layouts based on industry best practices.</li>
            </ul>

            <h2>Who is this for?</h2>
            <p>Whether you are a solo developer building your first MVP, a startup founder pitching to investors, or an agency looking to speed up prototyping, Osara AI empowers you to build beautiful apps without a design degree.</p>
            
            <p>Start generating today and experience the future.</p>
        `,
        excerpt: "Discover how Osara AI transforms text prompts into production-ready mobile app designs in seconds.",
        language: "en",
        tags: ["News", "AI", "Osara"],
        category: "Updates",
        image: images.ai
    },
    {
        title: "مرحباً بكم في Osara AI: مستقبل تصميم تطبيقات الموبايل",
        slug: "welcome-osara-ai-ar",
        content: `
            <h1>مستقبل تصميم التطبيقات يبدأ هنا</h1>
            <p>مرحباً بكم في <strong>Osara AI</strong>، المساعد الذكي الذي يحول أفكارك المكتوبة إلى واجهات تطبيقات موبايل احترافية وقابلة للتعديل. في عالم تعني فيه السرعة كل شيء، لم يعد الانتظار لأسابيع للحصول على تصميم أمراً مقبولاً.</p>
            
            <h2>لماذا Osara AI؟</h2>
            <p>عمليات التصميم التقليدية بطيئة ومكلفة. تحتاج لمصمم، ومراجعات لا تنتهي، ثم تسليم للمبرمجين. Osara يختصر هذه الرحلة في ثوانٍ:</p>
            <ul>
                <li><strong>توليد فوري:</strong> صف تطبيقك (مثلاً: "تطبيق بنكي عصري بوضع ليلي") واحصل على النتيجة فوراً.</li>
                <li><strong>أكواد جاهزة:</strong> لا نقدم مجرد صور. نحن نوفر لك كود React Native و Flutter جاهز للنسخ واللصق.</li>
                <li><strong>اقتراحات ذكية:</strong> لست متأكداً مما تحتاج؟ Osara يقترح عليك الميزات والتخطيطات بناءً على أفضل الممارسات العالمية.</li>
            </ul>

            <h2>لمن هذه الأداة؟</h2>
            <p>سواء كنت مطوراً مستقلاً تبني تطبيقك الأول، أو مؤسس شركة ناشئة تعرض فكرتك على المستثمرين، أو شركة برمجيات تهدف لتسريع العمل، Osara AI يمنحك القوة لبناء تطبيقات مذهلة دون الحاجة لخبرة في التصميم.</p>
            
            <p>ابدأ التصميم اليوم وجرب المستقبل بنفسك.</p>
        `,
        excerpt: "اكتشف كيف يحول Osara AI النصوص إلى تصميمات تطبيقات جاهزة للعمل في ثوانٍ.",
        language: "ar",
        tags: ["أخبار", "ذكاء اصطناعي", "أوسارا"],
        category: "أخبار",
        image: images.ai
    },
    // 2. Tutorial
    {
        title: "How to Design a Food Delivery App from Scratch",
        slug: "food-delivery-app-tutorial",
        content: `
            <h1>Building the Next Uber Eats</h1>
            <p>Food delivery apps are complex. They need to handle restaurant listings, menus, carts, and tracking. Designing all these screens manually can take days. Let's do it in 5 minutes with Osara AI.</p>

            <h2>Step 1: The Home Screen</h2>
            <p>Start with a prompt like: <em>"A food delivery app home screen with a search bar, horizontal categories slider (Pizza, Burger), and a list of popular restaurants with ratings."</em></p>
            <p>Osara will generate a clean, user-friendly layout prioritizing food imagery.</p>

            <h2>Step 2: Restaurant Details</h2>
            <p>Next, ask for: <em>"A restaurant menu page with a large cover image, restaurant info, and a list of food items with 'Add to Cart' buttons."</em></p>

            <h2>Step 3: Cart & Checkout</h2>
            <p>Finally: <em>"A shopping cart screen with order summary, delivery map, and 'Place Order' button."</em></p>

            <h2>Pro Tip: Branding</h2>
            <p>Use the Osara editor to switch the primary color to Orange (#FF4500) or Red to stimulate appetite, a common psychological trick in food apps!</p>
        `,
        excerpt: "A step-by-step guide to building a complete food delivery UI, from Home Screen to Checkout, using AI.",
        language: "en",
        tags: ["Tutorial", "Food App", "Design"],
        category: "Engineering",
        image: images.mobile
    },
    {
        title: "كيف تصمم تطبيق توصيل طعام (مثل طلبات) من الصفر",
        slug: "food-delivery-app-tutorial-ar",
        content: `
            <h1>بناء تطبيق المطاعم القادم</h1>
            <p>تطبيقات توصيل الطعام معقدة. تحتاج للتعامل مع قوائم المطاعم، الوجبات، سلة الشراء، والتتبع. تصميم كل هذه الشاشات يدوياً يستغرق أياماً. دعنا نفعلها في 5 دقائق مع Osara AI.</p>

            <h2>الخطوة 1: الشاشة الرئيسية</h2>
            <p>ابدأ بأمر نصي مثل: <em>"شاشة رئيسية لتطبيق طعام مع شريط بحث، تصنيفات أفقية (بيتزا، برجر)، وقائمة بالمطاعم المشهورة مع التقييم."</em></p>
            <p>سيقوم Osara بتوليد واجهة نظيفة وسهلة الاستخدام تركز على صور الطعام.</p>

            <h2>الخطوة 2: تفاصيل المطعم</h2>
            <p>التالي، اطلب: <em>"صفحة قائمة طعام المطعم مع صورة غلاف كبيرة، معلومات المطعم، وقائمة الوجبات مع أزرار الإضافة للسلة."</em></p>

            <h2>الخطوة 3: السلة والدفع</h2>
            <p>أخيراً: <em>"شاشة سلة الشراء مع ملخص الطلب، خريطة التوصيل، وزر تأكيد الطلب."</em></p>

            <h2>نصيحة محترف: الهوية البصرية</h2>
            <p>استخدم محرر Osara لتغيير اللون الأساسي إلى البرتقالي (#FF4500) أو الأحمر لفتح الشهية، وهي خدعة نفسية شائعة في تطبيقات الطعام!</p>
        `,
        excerpt: "دليل خطوة بخطوة لبناء واجهة تطبيق توصيل كاملة، من الشاشة الرئيسية إلى الدفع، باستخدام الذكاء الاصطناعي.",
        language: "ar",
        tags: ["شرح", "تطبيقات طعام", "تصميم"],
        category: "هندسة برمجيات",
        image: images.mobile
    },
    // 3. React Native vs Flutter
    {
        title: "React Native vs Flutter: The 2026 Developer Guide",
        slug: "react-native-vs-flutter-2026",
        content: `
            <h1>The Battle of Frameworks</h1>
            <p>One of the most common questions we get at Osara AI is: <em>"Should I export my design to React Native or Flutter?"</em>. The answer depends on your goals.</p>

            <h2>React Native</h2>
            <ul>
                <li><strong>Language:</strong> JavaScript / TypeScript.</li>
                <li><strong>Best For:</strong> Teams with web development background.</li>
                <li><strong>Ecosystem:</strong> Massive library support via NPM.</li>
                <li><strong>Osara Support:</strong> Full JSX + Tailwind export.</li>
            </ul>

            <h2>Flutter</h2>
            <ul>
                <li><strong>Language:</strong> Dart.</li>
                <li><strong>Best For:</strong> High-performance apps needing consistent UI across all devices.</li>
                <li><strong>Strengths:</strong> Amazing documentation and widget reliability.</li>
                <li><strong>Osara Support:</strong> Clean Dart widget tree export.</li>
            </ul>

            <h2>Verdict</h2>
            <p>If you love JS, go React Native. If you want pixel-perfect consistency everywhere, go Flutter. Osara supports both, so you can't lose.</p>
        `,
        excerpt: "An in-depth comparison of the two leading cross-platform frameworks to help you decide which code to export.",
        language: "en",
        tags: ["Development", "React Native", "Flutter"],
        category: "Engineering",
        image: images.code
    },
    {
        title: "React Native أم Flutter: دليل المطور لعام 2026",
        slug: "react-native-vs-flutter-2026-ar",
        content: `
            <h1>صراع إطارات العمل</h1>
            <p>أحد أكثر الأسئلة التي نتلقاها في Osara AI هو: <em>"هل يجب أن أصدر تصميمي لـ React Native أم Flutter؟"</em>. الإجابة تعتمد على أهدافك.</p>

            <h2>React Native</h2>
            <ul>
                <li><strong>اللغة:</strong> JavaScript / TypeScript.</li>
                <li><strong>الأفضل لـ:</strong> الفرق التي لديها خلفية في تطوير الويب.</li>
                <li><strong>البيئة:</strong> مكتبات ضخمة ودعم مجتمعي عبر NPM.</li>
                <li><strong>دعم Osara:</strong> تصدير كامل لكود JSX مع Tailwind.</li>
            </ul>

            <h2>Flutter</h2>
            <ul>
                <li><strong>اللغة:</strong> Dart.</li>
                <li><strong>الأفضل لـ:</strong> التطبيقات عالية الأداء التي تحتاج واجهة متطابقة تماماً على كل الأجهزة.</li>
                <li><strong>نقاط القوة:</strong> توثيق (Documentation) مذهل وثبات في الأدوات.</li>
                <li><strong>دعم Osara:</strong> تصدير هيكلي نظيف لـ Dart Widgets.</li>
            </ul>

            <h2>الخلاصة</h2>
            <p>إذا كنت تحب الجافا سكربت، اختر React Native. إذا كنت تريد أداءً رسومياً مذهلاً، اختر Flutter. لحسن الحظ، Osara يدعم الاثنين!</p>
        `,
        excerpt: "مقارنة متعمقة بين أقوى إطارات العمل لمساعدتك في اتخاذ القرار الصحيح عند تصدير الكود.",
        language: "ar",
        tags: ["برمجة", "React Native", "Flutter"],
        category: "هندسة برمجيات",
        image: images.code
    }
];

async function main() {
    console.log('Seeding blog posts...');
    for (const post of posts) {
        try {
            await prisma.blogPost.upsert({
                where: { slug: post.slug },
                update: post,
                create: post,
            });
            console.log(`Created/Updated: ${post.title}`);
        } catch (e) {
            console.error(`Error seeding ${post.slug}:`, e);
        }
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
