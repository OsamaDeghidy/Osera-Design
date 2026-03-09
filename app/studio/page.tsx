"use client";

import { useState, useRef } from "react";
import {
    Image as ImageIcon,
    Sparkles,
    Upload,
    Download,
    Layers,
    Maximize,
    Eraser,
    Type,
    Layout,
    ChevronRight,
    Loader2,
    Trash2,
    Undo2,
    Redo2,
    History,
    Palette,
    Plus,
    Lightbulb,
    Wand2,
    Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import ImageEditor, { ImageEditorHandle } from "@/components/studio/image-editor";
import { useEffect } from "react";

const ASPECT_RATIOS = [
    { id: "1:1", label: "Square (1:1)", icon: SquareIcon },
    { id: "16:9", label: "Landscape (16:9)", icon: MonitorIcon },
    { id: "9:16", label: "Portrait (9:16)", icon: SmartphoneIcon },
];

function SquareIcon(props: any) {
    return <div className="w-4 h-4 border-2 border-current rounded-sm" {...props} />;
}

function MonitorIcon(props: any) {
    return <div className="w-5 h-3 border-2 border-current rounded-sm" {...props} />;
}

function SmartphoneIcon(props: any) {
    return <div className="w-3 h-5 border-2 border-current rounded-sm" {...props} />;
}

export default function StudioPage() {
    const [prompt, setPrompt] = useState("");
    const [projectLink, setProjectLink] = useState("");
    const [selectedRatio, setSelectedRatio] = useState("1:1");
    const [uploadedImages, setUploadedImages] = useState<string[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImages, setGeneratedImages] = useState<string[]>([]);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [currentDesignId, setCurrentDesignId] = useState<string | null>(null);
    const [trends, setTrends] = useState<any[]>([]);
    const [isEditMode, setIsEditMode] = useState(false);
    const editorRef = useRef<ImageEditorHandle>(null);

    const SUGGESTIONS = [
        {
            category: "Marketing (EN)",
            items: [
                { label: "Modern Social Ad", prompt: "A professional Instagram ad for a tech startup, clean typography, vibrant gradients, high-tech aesthetic." },
                { label: "Product Showcase", prompt: "Sleek marketing poster for a web application, showing desktop UI on a premium 3D background, soft lighting." },
                { label: "Minimalist Branding", prompt: "Conceptual branding poster, minimalist geometric shapes, soft shadows, 8k resolution, elegant." }
            ]
        },
        {
            category: "تسويق (AR)",
            items: [
                { label: "بوستر إعلاني مودرن", prompt: "بوستر إعلاني احترافي لشركة تقنية، خطوط عريضة، تدرجات لونية، مظهر عصري وجذاب." },
                { label: "عرض تطبيق موبايل", prompt: "بوستر تسويقي لتطبيق موبايل، يظهر واجهة المستخدم على خلفية بريميوم، إضاءة ناعمة واحترافية." },
                { label: "هوية بصرية بسيطة", prompt: "بوستر للهوية البصرية، أشكال هندسية بسيطة، ظلال ناعمة، دقة عالية، تصميم مريح للعين." }
            ]
        },
        {
            category: "Creative (Bilingual)",
            items: [
                { label: "Cyberpunk Tech", prompt: "Futuristic technology poster, cyberpunk neon colors, holographic elements, dark background." },
                { label: "خط عربي فني", prompt: "Artistic poster with Arabic calligraphy, modern heritage style, gold and dark blue colors, luxury feel." },
                { label: "3D Illustration", prompt: "Marketing poster with 3D cute characters, pastel colors, soft clay style, playful and friendly UI." }
            ]
        }
    ];

    const [activePromptCategory, setActivePromptCategory] = useState(SUGGESTIONS[0].category);
    const isAr = activePromptCategory.includes("AR") || activePromptCategory.includes("عربي");

    // --- Persistence: Load History & Trends ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [designsRes, trendsRes] = await Promise.all([
                    fetch("/api/design/studio/designs"),
                    fetch("/api/design/studio/trends")
                ]);

                if (designsRes.ok) {
                    const data = await designsRes.json();
                    if (Array.isArray(data)) {
                        setGeneratedImages(data.map(d => d.imageUrl));
                    }
                }

                if (trendsRes.ok) {
                    const data = await trendsRes.json();
                    if (Array.isArray(data)) setTrends(data);
                }
            } catch (err) {
                console.error("Failed to load data", err);
            }
        };
        fetchData();
    }, []);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onload = (event) => {
                setUploadedImages(prev => [...prev, event.target?.result as string]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index: number) => {
        setUploadedImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            toast.error("Please enter a prompt first");
            return;
        }

        setIsGenerating(true);
        try {
            const fullPrompt = projectLink
                ? `Act as a professional graphic designer. Create a high-quality marketing poster that matches the UI/UX style, color palette, and professional aesthetic of this project: ${projectLink}.
                   Project details to incorporate into the design: ${prompt}.
                   The final result must be the generated poster image.`
                : prompt;

            const response = await fetch("/api/design/studio/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt,
                    projectLink,
                    aspectRatio: selectedRatio,
                    imageBase64: uploadedImages,
                    modelType: "fast"
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Failed to generate image");
            }

            const data = await response.json();

            if (data.url) {
                setGeneratedImages(prev => [data.url, ...prev]);
                setSelectedImage(data.url);
                setCurrentDesignId(data.id);
                toast.success("Design saved to your work history! ✨");
            } else {
                throw new Error("No image URL returned");
            }
        } catch (error: any) {
            console.error("[STUDIO_GENERATE_CLIENT_ERROR]", error);
            toast.error(error.message || "Something went wrong during generation");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="flex h-screen bg-zinc-950 text-zinc-100 overflow-hidden">
            {/* Selection Sidebar */}
            <aside className="w-80 border-r border-zinc-800 flex flex-col bg-zinc-900/50 backdrop-blur-xl h-full">
                <div className="p-6 border-b border-zinc-800 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="size-8 bg-blue-500 rounded-lg flex items-center justify-center">
                            <Palette className="size-5 text-white" />
                        </div>
                        <h1 className="font-bold text-xl tracking-tight">Design Studio</h1>
                    </div>
                </div>

                <ScrollArea className="flex-1 min-h-0">
                    <div className="p-6 space-y-8">
                        {/* Image Upload Area */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Product Visuals (Optional)</Label>
                                {uploadedImages.length > 0 && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setUploadedImages([])}
                                        className="h-6 px-2 text-[10px] text-zinc-500 hover:text-red-400"
                                    >
                                        <Trash2 className="size-3 mr-1" /> Clear All
                                    </Button>
                                )}
                            </div>

                            {/* Multi-image preview grid */}
                            {uploadedImages.length > 0 && (
                                <div className="grid grid-cols-4 gap-2 mb-3">
                                    {uploadedImages.map((img, idx) => (
                                        <div key={idx} className="relative aspect-square rounded-md overflow-hidden border border-zinc-800 group">
                                            <img src={img} className="size-full object-cover" />
                                            <button
                                                onClick={() => removeImage(idx)}
                                                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                                            >
                                                <Trash2 className="size-4 text-white" />
                                            </button>
                                        </div>
                                    ))}
                                    {uploadedImages.length < 4 && (
                                        <label htmlFor="image-upload" className="aspect-square rounded-md border border-dashed border-zinc-800 flex items-center justify-center cursor-pointer hover:bg-zinc-800/50 transition-colors">
                                            <Plus className="size-4 text-zinc-500" />
                                        </label>
                                    )}
                                </div>
                            )}

                            {uploadedImages.length === 0 && (
                                <label
                                    htmlFor="image-upload"
                                    className="border-2 border-dashed border-zinc-800 rounded-xl p-8 flex flex-col items-center justify-center gap-3 hover:bg-zinc-900/50 transition-all cursor-pointer group"
                                >
                                    <div className="size-12 bg-zinc-800 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Plus className="size-6 text-zinc-400" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-medium">Click to upload</p>
                                        <p className="text-xs text-zinc-500 mt-1">PNG, JPG up to 10MB</p>
                                    </div>
                                </label>
                            )}

                            <input
                                type="file"
                                id="image-upload"
                                className="hidden"
                                multiple
                                onChange={handleImageUpload}
                            />
                        </div>

                        {/* Prompt Library */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-zinc-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
                                    <Lightbulb className="size-3 text-yellow-500" /> Prompt Library
                                </Label>
                                <span className="text-[10px] text-zinc-500">Bilingual Support</span>
                            </div>

                            <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
                                {SUGGESTIONS.map((cat) => (
                                    <button
                                        key={cat.category}
                                        onClick={() => setActivePromptCategory(cat.category)}
                                        className={cn(
                                            "whitespace-nowrap px-3 py-1 rounded-full text-[10px] border transition-all",
                                            activePromptCategory === cat.category
                                                ? "bg-blue-500/20 border-blue-500/50 text-blue-400"
                                                : "bg-zinc-800/50 border-zinc-800 text-zinc-500 hover:border-zinc-700"
                                        )}
                                    >
                                        {cat.category}
                                    </button>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 gap-2">
                                {SUGGESTIONS.find(c => c.category === activePromptCategory)?.items.map((s, i) => (
                                    <button
                                        key={i}
                                        onClick={() => {
                                            setPrompt(s.prompt);
                                            toast.success("Prompt loaded!");
                                        }}
                                        className="text-[11px] text-left p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-blue-500/50 hover:bg-zinc-800/50 transition-all group"
                                    >
                                        <div className="font-semibold text-zinc-300 group-hover:text-white mb-1 flex items-center justify-between">
                                            {s.label}
                                            <Wand2 className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                        <p className="text-zinc-500 line-clamp-1 group-hover:text-zinc-400">{s.prompt}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Project Link Area */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-zinc-400 text-xs font-semibold uppercase tracking-wider text-blue-400">Project Link (Analyze UI)</Label>
                                <Layout className="size-3 text-blue-500" />
                            </div>
                            <Input
                                value={projectLink}
                                onChange={(e) => setProjectLink(e.target.value)}
                                placeholder="Paste your project URL here..."
                                className="bg-zinc-800/50 border-zinc-800 h-10 text-xs focus:ring-blue-500"
                            />
                        </div>

                        {/* Prompt Area */}
                        <div className="space-y-3">
                            <Label className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">What are we designing?</Label>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="e.g. A premium minimalist social media poster for a luxury watch with golden lighting and soft shadows..."
                                className="w-full h-32 bg-zinc-800/50 border border-zinc-800 rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none placeholder:text-zinc-600"
                            />
                        </div>

                        {/* Settings */}
                        <div className="space-y-4">
                            <div className="space-y-3">
                                <Label className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Aspect Ratio</Label>
                                <div className="grid grid-cols-3 gap-2">
                                    {ASPECT_RATIOS.map((ratio) => (
                                        <button
                                            key={ratio.id}
                                            onClick={() => setSelectedRatio(ratio.id)}
                                            className={cn(
                                                "flex flex-col items-center gap-2 p-3 rounded-xl border text-xs font-medium transition-all",
                                                selectedRatio === ratio.id
                                                    ? "bg-blue-500/10 border-blue-500 text-blue-400"
                                                    : "bg-zinc-800/30 border-zinc-800 text-zinc-500 hover:bg-zinc-800 hover:border-zinc-700"
                                            )}
                                        >
                                            <ratio.icon />
                                            {selectedRatio}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Trends (Managed by Admin) */}
                        <div className="space-y-4 pt-4 border-t border-zinc-800">
                            <div className="flex items-center justify-between">
                                <Label className="text-blue-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
                                    <Sparkles className="size-3" /> Trends (ترندات)
                                </Label>
                                <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 border-none text-[9px]">FRESH</Badge>
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                                {trends.length > 0 ? (
                                    trends.flatMap(cat => cat.prompts || []).map((t: any) => (
                                        <button
                                            key={t.id}
                                            onClick={() => {
                                                setPrompt(t.prompt);
                                                toast.success("Trend loaded!");
                                            }}
                                            className="text-[11px] text-left p-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-blue-500 hover:bg-zinc-800/50 transition-all flex items-center justify-between"
                                        >
                                            <span className="flex items-center gap-2 text-zinc-300">
                                                <div className="size-1.5 bg-blue-500 rounded-full animate-pulse" />
                                                {isAr ? t.titleAr : t.titleEn}
                                            </span>
                                            <ChevronRight className="size-3 text-zinc-600" />
                                        </button>
                                    ))
                                ) : (
                                    <>
                                        <button
                                            onClick={() => { setPrompt("Professional Ramadan greeting card, project colors, moon lanterns."); toast.success("Trend loaded!"); }}
                                            className="text-[11px] text-left p-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-blue-500 transition-all flex items-center justify-between"
                                        >
                                            <span>🌙 Ramadan Greeting (رمضان)</span>
                                            <ChevronRight className="size-3" />
                                        </button>
                                        <button
                                            onClick={() => { setPrompt("Product showcase, flying through a beautiful blue sky, optimistic lighting."); toast.success("Trend loaded!"); }}
                                            className="text-[11px] text-left p-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-blue-500 transition-all flex items-center justify-between"
                                        >
                                            <span>☁️ Sky Flying (طيران)</span>
                                            <ChevronRight className="size-3" />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </ScrollArea>

                <div className="p-6 border-t border-zinc-800">
                    <Button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold gap-3 shadow-lg shadow-blue-900/20 transition-all disabled:opacity-50 group"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="size-5 animate-spin" />
                                <span>Generating Magic...</span>
                            </>
                        ) : (
                            <>
                                <Sparkles className="size-5 group-hover:scale-110 transition-transform" />
                                <div className="flex flex-col items-center">
                                    <span>Generate Poster</span>
                                    <span className="text-[10px] font-normal opacity-70">2 Credits per design</span>
                                </div>
                            </>
                        )}
                    </Button>
                </div>
            </aside>

            {/* Main Studio Area */}
            <main className="flex-1 flex flex-col relative bg-zinc-950">
                <header className="h-16 border-b border-zinc-800 px-6 flex items-center justify-between bg-zinc-950/80 backdrop-blur-md z-10">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-zinc-900 border-zinc-800 text-zinc-400">Draft v1.0</Badge>
                        <Separator orientation="vertical" className="h-4 bg-zinc-800 mx-2" />
                        <span className="text-sm font-medium text-zinc-400">Marketing Poster Design</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-zinc-400 hover:text-white hover:bg-zinc-900"
                            onClick={() => editorRef.current?.undo()}
                            disabled={!isEditMode}
                        >
                            <Undo2 className="size-5" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-zinc-400 hover:text-white hover:bg-zinc-900"
                            onClick={() => editorRef.current?.redo()}
                            disabled={!isEditMode}
                        >
                            <Redo2 className="size-5" />
                        </Button>
                        <Separator orientation="vertical" className="h-4 bg-zinc-800 mx-2" />
                        <Button
                            variant="outline"
                            className="border-zinc-800 bg-zinc-900 hover:bg-zinc-800 gap-2"
                            onClick={async () => {
                                if (isEditMode) {
                                    await editorRef.current?.exportImage();
                                } else if (selectedImage) {
                                    // Direct Export for raw image
                                    const link = document.createElement('a');
                                    link.download = `osera-poster-${Date.now()}.png`;
                                    link.href = selectedImage;
                                    link.click();
                                }
                            }}
                            disabled={!selectedImage}
                        >
                            <Download className="size-4" /> Export
                        </Button>
                    </div>
                </header>

                <div className="flex-1 p-8 flex items-center justify-center overflow-auto custom-scrollbar relative">
                    {selectedImage ? (
                        <div className="relative group max-w-full max-h-full w-full h-full flex items-center justify-center">
                            {isEditMode ? (
                                <div className="w-full h-full max-w-4xl max-h-[80vh]">
                                    <ImageEditor ref={editorRef} baseImage={selectedImage} />
                                </div>
                            ) : (
                                <div className="relative">
                                    <Card className="border-none shadow-2xl shadow-blue-900/10 overflow-hidden bg-zinc-900">
                                        <img
                                            src={selectedImage}
                                            alt="Generated poster"
                                            className="max-h-[70vh] w-auto object-contain transition-transform duration-500 group-hover:scale-[1.01]"
                                        />
                                    </Card>

                                    {/* Contextual Tools Overlay */}
                                    <div className="absolute -right-16 top-0 flex flex-col gap-2 p-2 bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-2xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="icon" className="hover:bg-zinc-800 text-zinc-400 hover:text-blue-400" title="Remove Background">
                                            <Eraser className="size-5" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="hover:bg-zinc-800 text-zinc-400 hover:text-blue-400"
                                            title="Add Text"
                                            onClick={() => {
                                                setIsEditMode(true);
                                                setTimeout(() => editorRef.current?.addText(), 100);
                                            }}
                                        >
                                            <Type className="size-5" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="hover:bg-zinc-800 text-zinc-400 hover:text-blue-400" title="Enhance Quality">
                                            <Sparkles className="size-5" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="hover:bg-zinc-800 text-zinc-400 hover:text-blue-400" title="Upscale">
                                            <Maximize className="size-5" />
                                        </Button>
                                        <Separator className="bg-zinc-800 my-1" />
                                        <Button variant="ghost" size="icon" className="hover:bg-zinc-800 text-zinc-400 hover:text-red-400" title="Delete">
                                            <Trash2 className="size-5" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center space-y-6 max-w-sm">
                            <div className="mx-auto size-20 bg-zinc-900 border border-zinc-800 rounded-3xl flex items-center justify-center">
                                <ImageIcon className="size-10 text-zinc-700" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold">Ready to create?</h3>
                                <p className="text-zinc-500 text-sm">Describe your vision or upload a product image to start designing professional posters.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* History / Carousel at bottom */}
                {generatedImages.length > 0 && (
                    <div className="h-32 border-t border-zinc-800 bg-zinc-950/50 backdrop-blur-md p-4 px-8 overflow-hidden">
                        <div className="flex items-center gap-4 h-full">
                            <div className="flex items-center gap-2 text-zinc-500 mr-4">
                                <History className="size-4" />
                                <span className="text-xs font-bold uppercase tracking-widest">History</span>
                            </div>
                            <ScrollArea className="flex-1 whitespace-nowrap pb-4">
                                <div className="flex gap-3">
                                    {generatedImages.map((img, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setSelectedImage(img)}
                                            className={cn(
                                                "size-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0",
                                                selectedImage === img ? "border-blue-500 scale-105" : "border-transparent opacity-60 hover:opacity-100"
                                            )}
                                        >
                                            <img src={img} className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    </div>
                )}
            </main>

            {/* Floating Design Tools */}
            {
                !isEditMode && selectedImage && (
                    <div className="fixed bottom-36 right-8 flex flex-col gap-3 animate-in slide-in-from-bottom-4">
                        <Button
                            onClick={() => setIsEditMode(true)}
                            className="rounded-full size-12 p-0 bg-blue-600 shadow-xl shadow-blue-500/20"
                        >
                            <Type className="size-5" />
                        </Button>
                        <Button className="rounded-full size-12 p-0 bg-zinc-800 hover:bg-zinc-700 shadow-xl">
                            <Layers className="size-5" />
                        </Button>
                    </div>
                )
            }

            {
                isEditMode && (
                    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-zinc-900 border border-zinc-800 p-2 px-6 rounded-full shadow-2xl z-50">
                        <span className="text-sm font-medium text-zinc-400">Editing Mode</span>
                        <Separator orientation="vertical" className="h-4 bg-zinc-800" />
                        <Button variant="ghost" size="sm" onClick={() => setIsEditMode(false)} className="text-zinc-300 hover:text-white">
                            Exit Editor
                        </Button>
                        <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-500"
                            onClick={() => editorRef.current?.saveDesign()}
                        >
                            Save Changes
                        </Button>
                    </div>
                )
            }
        </div >
    );
}
