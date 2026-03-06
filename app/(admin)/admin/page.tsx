"use client"

import { useEffect, useState } from "react"
import { Users, Code, Activity, Star } from "lucide-react"

export default function AdminDashboard() {
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch("/api/admin/stats")
            .then(res => res.json())
            .then(data => {
                setStats(data)
                setLoading(false)
            })
            .catch(err => {
                console.error(err)
                setLoading(false)
            })
    }, [])

    if (loading) return <div className="p-8">Loading dashboard...</div>
    if (!stats) return <div className="p-8">Error loading stats.</div>

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
                <p className="text-muted-foreground mt-2">Welcome to the OSARA AI Design admin panel.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-card rounded-xl border shadow-sm p-6 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-muted-foreground">Total Users</h3>
                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                            <Users size={20} />
                        </div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold">{stats.totalUsers}</div>
                        <p className="text-xs text-muted-foreground mt-1">Registered accounts</p>
                    </div>
                </div>

                <div className="bg-card rounded-xl border shadow-sm p-6 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-muted-foreground">AI Generations</h3>
                        <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500">
                            <Code size={20} />
                        </div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold">{stats.totalProjects}</div>
                        <p className="text-xs text-muted-foreground mt-1">Total projects created</p>
                    </div>
                </div>

                <div className="bg-card rounded-xl border shadow-sm p-6 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-muted-foreground">Revenue (EGP)</h3>
                        <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
                            <Activity size={20} />
                        </div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold">{stats.totalRevenueEGP} EGP</div>
                        <p className="text-xs text-muted-foreground mt-1">From completed orders</p>
                    </div>
                </div>

                <div className="bg-card rounded-xl border shadow-sm p-6 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-muted-foreground">User Satisfaction</h3>
                        <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500">
                            <Star size={20} />
                        </div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold">{stats.averageRating} / 5.0</div>
                        <p className="text-xs text-muted-foreground mt-1">Based on {stats.totalFeedback} reviews</p>
                    </div>
                </div>
            </div>

            {/* Placeholder for future Recharts integration */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                <div className="bg-card rounded-xl border shadow-sm p-6 min-h-[300px] flex items-center justify-center text-muted-foreground">
                    Activity Chart (Coming Soon)
                </div>
                <div className="bg-card rounded-xl border shadow-sm p-6 min-h-[300px] flex items-center justify-center text-muted-foreground">
                    Recent Feedback (Coming Soon)
                </div>
            </div>
        </div>
    )
}
