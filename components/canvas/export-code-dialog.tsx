"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Copy, Check, Download, Loader2, Code2, Smartphone, Monitor, SmartphoneNfc } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

interface ExportCodeDialogProps {
    isOpen: boolean;
    onClose: () => void;
    htmlContent: string;
    frameId: string;
    projectId: string;
    title: string;
}

export function ExportCodeDialog({
    isOpen,
    onClose,
    htmlContent,
    frameId,
    projectId,
    title,
}: ExportCodeDialogProps) {
    const [activeTab, setActiveTab] = useState("html");
    const [codes, setCodes] = useState<{ [key: string]: string }>({
        html: htmlContent,
    });
    const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
    const [copied, setCopied] = useState(false);

    // Simple local React conversion
    const convertToReact = (html: string) => {
        let react = html
            .replace(/class=/g, "className=")
            .replace(/for=/g, "htmlFor=")
            .replace(/onclick=/g, "onClick=")
            .replace(/tabindex=/g, "tabIndex=")
            .replace(/autocomplete=/g, "autoComplete=")
            .replace(/style="([^"]*)"/g, (match, p1) => {
                const style = p1.split(';').reduce((acc: any, curr: string) => {
                    const [key, value] = curr.split(':');
                    if (key && value) {
                        const camelKey = key.trim().replace(/-([a-z])/g, (g) => g[1].toUpperCase());
                        acc[camelKey] = value.trim();
                    }
                    return acc;
                }, {});
                return `style={${JSON.stringify(style)}}`;
            });

        // Self-close tags
        const voidTags = ["img", "input", "br", "hr", "meta", "link"];
        voidTags.forEach(tag => {
            const regex = new RegExp(`<${tag}([^>]*[^/])>`, "g");
            react = react.replace(regex, `<${tag}$1 />`);
        });

        return `
import React from 'react';

const ${title.replace(/\s+/g, '') || 'Component'} = () => {
  return (
    ${react}
  );
};

export default ${title.replace(/\s+/g, '') || 'Component'};
`.trim();
    };

    useEffect(() => {
        if (isOpen && activeTab === "react" && !codes.react) {
            setCodes(prev => ({ ...prev, react: convertToReact(htmlContent) }));
        }
    }, [isOpen, activeTab, htmlContent]);

    const fetchAICode = async (target: string) => {
        if (codes[target] || loading[target]) return;

        setLoading(prev => ({ ...prev, [target]: true }));
        try {
            const response = await axios.post(`/api/project/${projectId}/frame/${frameId}/export`, {
                target,
                html: htmlContent
            });
            setCodes(prev => ({ ...prev, [target]: response.data.code }));
        } catch (error) {
            console.error(error);
            toast.error(`Failed to generate ${target} code`);
        } finally {
            setLoading(prev => ({ ...prev, [target]: false }));
        }
    };

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        if (value === "flutter" || value === "react-native") {
            fetchAICode(value);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(codes[activeTab] || "");
        setCopied(true);
        toast.success("Code copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const extension = activeTab === "flutter" ? "dart" : activeTab === "react" || activeTab === "react-native" ? "tsx" : "html";
        const blob = new Blob([codes[activeTab]], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${title.toLowerCase().replace(/\s+/g, "-")}.${extension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden bg-zinc-950 border-zinc-800 text-zinc-100">
                <DialogHeader className="p-6 pb-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                <Code2 className="text-blue-400 size-5" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-bold">Export Code</DialogTitle>
                                <DialogDescription className="text-zinc-400">
                                    Copy or download high-quality code for your developers.
                                </DialogDescription>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 gap-2"
                                onClick={handleCopy}
                            >
                                {copied ? <Check className="size-4 text-green-400" /> : <Copy className="size-4" />}
                                Copy
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 gap-2"
                                onClick={handleDownload}
                            >
                                <Download className="size-4" />
                                Download
                            </Button>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-hidden p-6 pt-4">
                    <Tabs value={activeTab} onValueChange={handleTabChange} className="h-full flex flex-col">
                        <TabsList className="bg-zinc-900 border-zinc-800 w-full justify-start p-1 mb-4 h-12">
                            <TabsTrigger value="html" className="data-[state=active]:bg-zinc-800 gap-2">
                                <Monitor className="size-4" /> HTML
                            </TabsTrigger>
                            <TabsTrigger value="react" className="data-[state=active]:bg-zinc-800 gap-2">
                                <Code2 className="size-4" /> React
                            </TabsTrigger>
                            <TabsTrigger value="react-native" className="data-[state=active]:bg-zinc-800 gap-2">
                                <SmartphoneNfc className="size-4" /> React Native
                            </TabsTrigger>
                            <TabsTrigger value="flutter" className="data-[state=active]:bg-zinc-800 gap-2">
                                <Smartphone className="size-4" /> Flutter
                            </TabsTrigger>
                        </TabsList>

                        <div className="flex-1 bg-black rounded-xl border border-zinc-800 overflow-hidden relative font-mono text-sm">
                            {loading[activeTab] ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm z-10 gap-3">
                                    <Loader2 className="size-8 text-blue-500 animate-spin" />
                                    <p className="text-zinc-400 animate-pulse">Gemini is translating to {activeTab}...</p>
                                </div>
                            ) : null}

                            <div className="h-full overflow-auto p-4 custom-scrollbar">
                                <pre className="text-zinc-300 leading-relaxed whitespace-pre-wrap break-all">
                                    <code>{codes[activeTab] || "// Code not generated yet"}</code>
                                </pre>
                            </div>
                        </div>
                    </Tabs>
                </div>
            </DialogContent>
        </Dialog>
    );
}
