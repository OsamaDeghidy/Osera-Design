"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ChevronLeft, Clock, Eye, MessageSquareQuote, Star, Send, Mail, Bell, AlertTriangle, CheckCircle2, Coins, ShieldCheck, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

export default function AdminUserProfilePage() {
    const params = useParams()
    const router = useRouter()
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const [updatingCredits, setUpdatingCredits] = useState(false)

    // Communication Form State
    const [msgTitle, setMsgTitle] = useState("")
    const [msgBody, setMsgBody] = useState("")
    const [channels, setChannels] = useState({ email: false, notification: true })
    const [msgType, setMsgType] = useState("INFO")

    // Account Management State
    const [newCredits, setNewCredits] = useState(0)
    const [newRole, setNewRole] = useState("USER")

    const fetchUserActivity = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/admin/users/${params.id}`)
            if (!res.ok) throw new Error("Failed to fetch user data")
            const json = await res.json()
            setData(json)
            setNewCredits(json.user?.credits || 0)
            setNewRole(json.user?.role || "USER")
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUserActivity()
    }, [params.id])

    const handleSendMessage = async () => {
        if (!msgTitle || !msgBody) {
            toast.error("Please fill in both title and message")
            return
        }

        setSending(true)
        try {
            const selectedChannels = Object.entries(channels)
                .filter(([_, active]) => active)
                .map(([name]) => name)

            if (selectedChannels.length === 0) {
                toast.error("Please select at least one channel")
                return
            }

            const res = await fetch(`/api/admin/users/${params.id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: msgTitle,
                    message: msgBody,
                    type: msgType,
                    channels: selectedChannels
                })
            })

            if (!res.ok) throw new Error("Failed to send message")

            toast.success("Message sent successfully!")
            setMsgTitle("")
            setMsgBody("")
        } catch (err) {
            console.error(err)
            toast.error("Error sending message")
        } finally {
            setSending(false)
        }
    }

    const handleUpdateCredits = async () => {
        setUpdatingCredits(true)
        try {
            const res = await fetch(`/api/admin/users/${params.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ credits: newCredits })
            })
            if (!res.ok) throw new Error("Failed to update credits")
            toast.success("Credits updated successfully")
            fetchUserActivity()
        } catch (err) {
            console.error(err)
            toast.error("Error updating credits")
        } finally {
            setUpdatingCredits(false)
        }
    }

    const handleToggleUnlimited = async () => {
        setUpdatingCredits(true)
        try {
            const res = await fetch(`/api/admin/users/${params.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isUnlimited: !user.isUnlimited })
            })
            if (!res.ok) throw new Error("Failed to toggle access")
            toast.success(`Unlimited access ${!user.isUnlimited ? 'enabled' : 'disabled'}`)
            fetchUserActivity()
        } catch (err) {
            console.error(err)
            toast.error("Error toggling access")
        } finally {
            setUpdatingCredits(false)
        }
    }

    const handleUpdateRole = async () => {
        setUpdatingCredits(true)
        try {
            const res = await fetch(`/api/admin/users/${params.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role: newRole })
            })
            if (!res.ok) throw new Error("Failed to update role")
            toast.success("User role updated successfully")
            fetchUserActivity()
        } catch (err) {
            console.error(err)
            toast.error("Error updating user role")
        } finally {
            setUpdatingCredits(false)
        }
    }

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

            {/* Communication Center */}
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Send size={20} className="text-primary" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">Communication Center</h2>
                        <p className="text-xs text-muted-foreground">Send direct alerts or emails to this user</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Message Title</label>
                            <Input
                                placeholder="e.g., Credits Refilled! or System Maintenance"
                                value={msgTitle}
                                onChange={(e) => setMsgTitle(e.target.value)}
                                className="bg-background"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Content</label>
                            <textarea
                                className="w-full min-h-[120px] rounded-lg border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                placeholder="Type your message here..."
                                value={msgBody}
                                onChange={(e) => setMsgBody(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Alert Type</label>
                                <select
                                    className="w-full h-10 rounded-lg border bg-background px-3 text-sm"
                                    value={msgType}
                                    onChange={(e) => setMsgType(e.target.value)}
                                >
                                    <option value="INFO">Information (Blue)</option>
                                    <option value="SUCCESS">Success (Green)</option>
                                    <option value="WARNING">Warning (Yellow)</option>
                                    <option value="ALERT">Critical (Red)</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Channels</label>
                                <div className="flex items-center gap-4 h-10">
                                    <button
                                        onClick={() => setChannels(c => ({ ...c, notification: !c.notification }))}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${channels.notification ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}
                                    >
                                        <Bell size={14} /> In-App
                                    </button>
                                    <button
                                        onClick={() => setChannels(c => ({ ...c, email: !c.email }))}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${channels.email ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}
                                    >
                                        <Mail size={14} /> Email
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-background/50 rounded-xl border border-dashed text-xs text-muted-foreground flex gap-3">
                            <AlertTriangle size={16} className="shrink-0 text-amber-500" />
                            <p>Sending an email will use the system's default sender. In-app notifications will appear in the user's notification bell immediately.</p>
                        </div>

                        <Button
                            className="w-full h-12 font-bold shadow-lg shadow-primary/20 gap-2"
                            disabled={sending}
                            onClick={handleSendMessage}
                        >
                            {sending ? "Sending..." : <><Send size={18} /> Send Message Now</>}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Management & Access Control */}
            <div className="bg-white border-2 border-primary/10 rounded-2xl p-6 shadow-sm overflow-hidden relative">
                <div className="flex items-center gap-2 mb-6">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <ShieldCheck size={20} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">Account Management</h2>
                        <p className="text-xs text-muted-foreground">Modify sensitive user account parameters</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Credits Adjuster */}
                    <div className="bg-muted/30 p-5 rounded-xl border flex flex-col justify-between space-y-4">
                        <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                            <Coins size={16} className="text-amber-500" />
                            Credit Balance
                        </div>
                        <div className="flex gap-2">
                            <Input
                                type="number"
                                value={newCredits}
                                onChange={(e) => setNewCredits(parseInt(e.target.value) || 0)}
                                className="font-bold text-lg h-12"
                            />
                            <Button
                                className="h-12 px-4 font-bold"
                                onClick={handleUpdateCredits}
                                disabled={updatingCredits}
                            >
                                {updatingCredits ? "..." : <Save size={18} />}
                            </Button>
                        </div>
                        <p className="text-[10px] text-muted-foreground">Overwrite user coin balance.</p>
                    </div>

                    {/* Access Toggle */}
                    <div className="bg-muted/30 p-5 rounded-xl border flex flex-col justify-between space-y-4">
                        <div className="flex justify-between items-start">
                            <div className="text-sm font-bold text-foreground">Unlimited Access</div>
                            <div className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${user.isUnlimited ? 'bg-primary text-white' : 'bg-muted-foreground/20 text-muted-foreground'}`}>
                                {user.isUnlimited ? "ON" : "OFF"}
                            </div>
                        </div>
                        <Button
                            variant={user.isUnlimited ? "outline" : "default"}
                            className="w-full font-bold h-12"
                            onClick={handleToggleUnlimited}
                            disabled={updatingCredits}
                        >
                            {user.isUnlimited ? "Revoke" : "Grant"} Unlimited
                        </Button>
                        <p className="text-[10px] text-muted-foreground">Bypass all credit checks.</p>
                    </div>

                    {/* Role Management */}
                    <div className="bg-muted/30 p-5 rounded-xl border flex flex-col justify-between space-y-4">
                        <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                            <ShieldCheck size={16} className="text-blue-500" />
                            System Role
                        </div>
                        <div className="flex gap-2">
                            <select
                                className="flex-1 h-12 rounded-lg border bg-background px-2 text-xs font-bold"
                                value={newRole}
                                onChange={(e) => setNewRole(e.target.value)}
                            >
                                <option value="USER">USER</option>
                                <option value="ADMIN">ADMIN</option>
                            </select>
                            <Button
                                className="h-12 px-4 font-bold"
                                onClick={handleUpdateRole}
                                disabled={updatingCredits}
                            >
                                {updatingCredits ? "..." : <Save size={18} />}
                            </Button>
                        </div>
                        <p className="text-[10px] text-muted-foreground">Set level (USER/ADMIN).</p>
                    </div>
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
