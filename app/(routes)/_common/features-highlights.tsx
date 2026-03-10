
"use client";

import { Smartphone, Globe, Palette, Edit3, Image as ImageIcon, Layout } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
    {
        title: "Mobile App Design",
        description: "Generate high-fidelity, interactive mobile UI screens for iOS and Android in seconds.",
        icon: Smartphone,
        color: "text-blue-500",
        bgColor: "bg-blue-500/10",
    },
    {
        title: "Web Platforms",
        description: "Desktop-first responsive designs for SaaS, E-commerce, and Professional Portfolios.",
        icon: Globe,
        color: "text-purple-500",
        bgColor: "bg-purple-500/10",
    },
    {
        title: "AI Studio & Posters",
        description: "Create stunning marketing posters, social media assets, and brand elements instantly.",
        icon: Palette,
        color: "text-orange-500",
        bgColor: "bg-orange-500/10",
    },
    {
        title: "Surgical AI Editing",
        description: "Don't just generate—refine. Use our precise tools to modify specific UI components with AI.",
        icon: Edit3,
        color: "text-green-500",
        bgColor: "bg-green-500/10",
    },
    {
        title: "Context-Aware Assets",
        description: "Our AI understands your brand and generates images and icons that fit your design language.",
        icon: ImageIcon,
        color: "text-pink-500",
        bgColor: "bg-pink-500/10",
    },
    {
        title: "Ready-to-Code",
        description: "Export clean, production-ready React and Tailwind CSS code for your developers.",
        icon: Layout,
        color: "text-cyan-500",
        bgColor: "bg-cyan-500/10",
    },
];

export default function FeaturesHighlights() {
    return (
        <section className="py-24 bg-muted/20">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-3xl font-bold tracking-tighter md:text-5xl">
                        Design Everything with AI
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        From mobile apps to professional marketing assets, Osera is your complete design partner.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {features.map((feature, i) => (
                        <Card key={i} className="border-none bg-background/50 backdrop-blur-sm hover:bg-background hover:shadow-xl transition-all duration-300 group overflow-hidden">
                            <CardContent className="p-8">
                                <div className={`size-12 rounded-xl ${feature.bgColor} ${feature.color} flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                                    <feature.icon size={24} />
                                </div>
                                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                                <p className="text-muted-foreground leading-relaxed text-sm">
                                    {feature.description}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
