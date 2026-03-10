
"use client";

import { Sparkles, MousePointer2, Download, ArrowRight } from "lucide-react";

const steps = [
    {
        title: "Prompt",
        description: "Describe your app, website, or brand asset in simple natural language. Our AI understands context and UI patterns.",
        icon: Sparkles,
        color: "bg-blue-500/10 text-blue-500",
    },
    {
        title: "Refine",
        description: "Use our surgical AI editing tools to modify specific components, change themes, or regenerate sections instantly.",
        icon: MousePointer2,
        color: "bg-purple-500/10 text-purple-500",
    },
    {
        title: "Export",
        description: "Once satisfied, export your high-fidelity designs as clean React/Tailwind code or high-quality brand assets.",
        icon: Download,
        color: "bg-orange-500/10 text-orange-500",
    },
];

export default function HowItWorks() {
    return (
        <section className="py-24 bg-background relative overflow-hidden">
            <div className="container px-4 md:px-6 mx-auto relative z-10">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-3xl font-bold tracking-tighter md:text-5xl">
                        How it works
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Go from concept to production-ready design in three simple steps.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto relative">
                    {/* Connection Line (Desktop) */}
                    <div className="hidden md:block absolute top-1/4 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-border to-transparent -z-10" />

                    {steps.map((step, i) => (
                        <div key={i} className="flex flex-col items-center text-center group">
                            <div className={`size-16 rounded-2xl ${step.color} flex items-center justify-center mb-6 shadow-sm border border-current/10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                                <step.icon size={32} />
                            </div>
                            <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                            <p className="text-muted-foreground leading-relaxed text-sm">
                                {step.description}
                            </p>
                            {i < steps.length - 1 && (
                                <ArrowRight className="md:hidden mt-8 text-muted-foreground/30 animate-pulse" />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Background Decoration */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-radial-primary opacity-[0.03] -z-0 pointer-events-none" />
        </section>
    );
}
