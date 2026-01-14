"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export const Footer = () => {
    const pathname = usePathname();
    const isAr = false; // We can add language context later if needed, defaulting to English/Global for now.

    if (pathname.includes("/view/")) return null; // Don't show footer on full-screen view

    const links = [
        { label: "Pricing", href: "/pricing" },
        { label: "Blog", href: "/blog" },
        { label: "About Us", href: "/about" },
        { label: "Contact", href: "/contact" },
    ];

    const legal = [
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
        { label: "Refund Policy", href: "/refund-policy" },
        { label: "Shipping Policy", href: "/shipping-policy" },
    ];

    return (
        <footer className="w-full bg-muted/30 border-t mt-20">
            <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-1">
                        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                            <span className="text-primary">Osera</span> Design
                        </Link>
                        <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
                            AI-Powered Mobile App Design Agent. Generate editable UI designs in seconds.
                        </p>
                        <div className="mt-6 text-sm text-muted-foreground">
                            <p>Cairo, Egypt</p>
                            <p className="mt-1">oserasoft@gmail.com</p>
                        </div>
                    </div>

                    {/* Links */}
                    <div>
                        <h3 className="font-semibold mb-4">Company</h3>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            {links.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="hover:text-primary transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="font-semibold mb-4">Legal</h3>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            {legal.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="hover:text-primary transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Newsletter / CTA */}
                    <div>
                        <h3 className="font-semibold mb-4">Get Started</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Start designing your dream app today.
                        </p>
                        <Link href="/" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full">
                            Generate Free
                        </Link>
                    </div>
                </div>

                <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
                    <p>© {new Date().getFullYear()} Osera Design. All rights reserved.</p>
                    <div className="flex gap-4">
                        {/* Social Icons Placeholder */}
                    </div>
                </div>
            </div>
        </footer>
    );
};
