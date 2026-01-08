"use client";
import React, { memo, useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import PromptInput from "@/components/prompt-input";
import Header from "./header";
import { useCreateProject, useGetProjects } from "@/features/use-project";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { Spinner } from "@/components/ui/spinner";
import { ProjectType } from "@/types/project";
import { useRouter } from "next/navigation";
import { FolderOpenDotIcon } from "lucide-react";
import { toast } from "sonner";

const LandingSection = () => {
  const { user } = useKindeBrowserClient();
  const router = useRouter();
  const [promptText, setPromptText] = useState<string>("");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [mode, setMode] = useState<"creative" | "precise">("creative");
  const [language, setLanguage] = useState<"en" | "ar">("en");
  const userId = user?.id;

  const { data: projects, isLoading, isError } = useGetProjects(userId);
  const { mutate, isPending } = useCreateProject();

  const suggestionsEn = [
    {
      label: "Finance Tracker",
      icon: "💸",
      value: `Finance app statistics screen. Current balance at top with dollar amount, bar chart showing spending over months (Oct-Mar) with month selector pills below, transaction list with app icons, amounts, and categories. Bottom navigation bar. Mobile app, single screen. Style: Dark theme, chunky rounded cards, playful but professional, modern sans-serif typography, Gen Z fintech vibe. Fun and fresh, not corporate.`,
    },
    {
      label: "Fitness Activity",
      icon: "🔥",
      value: `Fitness tracker summary screen. Large central circular progress ring showing steps and calories with neon glow. Line graph showing heart rate over time. Bottom section with grid of health metrics (Sleep, Water, SpO2). Mobile app, single screen. Style: Deep Dark Mode (OLED friendly). Pitch black background with electric neon green and vibrant blue accents. High contrast, data-heavy but organized, sleek and sporty aesthetic.`,
    },
    {
      label: "Food Delivery",
      icon: "🍔",
      value: `Food delivery home feed. Top search bar with location pin. Horizontal scrolling hero carousel of daily deals. Vertical list of restaurants with large delicious food thumbnails, delivery time badges, and rating stars. Floating Action Button (FAB) for cart. Mobile app, single screen. Style: Vibrant and Appetizing. Warm colors (orange, red, yellow), rounded card corners, subtle drop shadows to create depth. Friendly and inviting UI.`,
    },
    {
      label: "Travel Booking",
      icon: "✈️",
      value: `Travel destination detail screen. Full-screen immersive photography of a tropical beach. Bottom sheet overlay with rounded top corners containing hotel title, star rating, price per night, and a large "Book Now" button. Horizontal scroll of amenity icons. Mobile app, single screen. Style: Minimalist Luxury. ample whitespace, elegant serif typography for headings, clean sans-serif for body text. Sophisticated, airy, high-end travel vibe.`,
    },
    {
      label: "E-Commerce",
      icon: "👟",
      value: `Sneaker product page. Large high-quality product image on a light gray background. Color selector swatches, size selector grid, and a sticky "Add to Cart" button at the bottom. Title and price in bold, oversized typography. Mobile app, single screen. Style: Neo-Brutalism. High contrast, thick black outlines on buttons and cards, hard shadows (no blur), unrefined geometry, bold solid colors (yellow and black). Trendy streetwear aesthetic.`,
    },
    {
      label: "Meditation",
      icon: "🧘",
      value: `Meditation player screen. Central focus is a soft, abstract breathing bubble animation. Play/Pause controls and a time slider below. Background is a soothing solid pastel sage green. Mobile app, single screen. Style: Soft Minimal. Rounded corners on everything, low contrast text for relaxation, pastel color palette, very little UI clutter. Zen, calming, and therapeutic atmosphere.`,
    },
  ];

  const suggestionsAr = [
    {
      label: "تطبيق مصاريف",
      icon: "💸",
      value: `شاشة إحصائيات لتطبيق مالي. الرصيد الحالي في الأعلى، رسم بياني بالأعمدة يوضح المصاريف الشهرية، وقائمة بالمعاملات الأخيرة مع أيقونات وتصنيفات. شريط تنقل سفلي. تصميم عصري، ثيم داكن (Dark Theme)، بطاقات دائرية، وألوان مريحة للعين.`,
    },
    {
      label: "تطبيق لياقة",
      icon: "🔥",
      value: `شاشة ملخص النشاط الرياضي. حلقة دائرية كبيرة في المنتصف توضح الخطوات والسعرات الحرارية مع توهج نيون. رسم بياني خطي لمعدل ضربات القلب. شبكة سفلية لمقاييس الصحة (النوم، المياه). خلفية سوداء (OLED) مع لمسات خضراء نيون وزرقاء.`,
    },
    {
      label: "توصيل طعام",
      icon: "🍔",
      value: `شاشة رئيسية لتطبيق توصيل طعام. شريط بحث علوي مع تحديد الموقع. كاروسيل أفقي للعروض اليومية. قائمة عمودية للمطاعم مع صور طعام لذيذة وكبيرة، وتقييمات بالنجوم. زر عائم للسلة. ألوان دافئة وفاتحة للشهية (برتقالي، أحمر)، وزوايا ناعمة.`,
    },
    {
      label: "حجز سفر",
      icon: "✈️",
      value: `شاشة تفاصيل وجهة سياحية. صورة كاملة الشاشة لشاطئ استوائي. قائمة سفلية (Bottom Sheet) تحتوي على اسم الفندق، التقييم، والسعر في الليلة، وزر كبير "احجز الآن". قائمة أفقية للمرافق. تصميم بسيط وفاخر، مساحات بيضاء واسعة، وخطوط أنيقة.`,
    },
    {
      label: "متجر إلكتروني",
      icon: "👟",
      value: `صفحة منتج حذاء رياضي. صورة كبيرة للمنتج على خلفية رمادية فاتحة. خيارات الألوان والمقاسات. زر "أضف للسلة" ثابت في الأسفل. العنوان والسعر بخط عريض وكبير. تصميم Neo-Brutalism عصري، تباين عالي، وحدود سوداء واضحة.`,
    },
    {
      label: "تطبيق تأمل",
      icon: "🧘",
      value: `شاشة مشغل للتأمل. التركيز المركزي على فقاعة تنفس متحركة وناعمة. أزرار التحكم في التشغيل وشريط الوقت في الأسفل. الخلفية بلون أخضر ميرمية (Sage Green) هادئ جداً. تصميم بسيط (Minimal)، زوايا دائرية، ونص مريح للأعصاب.`,
    },
  ];

  const suggestions = language === "ar" ? suggestionsAr : suggestionsEn;

  const handleSuggestionClick = (val: string) => {
    setPromptText(val);
  };

  useEffect(() => {
    const savedPrompt = localStorage.getItem("saved_design_prompt");
    if (savedPrompt && user) {
      setPromptText(savedPrompt);
      mutate({ prompt: savedPrompt, imageBase64: null });
      localStorage.removeItem("saved_design_prompt");
      toast.success("Welcome back! Generating your design...");
    }
  }, [user, mutate]);

  const handleSubmit = () => {
    if (!promptText && !imageBase64) return;

    if (!user) {
      localStorage.setItem("saved_design_prompt", promptText);
      toast.info("Please create an account to generate your design");
      router.push("/api/auth/register");
      return;
    }

    mutate({ prompt: promptText, imageBase64, mode, language });
    setImageBase64(null); // Clear image after submit
  };

  return (
    <div className=" w-full min-h-screen">
      <div className="flex flex-col">
        <Header />

        <div className="relative overflow-hidden pt-28">
          <div
            className="max-w-6xl mx-auto flex flex-col
         items-center justify-center gap-8
        "
          >
            <div className="space-y-3">
              <h1
                className="text-center font-semibold text-4xl
            tracking-tight sm:text-5xl
            "
              >
                Design mobile apps <br className="md:hidden" />
                <span className="text-primary">in minutes</span>
              </h1>
              <div className="mx-auto max-w-2xl ">
                <p className="text-center font-medium text-foreground leading-relaxed sm:text-lg">
                  Go from idea to beautiful app mockups in minutes by chatting
                  with AI.
                </p>
              </div>
            </div>

            <div
              className="flex w-full max-w-3xl flex-col
            item-center gap-8 relative z-50
            "
            >
              <div className="w-full">
                <PromptInput
                  className="ring-2 ring-primary"
                  promptText={promptText}
                  setPromptText={setPromptText}
                  imageBase64={imageBase64}
                  setImageBase64={setImageBase64}
                  mode={mode}
                  setMode={setMode}
                  isLoading={isPending}
                  onSubmit={handleSubmit}
                  language={language}
                  setLanguage={setLanguage}
                />
              </div>

              <div className="flex flex-wrap justify-center gap-2 px-5">
                <Suggestions>
                  {suggestions.map((s) => (
                    <Suggestion
                      key={s.label}
                      suggestion={s.label}
                      className="text-xs! h-7! px-2.5 pt-1!"
                      onClick={() => handleSuggestionClick(s.value)}
                    >
                      {s.icon}
                      <span>{s.label}</span>
                    </Suggestion>
                  ))}
                </Suggestions>
              </div>
            </div>

            <div
              className="absolute -translate-x-1/2
             left-1/2 w-[5000px] h-[3000px] top-[80%]
             -z-10"
            >
              <div
                className="-translate-x-1/2 absolute
               bottom-[calc(100%-300px)] left-1/2
               h-[2000px] w-[2000px]
               opacity-20 bg-radial-primary"
              ></div>
              <div
                className="absolute -mt-2.5
              size-full rounded-[50%]
               bg-primary/20 opacity-70
               [box-shadow:0_-15px_24.8px_var(--primary)]"
              ></div>
              <div
                className="absolute z-0 size-full
               rounded-[50%] bg-background"
              ></div>
            </div>
          </div>
        </div>

        <div className="w-full py-10">
          <div className="mx-auto max-w-3xl">
            {userId && (
              <div>
                <h1
                  className="font-medium text-xl
              tracking-tight
              "
                >
                  Recent Projects
                </h1>

                {isLoading ? (
                  <div
                    className="flex items-center
                  justify-center py-2
                  "
                  >
                    <Spinner className="size-10" />
                  </div>
                ) : (
                  <div
                    className="grid grid-cols-1 sm:grid-cols-2
                  md:grid-cols-3 gap-3 mt-3
                    "
                  >
                    {projects?.map((project: ProjectType) => (
                      <ProjectCard key={project.id} project={project} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {isError && <p className="text-red-500">Failed to load projects</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

const ProjectCard = memo(({ project }: { project: ProjectType }) => {
  const router = useRouter();
  const createdAtDate = new Date(project.createdAt);
  const timeAgo = formatDistanceToNow(createdAtDate, { addSuffix: true });
  const thumbnail = project.thumbnail || null;

  const onRoute = () => {
    router.push(`/project/${project.id}`);
  };

  return (
    <div
      role="button"
      className="w-full flex flex-col border rounded-xl cursor-pointer
    hover:shadow-md overflow-hidden
    "
      onClick={onRoute}
    >
      <div
        className="h-40 bg-[#eee] relative overflow-hidden
        flex items-center justify-center
        "
      >
        {thumbnail ? (
          <img
            src={thumbnail}
            className="w-full h-full object-cover object-left
           scale-110
          "
          />
        ) : (
          <div
            className="w-16 h-16 rounded-full bg-primary/20
              flex items-center justify-center text-primary
            "
          >
            <FolderOpenDotIcon />
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col">
        <h3
          className="font-semibold
         text-sm truncate w-full mb-1 line-clamp-1"
        >
          {project.name}
        </h3>
        <p className="text-xs text-muted-foreground">{timeAgo}</p>
      </div>
    </div>
  );
});

ProjectCard.displayName = "ProjectCard";

export default LandingSection;
