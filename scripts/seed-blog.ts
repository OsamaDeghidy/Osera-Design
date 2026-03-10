
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const posts = [
        {
            title: "The Future of Design: AI Mobile & Web Generation",
            slug: "future-of-design-ai-mobile-web",
            excerpt: "Explore how Osera Design AI is revolutionizing the way developers and startups build high-fidelity interfaces in seconds.",
            content: `
        <h2>Designing at the Speed of Thought</h2>
        <p>In the fast-paced world of digital products, moving from idea to prototype is often the biggest bottleneck. Osera Design AI eliminates this gap by allowing you to generate fully editable Mobile and Web designs using simple natural language prompts.</p>
        
        <h3>Web Design: Desktop-First Strategy</h3>
        <p>Our latest update brings powerful Web generation capabilities. Whether you need a SaaS landing page, an e-commerce storefront, or a personal portfolio, our AI understands desktop-first layouts, responsive grids, and modern typography.</p>
        
        <h3>Mobile Excellence</h3>
        <p>We continue to lead in Mobile UI/UX. From complex dashboard flows to elegant onboarding screens, the designs are ready for React and Tailwind CSS integration immediately.</p>
        
        <p>Join the revolution in Cairo and beyond. Start designing with Osera Design AI today.</p>
      `,
            image: "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&q=80&w=800",
            category: "Engineering",
            language: "en",
        },
        {
            title: "مستقبل التصميم: توليد تطبيقات الجوال والمواقع بالذكاء الاصطناعي",
            slug: "future-of-design-ar",
            excerpt: "اكتشف كيف يغير Osera Design AI طريقة بناء الواجهات البرمجية للمطورين والشركات الناشئة في ثوانٍ معدودة.",
            content: `
        <h2 dir="rtl">التصميم بسرعة البرق</h2>
        <p dir="rtl">في عالم المنتجات الرقمية المتسارع، يمثل الانتقال من الفكرة إلى النموذج الأولي أكبر عائق. ويوفر Osera Design AI هذا الجسر من خلال السماح لك بتوليد تصميمات كاملة للموبايل والويب باستخدام أوامر نصية بسيطة.</p>
        
        <h3 dir="rtl">تصميم الويب: استراتيجية العرض المكتبي</h3>
        <p dir="rtl">تحديثنا الأخير يجلب قدرات قوية لتوليد المواقع. سواء كنت بحاجة إلى صفحة هبوط لخدمات سحابية (SaaS)، أو متجر إلكتروني، أو معرض أعمال شخصي، فإن ذكاءنا الاصطناعي يفهم تخطيطات الشاشات الكبيرة، والشبكات المتجاوبة، والخطوط الحديثة.</p>
        
        <h3 dir="rtl">التميز في الموبايل</h3>
        <p dir="rtl">نستمر في قيادة مجال واجهات المستخدم للموبايل. من لوحات التحكم المعقدة إلى شاشات الترحيب الأنيقة، التصميمات جاهزة للتكامل مع React و Tailwind CSS فوراً.</p>
        
        <p dir="rtl">انضم إلى الثورة في القاهرة وما حولها. ابدأ التصميم مع Osera Design AI اليوم.</p>
      `,
            image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800",
            category: "Engineering",
            language: "ar",
        },
        {
            title: "How to use the Community Gallery & Trends",
            slug: "osera-gallery-trends-guide",
            excerpt: "Learn how to browse, fork, and draw inspiration from thousands of designs created by the Osera Design community.",
            content: `
        <h2>Inspiration is Global</h2>
        <p>The Osera Gallery is more than just a showcase; it's a library of living code. Every design you see in the Trends section can be forked and customized to fit your brand.</p>
        
        <h3>Browsing Trends</h3>
        <p>Our Trends page highlights the most innovative prompts and visual styles currently being explored by our users in Cairo, Egypt, and globally. From glassmorphism to bento layouts, see what's hot.</p>
        
        <h3>Exporting to Studio</h3>
        <p>Found a design you love? One click brings it into your private Studio, where you can modify the colors, text, and layout using our surgical AI editing tools.</p>
      `,
            image: "https://images.unsplash.com/photo-1542744094-24638eff58bb?auto=format&fit=crop&q=80&w=800",
            category: "Design",
            language: "en",
        },
        {
            title: "كشف أحدث اتجاهات التصميم في 2026",
            slug: "ui-ux-trends-2026",
            excerpt: "ما الذي يخبئه المستقبل لتصميم الواجهات؟ تعرف على دور الذكاء الاصطناعي في تشكيل تجربة المستخدم القادمة.",
            content: `
          <h2 dir="rtl">الذكاء الاصطناعي ليس مجرد أداة</h2>
          <p dir="rtl">في عام 2026، أصبح الذكاء الاصطناعي هو المصمم المساعد الحقيقي. لم يعد الأمر يتعلق بمجرد إنشاء صور، بل ببناء أنظمة تصميم كاملة تتكيف مع احتياجات المستخدم.</p>
          
          <h3 dir="rtl">التحول نحو البساطة الفائقة</h3>
          <p dir="rtl">نشهد توجهاً كبيراً نحو الواجهات النظيفة التي تركز على المحتوى، مع لمسات فنية ذكية مثل "Glassmorphism" المطور والظلال الناعمة التي تعطي عمقاً دون تعقيد.</p>
        `,
            image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800",
            category: "Design",
            language: "ar",
        }
    ];

    for (const post of posts) {
        await prisma.blogPost.upsert({
            where: { slug: post.slug },
            update: post,
            create: post,
        });
    }

    console.log("Successfully seeded blog posts");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
