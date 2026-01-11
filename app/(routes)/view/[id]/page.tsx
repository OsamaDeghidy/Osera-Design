"use client";

import { useGetPublicProjectById } from "@/features/use-public-project";
import { useParams } from "next/navigation";
import Link from "next/link";
import { remixProject } from "@/actions/remix-project";
// Fix Import Path: Go up 2 levels from view/[id] to (routes) then to project/[id]
import Header from "../../project/[id]/_common/header";
import Canvas from "@/components/canvas";
import { CanvasProvider } from "@/context/canvas-context";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";


const ViewPage = () => {
    const params = useParams();
    const id = params.id as string;

    const { data: project, isPending, error } = useGetPublicProjectById(id);
    const hasInitialData = !!(project?.frames && project.frames.length > 0);

    if (error) {
        return (
            <div className="h-screen flex flex-col items-center justify-center gap-4">
                <h1 className="text-2xl font-bold">Project Not Found 🔒</h1>
                <p className="text-muted-foreground">This project is private or does not exist.</p>
                <Link href="/dashboard">
                    <Button variant="outline">Go Home</Button>
                </Link>
            </div>
        )
    }

    if (!isPending && !project) {
        return <div>Loading...</div>; // Skeleton instead?
    }

    return (
        <div className="relative h-screen w-full flex flex-col bg-background">
            {/* Read Only Header */}
            <header className="h-14 border-b flex items-center justify-between px-4 bg-background z-50">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">{project?.name}</span>
                    <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                        Read Only
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="sm">Create My Own</Button>
                    </Link>

                    <form action={async () => {
                        await remixProject(id);
                    }}>
                        <Button size="sm" className="gap-2" type="submit">
                            <Sparkles size={16} />
                            Remix Design
                        </Button>
                    </form>
                </div>
            </header>

            <CanvasProvider
                initialFrames={project?.frames || []}
                initialThemeId={project?.theme || ""}
                hasInitialData={hasInitialData}
                projectId={project?.id || ""}
            >
                <div className="flex flex-1 overflow-hidden">
                    <div className="relative flex-1">
                        <Canvas
                            projectId={project?.id || ""}
                            projectName={project?.name || ""}
                            isPending={isPending}
                            readOnly={true} // Enable Read Only Mode
                        />
                    </div>
                </div>
            </CanvasProvider>
        </div>
    );
};

export default ViewPage;
