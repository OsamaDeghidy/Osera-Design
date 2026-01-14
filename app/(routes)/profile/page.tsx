import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { prismadb } from "@/lib/prismadb";
import { redirect } from "next/navigation";
import { PaymentOrder } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user || !user.id) {
        redirect("/");
    }

    const dbUser = await prismadb.user.findUnique({
        where: { id: user.id }
    });

    if (!dbUser) {
        redirect("/");
    }

    // Fetch Transactions (PaymentOrder)
    const transactions = await prismadb.paymentOrder.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" }
    });

    return (
        <div className="container max-w-5xl mx-auto py-10 px-4">
            <h1 className="text-3xl font-bold tracking-tight mb-8">My Account</h1>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-10">
                {/* User Info Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Personal Info</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={user.picture || ""}
                                alt="User"
                                className="w-16 h-16 rounded-full border"
                            />
                            <div>
                                <p className="font-semibold text-lg">{user.given_name} {user.family_name}</p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                        </div>
                        <Separator />
                        <div className="text-sm text-muted-foreground">
                            Account ID: <span className="font-mono text-xs text-foreground bg-muted px-1 py-0.5 rounded">{dbUser.id}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Credit Balance Card */}
                <Card className="col-span-1 lg:col-span-2 border-primary/20 bg-primary/5">
                    <CardHeader>
                        <CardTitle className="flex justify-between items-center">
                            <span>Available Balance</span>
                            <span className="text-sm font-normal text-muted-foreground">Osera Credits</span>
                        </CardTitle>
                        <CardDescription>Use credits to generate new AI designs.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row items-baseline justify-between gap-4">
                            <div className="text-5xl font-extrabold text-primary">
                                {dbUser.credits} <span className="text-lg font-medium text-muted-foreground">Credits</span>
                            </div>
                            <Link href="/pricing">
                                <Button size="lg" className="px-8 font-semibold shadow-md">
                                    Top Up Credits ⚡
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Transaction History */}
            <h2 className="text-xl font-semibold mb-4">Transaction History</h2>
            <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground font-medium border-b">
                        <tr>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3">Provider</th>
                            <th className="px-4 py-3">Amount</th>
                            <th className="px-4 py-3">Credits Added</th>
                            <th className="px-4 py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {transactions.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                                    No transactions found.
                                </td>
                            </tr>
                        ) : (
                            transactions.map((tx: PaymentOrder) => (
                                <tr key={tx.id} className="hover:bg-muted/10 transition-colors">
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        {format(new Date(tx.createdAt), "dd MMM yyyy, HH:mm")}
                                    </td>
                                    <td className="px-4 py-3 uppercase text-xs font-semibold text-muted-foreground">
                                        {tx.provider || "PAYMOB"}
                                    </td>
                                    <td className="px-4 py-3 font-medium">
                                        {tx.amount} <span className="text-xs text-muted-foreground">{tx.currency || "EGP"}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        {tx.creditsAmount > 0 ? (
                                            <span className="text-green-600 font-bold">+{tx.creditsAmount}</span>
                                        ) : (
                                            <span className="text-muted-foreground">-</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className={`
                                            inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border
                                            ${tx.status === 'SUCCESS' ? 'bg-green-500/10 text-green-600 border-green-500/20' :
                                                tx.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' :
                                                    'bg-red-500/10 text-red-600 border-red-500/20'}
                                        `}>
                                            {tx.status}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
