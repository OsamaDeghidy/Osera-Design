import prisma from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Eye, Sparkles } from "lucide-react";
import Image from "next/image";

// Force dynamic to ensure we get latest public projects
export const dynamic = "force-dynamic";

export default async function GalleryPage() {
    // Fetch PUBLIC projects
    const projects = await prisma.project.findMany({
        where: {
            visibility: "PUBLIC",
        },
        orderBy: {
            createdAt: "desc",
        },
        take: 20, // Limit for V1
        include: {
            _count: {
                select: { frames: true }
            }
        }
    });

    return (
        <div className="min-h-screen bg-background p-8">
            <header className="mb-12 text-center">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent mb-4">
                    Community Showcase 🌍
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    Explore designs created by the Osera community. Click any project to view or remix it.
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {projects.map((project) => (
                    <Card key={project.id} className="group overflow-hidden hover:shadow-xl transition-all border-muted/50">
                        <Link href={`/view/${project.id}`}>
                            <div className="aspect-[9/16] relative bg-muted cursor-pointer overflow-hidden">
                                {project.thumbnail ? (
                                    <Image
                                        src={project.thumbnail}
                                        alt={project.name}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/50">
                                        No Preview
                                    </div>
                                )}

                                {/* Hover Overlay */}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <Button variant="secondary" size="sm" className="gap-2">
                                        <Eye size={16} /> View
                                    </Button>
                                </div>
                            </div>
                        </Link>

                        <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-semibold truncate pr-2" title={project.name}>{project.name}</h3>
                                {/* <Badge variant="secondary" className="text-xs">
                    {project._count.frames} Screens
                </Badge> */}
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                                {/* We don't have description/prompt column yet, maybe show theme or date */}
                                Generated {new Date(project.createdAt).toLocaleDateString()}
                            </p>
                        </CardContent>

                        <CardFooter className="p-4 pt-0 text-xs text-muted-foreground flex justify-between items-center">
                            <span>By User</span>
                            <span className="flex items-center gap-1 text-primary">
                                <Sparkles size={12} /> Remixable
                            </span>
                        </CardFooter>
                    </Card>
                ))}

                {projects.length === 0 && (
                    <div className="col-span-full text-center py-20">
                        <p className="text-muted-foreground">No public projects yet. Be the first to publish! 🚀</p>
                    </div>
                )}
            </div>
        </div>
    );
}
