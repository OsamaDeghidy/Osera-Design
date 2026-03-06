"use client"

import { useEffect, useState } from "react"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function AdminUsersPage() {
    const [users, setUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    useEffect(() => {
        // Reset page to 1 when search changes
        setPage(1)
    }, [search])

    useEffect(() => {
        const controller = new AbortController()

        const fetchUsers = async () => {
            setLoading(true)
            try {
                const res = await fetch(`/api/admin/users?search=${encodeURIComponent(search)}&limit=20&page=${page}`, {
                    signal: controller.signal
                })
                const data = await res.json()
                if (data.data) {
                    setUsers(data.data)
                    setTotalPages(data.totalPages || 1)
                } else if (Array.isArray(data)) {
                    setUsers(data)
                    setTotalPages(1)
                }
            } catch (err: any) {
                if (err.name === 'AbortError') return;
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        const debounce = setTimeout(fetchUsers, 500)
        return () => {
            clearTimeout(debounce)
            controller.abort()
        }
    }, [search, page])

    return (
        <div className="space-y-6 flex flex-col min-h-full">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Users Management</h1>
                    <p className="text-muted-foreground mt-2">View and manage registered users.</p>
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

            <div className="flex items-center gap-4 max-w-sm">
                <div className="relative w-full">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search users by name or email..."
                        className="pl-8 bg-background"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-card border rounded-xl overflow-hidden shadow-sm flex-1">
                <div className="overflow-x-auto min-h-[300px]">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                            <tr>
                                <th className="px-6 py-4 font-medium">Email</th>
                                <th className="px-6 py-4 font-medium">Name</th>
                                <th className="px-6 py-4 font-medium text-center">Credits</th>
                                <th className="px-6 py-4 font-medium">Joined</th>
                                <th className="px-6 py-4 font-medium text-center">Status</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && users.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">Loading users...</td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">No users found.</td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-foreground">{user.email}</td>
                                        <td className="px-6 py-4">{user.firstName} {user.lastName}</td>
                                        <td className="px-6 py-4 text-center font-bold text-primary">{user.credits}</td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {user.isUnlimited ? (
                                                <span className="bg-purple-500/10 text-purple-500 px-2 py-1 rounded text-xs font-semibold">Unlimited</span>
                                            ) : (
                                                <span className="bg-green-500/10 text-green-500 px-2 py-1 rounded text-xs font-semibold">Active</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <a href={`/admin/users/${user.id}`} className="text-xs font-medium text-primary hover:underline bg-primary/10 px-3 py-1.5 rounded-md">
                                                View Activity
                                            </a>
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
