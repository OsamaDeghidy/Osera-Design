"use client";

import React, { useState } from "react";
import { PROMPT_LIBRARY, PromptCategory, PromptItem } from "@/data/prompts";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, ArrowRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface PromptLibraryModalProps {
    onSelect: (prompt: string) => void;
    language: "en" | "ar";
    trigger?: React.ReactNode;
}

export const PromptLibraryModal = ({
    onSelect,
    language,
    trigger,
}: PromptLibraryModalProps) => {
    const [open, setOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string>(
        PROMPT_LIBRARY[0].id
    );

    const activeCategory = PROMPT_LIBRARY.find((c) => c.id === selectedCategory);

    const isAr = language === "ar";
    const direction = isAr ? "rtl" : "ltr";

    const handleSelect = (prompt: PromptItem) => {
        onSelect(isAr ? prompt.valueAr : prompt.valueEn);
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground gap-2 h-8 px-2"
                    >
                        <Sparkles size={14} />
                        <span className="text-xs">{isAr ? "أفكار جاهزة" : "Ideas"}</span>
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-3xl h-[80vh] flex flex-col p-0 gap-0 overflow-hidden" dir={direction}>
                <div className="p-6 border-b">
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Sparkles className="text-primary" />
                        {isAr ? "مكتبة الإلهام" : "Inspiration Library"}
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                        {isAr
                            ? "اختر فكرة جاهزة لتبدأ تصميمك بسرعة واحترافية"
                            : "Choose a ready-made prompt to jumpstart your design"}
                    </p>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar */}
                    <div className="w-48 md:w-64 border-e bg-muted/10 flex-shrink-0 flex flex-col p-2 gap-1 overflow-y-auto">
                        {PROMPT_LIBRARY.map((category) => (
                            <Button
                                key={category.id}
                                variant={selectedCategory === category.id ? "secondary" : "ghost"}
                                className={cn(
                                    "justify-start gap-3 h-10 w-full",
                                    selectedCategory === category.id && "bg-primary/10 text-primary font-medium"
                                )}
                                onClick={() => setSelectedCategory(category.id)}
                            >
                                <span>{category.icon}</span>
                                <span className="truncate">
                                    {isAr ? category.labelAr : category.labelEn}
                                </span>
                            </Button>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="flex-1 bg-background flex flex-col overflow-hidden">
                        <ScrollArea className="flex-1 p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-20">
                                {activeCategory?.prompts.map((prompt) => (
                                    <div
                                        key={prompt.id}
                                        className="group flex flex-col border rounded-xl p-4 cursor-pointer hover:border-primary/50 hover:bg-muted/5 transition-all w-full text-start"
                                        onClick={() => handleSelect(prompt)}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <h4 className="font-semibold text-sm">
                                                {isAr ? prompt.titleAr : prompt.titleEn}
                                            </h4>
                                            {isAr ? <ArrowLeft size={16} className="opacity-0 group-hover:opacity-100 transition-opacity text-primary" /> : <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity text-primary" />}
                                        </div>

                                        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                                            {isAr ? prompt.descriptionAr : prompt.descriptionEn}
                                        </p>

                                        <div className="mt-auto pt-3 border-t text-[10px] text-muted-foreground line-clamp-3 bg-muted/30 p-2 rounded italic">
                                            "{isAr ? prompt.valueAr : prompt.valueEn}"
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
