/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRealtime } from "inngest/react";
import { fetchRealtimeSubscriptionToken } from "@/app/action/realtime";
import { THEME_LIST, ThemeType } from "@/lib/themes";
import { FrameType } from "@/types/project";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";
import axios from "axios";

export type LoadingStatusType =
  | "idle"
  | "running"
  | "analyzing"
  | "generating"
  | "completed";

interface CanvasContextType {
  theme?: ThemeType;
  setTheme: (id: string) => void;
  themes: ThemeType[];

  projectType: "MOBILE" | "WEB";
  setProjectType: (type: "MOBILE" | "WEB") => void;

  frames: FrameType[];
  setFrames: (frames: FrameType[]) => void;
  updateFrame: (id: string, data: Partial<FrameType>) => void;
  addFrame: (frame: FrameType) => void;

  selectedFrameId: string | null;
  selectedFrame: FrameType | null;
  setSelectedFrameId: (id: string | null) => void;

  loadingStatus: LoadingStatusType | null;
  setLoadingStatus: (status: LoadingStatusType | null) => void;

  isEditMode: boolean;
  setIsEditMode: (val: boolean) => void;
  targetHtmlData: { html: string; name: string } | null;
  setTargetHtmlData: (data: { html: string; name: string } | null) => void;
}

const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

export const CanvasProvider = ({
  children,
  initialFrames,
  initialThemeId,
  initialProjectType,
  hasInitialData,
  projectId,
}: {
  children: ReactNode;
  initialFrames: FrameType[];
  initialThemeId?: string;
  initialProjectType?: "MOBILE" | "WEB";
  hasInitialData: boolean;
  projectId: string | null;
}) => {
  const [themeId, setThemeId] = useState<string>(
    initialThemeId || THEME_LIST[0].id
  );

  const [projectType, setProjectType] = useState<"MOBILE" | "WEB">(
    initialProjectType || "MOBILE"
  );

  const [frames, setFrames] = useState<FrameType[]>(initialFrames || []);
  const [selectedFrameId, setSelectedFrameId] = useState<string | null>(null);

  const [loadingStatus, setLoadingStatus] = useState<LoadingStatusType | null>(
    null
  );

  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [targetHtmlData, setTargetHtmlData] = useState<{ html: string; name: string } | null>(null);

  const [prevProjectId, setPrevProjectId] = useState(projectId);
  if (projectId !== prevProjectId) {
    setPrevProjectId(projectId);
    setLoadingStatus(hasInitialData ? "idle" : "running");
    setFrames(initialFrames || []);
    setThemeId(initialThemeId || THEME_LIST[0].id);
    setProjectType(initialProjectType || "MOBILE");
    setSelectedFrameId(null);
  }

  const theme = THEME_LIST.find((t) => t.id === themeId);
  const selectedFrame =
    selectedFrameId && frames.length !== 0
      ? frames.find((f) => f.id === selectedFrameId) || null
      : null;

  // Update the LoadingState Inngest Realtime event
  const { messages, error: realtimeError } = useRealtime({
    token: fetchRealtimeSubscriptionToken,
  });

  const freshData = messages.delta;

  useEffect(() => {
    if (realtimeError) {
      console.error("[REALTIME_WS_ERROR] WebSocket subscription failed:", realtimeError);
    }
  }, [realtimeError]);

  useEffect(() => {
    if (!freshData || freshData.length === 0) return;

    freshData.forEach((message: any) => {
      const { data, topic } = message;

      if (data.projectId !== projectId) return;

      switch (topic) {
        case "generation.start":
          const status = data.status;
          setLoadingStatus(status);
          break;
        case "analysis.start":
          setLoadingStatus("analyzing");
          break;
        case "analysis.complete":
          setLoadingStatus("generating");
          if (data.theme) setThemeId(data.theme);

          if (data.screens && data.screens.length > 0) {
            const skeletonFrames: FrameType[] = data.screens.map((s: any) => ({
              id: s.id,
              title: s.name,
              htmlContent: "",
              isLoading: true,
            }));
            setFrames((prev) => [...prev, ...skeletonFrames]);
          }
          break;
        case "frame.created":
          if (data.frame) {
            setFrames((prev) => {
              const newFrames = [...prev];
              const idx = newFrames.findIndex((f) => f.id === data.screenId);
              if (idx !== -1) newFrames[idx] = data.frame;
              else newFrames.push(data.frame);
              return newFrames;
            });
          }
          break;
        case "generation.complete":
          setLoadingStatus("completed");
          setTimeout(() => {
            setLoadingStatus("idle");
          }, 100);
          break;
        case "generation.error":
          setLoadingStatus("idle");
          toast.error(data.message || "Generation failed. Please try again.");
          break;
        default:
          break;
      }
    });
  }, [projectId, freshData]);

  // --- POLLING FALLBACK ---
  // If WebSocket fails or events are missed, poll every 3 seconds while loading
  useEffect(() => {
    if (!projectId || loadingStatus === "idle" || loadingStatus === "completed" || loadingStatus === null) {
      return;
    }

    console.warn(`[CANVAS_POLL] Active polling for project ${projectId} (Status: ${loadingStatus})`);
    const interval = setInterval(async () => {
      try {
        const response = await axios.get(`/api/project/${projectId}`);
        const updatedProject = response.data;
        if (updatedProject && Array.isArray(updatedProject.frames)) {
          // If we have more frames than current state, or the last frame is not loading anymore
          const currentFramesLength = frames?.length || 0;
          if (updatedProject.frames.length > currentFramesLength ||
            updatedProject.frames.some((f: any) => !f.isLoading && frames?.find(pf => pf.id === f.id)?.isLoading)) {
            console.log("[CANVAS_POLL] New data found via poll. Syncing...");
            setFrames(updatedProject.frames);
            // If the project in DB has frames and we are still "analyzing", move to "generating"
            if (updatedProject.frames.length > 0 && loadingStatus === "analyzing") {
              setLoadingStatus("generating");
            }
          }

          // Check if it's actually finished but we missed it
          // (This is tricky because we don't know for sure, but we can check if it's been running for a long time)
        }
      } catch (err) {
        console.error("[CANVAS_POLL_ERROR]", err);
      }
    }, 3000); // Increased frequency to 3s for better UX on WS failure

    return () => {
      console.log("[CANVAS_POLL] Stopping polling.");
      clearInterval(interval);
    };
  }, [projectId, loadingStatus, frames.length]);

  const addFrame = useCallback((frame: FrameType) => {
    setFrames((prev) => [...prev, frame]);
  }, []);

  const updateFrame = useCallback((id: string, data: Partial<FrameType>) => {
    setFrames((prev) => {
      return prev.map((frame) =>
        frame.id === id ? { ...frame, ...data } : frame
      );
    });
  }, []);

  return (
    <CanvasContext.Provider
      value={{
        theme,
        setTheme: setThemeId,
        themes: THEME_LIST,
        projectType,
        setProjectType,
        frames,
        setFrames,
        selectedFrameId,
        selectedFrame,
        setSelectedFrameId,
        updateFrame,
        addFrame,
        loadingStatus,
        setLoadingStatus,
        isEditMode,
        setIsEditMode,
        targetHtmlData,
        setTargetHtmlData,
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
};

export const useCanvas = () => {
  const ctx = useContext(CanvasContext);
  if (!ctx) throw new Error("useCanvas must be used inside CanvasProvider");
  return ctx;
};
