"use client";

import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from "react";
import { Move, Type, Trash2, Download, Layers, Palette, RotateCw, Loader2, Plus, MousePointer2, Square, Image as ImageIcon } from "lucide-react";
import { toPng } from 'html-to-image';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Rnd } from "react-rnd";
import { cn } from "@/lib/utils";
import { toast } from 'sonner';
import { nanoid } from 'nanoid';

export interface EditorElement {
    id: string;
    type: 'text' | 'image' | 'shape';
    content: string;
    x: number;
    y: number;
    fontSize?: number;
    fontWeight?: string;
    color?: string;
    fontFamily?: string;
}

export interface ImageEditorHandle {
    exportImage: () => Promise<void>;
    addText: () => void;
    addLogo: () => void;
    undo: () => void;
    redo: () => void;
    saveDesign: () => Promise<void>;
}

interface ImageEditorProps {
    baseImage: string;
}

const ImageEditor = forwardRef<ImageEditorHandle, ImageEditorProps>(({ baseImage }, ref) => {
    const [elements, setElements] = useState<EditorElement[]>([]);
    const [history, setHistory] = useState<EditorElement[][]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [isExporting, setIsExporting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const canvasRef = useRef<HTMLDivElement>(null);

    // Track history for undo/redo
    const addToHistory = (newElements: EditorElement[]) => {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push([...newElements]);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    };

    useEffect(() => {
        // Initial state
        if (history.length === 0) {
            setHistory([[]]);
            setHistoryIndex(0);
        }
    }, []);

    const handleExport = async () => {
        if (!canvasRef.current) return;

        setIsExporting(true);
        try {
            setSelectedId(null);
            await new Promise(resolve => setTimeout(resolve, 100));

            const dataUrl = await toPng(canvasRef.current, {
                cacheBust: true,
                pixelRatio: 2,
            });

            const link = document.createElement('a');
            link.download = `osera-design-${Date.now()}.png`;
            link.href = dataUrl;
            link.click();
            toast.success("Design exported successfully!");
        } catch (err) {
            console.error('Export failed', err);
            toast.error("Export failed. Please try again.");
        } finally {
            setIsExporting(false);
        }
    };

    const addText = () => {
        const id = nanoid();
        const newText: EditorElement = {
            id,
            type: 'text',
            content: "Edit Text",
            x: 100,
            y: 100,
            fontSize: 40,
            color: "#ffffff",
            fontFamily: "var(--font-cairo), Inter, sans-serif",
            fontWeight: "700"
        };
        const updated = [...elements, newText];
        setElements(updated);
        addToHistory(updated);
        setSelectedId(id);
    };

    const updateElement = (id: string, updates: Partial<EditorElement>) => {
        const updated = elements.map(el => el.id === id ? { ...el, ...updates } : el);
        setElements(updated);
        addToHistory(updated);
    };

    const deleteElement = (id: string) => {
        const updated = elements.filter(el => el.id !== id);
        setElements(updated);
        addToHistory(updated);
        setSelectedId(null);
    };

    const undo = () => {
        if (historyIndex > 0) {
            const prev = history[historyIndex - 1];
            setElements([...prev]);
            setHistoryIndex(historyIndex - 1);
        }
    };

    const redo = () => {
        if (historyIndex < history.length - 1) {
            const next = history[historyIndex + 1];
            setElements([...next]);
            setHistoryIndex(historyIndex + 1);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Simulated save for now, in V2 we'd post to /api/design/studio/save-changes
            await new Promise(r => setTimeout(r, 1000));
            toast.success("Design changes saved!");
        } catch (err) {
            toast.error("Failed to save changes.");
        } finally {
            setIsSaving(false);
        }
    };

    useImperativeHandle(ref, () => ({
        exportImage: handleExport,
        addText,
        addLogo: () => {
            toast.info("Logo upload tools coming soon!");
        },
        undo,
        redo,
        saveDesign: handleSave
    }));

    const selectedElement = elements.find(el => el.id === selectedId);

    return (
        <div className="flex flex-col h-full bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl">
            {/* Editor Toolbar */}
            <div className="h-14 bg-zinc-900 border-b border-zinc-800 px-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={addText} className="gap-2 text-zinc-300 hover:text-white">
                        <Type className="size-4" /> Add Text
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-2 text-zinc-300 hover:text-white">
                        <Layers className="size-4" /> Add Logo
                    </Button>
                </div>

                {selectedId && (
                    <div className="flex items-center gap-4 animate-in fade-in slide-in-from-top-1">
                        <div className="flex items-center gap-2 bg-zinc-800 rounded-lg p-1">
                            <Input
                                type="color"
                                value={selectedElement?.color}
                                onChange={(e) => updateElement(selectedId, { color: e.target.value })}
                                className="size-8 p-0 border-none bg-transparent cursor-pointer"
                            />
                            <Input
                                type="number"
                                value={selectedElement?.fontSize}
                                onChange={(e) => updateElement(selectedId, { fontSize: parseInt(e.target.value) })}
                                className="w-16 h-8 bg-zinc-900 border-zinc-700 text-xs"
                            />
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => deleteElement(selectedId)} className="text-zinc-500 hover:text-red-400">
                            <Trash2 className="size-4" />
                        </Button>
                    </div>
                )}

                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={handleExport} disabled={isExporting} className="gap-2 text-zinc-300 hover:text-white">
                        {isExporting ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />} Download
                    </Button>
                </div>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 relative bg-zinc-950 flex items-center justify-center p-8 overflow-hidden group">
                <div
                    ref={canvasRef}
                    className="relative shadow-2xl"
                    style={{ maxHeight: '100%', maxWidth: '100%' }}
                >
                    <img
                        src={baseImage}
                        alt="Base"
                        className="max-h-[70vh] w-auto pointer-events-none select-none"
                    />

                    {elements.map((el) => (
                        <Rnd
                            key={el.id}
                            position={{ x: el.x, y: el.y }}
                            onDragStop={(e, d) => updateElement(el.id, { x: d.x, y: d.y })}
                            bounds="parent"
                            enableResizing={false}
                            onClick={(e: any) => {
                                e.stopPropagation();
                                setSelectedId(el.id);
                            }}
                            className={cn(
                                "cursor-move",
                                selectedId === el.id ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-zinc-950" : ""
                            )}
                        >
                            <div
                                style={{
                                    fontSize: `${el.fontSize}px`,
                                    color: el.color,
                                    fontFamily: el.fontFamily,
                                    fontWeight: el.fontWeight,
                                    textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                                }}
                                className="whitespace-nowrap px-2"
                                onDoubleClick={() => {
                                    const newText = prompt("Enter text:", el.content);
                                    if (newText) updateElement(el.id, { content: newText });
                                }}
                            >
                                {el.content}
                            </div>
                        </Rnd>
                    ))}
                </div>

                {/* Help Overlay */}
                <div className="absolute bottom-4 left-4 text-[10px] text-zinc-600 uppercase tracking-widest pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                    Drag to move • Double click to edit • Use toolbar for styles
                </div>
            </div>
        </div>
    );
});

export default ImageEditor;
