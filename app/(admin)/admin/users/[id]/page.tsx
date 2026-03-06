"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ChevronLeft, Clock, Eye, MessageSquareQuote, Star } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AdminUserProfilePage() {
    const params = useParams()
    const router = useRouter()
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchUserActivity = async () => {
            try {
                const res = await fetch(`/api/admin/users/${params.id}`)
                if (!res.ok) throw new Error("Failed to fetch user data")
                const json = await res.json()
                setData(json)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        // We know this page is not unmounting frequently, but could add AbortController
        // if needed. Kept simple for now since it runs once per ID.
        fetchUserActivity()
    }, [params.id])

    if (loading) {
        return <div className="p-12 text-center text-muted-foreground">Loading user profile...</div>
    }

    if (!data || !data.user) {
        return (
            <div className="p-12 text-center space-y-4">
                <div className="text-destructive font-semibold">User not found</div>
                <Button onClick={() => router.push("/admin/users")} variant="outline">Back to Users</Button>
            </div>
        )
    }

    const { user, projects, feedback } = data

    return (
        <div className="space-y-8 pb-12">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.push("/admin/users")}>
                    <ChevronLeft size={20} />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{user.firstName} {user.lastName}</h1>
                    <p className="text-muted-foreground">{user.email}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-card rounded-xl border shadow-sm p-6">
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Account Status</h3>
                    <div className="text-2xl font-bold">{user.isUnlimited ? "Unlimited" : "Active"}</div>
                    <div className="text-xs text-muted-foreground mt-2">Joined {new Date(user.createdAt).toLocaleDateString()}</div>
                </div>
                <div className="bg-card rounded-xl border shadow-sm p-6">
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Remaining Credits</h3>
                    <div className="text-2xl font-bold text-primary">{user.credits}</div>
                </div>
                <div className="bg-card rounded-xl border shadow-sm p-6">
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Generations</h3>
                    <div className="text-2xl font-bold">{projects.length}</div>
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Generation History</h2>
                {projects.length === 0 ? (
                    <div className="p-8 text-center border rounded-xl border-dashed text-muted-foreground">No projects generated yet.</div>
                ) : (
                    <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Project Name</th>
                                    <th className="px-6 py-4 font-medium">Screens</th>
                                    <th className="px-6 py-4 font-medium">Date Created</th>
                                    <th className="px-6 py-4 font-medium text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {projects.map((project: any) => (
                                    <tr key={project.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-foreground">{project.name}</td>
                                        <td className="px-6 py-4">{project.frames?.length || 0}</td>
                                        <td className="px-6 py-4 text-muted-foreground flex items-center gap-2">
                                            <Clock size={14} /> {new Date(project.createdAt).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <a href={`/project/${project.id}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-xs font-medium text-primary hover:underline">
                                                <Eye size={14} /> View
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Feedback Provided</h2>
                {feedback.length === 0 ? (
                    <div className="p-8 text-center border rounded-xl border-dashed text-muted-foreground">No feedback provided yet.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {feedback.map((f: any) => (
                            <div key={f.id} className="bg-card border rounded-xl p-4 shadow-sm flex flex-col gap-3">
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <Star key={star} size={14} className={star <= f.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground opacity-30"} />
                                        ))}
                                    </div>
                                    <span className="text-xs text-muted-foreground">{new Date(f.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex-1">
                                    {f.comment ? (
                                        <p className="text-sm italic text-foreground flex gap-2">
                                            <MessageSquareQuote size={14} className="mt-0.5 shrink-0 text-muted-foreground" />
                                            "{f.comment}"
                                        </p>
                                    ) : (
                                        <span className="text-xs text-muted-foreground italic">No comment provided.</span>
                                    )}
                                </div>
                                <a href={`/project/${f.projectId}`} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                                    Origin Project: {f.projectId.substring(0, 8)}...
                                </a>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
