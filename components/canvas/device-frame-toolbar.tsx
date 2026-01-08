"use client";

import { cn } from "@/lib/utils";
import {
  CodeIcon,
  DownloadIcon,
  GripVertical,
  MoreHorizontalIcon,
  Trash2Icon,
  Trash2,
  ReplaceIcon,
  Redo2Icon,
  RotateCwIcon,
  Sparkles,
  Send,
  Wand2,
  Wand2Icon,
} from "lucide-react";
import { useState } from "react";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { InputGroup, InputGroupAddon } from "../ui/input-group";
import { Input } from "../ui/input";
import { ButtonGroup } from "../ui/button-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

import PromptInput from "@/components/prompt-input";
import { GenerationMode } from "@/types/generation";

type PropsType = {
  title: string;
  isSelected?: boolean;
  disabled?: boolean;
  isDownloading: boolean;
  scale?: number;
  isRegenerating?: boolean;
  isDeleting?: boolean;
  onOpenHtmlDialog: () => void;
  onDownloadPng?: () => void;
  onRegenerate?: (prompt: string, imageBase64?: string | null, mode?: GenerationMode) => void;
  onDeleteFrame?: () => void;
};
const DeviceFrameToolbar = ({
  title,
  isSelected,
  disabled,
  scale = 1.7,
  isDownloading,
  isRegenerating = false,
  isDeleting = false,
  onOpenHtmlDialog,
  onDownloadPng,
  onRegenerate,
  onDeleteFrame,
}: PropsType) => {
  const [promptValue, setPromptValue] = useState("");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [mode, setMode] = useState<GenerationMode>("creative");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const handleRegenerate = () => {
    if (promptValue.trim() || imageBase64) {
      onRegenerate?.(promptValue, imageBase64, mode);
      setPromptValue("");
      setImageBase64(null);
      setIsPopoverOpen(false);
    }
  };
  return (
    <div
      className={cn(
        `absolute -mt-2 flex items-center justify-between gap-2 rounded-full z-50
        `,
        isSelected
          ? `left-1/2 -translate-x-1/2 border bg-card
            dark:bg-muted pl-2 py-1 shadown-sm
            min-w-[260px] h-[35px]
          `
          : "w-[150px h-auto] left-10 "
      )}
      style={{
        top: isSelected ? "-70px" : "-38px",
        transformOrigin: "center top",
        transform: `scale(${scale})`,
      }}
    >
      <div
        role="button"
        className="flex flex-1 cursor-grab items-center
        justify-start gap-1.5 active:cursor-grabbing h-full
        "
      >
        <GripVertical className="size-4 text-muted-foreground" />
        <div
          className={cn(
            `min-w-20 font-medium text-sm
           mx-px truncate mt-0.5
          `,
            isSelected && "w-[100px]"
          )}
        >
          {title}
        </div>
      </div>

      {isSelected && (
        <>
          <Separator orientation="vertical" className="h-5! bg-border" />
          <ButtonGroup className="gap-px! justify-end pr-2! h-full ">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    disabled={disabled}
                    size="icon-xs"
                    variant="ghost"
                    className="rounded-full!"
                    onClick={onOpenHtmlDialog}
                  >
                    <CodeIcon className="size-3.5! stroke-1.5! mt-px" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>View HTML</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    disabled={disabled || isDownloading}
                    size="icon-xs"
                    className="rounded-full!"
                    variant="ghost"
                    onClick={onDownloadPng}
                  >
                    {isDownloading ? (
                      <Spinner />
                    ) : (
                      <DownloadIcon className="size-3.5! stroke-1.5!" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Download PNG</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <PopoverTrigger asChild>
                      <Button
                        disabled={disabled}
                        size="icon-xs"
                        className="rounded-full! bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-200/50 hover:opacity-90 transition-all border-0!"
                        variant="ghost"
                      >
                        {isRegenerating ? (
                          <Spinner className="size-3.5! text-white" />
                        ) : (
                          <Wand2 className="size-3.5! stroke-1.5! text-white" />
                        )}
                      </Button>
                    </PopoverTrigger>
                  </TooltipTrigger>
                  <TooltipContent>AI Regenerate</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <PopoverContent align="end" className="w-[400px] p-2 rounded-xl">
                <PromptInput
                  promptText={promptValue}
                  setPromptText={setPromptValue}
                  imageBase64={imageBase64}
                  setImageBase64={setImageBase64}
                  mode={mode}
                  setMode={setMode}
                  isLoading={isRegenerating}
                  hideSubmitBtn={false}
                  onSubmit={handleRegenerate}
                  className="shadow-none border-0"
                />
              </PopoverContent>
            </Popover>

            <DropdownMenu>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        className="rounded-full!"
                      >
                        <MoreHorizontalIcon className=" mb-px size-3.5! stroke-1.5!" />
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent>More options</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <DropdownMenuContent align="end" className="w-32 rounded-md p-0!">
                <DropdownMenuItem
                  disabled={disabled || isDeleting}
                  onClick={onDeleteFrame}
                  className="cursor-pointer"
                >
                  {isDeleting ? (
                    <Spinner />
                  ) : (
                    <>
                      <Trash2Icon className="size-4" />
                      Delete
                    </>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </ButtonGroup>
        </>
      )}
    </div>
  );
};

export default DeviceFrameToolbar;
