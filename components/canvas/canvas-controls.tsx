import { TOOL_MODE_ENUM, ToolModeType } from "@/constant/canvas";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { HandIcon, MinusIcon, MousePointerIcon, PlusIcon, Star } from "lucide-react";
import { Separator } from "../ui/separator";

type PropsType = {
  zoomIn: () => void;
  zoomOut: () => void;
  zoomPercent: number;
  toolMode: ToolModeType;
  setToolMode: (toolMode: ToolModeType) => void;
  onFeedback?: () => void;
};
const CanvasControls = ({
  zoomIn,
  zoomOut,
  zoomPercent,
  toolMode,
  setToolMode,
  onFeedback,
}: PropsType) => {
  return (
    <div
      className="
   -translate-x-1/2 absolute bottom-4 left-1/2
   flex items-center gap-3 rounded-full border
   bg-black dark:bg-muted py-1.5 px-4 shadow-md text-white!

  "
    >
      <div className="flex items-center gap-1">
        <Button
          size="icon-sm"
          variant="ghost"
          className={cn(
            "rounded-full cursor-pointer hover:bg-white/20! text-white!",
            toolMode === TOOL_MODE_ENUM.SELECT && "bg-white/20"
          )}
          onClick={() => setToolMode(TOOL_MODE_ENUM.SELECT)}
        >
          <MousePointerIcon />
        </Button>
        <Button
          size="icon-sm"
          variant="ghost"
          className={cn(
            "rounded-full cursor-pointer hover:bg-white/20! text-white!",
            toolMode === TOOL_MODE_ENUM.HAND && "bg-white/20"
          )}
          onClick={() => setToolMode(TOOL_MODE_ENUM.HAND)}
        >
          <HandIcon />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-5! bg-white/30" />
      <div className="flex items-center gap-1">
        <Button
          size="icon-sm"
          variant="ghost"
          className={cn(
            "rounded-full cursor-pointer hover:bg-white/20! text-white!"
          )}
          onClick={() => zoomOut()}
        >
          <MinusIcon />
        </Button>
        <div className="min-w-10 text-center text-sm">{zoomPercent}%</div>
        <Button
          size="icon-sm"
          variant="ghost"
          className={cn(
            "rounded-full cursor-pointer hover:bg-white/20! text-white!"
          )}
          onClick={() => zoomIn()}
        >
          <PlusIcon />
        </Button>
      </div>

      {onFeedback && (
        <>
          <Separator orientation="vertical" className="h-5! bg-white/30" />
          <Button
            size="sm"
            variant="ghost"
            onClick={onFeedback}
            className="rounded-full cursor-pointer hover:bg-yellow-500/20! text-yellow-400 font-medium px-3 flex items-center gap-1.5 transition-colors"
          >
            <Star size={14} className="fill-yellow-400" />
            <span className="hidden sm:inline">Rate AI</span>
          </Button>
        </>
      )}
    </div>
  );
};

export default CanvasControls;
