"use client"

import { useEffect, useState } from "react"
import { Eye, Clock, ChevronLeft, ChevronRight, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export default function AdminProjectsPage() {
    const [projects, setProjects] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [isDeleting, setIsDeleting] = useState<string | null>(null)

    const fetchProjects = async (currentPage: number, controller?: AbortController) => {
        setLoading(true)
        try {
            const res = await fetch(`/api/admin/projects?limit=20&page=${currentPage}`, {
                signal: controller?.signal
            })
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

    useEffect(() => {
        const controller = new AbortController()
        fetchProjects(page, controller)
        return () => controller.abort()
    }, [page])

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this project? This cannot be undone.")) return;

        setIsDeleting(id)
        try {
            const res = await fetch(`/api/admin/projects/${id}`, {
                method: "DELETE"
            })
            if (!res.ok) throw new Error("Delete failed");
            toast.success("Project deleted successfully")
            // Refresh list
            fetchProjects(page)
        } catch (err) {
            console.error(err)
            toast.error("Failed to delete project")
        } finally {
            setIsDeleting(null)
        }
    }

    return (
        <div className="space-y-6 flex flex-col min-h-full">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Generated Projects Review</h1>
                    <p className="text-muted-foreground mt-2">Monitor AI output quality by reviewing recent app generations.</p>
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1 || loading}
                    >
                        <ChevronLeft size={16} /> Prev
                    </Button>
                    <span className="text-sm font-medium px-4">
                        Page {page} of {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page >= totalPages || loading}
                    >
                        Next <ChevronRight size={16} />
                    </Button>
                </div>
            </div>

            {loading && projects.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground flex-1 flex items-center justify-center">Loading projects...</div>
            ) : projects.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground flex-1 flex items-center justify-center">No projects found.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 flex-1 content-start">
                    {projects.map((project) => (
                        <div key={project.id} className="bg-card border rounded-xl overflow-hidden flex flex-col hover:shadow-md transition-all">
                            <div className="h-48 bg-muted border-b relative group">
                                {project.thumbnail ? (
                                    <img src={project.thumbnail} alt={project.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm flex-col gap-2">
                                        <Eye className="w-8 h-8 opacity-50" />
                                        <span>No Thumbnail generated</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity gap-2">
                                    <a href={`/project/${project.id}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium shadow-sm flex items-center gap-2 hover:bg-primary/90">
                                        <Eye size={16} /> View
                                    </a>
                                </div>
                            </div>
                            <div className="p-4 flex flex-col flex-1">
                                <div className="flex justify-between items-start gap-2">
                                    <h3 className="font-semibold text-lg line-clamp-1" title={project.name}>{project.name}</h3>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                        onClick={() => handleDelete(project.id)}
                                        disabled={isDeleting === project.id}
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground mt-auto">
                                    <span className="flex items-center gap-1"><Clock size={12} /> {new Date(project.createdAt).toLocaleDateString()}</span>
                                    <span className="bg-muted px-2 py-1 rounded-md text-foreground">{project.frames?.length || 0} Screens</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
