"use client"

import { useEffect, useState } from "react"
import { Star, MessageSquareQuote } from "lucide-react"

export default function AdminFeedbackPage() {
    const [feedbacks, setFeedbacks] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchFeedback = async () => {
            try {
                const res = await fetch("/api/feedback")
                const data = await res.json()
                setFeedbacks(data)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchFeedback()
    }, [])

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">User Feedback</h1>
                <p className="text-muted-foreground mt-2">See what users are saying about the AI generation quality.</p>
            </div>

            <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                            <tr>
                                <th className="px-6 py-4 font-medium">Rating</th>
                                <th className="px-6 py-4 font-medium min-w-[300px]">Comment</th>
                                <th className="px-6 py-4 font-medium">Project ID</th>
                                <th className="px-6 py-4 font-medium">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">Loading feedback...</td>
                                </tr>
                            ) : feedbacks.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">No feedback received yet.</td>
                                </tr>
                            ) : (
                                feedbacks.map((feedback) => (
                                    <tr key={feedback.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star
                                                        key={star}
                                                        size={16}
                                                        className={star <= feedback.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground opacity-30"}
                                                    />
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {feedback.comment ? (
                                                <div className="flex items-start gap-2 text-foreground">
                                                    <MessageSquareQuote size={16} className="mt-0.5 text-muted-foreground shrink-0" />
                                                    <p>{feedback.comment}</p>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground italic text-xs">No comment provided</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-xs font-mono text-muted-foreground">
                                            {feedback.projectId ? (
                                                <a href={`/project/${feedback.projectId}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                                    {feedback.projectId.substring(0, 8)}...
                                                </a>
                                            ) : "N/A"}
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            {new Date(feedback.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
