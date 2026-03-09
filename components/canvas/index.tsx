import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { LoadingStatusType, useCanvas } from "@/context/canvas-context";
import { cn } from "@/lib/utils";
import { Spinner } from "../ui/spinner";
import CanvasFloatingToolbar from "./canvas-floating-toolbar";
import { TOOL_MODE_ENUM, ToolModeType } from "@/constant/canvas";
import CanvasControls from "./canvas-controls";
import DeviceFrame from "./device-frame";
import HtmlDialog from "./html-dialog";
import { toast } from "sonner";
import { useRegenerateFrame } from "@/features/use-frame";
import { Button } from "../ui/button";
import { Sparkles, Moon, Diamond } from "lucide-react";
import FeedbackDialog from "../feedback-dialog";

const DEMO_HTML = `
<div class="flex flex-col w-full min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans pt-12 pb-24 px-6 overflow-y-auto relative">
 <!-- Content omitted for brevity as it's just a demo string -->
</div>
`;

const Canvas = ({
  projectId,
  isPending,
  projectName,
  readOnly = false,
}: {
  projectId: string;
  isPending: boolean;
  projectName: string | null;
  readOnly?: boolean;
}) => {
  const {
    theme,
    frames,
    selectedFrame,
    selectedFrameId,
    setSelectedFrameId,
    loadingStatus,
    setLoadingStatus,
    updateFrame,
    projectType,
  } = useCanvas();
  const regenerateMutation = useRegenerateFrame(projectId);
  const [toolMode, setToolMode] = useState<ToolModeType>(TOOL_MODE_ENUM.SELECT);
  const [zoomPercent, setZoomPercent] = useState<number>(53);
  const [currentScale, setCurrentScale] = useState<number>(0.53);
  const [openHtmlDialog, setOpenHtmlDialog] = useState(false);
  const [isScreenshotting, setIsScreenshotting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const canvasRootRef = useRef<HTMLDivElement>(null);

  function getCanvasHtmlContent() {
    const el = canvasRootRef.current;
    if (!el) {
      toast.error("Canvas element not found");
      return null;
    }
    let styles = "";
    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules) styles += rule.cssText;
      } catch { }
    }

    return {
      element: el,
      html: `
         <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <style>body{margin:0}*{box-sizing:border-box}${styles}</style>
          </head>
          <body>${el.outerHTML}</body>
          </html>
      `,
    };
  }

  const saveThumbnailToProject = useCallback(
    async (projectId: string | null) => {
      // Skip auto-save in read-only mode
      if (readOnly) return;

      try {
        if (!projectId) return null;
        const result = getCanvasHtmlContent();
        if (!result?.html) return null;
        setSelectedFrameId(null);
        setIsSaving(true);
        const response = await axios.post("/api/screenshot", {
          html: result.html,
          width: result.element.scrollWidth,
          height: 700,
          projectId,
        });
        if (response.data) {
          console.log("Thumbnail saved", response.data);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setIsSaving(false);
      }
    },
    [setSelectedFrameId, readOnly]
  );

  useEffect(() => {
    if (!projectId) return;
    if (loadingStatus === "completed") {
      saveThumbnailToProject(projectId);

      // Delay showing the feedback dialog slightly so the user sees the output first
      const timer = setTimeout(() => {
        if (!readOnly) setShowFeedback(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [loadingStatus, projectId, saveThumbnailToProject, readOnly]);

  const onOpenHtmlDialog = () => {
    setOpenHtmlDialog(true);
  };

  const handleCanvasScreenshot = useCallback(async () => {
    try {
      const result = getCanvasHtmlContent();
      if (!result?.html) {
        toast.error("Failed to get canvas content");
        return null;
      }
      setSelectedFrameId(null);
      setIsScreenshotting(true);

      const response = await axios.post(
        "/api/screenshot",
        {
          html: result.html,
          width: result.element.scrollWidth,
          height: 700,
        },
        {
          responseType: "blob",
          validateStatus: (s) => (s >= 200 && s < 300) || s === 304,
        }
      );
      const title = projectName || "Canvas";
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${title.replace(/\s+/g, "-").toLowerCase()}
      -${Date.now()}.png`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success("Screenshot downloaded");
    } catch (error) {
      console.log(error);
      toast.error("Failed to screenshot canvs");
    } finally {
      setIsScreenshotting(false);
    }
  }, [projectName, setSelectedFrameId]);

  const currentStatus = isSaving
    ? "finalizing"
    : isPending && (loadingStatus === null || loadingStatus === "idle")
      ? "fetching"
      : loadingStatus !== "idle" && loadingStatus !== "completed"
        ? loadingStatus
        : null;

  const handleMagicRegenerate = (prompt: string) => {
    // Determine which frame to target. If none selected, use the first frame available.
    const targetFrameId = selectedFrameId || (frames && frames.length > 0 ? frames[0].id : null);

    if (!targetFrameId) {
      toast.info("No frames available to redesign");
      return;
    }

    regenerateMutation.mutate(
      { frameId: targetFrameId, prompt },
      {
        onSuccess: () => {
          updateFrame(targetFrameId, { isLoading: true });
          toast.success("Magic is happening... 🪄");
        },
      }
    );
  };

  return (
    <>
      <div className="relative w-full h-full overflow-hidden">
        {!readOnly && (
          <div className="hidden md:block">
            <CanvasFloatingToolbar
              projectId={projectId}
              isScreenshotting={isScreenshotting}
              onScreenshot={handleCanvasScreenshot}
            />
          </div>
        )}

        {currentStatus && <CanvasLoader status={currentStatus} />}

        <TransformWrapper
          initialScale={projectType === "WEB" ? 0.35 : 0.53}
          initialPositionX={projectType === "WEB" ? 30 : 40}
          initialPositionY={5}
          minScale={0.1}
          maxScale={3}
          wheel={{ step: 0.1 }}
          pinch={{ step: 0.1 }}
          doubleClick={{ disabled: true }}
          centerZoomedOut={false}
          centerOnInit={false}
          smooth={true}
          limitToBounds={false}
          panning={{
            disabled: toolMode !== TOOL_MODE_ENUM.HAND,
          }}
          onTransformed={(ref) => {
            setZoomPercent(Math.round(ref.state.scale * 100));
            setCurrentScale(ref.state.scale);
          }}
        >
          {({ zoomIn, zoomOut }) => (
            <>
              <div
                ref={canvasRootRef}
                className={cn(
                  `absolute inset-0 w-full h-full bg-[#eee]
                  dark:bg-[#242423] p-3
              `,
                  toolMode === TOOL_MODE_ENUM.HAND
                    ? "cursor-grab active:cursor-grabbing"
                    : "cursor-default"
                )}
                style={{
                  backgroundImage:
                    "radial-gradient(circle, var(--primary) 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                }}
              >
                <TransformComponent
                  wrapperStyle={{
                    width: "100%",
                    height: "100%",
                    overflow: "unset",
                  }}
                  contentStyle={{
                    width: "100%",
                    height: "100%",
                  }}
                >
                  <div>
                    {frames?.map((frame, index: number) => {
                      const stepX = projectType === "WEB" ? 1250 : 480;
                      const baseX = 100 + index * stepX;
                      const y = 100;
                      return (
                        <DeviceFrame
                          key={`${frame.id}-${index}`}
                          frameId={frame.id}
                          projectId={projectId}
                          title={frame.title}
                          html={frame.htmlContent}
                          isLoading={frame.isLoading}
                          scale={currentScale}
                          initialPosition={{
                            x: baseX,
                            y,
                          }}
                          toolMode={toolMode}
                          theme_style={theme?.style}
                          onOpenHtmlDialog={onOpenHtmlDialog}
                        />
                      );
                    })}
                  </div>
                </TransformComponent>
              </div>

              {!readOnly && (
                <div className="hidden md:block">
                  <CanvasControls
                    zoomIn={zoomIn}
                    zoomOut={zoomOut}
                    zoomPercent={zoomPercent}
                    toolMode={toolMode}
                    setToolMode={setToolMode}
                    onFeedback={() => setShowFeedback((prev) => !prev)}
                  />
                </div>
              )}
            </>
          )}
        </TransformWrapper>

        {/* Mobile Magic Buttons Bar (Always visible on mobile to make it easier, defaults to modifying the first frame if none selected) */}
        {!readOnly && frames && frames.length > 0 && (
          <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-sm flex items-center justify-center gap-2 z-[60] bg-background/80 backdrop-blur-md p-2 rounded-3xl border shadow-xl">
            <Button
              size="sm"
              disabled={regenerateMutation.isPending || !!(selectedFrame && selectedFrame.isLoading)}
              onClick={() => handleMagicRegenerate("Redesign this screen to use a beautiful Dark Mode theme with glowing accents")}
              className="rounded-full shadow-sm bg-gray-900 text-white flex-1 text-xs px-2 whitespace-nowrap"
            >
              <Moon className="size-3.5 mr-1" /> Dark
            </Button>
            <Button
              size="sm"
              disabled={regenerateMutation.isPending || !!(selectedFrame && selectedFrame.isLoading)}
              onClick={() => handleMagicRegenerate("Redesign this to be very minimalist, simple, and clean. Remove clutter.")}
              className="rounded-full shadow-sm bg-amber-500 hover:bg-amber-600 text-white flex-1 text-xs px-2 whitespace-nowrap"
            >
              <Sparkles className="size-3.5 mr-1" /> Simple
            </Button>
            <Button
              size="sm"
              disabled={regenerateMutation.isPending || !!(selectedFrame && selectedFrame.isLoading)}
              onClick={() => handleMagicRegenerate("Redesign this to look extremely premium, modern, luxurious and professional.")}
              className="rounded-full shadow-sm bg-purple-600 hover:bg-purple-700 text-white flex-1 text-xs px-2 whitespace-nowrap"
            >
              <Diamond className="size-3.5 mr-1" /> Pro
            </Button>
          </div>
        )}
      </div>

      <HtmlDialog
        html={selectedFrame?.htmlContent || ""}
        title={selectedFrame?.title}
        theme_style={theme?.style}
        open={openHtmlDialog}
        onOpenChange={setOpenHtmlDialog}
      />

      {projectId && !readOnly && (
        <FeedbackDialog
          projectId={projectId}
          open={showFeedback}
          onOpenChange={setShowFeedback}
        />
      )}
    </>
  );
};

function CanvasLoader({
  status,
}: {
  status?: LoadingStatusType | "fetching" | "finalizing";
}) {
  return (
    <div
      className={cn(
        `absolute top-4 left-1/2 -translate-x-1/2 min-w-40
      max-w-full px-4 pt-1.5 pb-2
      rounded-br-xl rounded-bl-xl shadow-md
      flex items-center space-x-2 z-20
    `,
        status === "fetching" && "bg-gray-500 text-white",
        status === "running" && "bg-amber-500 text-white",
        status === "analyzing" && "bg-blue-500 text-white",
        status === "generating" && "bg-purple-500 text-white",
        status === "finalizing" && "bg-purple-500 text-white"
      )}
    >
      <Spinner className="w-4 h-4 stroke-3!" />
      <span className="text-sm font-semibold capitalize">
        {status === "fetching" ? "Loading Project" : status}
      </span>
    </div>
  );
}

export default Canvas;
