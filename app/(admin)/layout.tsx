import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Users, Image as ImageIcon, MessageSquare, LogOut, Home } from "lucide-react";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { getRoles, getUser } = getKindeServerSession();
    const [roles, user] = await Promise.all([getRoles(), getUser()]);

    const hasAdminRole = roles?.some(role => role.key === 'admin');
    const isOwnerEmail = user?.email === 'oserasoft@gmail.com';

    const isAdmin = hasAdminRole || isOwnerEmail;

    if (!isAdmin) {
        redirect("/");
    }

    const menuItems = [
        { href: "/admin", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
        { href: "/admin/users", label: "Users", icon: <Users size={20} /> },
        { href: "/admin/projects", label: "Projects", icon: <ImageIcon size={20} /> },
        { href: "/admin/feedback", label: "Feedback", icon: <MessageSquare size={20} /> },
    ];

    return (
        <div className="min-h-screen bg-muted/20 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-background border-r flex flex-col hidden md:flex">
                <div className="h-16 flex items-center px-6 border-b">
                    <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                        OSARA ADMIN
                    </span>
                </div>
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {menuItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                            {item.icon}
                            {item.label}
                        </Link>
                    ))}
                </nav>
                <div className="p-4 border-t space-y-2">
                    <Link
                        href="/"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                        <Home size={20} />
                        Return to App
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0">
                <div className="h-16 flex items-center justify-between px-8 bg-background border-b md:hidden">
                    <span className="text-lg font-bold">OSARA ADMIN</span>
                    <Link href="/" className="text-sm font-medium text-primary">Exit</Link>
                </div>
                <div className="p-8 flex-1 overflow-y-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
