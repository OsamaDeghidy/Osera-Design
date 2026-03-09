"use client";

import { useState, useEffect } from "react";
import {
    Sparkles,
    Plus,
    Trash2,
    ChevronRight,
    Image as ImageIcon,
    PlusCircle,
    LayoutGrid,
    Flame
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Image from "next/image";

export default function AdminStudioPage() {
    const [designs, setDesigns] = useState<any[]>([]);
    const [trends, setTrends] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Form states
    const [newCategoryAr, setNewCategoryAr] = useState("");
    const [newCategoryEn, setNewCategoryEn] = useState("");

    const [selectedCatId, setSelectedCatId] = useState("");
    const [newPromptAr, setNewPromptAr] = useState("");
    const [newPromptEn, setNewPromptEn] = useState("");
    const [newPromptText, setNewPromptText] = useState("");

    const fetchData = async () => {
        try {
            const [dRes, tRes] = await Promise.all([
                fetch("/api/admin/studio/designs"),
                fetch("/api/admin/studio/trends")
            ]);
            if (dRes.ok) setDesigns(await dRes.json());
            if (tRes.ok) setTrends(await tRes.json());
        } catch (error) {
            toast.error("Failed to load data");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const addCategory = async () => {
        if (!newCategoryAr || !newCategoryEn) return;
        try {
            const res = await fetch("/api/admin/studio/trends", {
                method: "POST",
                body: JSON.stringify({ type: "CATEGORY", nameAr: newCategoryAr, nameEn: newCategoryEn })
            });
            if (res.ok) {
                toast.success("Category added!");
                setNewCategoryAr("");
                setNewCategoryEn("");
                fetchData();
            }
        } catch (err) {
            toast.error("Error adding category");
        }
    };

    const addPrompt = async () => {
        if (!selectedCatId || !newPromptText) return;
        try {
            const res = await fetch("/api/admin/studio/trends", {
                method: "POST",
                body: JSON.stringify({
                    type: "PROMPT",
                    categoryId: selectedCatId,
                    titleAr: newPromptAr,
                    titleEn: newPromptEn,
                    prompt: newPromptText
                })
            });
            if (res.ok) {
                toast.success("Prompt added!");
                setNewPromptAr("");
                setNewPromptEn("");
                setNewPromptText("");
                fetchData();
            }
        } catch (err) {
            toast.error("Error adding prompt");
        }
    };

    const deleteItem = async (id: string, type: "CATEGORY" | "PROMPT") => {
        if (!confirm("Are you sure?")) return;
        try {
            const res = await fetch(`/api/admin/studio/trends?id=${id}&type=${type}`, { method: "DELETE" });
            if (res.ok) {
                toast.success("Deleted!");
                fetchData();
            }
        } catch (err) {
            toast.error("Error deleting");
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Studio Management</h1>
                    <p className="text-muted-foreground">Manage trends and view user generations</p>
                </div>
                <Badge variant="outline" className="px-3 py-1 bg-blue-500/10 text-blue-500 border-blue-500/20">
                    <Sparkles className="size-3 mr-2 fill-current" /> Admin Studio v1.0
                </Badge>
            </div>

            <Tabs defaultValue="gallery" className="space-y-6">
                <TabsList className="bg-muted/50 p-1">
                    <TabsTrigger value="gallery" className="gap-2">
                        <LayoutGrid className="size-4" /> Gallery
                    </TabsTrigger>
                    <TabsTrigger value="trends" className="gap-2">
                        <Flame className="size-4" /> Trends Manager
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="gallery">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>User Generations Gallery</CardTitle>
                                <CardDescription>Recent posters created by users in the Studio</CardDescription>
                            </div>
                            <Button variant="outline" size="sm" onClick={fetchData} disabled={isLoading}>
                                {isLoading ? "Loading..." : "Refresh Gallery"}
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="h-[400px] flex items-center justify-center border-2 border-dashed rounded-xl">
                                    <div className="text-center space-y-2">
                                        <div className="animate-spin size-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                                        <p className="text-muted-foreground">Fetching generations...</p>
                                    </div>
                                </div>
                            ) : designs.length === 0 ? (
                                <div className="h-[400px] flex items-center justify-center border-2 border-dashed rounded-xl bg-muted/20">
                                    <div className="text-center space-y-4">
                                        <div className="size-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                                            <ImageIcon className="size-8 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg">No designs found</h3>
                                            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                                                User posters will appear here once they are generated in the Studio.
                                            </p>
                                        </div>
                                        <Button variant="outline" onClick={fetchData}>Check Again</Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {designs.map((d) => (
                                        <div key={d.id} className="group relative aspect-square rounded-xl overflow-hidden border bg-muted">
                                            <Image
                                                src={d.imageUrl}
                                                alt={d.prompt}
                                                fill
                                                className="object-cover transition-transform group-hover:scale-105"
                                            />

                                            {/* Status Badge */}
                                            <div className="absolute top-2 left-2 z-10">
                                                {d.isPublic ? (
                                                    <Badge className="bg-green-500 text-white border-green-600/20 text-[9px] uppercase tracking-tighter shadow-lg">
                                                        Public
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary" className="bg-black/50 backdrop-blur-md text-white/70 border-white/10 text-[9px] uppercase tracking-tighter">
                                                        Draft
                                                    </Badge>
                                                )}
                                            </div>

                                            {/* Actions Overlay */}
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                                                <div className="flex justify-end">
                                                    <Button
                                                        size="icon"
                                                        variant={d.isPublic ? "default" : "secondary"}
                                                        className={`size-8 rounded-full ${d.isPublic ? 'bg-green-600 hover:bg-green-700' : 'bg-white/20 hover:bg-white/40'}`}
                                                        onClick={async () => {
                                                            const res = await fetch("/api/admin/studio/designs", {
                                                                method: "PATCH",
                                                                body: JSON.stringify({ id: d.id, isPublic: !d.isPublic })
                                                            });
                                                            if (res.ok) {
                                                                toast.success(d.isPublic ? "Removed from gallery" : "Featured in gallery!");
                                                                fetchData();
                                                            }
                                                        }}
                                                    >
                                                        {d.isPublic ? <ImageIcon className="size-4" /> : <Sparkles className="size-4" />}
                                                    </Button>
                                                </div>
                                                <p className="text-[10px] text-white line-clamp-2 drop-shadow-md">{d.prompt}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="trends" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Add Category */}
                        <Card>
                            <CardHeader>
                                <CardTitle>New Category</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>English Name</Label>
                                    <Input value={newCategoryEn} onChange={(e) => setNewCategoryEn(e.target.value)} placeholder="e.g., Seasonal" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Arabic Name</Label>
                                    <Input value={newCategoryAr} onChange={(e) => setNewCategoryAr(e.target.value)} placeholder="مثال: موسمي" dir="rtl" />
                                </div>
                                <Button className="w-full" onClick={addCategory}>
                                    <PlusCircle className="size-4 mr-2" /> Add Category
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Add Prompt */}
                        <Card>
                            <CardHeader>
                                <CardTitle>New Trend Prompt</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Category</Label>
                                    <select
                                        className="w-full p-2 bg-background border rounded-md"
                                        value={selectedCatId}
                                        onChange={(e) => setSelectedCatId(e.target.value)}
                                    >
                                        <option value="">Select Category</option>
                                        {trends.map(c => <option key={c.id} value={c.id}>{c.nameEn}</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-2">
                                        <Label>Title (EN)</Label>
                                        <Input value={newPromptEn} onChange={(e) => setNewPromptEn(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Title (AR)</Label>
                                        <Input value={newPromptAr} onChange={(e) => setNewPromptAr(e.target.value)} dir="rtl" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>System Prompt</Label>
                                    <Input value={newPromptText} onChange={(e) => setNewPromptText(e.target.value)} placeholder="Direct instruction for AI" />
                                </div>
                                <Button className="w-full" onClick={addPrompt} disabled={!selectedCatId}>
                                    <Plus className="size-4 mr-2" /> Add Prompt
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Manage Existing */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Existing Trends</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {trends.map((cat) => (
                                    <div key={cat.id} className="border rounded-xl p-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="font-bold">{cat.nameEn} ({cat.nameAr})</h3>
                                            <Button variant="ghost" size="sm" onClick={() => deleteItem(cat.id, "CATEGORY")} className="text-destructive">
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </div>
                                        <div className="grid gap-2">
                                            {cat.prompts?.map((p: any) => (
                                                <div key={p.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg text-sm">
                                                    <div>
                                                        <span className="font-semibold">{p.titleEn}</span>
                                                        <p className="text-xs text-muted-foreground truncate max-w-[400px]">{p.prompt}</p>
                                                    </div>
                                                    <Button variant="ghost" size="icon" onClick={() => deleteItem(p.id, "PROMPT")}>
                                                        <Trash2 className="size-4 text-muted-foreground" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
