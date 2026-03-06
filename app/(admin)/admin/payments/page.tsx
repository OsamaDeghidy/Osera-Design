"use client"

import { useEffect, useState } from "react"
import { CreditCard, DollarSign, History, Search, ChevronLeft, ChevronRight, Filter, Clock, CheckCircle2, XCircle, AlertCircle, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

export default function AdminPaymentsPage() {
    const [payments, setPayments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    // Filters
    const [statusFilter, setStatusFilter] = useState("")
    const [providerFilter, setProviderFilter] = useState("")
    const [userIdFilter, setUserIdFilter] = useState("")

    const fetchPayments = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: "20"
            })
            if (statusFilter) params.append("status", statusFilter);
            if (providerFilter) params.append("provider", providerFilter);
            if (userIdFilter) params.append("userId", userIdFilter);

            const res = await fetch(`/api/admin/payments?${params.toString()}`)
            const data = await res.json()
            setPayments(data.data || [])
            setTotalPages(data.totalPages || 1)
        } catch (err) {
            console.error(err)
            toast.error("Failed to load payments")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPayments()
    }, [page, statusFilter, providerFilter, userIdFilter])

    const getStatusBadge = (status: string) => {
        switch (status.toUpperCase()) {
            case "PAID":
            case "SUCCESS":
            case "VERIFIED":
                return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 gap-1.5"><CheckCircle2 size={12} /> Verified</Badge>
            case "PENDING":
                return <Badge variant="outline" className="text-amber-600 bg-amber-50 gap-1.5"><Clock size={12} /> Pending</Badge>
            case "FAILED":
            case "CANCELLED":
                return <Badge variant="destructive" className="gap-1.5"><XCircle size={12} /> Failed</Badge>
            default:
                return <Badge variant="secondary">{status}</Badge>
        }
    }

    const getProviderBadge = (provider: string) => {
        if (provider === "PAYPAL") return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">PayPal</Badge>
        if (provider === "PAYMOB") return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Paymob</Badge>
        return <Badge variant="secondary">{provider}</Badge>
    }

    return (
        <div className="space-y-6 flex flex-col min-h-full">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent flex items-center gap-3">
                        <CreditCard className="text-primary" />
                        Transactions Oversight
                    </h1>
                    <p className="text-muted-foreground mt-2 font-medium">Track all financial inflows and payment order statuses.</p>
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

            {/* Premium Filter Controls */}
            <div className="bg-card border rounded-xl p-4 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground px-1">Search User ID</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                        <Input
                            placeholder="Enter exact ID..."
                            className="bg-muted/30 pl-9 text-sm"
                            value={userIdFilter}
                            onChange={(e) => setUserIdFilter(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground px-1">Payment Status</label>
                    <select
                        className="w-full h-10 rounded-lg border bg-muted/30 px-3 text-sm focus:bg-background transition-all outline-none"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        <option value="PAID">Paid / Success</option>
                        <option value="VERIFIED">Verified</option>
                        <option value="PENDING">Pending</option>
                        <option value="FAILED">Failed</option>
                    </select>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground px-1">Payment Gateway</label>
                    <select
                        className="w-full h-10 rounded-lg border bg-muted/30 px-3 text-sm focus:bg-background transition-all outline-none"
                        value={providerFilter}
                        onChange={(e) => setProviderFilter(e.target.value)}
                    >
                        <option value="">All Gateways</option>
                        <option value="PAYMOB">Paymob (Local)</option>
                        <option value="PAYPAL">PayPal (Global)</option>
                    </select>
                </div>

                <div className="flex items-end pb-0.5">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-xs font-bold gap-2 text-muted-foreground hover:text-foreground"
                        onClick={() => {
                            setUserIdFilter("");
                            setStatusFilter("");
                            setProviderFilter("");
                        }}
                    >
                        <AlertCircle size={14} /> Reset Filters
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="py-24 text-center text-muted-foreground animate-pulse flex flex-col items-center">
                    <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
                    Fetching transactions...
                </div>
            ) : payments.length === 0 ? (
                <div className="py-24 text-center border-2 border-dashed rounded-2xl bg-muted/5 flex flex-col items-center gap-4">
                    <History size={48} className="text-muted-foreground/30" />
                    <div className="space-y-1">
                        <p className="font-bold text-lg">No transactions found</p>
                        <p className="text-sm text-muted-foreground">Try adjusting your filters to broaden your search.</p>
                    </div>
                </div>
            ) : (
                <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground text-[11px] uppercase tracking-widest font-black">
                            <tr>
                                <th className="px-6 py-4">Transaction Details</th>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Gateway</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Credits</th>
                                <th className="px-6 py-4 text-right">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {payments.map((p) => (
                                <tr key={p.id} className="hover:bg-muted/20 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-foreground font-mono text-xs">{p.transactionId || p.paymobOrderId || "Manual/N/A"}</span>
                                            <span className="text-[10px] text-muted-foreground mt-0.5 truncate max-w-[150px]" title={p.id}>Ref: {p.id.slice(-8)}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div
                                            className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors"
                                            onClick={() => window.open(`/admin/users/${p.userId}`, '_blank')}
                                        >
                                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">U</div>
                                            <span className="font-medium">{p.userId.slice(0, 10)}...</span>
                                            <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {getStatusBadge(p.status)}
                                    </td>
                                    <td className="px-6 py-4">
                                        {getProviderBadge(p.provider)}
                                    </td>
                                    <td className="px-6 py-4 font-bold text-foreground">
                                        {p.amount.toLocaleString()} {p.currency}
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant="secondary" className="font-bold">+{p.creditsAmount}</Badge>
                                    </td>
                                    <td className="px-6 py-4 text-right text-muted-foreground font-medium">
                                        <div className="flex flex-col items-end">
                                            <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                                            <span className="text-[10px] opacity-60">{new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
