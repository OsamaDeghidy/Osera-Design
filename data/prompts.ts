export type PromptCategory = {
    id: string;
    labelEn: string;
    labelAr: string;
    icon: string;
    prompts: PromptItem[];
};

export type PromptItem = {
    id: string;
    titleEn: string;
    titleAr: string;
    descriptionEn: string;
    descriptionAr: string;
    valueEn: string;
    valueAr: string;
};

export const PROMPT_LIBRARY: PromptCategory[] = [
    {
        id: "business",
        labelEn: "Business & SaaS",
        labelAr: "أعمال و خدمات",
        icon: "📊",
        prompts: [
            {
                id: "crm-dashboard",
                titleEn: "CRM Dashboard",
                titleAr: "لوحة تحكم CRM",
                descriptionEn: "Sales overview with charts and tables",
                descriptionAr: "نظرة عامة على المبيعات مع رسوم بيانية وجداول",
                valueEn: "CRM Admin Dashboard screen. Top row with 4 KPIs (Total Revenue, Active Leads, Conversion Rate). Middle section: Large Area Chart showing revenue trends (Jan-Dec). Bottom section: Recent Leads table with status badges (New, Contacted, Won) and user avatars. Style: Clean Corporate, white background, blue accents, dense data visualization.",
                valueAr: "شاشة لوحة تحكم CRM للمسؤولين. الصف العلوي يحتوي على 4 مؤشرات أداء (الإجمالي، العملاء المحتملين، معدل التحويل). القسم الأوسط: رسم بياني مساحي كبير يوضح اتجاهات الدخل. القسم السفلي: جدول العملاء الجدد مع حالات ملونة (جديد، تم الاتصال، تم البيع) وصور المستخدمين. التصميم: نظيف ومؤسسي، خلفية بيضاء، لمسات زرقاء، وعرض كثيف للبيانات.",
            },
            {
                id: "crypto-wallet",
                titleEn: "Crypto Wallet",
                titleAr: "محفظة عملات رقمية",
                descriptionEn: "Dark mode portfolio tracker",
                descriptionAr: "متتبع محفظة الوضع الداكن",
                valueEn: "Crypto Wallet Portfolio screen. Dark aesthetic (Midnight Blue/Black). Large balance display in center with +2.4% green indicator. List of assets (Bitcoin, Ethereum, Solana) with sparkline mini-charts. Bottom navigation with floating 'Swap' button. Glassmorphism effects on cards.",
                valueAr: "شاشة محفظة عملات رقمية. ثيم داكن (أزرق ليلي/أسود). عرض الرصيد بخط كبير في المنتصف مع مؤشر ربح أخضر. قائمة العملات (بيتكوين، إيثيريوم) مع رسوم بيانية مصغرة. شريط تنقل سفلي مع زر 'تبديل' عائم. تأثيرات زجاجية (Glassmorphism) على البطاقات.",
            },
            {
                id: "analytics-report",
                titleEn: "Analytics Report",
                titleAr: "تقرير تحليلات",
                descriptionEn: "Detailed metrics and easy-to-read graphs",
                descriptionAr: "مؤشرات تفصيلية ورسوم بيانية سهلة القراءة",
                valueEn: "Social Media Analytics screen. Grid layout of metric cards: Follower Growth (Line Chart), Engagement Rate (Circular Progress), Audience Demographics (Bar Chart). Top header with date range picker. Style: Modern Minimalist, soft gray background, colorful data visualizations.",
                valueAr: "شاشة تحليلات وسائل التواصل الاجتماعي. تخطيط شبكي لبطاقات المقاييس: نمو المتابعين (رسم خطي)، معدل التفاعل (دائري)، ديموغرافية الجمهور (أعمدة). ترويسة علوية مع محدد التاريخ. التصميم: عصري بسيط، خلفية رمادية فاتحة، وتمثيل بيانات ملون.",
            },
        ],
    },
    {
        id: "ecommerce",
        labelEn: "E-Commerce",
        labelAr: "تجارة إلكترونية",
        icon: "🛍️",
        prompts: [
            {
                id: "fashion-store",
                titleEn: "Fashion Store Home",
                titleAr: "رئيسية متجر أزياء",
                descriptionEn: "Trendy clothing app feed",
                descriptionAr: "واجهة تطبيق ملابس عصري",
                valueEn: "Fashion eCommerce Home screen. Hero section with full-width model photography and 'New Collection' overlay. Horizontal scroll of categories (Men, Women, Kids). Grid of product cards with heart icon, price, and 'Add' button. Style: High-end Editorial, ample whitespace, serif typography headers, black and white color scheme.",
                valueAr: "الشاشة الرئيسية لمتجر أزياء. قسم علوي (Hero) مع صورة عارضة بعرض كامل ونص 'تشكيلة جديدة'. تصفح أفقي للأقسام (رجال، نساء، أطفال). شبكة من بطاقات المنتجات مع أيقونة قلب، السعر، وزر إضافة. التصميم: راقي (Editorial)، مساحات بيضاء واسعة، عناوين بخط Serif، ونظام ألوان أبيض وأسود.",
            },
            {
                id: "food-delivery",
                titleEn: "Food Delivery Menu",
                titleAr: "قائمة توصيل طعام",
                descriptionEn: "Appetizing restaurant menu",
                descriptionAr: "قائمة مطعم تفتح الشهية",
                valueEn: "Restaurant Details screen. Top third is a header video/image of sizzling burgers. Info overlay with 4.8 stars rating and delivery time. Scrollable menu categories (Burgers, Sides, Drinks). List of items with mouth-watering square thumbnails and price. Sticky 'View Cart' button at bottom. Style: Warm colors (Orange/Red), rounded corners, appetizing UI.",
                valueAr: "شاشة تفاصيل مطعم. الثلث العلوي صورة/فيديو لبرجر ساخن. معلومات عن التقييم (4.8) ووقت التوصيل. قائمة قابلة للتمرير للأصناف (برجر، مقبلات، مشروبات). قائمة العناصر مع صور مربعة شهية والسعر. زر 'عربة التسوق' ثابت بالأسفل. التصميم: ألوان دافئة (برتقالي/أحمر)، زوايا دائرية، وواجهة جذابة.",
            },
        ],
    },
    {
        id: "lifestyle",
        labelEn: "Lifestyle & Social",
        labelAr: "نمط حياة و تواصل",
        icon: "🧘",
        prompts: [
            {
                id: "meditation-player",
                titleEn: "Meditation Player",
                titleAr: "مشغل تأمل",
                descriptionEn: "Calming audio playback screen",
                descriptionAr: "شاشة تشغيل صوتي مريحة",
                valueEn: "Meditation App Player. Background: Soft abstract gradient mesh (Sage Green/Lavender). Center: Pulsing breathing circle animation. Bottom: Playback controls (Play, Pause, slider) and AirPlay icon. Typography: Soft, rounded sans-serif. Vibe: Zen, calming, therapeutic.",
                valueAr: "مشغل تطبيق تأمل. الخلفية: تدرج لوني تجريدي ناعم (أخضر/خزامي). الوسط: دائرة تنفس متحركة. الأسفل: أدوات التحكم في التشغيل وشريط الوقت. الخطوط: ناعمة ودائرية. الجو العام: هادئ، مريح، وعلاجي.",
            },
            {
                id: "chat-list",
                titleEn: "Messaging Inbox",
                titleAr: "صندوق الرسائل",
                descriptionEn: "Modern chat application list",
                descriptionAr: "قائمة محادثات لتطبيق عصري",
                valueEn: "Messaging App Inbox. Search bar at top. Horizontal 'Stories' avatars section. Vertical list of chat threads with user avatars, name, message preview, and time. Swipe actions visible on one item. Floating 'New Chat' button. Style: Clean, familiar (like WhatsApp/Telegram), unread blue badges.",
                valueAr: "صندوق الوارد لتطبيق محادثة. شريط بحث في الأعلى. قسم أفقي لـ 'القصص' (Stories). قائمة عمودية للمحادثات مع صور المستخدمين، الاسم، معاينة الرسالة، والوقت. زر عائم 'محادثة جديدة'. التصميم: نظيف، مألوف، مع شارات زرقاء للرسائل غير المقروءة.",
            },
            {
                id: "travel-explore",
                titleEn: "Travel Explore",
                titleAr: "استكشاف السفر",
                descriptionEn: "Destination discovery feed",
                descriptionAr: "واجهة استكشاف وجهات سياحية",
                valueEn: "Travel App Explore screen. Search bar with 'Where to?'. Masonry grid layout of destination cards (Paris, Tokyo, Bali) with large vertical images, white text overlay, and 'Save' bookmark icon. Bottom navigation bar. Style: Immersive, full-screen imagery, transparent gradients for text readability.",
                valueAr: "شاشة استكشاف لتطبيق سفر. شريط بحث 'إلى أين؟'. تخطيط شبكي (Masonry) لبطاقات الوجهات (باريس، طوكيو، بالي) مع صور عمودية كبيرة، نص أبيض فوق الصورة، وأيقونة حفظ. شريط تنقل سفلي. التصميم: غامر، صور ملء الشاشة، تدرجات شفافة لقراءة النص.",
            },
        ],
    },
    {
        id: "education",
        labelEn: "Education",
        labelAr: "تعليم",
        icon: "🎓",
        prompts: [
            {
                id: "course-dashboard",
                titleEn: "Student Dashboard",
                titleAr: "لوحة تحكم الطالب",
                descriptionEn: "Course progress and upcoming lessons",
                descriptionAr: "تقدم الدورات والدروس القادمة",
                valueEn: "Learning App Student Dashboard. Header with 'Good Morning, Sarah'. Horizontal scroll of 'Continue Learning' cards with progress bars. Vertical list of 'Upcoming Classes'. Bottom navigation. Style: Playful, colorful (Yellow/Purple), rounded shapes, gamification elements (badges, streaks).",
                valueAr: "لوحة تحكم طالب في تطبيق تعليمي. ترويسة 'صباح الخير، سارة'. تصفح أفقي لبطاقات 'تابع التعلم' مع أشرطة تقدم. قائمة عمودية 'الحصص القادمة'. شريط تنقل سفلي. التصميم: مرح، ملون (أصفر/بنفسجي)، أشكال دائرية، وعناصر تحفيز (أوسمة، نقاط).",
            },
            {
                id: "quiz-screen",
                titleEn: "Quiz Screen",
                titleAr: "شاشة اختبار",
                descriptionEn: "Interactive question interface",
                descriptionAr: "واجهة أسئلة تفاعلية",
                valueEn: "Educational Quiz Screen. multiple choice question in center. Timer progress bar at top. 4 distinct answer buttons with hover states. 'Submit' button at bottom. Confetti animation ready. Style: Clean focus, large typography, high contrast for readability.",
                valueAr: "شاشة اختبار تعليمي. سؤال متعدد الخيارات في المنتصف. شريط توقيت في الأعلى. 4 أزرار إجابات مميزة. زر 'إرسال' في الأسفل. التصميم: تركيز عالي، خطوط كبيرة، تباين عالي للقراءة.",
            },
        ],
    },
    {
        id: "real-estate",
        labelEn: "Real Estate",
        labelAr: "عقارات",
        icon: "🏠",
        prompts: [
            {
                id: "property-listing",
                titleEn: "Property Listing",
                titleAr: "قائمة العقارات",
                descriptionEn: "House hunting feed with maps",
                descriptionAr: "تصفح المنازل مع الخرائط",
                valueEn: "Real Estate Listings. Top search bar with filters (Price, Beds). Large image cards of houses with price tag overlay and 'Heart' icon. 'Map View' floating button. Style: Trustworthy, professional, white and navy blue, clean lines.",
                valueAr: "قائمة عقارات. شريط بحث علوي مع فلاتر (السعر، الغرف). بطاقات صور كبيرة للمنازل مع السعر وأيقونة المفضلة. زر عائم 'عرض الخريطة'. التصميم: موثوق، محترف، أبيض وأزرق كحلي، خطوط نظيفة.",
            },
        ],
    },
    {
        id: "news",
        labelEn: "News & Magazine",
        labelAr: "أخبار و مجلات",
        icon: "📰",
        prompts: [
            {
                id: "news-feed",
                titleEn: "News Home",
                titleAr: "رئيسية الأخبار",
                descriptionEn: "Modern editorial news feed",
                descriptionAr: "واجهة أخبار تحريرية عصرية",
                valueEn: "News App Home. featured breaking news with large typography and full-width image. Scrollable categories (Tech, Politics, Sports). List of recent articles with small thumbnails and timestamps. Style: NYTimes aesthetic, serif fonts, classic black and white, serious and legible.",
                valueAr: "الصفحة الرئيسية لتطبيق أخبار. خبر عاجل مميز بخط كبير وصورة بعرض كامل. تصنيفات قابلة للتمرير (تقنية، سياسة، رياضة). قائمة مقالات حديثة مع صور مصغرة وتوقيت. التصميم: كلاسيكي (مثل الصحف)، خطوط Serif المقروءة، أبيض وأسود، جاد.",
            },
        ],
    },
];
