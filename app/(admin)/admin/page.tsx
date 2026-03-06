"use client"

import { useEffect, useState } from "react"
import { Users, Code, Activity, Star, TrendingUp, BarChart3 } from "lucide-react"
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell
} from "recharts"

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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
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
                        <h3 className="text-sm font-medium text-muted-foreground">Revenue (USD)</h3>
                        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                            <Activity size={20} />
                        </div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold">${stats.totalRevenueUSD}</div>
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

            {/* Analytics Section */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-8">
                {/* Daily Project Generations Chart */}
                <div className="bg-card rounded-xl border shadow-sm p-6 flex flex-col space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                <TrendingUp size={20} className="text-blue-500" />
                                Project Generation Growth
                            </h3>
                            <p className="text-sm text-muted-foreground">Daily activity for the last 30 days</p>
                        </div>
                    </div>
                    <div className="h-[300px] w-full pt-4 text-black">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.dailyData}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(str) => {
                                        try {
                                            const d = new Date(str);
                                            return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
                                        } catch (e) {
                                            return str;
                                        }
                                    }}
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fill: '#888' }}
                                />
                                <YAxis
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fill: '#888' }}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e5e5', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                                    labelFormatter={(label) => new Date(label).toDateString()}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="count"
                                    stroke="#3b82f6"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorCount)"
                                    animationDuration={1500}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-card rounded-xl border shadow-sm p-6 flex flex-col space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        <BarChart3 size={20} className="text-indigo-500" />
                        Projects Analytics (By Frame Count)
                    </h3>
                    <p className="text-sm text-muted-foreground pb-2 border-b">
                        Breakdown of projects based on the number of generated UI screens.
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                        <div className="p-3 bg-muted/40 rounded-lg text-center border">
                            <div className="text-2xl font-bold">{stats.projectBreakdown['0_screens']}</div>
                            <div className="text-xs text-muted-foreground">0 Screens</div>
                        </div>
                        <div className="p-3 bg-muted/40 rounded-lg text-center border">
                            <div className="text-2xl font-bold">{stats.projectBreakdown['1_screen']}</div>
                            <div className="text-xs text-muted-foreground">1 Screen</div>
                        </div>
                        <div className="p-3 bg-muted/40 rounded-lg text-center border">
                            <div className="text-2xl font-bold">{stats.projectBreakdown['2_screens']}</div>
                            <div className="text-xs text-muted-foreground">2 Screens</div>
                        </div>
                        <div className="p-3 bg-muted/40 rounded-lg text-center border">
                            <div className="text-2xl font-bold">{stats.projectBreakdown['3_screens']}</div>
                            <div className="text-xs text-muted-foreground">3 Screens</div>
                        </div>
                        <div className="p-3 bg-muted/40 rounded-lg text-center border">
                            <div className="text-2xl font-bold">{stats.projectBreakdown['4_screens']}</div>
                            <div className="text-xs text-muted-foreground">4 Screens</div>
                        </div>
                        <div className="p-3 bg-muted/40 rounded-lg text-center border">
                            <div className="text-2xl font-bold">{stats.projectBreakdown['5_screens']}</div>
                            <div className="text-xs text-muted-foreground">5 Screens</div>
                        </div>
                        <div className="p-3 bg-muted/40 rounded-lg text-center border">
                            <div className="text-2xl font-bold">{stats.projectBreakdown['6_to_9_screens']}</div>
                            <div className="text-xs text-muted-foreground">6 - 9 Screens</div>
                        </div>
                        <div className="p-3 bg-muted/40 rounded-lg text-center border">
                            <div className="text-2xl font-bold">{stats.projectBreakdown['10_screens']}</div>
                            <div className="text-xs text-muted-foreground">10 Screens</div>
                        </div>
                        <div className="p-3 bg-muted/40 rounded-lg text-center border bg-blue-500/5">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.projectBreakdown['gt_10_screens']}</div>
                            <div className="text-xs text-blue-600/80 dark:text-blue-400/80">&gt; 10 Screens</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Satisfaction Distribution */}
            <div className="bg-card rounded-xl border shadow-sm p-6 mt-8">
                <h3 className="font-semibold text-lg flex items-center gap-2 mb-6">
                    <Star size={20} className="text-yellow-500 fill-yellow-500" />
                    Satisfaction Distribution
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                    {[5, 4, 3, 2, 1].map((rating) => {
                        const count = stats.feedbackDistribution[rating] || 0;
                        const percentage = stats.totalFeedback > 0
                            ? (count / stats.totalFeedback) * 100
                            : 0;

                        return (
                            <div key={rating} className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium flex items-center gap-1">
                                        {rating} <Star size={12} className="fill-yellow-500 text-yellow-500" />
                                    </span>
                                    <span className="text-muted-foreground">{count} reviews</span>
                                </div>
                                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-yellow-500 transition-all duration-1000 ease-out"
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
