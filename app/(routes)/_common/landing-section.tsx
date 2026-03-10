"use client";
import React, { memo, useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";

import PromptInput from "@/components/prompt-input";
import Header from "./header";
import { useCreateProject, useGetProjects } from "@/features/use-project";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { Spinner } from "@/components/ui/spinner";
import { ProjectType } from "@/types/project";
import { useRouter } from "next/navigation";
import { FolderOpenDotIcon, CreditCardIcon } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

const LandingSection = () => {
  const { user } = useKindeBrowserClient();
  const router = useRouter();
  const [promptText, setPromptText] = useState<string>("");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [mode, setMode] = useState<"creative" | "precise">("creative");
  const [language, setLanguage] = useState<"en" | "ar">("en");
  const [projectType, setProjectType] = useState<"MOBILE" | "WEB">("MOBILE");
  const userId = user?.id;

  const { data: projects, isLoading, isError } = useGetProjects(userId);
  const { mutate, isPending } = useCreateProject();



  useEffect(() => {
    const savedPrompt = localStorage.getItem("saved_design_prompt");
    if (savedPrompt && user) {
      setPromptText(savedPrompt);
      mutate({ prompt: savedPrompt, imageBase64: null, projectType: "MOBILE" });
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

    mutate({ prompt: promptText, imageBase64, mode, language, projectType });
    setImageBase64(null); // Clear image after submit
  };

  return (
    <div className=" w-full min-h-screen">
      <div className="flex flex-col">
        <Header />

        <div className="relative overflow-hidden pt-28">
          <div
            className="max-w-6xl mx-auto flex flex-col
         items-center justify-center gap-8 mb-1
        "
          >
            <div className="space-y-3">
              <h1 className="text-center font-semibold text-4xl tracking-tight sm:text-7xl">
                Your All-in-One AI Design Partner <br className="md:hidden" />
                <span className="text-primary">For Pixel-Perfect UI & Assets</span>
              </h1>
              <div className="mx-auto max-w-2xl ">
                <p className="text-center font-medium text-foreground leading-relaxed sm:text-lg">
                  Generate high-fidelity mobile apps, websites, and brand assets in seconds. The ultimate tool for developers, startups, and designers.
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
                  language={language}
                  setLanguage={setLanguage}
                  projectType={projectType}
                  setProjectType={setProjectType}
                  isLoading={isPending}
                  onSubmit={handleSubmit}
                />
              </div>

              {/* Explicit Checkout/Pricing Link for Reviewers */}
              <div className="w-full flex justify-center mt-2">
                <Link href="/pricing" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors bg-secondary/50 px-4 py-2 rounded-full border">
                  <CreditCardIcon size={16} />
                  View Pricing & Checkout
                </Link>
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

        <div className="w-full py-10 hidden md:block">
          <div className="mx-auto max-w-3xl">
            {userId && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h1 className="font-medium text-xl tracking-tight">
                    Recent Projects
                  </h1>
                  <button
                    onClick={() => router.push('/project')}
                    className="text-sm text-primary hover:underline font-medium"
                  >
                    View Full Dashboard &rarr;
                  </button>
                </div>

                {isLoading ? (
                  <div className="flex items-center justify-center py-2">
                    <Spinner className="size-10" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                    {projects?.slice(0, 3).map((project: ProjectType) => (
                      <ProjectCard key={project.id} project={project} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {isError && <p className="text-red-500">Failed to load projects</p>}
          </div>
        </div>

        {/* Mobile-only Dashboard Link to compensate for hiding the list above */}
        {userId && (
          <div className="w-full py-4 text-center md:hidden">
            <button
              onClick={() => router.push('/project')}
              className="w-[90%] mx-auto py-3 bg-secondary text-secondary-foreground rounded-xl font-medium shadow-sm border"
            >
              Go to My Dashboard
            </button>
          </div>
        )}
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
