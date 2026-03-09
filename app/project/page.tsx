"use client";
import React, { memo } from "react";
import Header from "@/app/project/[id]/_common/header";
import { useGetProjects } from "@/features/use-project";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { Spinner } from "@/components/ui/spinner";
import { ProjectType } from "@/types/project";
import { useRouter } from "next/navigation";
import { FolderOpenDotIcon, Plus, Palette } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";

const DashboardPage = () => {
  const { user } = useKindeBrowserClient();
  const userId = user?.id;
  const router = useRouter();

  const { data: projects, isLoading, isError } = useGetProjects(userId);

  return (
    <div className="w-full min-h-screen bg-background">
      <Header />

      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Workspace</h1>
            <p className="text-muted-foreground mt-1">Manage and view all your generated mobile apps.</p>
          </div>
          <Button onClick={() => router.push('/')} className="gap-2">
            <Plus size={16} /> New Design
          </Button>
        </div>

        {/* New Design Studio Section */}
        <div className="mb-10 p-6 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 text-white shadow-xl shadow-blue-500/20 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="size-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
              <Palette className="size-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">AI Design Studio</h2>
              <p className="text-blue-100 mt-1 max-w-md">Generate stunning marketing posters and social media posts for your projects in seconds.</p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="lg"
            className="w-full md:w-auto font-bold px-8 shadow-lg"
            onClick={() => router.push('/studio')}
          >
            Try Studio ✨
          </Button>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">My Projects</h2>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner className="size-12" />
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center py-20 text-red-500">
            Failed to load your projects. Please try again.
          </div>
        ) : projects?.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed rounded-xl border-muted">
            <FolderOpenDotIcon className="mx-auto size-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-medium">No projects yet</h3>
            <p className="text-muted-foreground mt-2 mb-6">You haven't designed any apps yet.</p>
            <Button onClick={() => router.push('/')}>Start Designing</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {projects?.map((project: ProjectType) => (
              <ProjectCard key={project.id} project={project} />
            ))}
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
      className="w-full flex flex-col border rounded-xl cursor-pointer hover:shadow-md overflow-hidden bg-card"
      onClick={onRoute}
    >
      <div className="h-40 bg-muted/30 relative overflow-hidden flex items-center justify-center border-b">
        {thumbnail ? (
          <img
            src={thumbnail}
            className="w-full h-full object-cover object-left scale-110"
            alt={project.name}
          />
        ) : (
          <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <FolderOpenDotIcon size={24} />
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col">
        <h3 className="font-semibold text-sm truncate w-full mb-1 line-clamp-1">
          {project.name}
        </h3>
        <p className="text-xs text-muted-foreground">{timeAgo}</p>
      </div>
    </div>
  );
});

ProjectCard.displayName = "ProjectCard";

export default DashboardPage;
