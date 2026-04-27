# 🚀 Osera Design AI - PROJECT STATUS & ARCHITECTURE

هذا الملف هو المرجع التقني الشامل لحالة المشروع الحالية، الميزات المنفذة، ومعمارية النظام. يهدف لضمان الفهم العميق للمنصة وتجنب أي سوء تقدير لقدراتها في المستقبل.

---

## 🏗️ Core Architecture (المعمارية الأساسية)

*   **Frontend**: Next.js 16.1.x (App Router), React 19.2.x, Tailwind CSS v4.
*   **Backend**: Next.js API Routes + **Inngest** للعمليات المعقدة في الخلفية.
*   **Database**: MongoDB مع **Prisma ORM**.
*   **Authentication**: **Kinde Auth**.
*   **UI Components**: Shadcn UI (Radix UI).

---

## ✅ Features Implemented (الميزات المنفذة بالفعل)

### 1. AI Mobile UI Generator (`inngest/functions/generateScreens.ts`)
*   **Lazy Generation Strategy**: يتم توليد الشاشة الأولى بالكامل (Full UI)، بينما يتم وضع **Skeletons** للشاشات التالية مع تخزين الـ `Purpose` والـ `Visual Description` في علامات (Markers).
*   **Multi-Model Analysis**: استخدام `gemini-2.5-flash-lite` للتخطيط والتحليل (Planning).
*   **Vision Support**: إمكانية رفع صورة (Image-to-Code) لمحاكاة التصميم.
*   **Arabic RTL Support**: دعم كامل للواجهات العربية مع خط "Cairo" وقلب العناصر (Mirroring).

### 2. Digital Design Studio (`app/studio`)
*   **Poster Generation**: مخصص لتوليد بوسترات تسويقية وعروض تقديمية للمشاريع.
*   **Brand DNA Extraction**: نظام ذكي يقوم بتحليل كود الـ HTML الخاص بمشروع المستخدم لاستخراج "بصمة البراند" (الألوان والستايل) ثم يمررها لـ `Nano Banana Pro` لضمان تناسق البوستر مع التطبيق.
*   **Image Editor**: محرر متكامل (Canvas-based) لإضافة النصوص، الحذف، التراجع، والتحكم في الأبعاد.

### 3. Integrated Admin Panel (`app/(admin)/admin`)
*   **Users Management**: تتبع المستخدمين وحالتهم.
*   **Project Dashboard**: متابعة المشاريع المولدة.
*   **Payment Tracking**: نظام كامل لمتابعة عمليات الدفع (Paymob, PayPal).
*   **Feedback & Studio**: مراقبة الاقتراحات والتصاميم المولدة في الاستوديو.

### 4. Credit & Monetization System
*   **Credits**: خصم تلقائي (1 كريدت للتصميم، 2 كريدت للاستوديو).
*   **Payment Gateways**: دمج `Paymob` و `PayPal` مع صفحات تجريبية لـ `PaySky`.
*   **Unlimited Tier**: خاصية للمطورين أو المشتركين المميزين لتجاوز قيود الكريدت.

---

## ⚙️ Technical Workflows (سير العمل التقني)

*   **Inngest Events**:
    *   `ui/generate.screens`: لتوليد تطبيقات الموبايل.
    *   `ui/generate.web`: لتوليد صفحات الويب (Desktop).
    *   `ui/regenerate.frame`: لإعادة توليد إطار (Frame) محدد.
*   **API Architecture**:
    *   `/api/design/studio/generate`: المحرك الأساسي لتوليد الصور العالية الجودة.
    *   `/api/screenshot`: لاستخدام `Puppeteer` لأخذ لقطات من الـ HTML.

---

## 🚧 Current Gaps & Roadmap (فجوات قيد التطوير)

*   **Surgical Editing**: تعديل مكون (Component) بعينه داخل الإطار بدلاً من إعادة توليد الإطار كاملاً.
*   **Public Gallery**: نظام عرض عام للمشاريع لتحسين الـ SEO.
*   **AI Code Linter**: طبقة إضافية لتنظيف كود Tailwind الناتج من AI قبل حفظه في الداتا بيز.

---

## 📂 Project Hygiene (نظافة المشروع)
*   **Test Files**: ملفات `test-*.mjs` في الـ Root هي سكريبتات تجريبية لـ Paymob و Gemini.
*   **Logs & Personal Notes**: ملفات مثل `osama.txt` و `.env` المنسوخة يجب الحذر عند التعامل معها أو تنظيفها.

---
**آخر تحديث**: 2026-03-20
**الحالة**: الإنتاج (Production Ready)
