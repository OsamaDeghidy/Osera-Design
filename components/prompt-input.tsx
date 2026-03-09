import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "./ui/input-group";
import { CornerDownLeftIcon, PaperclipIcon, XIcon, Sparkles, Target, Smartphone, Monitor } from "lucide-react";
import { Spinner } from "./ui/spinner";
import { toast } from "sonner";
import { GenerationLanguage, GenerationMode } from "@/types/generation";
import { PromptLibraryModal } from "./modals/prompt-library-modal";

interface PropsType {
  promptText: string;
  setPromptText: (value: string) => void;
  imageBase64?: string | null;
  setImageBase64?: (value: string | null) => void;
  mode?: GenerationMode;
  setMode?: (mode: GenerationMode) => void;
  language?: GenerationLanguage;
  setLanguage?: (lang: GenerationLanguage) => void;
  projectType?: "MOBILE" | "WEB";
  setProjectType?: (type: "MOBILE" | "WEB") => void;
  isLoading?: boolean;
  className?: string;
  hideSubmitBtn?: boolean;
  onSubmit?: () => void;
  // Targeted Editing Props
  isTargetedEdit?: boolean;
  setIsTargetedEdit?: (val: boolean) => void;
  selectedElementName?: string | null;
}

const PromptInput = ({
  promptText,
  setPromptText,
  imageBase64,
  setImageBase64,
  mode = "creative",
  setMode,
  language = "en",
  setLanguage,
  projectType = "MOBILE",
  setProjectType,
  isLoading,
  className,
  hideSubmitBtn = false,
  onSubmit,
  isTargetedEdit = false,
  setIsTargetedEdit,
  selectedElementName,
}: PropsType) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB");
      return;
    }

    setIsCompressing(true);
    try {
      const compressed = await compressImage(file);
      setImageBase64?.(compressed);
      toast.success("Image attached!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to process image");
    } finally {
      setIsCompressing(false);
      // Reset input so same file can be selected again if needed
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = () => {
    setImageBase64?.(null);
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_SIZE = 800; // Resize to max 800px for Gemini
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.7)); // Compress to 70% quality
        };
      };
    });
  };

  return (
    <div className="bg-background">
      <InputGroup
        className={cn(
          "min-h-[172px] rounded-3xl bg-background relative",
          className && className
        )}
      >
        {/* Targeted Edit Selection Indicator */}
        {isTargetedEdit && (
          <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-blue-100/90 backdrop-blur-sm text-blue-700 px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold shadow-sm z-10 border border-blue-200 max-w-[55%] overflow-hidden pointer-events-none">
            <Target className="size-3 shrink-0" />
            <span className="truncate">{selectedElementName ? `Target: ${selectedElementName}` : "Select element..."}</span>
          </div>
        )}

        <InputGroupTextarea
          className="text-base! py-2.5! resize-none pt-10!" // added pt-10! to make room for the indicator
          placeholder="Describe your app idea, or upload a sketch..."
          value={promptText}
          onChange={(e) => {
            setPromptText(e.target.value);
          }}
        />

        {/* Image Preview Area */}
        {imageBase64 && (
          <div className="absolute bottom-16 left-4 z-10">
            <div className="relative group">
              <div className="w-16 h-16 rounded-xl overflow-hidden border border-border shadow-sm">
                <img src={imageBase64} alt="Preview" className="w-full h-full object-cover" />
              </div>
              <button
                onClick={handleRemoveImage}
                className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground p-0.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <XIcon className="size-3" />
              </button>
            </div>
          </div>
        )}

        <InputGroupAddon
          align="block-end"
          className="flex flex-col sm:flex-row items-center justify-between w-full px-2 pb-2 gap-3"
        >
          {/* Top Row (Mobile) / Left Side (Desktop) */}
          <div className="flex w-full sm:w-auto items-center justify-start gap-2">
            <div className="flex items-center gap-2">
              {/* File Input (Hidden) */}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageSelect}
              />

              {/* Upload Button */}
              <InputGroupButton
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground hover:text-primary transition-colors"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading || isCompressing}
                title="Upload sketch or screenshot"
              >
                {isCompressing ? <Spinner className="size-4" /> : <PaperclipIcon className="size-5" />}
              </InputGroupButton>

              {/* Library */}
              <PromptLibraryModal
                language={language || "en"}
                onSelect={(val) => setPromptText(val)}
                trigger={
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-primary transition-colors p-2 rounded-full hover:bg-muted/50"
                    title="Inspiration Library"
                  >
                    <Sparkles size={18} />
                  </button>
                }
              />
            </div>

            {/* Language Toggle (Mobile Only) - Removed to simplify mobile UI */}
          </div>

          {/* Bottom Row (Mobile) / Right Side (Desktop) */}
          <div className="flex w-full sm:w-auto items-center justify-start sm:justify-end gap-2 flex-wrap">
            {/* Controls Group */}
            <div className="flex items-center gap-1 sm:gap-2 flex-wrap">


              {/* Targeted Edit Toggle */}
              {setIsTargetedEdit && (
                <div className="flex items-center gap-0.5 md:gap-1 bg-muted/50 p-1 rounded-lg">
                  <button
                    onClick={() => setIsTargetedEdit(!isTargetedEdit)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                      isTargetedEdit
                        ? "bg-blue-100 shadow-sm text-blue-700 border border-blue-200"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                    title="Target Component Edit"
                  >
                    <Target className="size-3.5 shrink-0" />
                    <span className="hidden lg:inline">Target Edit</span>
                  </button>
                </div>
              )}

              {/* Project Type Toggle (Desktop & Mobile) */}
              {setProjectType && (
                <div className="flex items-center gap-0.5 md:gap-1 bg-muted/50 p-1 rounded-lg">
                  <button
                    onClick={() => setProjectType("MOBILE")}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                      projectType === "MOBILE"
                        ? "bg-background shadow-sm text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                    title="Mobile App"
                  >
                    <Smartphone className="size-3.5 shrink-0" />
                    <span className="hidden lg:inline">Mobile</span>
                  </button>
                  <button
                    onClick={() => setProjectType("WEB")}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                      projectType === "WEB"
                        ? "bg-background shadow-sm text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                    title="Web App"
                  >
                    <Monitor className="size-3.5 shrink-0" />
                    <span className="hidden lg:inline">Web</span>
                  </button>
                </div>
              )}

              {/* Language Toggle (Desktop Only) */}
              {setLanguage && (
                <div className="hidden md:flex items-center gap-1 bg-muted/50 p-1 rounded-lg">
                  <button
                    onClick={() => setLanguage("en")}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                      language === "en"
                        ? "bg-background shadow-sm text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    En
                  </button>
                  <button
                    onClick={() => setLanguage("ar")}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all font-sans",
                      language === "ar"
                        ? "bg-background shadow-sm text-primary font-bold"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                    style={{ fontFamily: "var(--font-cairo)" }}
                  >
                    ع
                  </button>
                </div>
              )}
            </div>

            {/* Submit Button */}
            {!hideSubmitBtn && (
              <InputGroupButton
                variant="default"
                className="w-full md:w-auto min-w-[100px]"
                size="sm"
                disabled={(!promptText?.trim() && !imageBase64) || isLoading || isCompressing}
                onClick={() => onSubmit?.()}
              >
                {isLoading ? (
                  <Spinner />
                ) : (
                  <>
                    Design
                    <CornerDownLeftIcon className="size-4" />
                  </>
                )}
              </InputGroupButton>
            )}
          </div>
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
};

export default PromptInput;
