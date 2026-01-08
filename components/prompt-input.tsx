import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "./ui/input-group";
import { CornerDownLeftIcon, PaperclipIcon, XIcon, Sparkles, Target } from "lucide-react";
import { Spinner } from "./ui/spinner";
import { toast } from "sonner";
import { GenerationLanguage, GenerationMode } from "@/types/generation";

interface PropsType {
  promptText: string;
  setPromptText: (value: string) => void;
  imageBase64?: string | null;
  setImageBase64?: (value: string | null) => void;
  mode?: GenerationMode;
  setMode?: (mode: GenerationMode) => void;
  language?: GenerationLanguage;
  setLanguage?: (lang: GenerationLanguage) => void;
  isLoading?: boolean;
  className?: string;
  hideSubmitBtn?: boolean;
  onSubmit?: () => void;
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
  isLoading,
  className,
  hideSubmitBtn = false,
  onSubmit,
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
        <InputGroupTextarea
          className="text-base! py-2.5! resize-none"
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
          className="flex items-center justify-between w-full px-2"
        >
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

          {/* Mode Toggle */}
          {setMode && (
            <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg mr-2">
              <button
                onClick={() => setMode("creative")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                  mode === "creative"
                    ? "bg-background shadow-sm text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title="Creative Mode"
              >
                <Sparkles className="size-3.5" />
                Creative
              </button>
              <button
                onClick={() => setMode("precise")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                  mode === "precise"
                    ? "bg-background shadow-sm text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title="Precise Mode"
              >
                <Target className="size-3.5" />
                Precise
              </button>
            </div>
          )}

          {/* Language Toggle */}
          {setLanguage && (
            <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg mr-2">
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

          {!hideSubmitBtn && (
            <InputGroupButton
              variant="default"
              className=""
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
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
};

export default PromptInput;
