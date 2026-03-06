"use client"

import { useEffect, useState } from "react"
import { Eye, Clock, ChevronLeft, ChevronRight, Trash2, Search, Filter, User, Calendar, BookOpen, LayoutGrid, CheckSquare, Square, X, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

export default function AdminProjectsPage() {
    const [projects, setProjects] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [isDeleting, setIsDeleting] = useState<string | null>(null)
    const [isBulkDeleting, setIsBulkDeleting] = useState(false)

    // Filters
    const [search, setSearch] = useState("")
    const [userQuery, setUserQuery] = useState("")
    const [theme, setTheme] = useState("")
    const [screenCount, setScreenCount] = useState("")
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")

    // Selection
    const [selectedIds, setSelectedIds] = useState<string[]>([])

    const fetchProjects = async (currentPage: number, currentFilters: any = {}, controller?: AbortController) => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                limit: "20",
                page: currentPage.toString(),
            })

            Object.entries(currentFilters).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== "") {
                    params.append(key, value as string)
                }
            })

            const res = await fetch(`/api/admin/projects?${params.toString()}`, {
                signal: controller?.signal
            })

            if (!res.ok) {
                const text = await res.text();
                console.error("[FETCH_PROJECTS_ERROR]", text);
                throw new Error(text || "Failed to load projects");
            }

            const data = await res.json()
            if (data.data) {
                setProjects(data.data)
                setTotalPages(data.totalPages || 1)
            } else if (Array.isArray(data)) {
                setProjects(data)
                setTotalPages(1)
            }
        } catch (err: any) {
            if (err.name === 'AbortError') return;
            console.error(err)
            toast.error("Failed to load projects.")
        } finally {
            setLoading(false)
        }
    }

    const clearFilters = () => {
        setSearch("")
        setUserQuery("")
        setTheme("")
        setScreenCount("")
        setStartDate("")
        setEndDate("")
        setPage(1)
    }

    // Debounce effect
    useEffect(() => {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => {
            const filters = { search, userQuery, theme, screenCount, startDate, endDate }
            fetchProjects(page, filters, controller)
            // Note: We DON'T clear selectedIds here to allow cross-page selection if needed, 
            // but usually clearing on filter change is safer. Let's keep it for now.
            setSelectedIds([])
        }, 500)

        return () => {
            controller.abort()
            clearTimeout(timeoutId)
        }
    }, [page, search, userQuery, theme, screenCount, startDate, endDate])

    const handleDelete = async (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (!confirm("Are you sure you want to delete this project? This cannot be undone.")) return;

        setIsDeleting(id)
        try {
            const res = await fetch(`/api/admin/projects/${id}`, {
                method: "DELETE"
            })
            if (!res.ok) throw new Error("Delete failed");
            toast.success("Project deleted successfully")
            fetchProjects(page, { search, userQuery, theme, screenCount, startDate, endDate })
            setSelectedIds(prev => prev.filter(item => item !== id))
        } catch (err) {
            console.error(err)
            toast.error("Failed to delete project")
        } finally {
            setIsDeleting(null)
        }
    }

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        if (!confirm(`Are you sure you want to delete ${selectedIds.length} projects? This will permanently remove them and all their screens.`)) return;

        setIsBulkDeleting(true)
        const loadingToast = toast.loading(`Deleting ${selectedIds.length} projects...`)

        try {
            let successCount = 0;
            let failCount = 0;

            for (const id of selectedIds) {
                const res = await fetch(`/api/admin/projects/${id}`, { method: "DELETE" });
                if (res.ok) successCount++;
                else failCount++;
            }

            toast.dismiss(loadingToast)
            if (successCount > 0) toast.success(`${successCount} projects deleted successfully`);
            if (failCount > 0) toast.error(`${failCount} projects failed to delete`);

            fetchProjects(page, { search, userQuery, theme, screenCount, startDate, endDate })
            setSelectedIds([])
        } catch (err) {
            toast.dismiss(loadingToast)
            console.error(err)
            toast.error("An error occurred during bulk deletion")
        } finally {
            setIsBulkDeleting(false)
        }
    }

    const toggleSelection = (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        )
    }

    const toggleSelectAll = () => {
        if (selectedIds.length === projects.length && projects.length > 0) {
            setSelectedIds([])
        } else {
            setSelectedIds(projects.map(p => p.id))
        }
    }

    return (
        <div className="space-y-6 flex flex-col min-h-full pb-24">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b pb-6">
                <div className="flex-1">
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Generated Projects Review</h1>
                    <p className="text-muted-foreground mt-2 font-medium">Monitor AI output quality by reviewing recent app generations.</p>
                </div>

                <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg border">
                    <Button
                        variant={page === 1 ? "ghost" : "outline"}
                        size="sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1 || loading}
                        className="h-8"
                    >
                        <ChevronLeft size={16} />
                    </Button>
                    <span className="text-xs font-semibold px-2 min-w-[80px] text-center">
                        Page {page} of {totalPages}
                    </span>
                    <Button
                        variant={page >= totalPages ? "ghost" : "outline"}
                        size="sm"
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page >= totalPages || loading}
                        className="h-8"
                    >
                        <ChevronRight size={16} />
                    </Button>
                </div>
            </div>

            {/* Premium Filter Bar */}
            <div className="p-4 bg-card border rounded-xl shadow-sm space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                        <Input
                            placeholder="Project name..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            className="pl-9 bg-muted/30 focus:bg-background transition-all"
                        />
                    </div>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                        <Input
                            placeholder="User email..."
                            value={userQuery}
                            onChange={(e) => { setUserQuery(e.target.value); setPage(1); }}
                            className="pl-9 bg-muted/30 focus:bg-background transition-all"
                        />
                    </div>
                    <div className="relative">
                        <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                        <Input
                            placeholder="Style/Theme..."
                            value={theme}
                            onChange={(e) => { setTheme(e.target.value); setPage(1); }}
                            className="pl-9 bg-muted/30 focus:bg-background transition-all"
                        />
                    </div>
                    <div className="relative">
                        <LayoutGrid className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                        <Input
                            placeholder="Screens (0 = empty)..."
                            value={screenCount}
                            onChange={(e) => { setScreenCount(e.target.value); setPage(1); }}
                            className="pl-9 bg-muted/30 focus:bg-background transition-all"
                        />
                    </div>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                        <Input
                            type="date"
                            value={startDate}
                            onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                            className="pl-9 bg-muted/30 focus:bg-background transition-all text-xs"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] uppercase font-bold text-muted-foreground pointer-events-none">Start</div>
                    </div>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                        <Input
                            type="date"
                            value={endDate}
                            onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                            className="pl-9 bg-muted/30 focus:bg-background transition-all text-xs"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] uppercase font-bold text-muted-foreground pointer-events-none">End</div>
                    </div>
                </div>

                <div className="flex justify-between items-center">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleSelectAll}
                        className="text-xs font-bold gap-2 text-primary hover:bg-primary/5"
                    >
                        {selectedIds.length === projects.length && projects.length > 0 ? <CheckSquare size={16} /> : <Square size={16} />}
                        {selectedIds.length === projects.length && projects.length > 0 ? "Deselect All" : "Select All on Page"}
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={clearFilters}
                        className="text-[10px] uppercase font-black tracking-widest h-7"
                    >
                        <X size={12} className="mr-1" /> Clear Filters
                    </Button>
                </div>
            </div>

            {loading && projects.length === 0 ? (
                <div className="py-24 text-center text-muted-foreground flex-1 flex flex-col items-center justify-center animate-pulse">
                    <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
                    Loading projects...
                </div>
            ) : projects.length === 0 ? (
                <div className="py-24 text-center text-muted-foreground flex-1 flex flex-col items-center justify-center bg-muted/10 rounded-2xl border-2 border-dashed">
                    <Search className="w-12 h-12 opacity-20 mb-4" />
                    <p className="text-xl font-semibold">No projects found.</p>
                    <p className="text-sm">Try adjusting your filters or search terms.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 flex-1 content-start">
                    {projects.map((project) => (
                        <div
                            key={project.id}
                            className={`bg-card border rounded-xl overflow-hidden flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative group/card cursor-pointer ${selectedIds.includes(project.id) ? 'ring-2 ring-primary border-primary md:translate-y-[-4px]' : ''}`}
                            onClick={() => toggleSelection(project.id)}
                        >
                            {/* Checkbox Overlay */}
                            <div className={`absolute top-3 left-3 z-20 transition-all ${selectedIds.includes(project.id) ? 'opacity-100 scale-110' : 'opacity-0 group-hover/card:opacity-100'}`}>
                                <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center shadow-lg transition-all ${selectedIds.includes(project.id) ? 'bg-primary border-primary text-white' : 'bg-background/80 border-white text-transparent backdrop-blur-md'}`}>
                                    <CheckSquare size={14} fill="currentColor" className={selectedIds.includes(project.id) ? 'text-white' : 'text-transparent'} />
                                </div>
                            </div>

                            <div className="h-48 bg-muted border-b relative group">
                                {project.thumbnail ? (
                                    <img src={project.thumbnail} alt={project.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm flex-col gap-2">
                                        <Eye className="w-8 h-8 opacity-50" />
                                        <span>No Thumbnail</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity gap-2 backdrop-blur-sm">
                                    <Button
                                        variant="default"
                                        size="sm"
                                        className="rounded-full font-bold h-9 shadow-lg"
                                        onClick={(e) => { e.stopPropagation(); window.open(`/project/${project.id}`, '_blank'); }}
                                    >
                                        <Eye size={16} className="mr-2" /> View Project
                                    </Button>
                                </div>
                                <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 bg-black/60 text-white text-[10px] font-bold rounded-full backdrop-blur-md">
                                    <Badge className="bg-primary/80 hover:bg-primary text-white border-none h-4 px-1">{project.frames?.length || 0}</Badge> Screens
                                </div>
                            </div>
                            <div className="p-5 flex flex-col flex-1">
                                <div className="flex justify-between items-start gap-3 mb-2">
                                    <h3 className="font-bold text-lg leading-tight line-clamp-2 min-h-[3.5rem]" title={project.name}>{project.name}</h3>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 min-w-[2rem] text-destructive hover:bg-destructive/10 rounded-full"
                                        onClick={(e) => handleDelete(project.id, e)}
                                        disabled={isDeleting === project.id}
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                </div>

                                {project.theme && (
                                    <div className="mb-4">
                                        <span className="text-[10px] font-black uppercase text-muted-foreground leading-none tracking-wider">Style Context</span>
                                        <div className="text-sm font-medium text-foreground/80 mt-0.5 capitalize line-clamp-1" title={project.theme}>{project.theme}</div>
                                    </div>
                                )}

                                <div className="mt-auto pt-4 border-t flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
                                    <span className="flex items-center gap-1.5 bg-muted/30 px-2 py-1 rounded-md">
                                        <Clock size={12} className="text-primary" />
                                        {new Date(project.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>
                                    <span className="text-primary/70">{project.id.slice(-6)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Floating Bulk Action Bar */}
            {selectedIds.length > 0 && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="bg-background border-2 border-primary/20 shadow-2xl rounded-2xl px-6 py-4 flex items-center gap-6 backdrop-blur-md min-w-[320px]">
                        <div className="flex flex-col">
                            <span className="text-xs font-black uppercase tracking-tighter text-primary">Bulk Operations</span>
                            <span className="text-sm font-bold">{selectedIds.length} projects selected</span>
                        </div>

                        <div className="h-8 w-[1px] bg-border ml-2 mr-2" />

                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-9 px-3 font-semibold text-muted-foreground hover:text-foreground"
                                onClick={() => setSelectedIds([])}
                            >
                                Deselect
                            </Button>

                            <Button
                                variant="destructive"
                                size="sm"
                                className="h-9 px-6 font-bold shadow-lg shadow-destructive/20 flex items-center gap-2"
                                onClick={handleBulkDelete}
                                disabled={isBulkDeleting}
                            >
                                <Trash size={16} />
                                {isBulkDeleting ? "Deleting..." : "Delete ALL"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
