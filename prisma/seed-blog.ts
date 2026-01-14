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
        content: "<h1>Welcome to Osara AI</h1><p>Osara AI is an advanced AI agent capable of generating fully editable mobile app designs in seconds. Whether you are a developer looking to speed up your workflow or a startup founder with an idea, Osara is here to help.</p><h2>How it works</h2><p>Simply describe your app idea in text, and our AI will generate the UI, complete with code (React Native/Flutter).</p>",
        excerpt: "Discover how Osara AI transforms text prompts into production-ready mobile app designs.",
        language: "en",
        tags: ["News", "AI", "Osara"],
        category: "Updates",
        image: images.ai
    },
    {
        title: "مرحباً بكم في Osara AI: مستقبل تصميم تطبيقات الموبايل",
        slug: "welcome-osara-ai-ar",
        content: "<h1>مرحباً بكم في Osara AI</h1><p>أوسارا هو وكيل ذكاء اصطناعي متقدم قادر على توليد تصميمات تطبيقات موبايل قابلة للتعديل بالكامل في ثوانٍ. سواء كنت مبرمجاً تهدف لتسريع عملك أو مؤسس شركة ناشئة لديك فكرة، أوسارا هنا للمساعدة.</p><h2>كيف يعمل؟</h2><p>ببساطة، اشرح فكرة تطبيقك نصياً، وسيقوم الذكاء الاصطناعي بتوليد واجهة المستخدم (UI) مع الكود البرمجي.</p>",
        excerpt: "اكتشف كيف يحول Osara AI النصوص إلى تصميمات تطبيقات جاهزة للعمل.",
        language: "ar",
        tags: ["أخبار", "ذكاء اصطناعي", "أوسارا"],
        category: "أخبار",
        image: images.ai
    },
    // 2. Tutorial
    {
        title: "How to Design a Food Delivery App in 5 Minutes",
        slug: "food-delivery-app-tutorial",
        content: "<h1>Designing a Food App</h1><p>In this tutorial, we will show you how to build a Talabat or Uber Eats clone using Osara AI.</p><h2>Step 1: The Prompt</h2><p>Type: 'A food delivery app with a home screen showing restaurants, a menu page, and a cart checkout.'</p><h2>Step 2: Customization</h2><p>Use the editor to change colors to Orange/Red to stimulate appetite.</p>",
        excerpt: "Learn to build a complete food delivery UI from scratch using AI steps.",
        language: "en",
        tags: ["Tutorial", "Food App", "Design"],
        category: "Engineering",
        image: images.mobile
    },
    {
        title: "كيف تصمم تطبيق توصيل طعام في 5 دقائق",
        slug: "food-delivery-app-tutorial-ar",
        content: "<h1>تصميم تطبيق مطاعم</h1><p>في هذا الدرس، سنشرح كيفية بناء شبيه لتطبيق طلبات أو أوبر إيتس باستخدام Osara AI.</p><h2>الخطوة 1: الأمر النصي</h2><p>اكتب: 'تطبيق توصيل طعام مع شاشة رئيسية للمطاعم، وصفحة قائمة طعام، وشاشة الدفع.'</p><h2>الخطوة 2: التخصيص</h2><p>استخدم المحرر لتغيير الألوان إلى البرتقالي أو الأحمر لفتح الشهية.</p>",
        excerpt: "تعلم بناء واجهة تطبيق توصيل كاملة من الصفر بخطوات بسيطة.",
        language: "ar",
        tags: ["شرح", "تطبيقات طعام", "تصميم"],
        category: "هندسة برمجيات",
        image: images.mobile
    },
    // 3. React Native vs Flutter
    {
        title: "React Native vs Flutter: Which one to choose in 2026?",
        slug: "react-native-vs-flutter-2026",
        content: "<h1>The Great Debate</h1><p>Both frameworks are excellent, but your choice depends on your team's expertise. Osara AI exports to both!</p><h2>React Native</h2><p>Best for web developers accustomed to JavaScript.</p><h2>Flutter</h2><p>Best for high-performance graphics and consistent UI.</p>",
        excerpt: "A comprehensive comparison for the modern developer.",
        language: "en",
        tags: ["Development", "React Native", "Flutter"],
        category: "Engineering",
        image: images.code
    },
    {
        title: "React Native أم Flutter: ماذا تختار في 2026؟",
        slug: "react-native-vs-flutter-2026-ar",
        content: "<h1>المنافسة الكبرى</h1><p>كلا الإطارين ممتاز، لكن اختيارك يعتمد على خبرة فريقك. Osara AI يدعم التصدير لكليهما!</p><h2>React Native</h2><p>الأفضل لمطوري الويب المعتادين على JavaScript.</p><h2>Flutter</h2><p>الأفضل للأداء العالي والواجهات المتناسقة.</p>",
        excerpt: "مقارنة شاملة للمطور العصري.",
        language: "ar",
        tags: ["برمجة", "React Native", "Flutter"],
        category: "هندسة برمجيات",
        image: images.code
    },
    // 4. E-commerce
    {
        title: "Boosting E-commerce Sales with Better UI Design",
        slug: "ecommerce-ui-tips",
        content: "<h1>UI Tips for Sales</h1><p>A good design builds trust. Ensure your 'Add to Cart' button is visible and contrasty.</p><p>Osara's e-commerce templates are optimized for conversion.</p>",
        excerpt: "Tips and tricks to increase conversion rates through design.",
        language: "en",
        tags: ["E-commerce", "Tips", "Business"],
        category: "Business",
        image: images.business
    },
    {
        title: "زيادة مبيعات المتاجر الإلكترونية من خلال التصميم",
        slug: "ecommerce-ui-tips-ar",
        content: "<h1>نصائح للتصميم والمبيعات</h1><p>التصميم الجيد يبني الثقة. تأكد من أن زر 'أضف للسلة' واضح ومتباين اللون.</p><p>نماذج التجارة الإلكترونية في Osara مصممة خصيصاً لزيادة التحويل.</p>",
        excerpt: "نصائح وحيل لزيادة معدلات التحويل من خلال تحسين واجهة المستخدم.",
        language: "ar",
        tags: ["تجارة إلكترونية", "نصائح", "بيزنس"],
        category: "أعمال",
        image: images.business
    },
    // 5. Why AI?
    {
        title: "Why Startups Should Use AI for MVP",
        slug: "ai-for-mvp",
        content: "<h1>Speed is Key</h1><p>Investors want to see a product, not slides. AI helps you build an MVP in days, not months.</p><p>Osara AI reduces the cost of MVP design by 90%.</p>",
        excerpt: "How AI accelerates the path from idea to funding.",
        language: "en",
        tags: ["Startups", "MVP", "Strategy"],
        category: "Business",
        image: images.office
    },
    {
        title: "لماذا يجب على الشركات الناشئة استخدام الذكاء الاصطناعي للـ MVP",
        slug: "ai-for-mvp-ar",
        content: "<h1>السرعة هي المفتاح</h1><p>المستثمرون يريدون رؤية منتج، وليس شرائح عرض. الذكاء الاصطناعي يساعدك لبناء نموذج أولي في أيام.</p><p>Osara AI يقلل تكلفة تصميم النموذج الأولي بنسبة 90%.</p>",
        excerpt: "كيف يسرع الذكاء الاصطناعي الطريق من الفكرة إلى التمويل.",
        language: "ar",
        tags: ["شركات ناشئة", "MVP", "استراتيجية"],
        category: "أعمال",
        image: images.office
    },
    // 6. Color Theory
    {
        title: "Color Psychology in Mobile Apps",
        slug: "color-psychology",
        content: "<h1>Choosing the Right Colors</h1><p>Blue represents trust (Banks), Red represents hunger/urgency (Food), Green represents health.</p><p>Osara has built-in color palettes based on these theories.</p>",
        excerpt: "Understand how colors affect user behavior.",
        language: "en",
        tags: ["Design", "Colors", "Psychology"],
        category: "Design",
        image: images.design
    },
    {
        title: "سيكولوجية الألوان في تطبيقات الموبايل",
        slug: "color-psychology-ar",
        content: "<h1>اختيار الألوان الصحيحة</h1><p>الأزرق يمثل الثقة (بنوك)، الأحمر الجوع/الإلحاح (طعام)، الأخضر الصحة.</p><p>يحتوي Osara على لوحات ألوان جاهزة مبنية على هذه النظريات.</p>",
        excerpt: "افهم كيف تؤثر الألوان على سلوك المستخدم.",
        language: "ar",
        tags: ["تصميم", "ألوان", "علم نفس"],
        category: "تصميم",
        image: images.design
    },
    // 7. No-Code Movement
    {
        title: "Is No-Code the End of Programming?",
        slug: "no-code-vs-code",
        content: "<h1>No, it's just a tool.</h1><p>No-code tools are great for simple apps, but code generation tools like Osara give you the best of both worlds: Speed + Customizability.</p>",
        excerpt: "Debunking myths about the No-Code movement.",
        language: "en",
        tags: ["No-Code", "Programming", "Opinion"],
        category: "Engineering",
        image: images.tech
    },
    {
        title: "هل الـ No-Code هو نهاية البرمجة؟",
        slug: "no-code-vs-code-ar",
        content: "<h1>لا، إنه مجرد أداة.</h1><p>أدوات الـ No-Code ممتازة للتطبيقات البسيطة، لكن أدوات توليد الكود مثل Osara تمنحك أفضل ما في العالمين: السرعة + قابلية التخصيص.</p>",
        excerpt: "كشف الحقائق حول حركة الـ No-Code.",
        language: "ar",
        tags: ["نو كود", "برمجة", "رأي"],
        category: "هندسة برمجيات",
        image: images.tech
    },
    // 8. Typography
    {
        title: "Typography Matters: Choosing Fonts",
        slug: "typography-fonts",
        content: "<h1>Readable & Beautiful</h1><p>For Arabic, 'Cairo' is king. For English, 'Jost' or 'Inter'.</p><p>Osara automatically selects the best fonts for your language.</p>",
        excerpt: "How to select fonts that look good on small screens.",
        language: "en",
        tags: ["Design", "Typography", "Fonts"],
        category: "Design",
        image: images.design
    },
    {
        title: "أهمية الخطوط: كيف تختار خط التطبيق",
        slug: "typography-fonts-ar",
        content: "<h1>مقروء وجميل</h1><p>للغة العربية، خط 'Cairo' هو الملك. للإنجليزية 'Jost' أو 'Inter'.</p><p>يقوم Osara باختيار أفضل الخطوط تلقائياً حسب لغة التطبيق.</p>",
        excerpt: "كيف تختار خطوطاً تبدو رائعة على الشاشات الصغيرة.",
        language: "ar",
        tags: ["تصميم", "خطوط", "تايبوجرافي"],
        category: "تصميم",
        image: images.design
    },
    // 9. Accessibility
    {
        title: "Designing for Everyone: Accessibility",
        slug: "app-accessibility",
        content: "<h1>Inclusive Design</h1><p>Ensure your buttons are large enough and colors have enough contrast for visually impaired users.</p>",
        excerpt: "Making your app usable by everyone.",
        language: "en",
        tags: ["Accessibility", "UX", "Guide"],
        category: "Design",
        image: images.mobile
    },
    {
        title: "التصميم للجميع: سهولة الوصول (Accessibility)",
        slug: "app-accessibility-ar",
        content: "<h1>تصميم شامل</h1><p>تأكد من أن الأزرار كبيرة بما يكفي وأن الألوان ذات تباين عالٍ لضعاف البصر.</p>",
        excerpt: "جعل تطبيقك قابلاً للاستخدام من قبل الجميع.",
        language: "ar",
        tags: ["سهولة الوصول", "تغربة مستخدم", "دليل"],
        category: "تصميم",
        image: images.mobile
    },
    // 10. Future of Osara
    {
        title: "What's Next for Osara AI?",
        slug: "osara-roadmap-2026",
        content: "<h1>Our Roadmap</h1><p>We are working on: 1. Full Project Export 2. Collaborative Editing 3. AI Copilot for Code.</p>",
        excerpt: "A sneak peek into our upcoming features.",
        language: "en",
        tags: ["Roadmap", "News", "Future"],
        category: "Updates",
        image: images.ai
    },
    {
        title: "ما القادم لـ Osara AI؟",
        slug: "osara-roadmap-2026-ar",
        content: "<h1>خارطة الطريق</h1><p>نعمل حالياً على: 1. تصدير كامل للمشروع 2. التحرير التعاوني 3. مساعد ذكي للأكواد.</p>",
        excerpt: "نظرة سريعة على الميزات القادمة.",
        language: "ar",
        tags: ["خارطة طريق", "أخبار", "مستقبل"],
        category: "أخبار",
        image: images.ai
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
