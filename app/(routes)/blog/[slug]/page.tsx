import { notFound } from "next/navigation";
import { format } from "date-fns";
import Link from "next/link";
import { prismadb } from "@/lib/prismadb";
import { Button } from "@/components/ui/button";
import { ChevronRight, Calendar, Clock, User } from "lucide-react";
import { Metadata } from "next";

interface Props {
    params: Promise<{ slug: string }>;
}

export const revalidate = 0;

export async function generateMetadata(props: Props): Promise<Metadata> {
    const params = await props.params;
    const post = await prismadb.blogPost.findUnique({
        where: { slug: params.slug },
    });
    if (!post) return { title: "Post Not Found" };

    return {
        title: `${post.title} - Osara AI Blog`,
        description: post.excerpt,
    };
}

export default async function BlogPostPage(props: Props) {
    const params = await props.params;
    const post = await prismadb.blogPost.findUnique({
        where: { slug: params.slug },
    });

    if (!post) {
        notFound();
    }

    // Simple readtime calculation
    const words = post.content.split(" ").length;
    const readTime = `${Math.ceil(words / 200)} min read`;

    // Determine direction
    const isAr = post.language === "ar";
    const dir = isAr ? "rtl" : "ltr";
    const align = isAr ? "text-right" : "text-left";

    return (
        <div className="max-w-4xl mx-auto py-16 px-6">
            <div className="mb-12">
                <div className={`flex items-center gap-2 text-sm text-muted-foreground mb-6 ${isAr ? "flex-row-reverse" : ""}`}>
                    <Link href="/blog" className="hover:text-primary transition-colors">
                        Blog
                    </Link>
                    <ChevronRight className={`w-4 h-4 ${isAr ? "rotate-180" : ""}`} />
                    <span className="truncate">{post.title}</span>
                </div>

                <h1 className={`text-3xl md:text-5xl font-bold mb-6 leading-tight ${align}`} dir={dir}>
                    {post.title}
                </h1>

                <div className={`flex flex-wrap items-center gap-6 text-sm text-muted-foreground border-b pb-8 ${isAr ? "flex-row-reverse" : ""}`}>
                    <div className="flex items-center gap-2">
                        <span>{readTime}</span>
                        <Clock className="w-4 h-4" />
                    </div>
                    <div className="flex items-center gap-2">
                        <span>{format(new Date(post.createdAt), "MMMM d, yyyy")}</span>
                        <Calendar className="w-4 h-4" />
                    </div>
                    <div className="flex items-center gap-2">
                        <span>{post.author}</span>
                        <User className="w-4 h-4" />
                    </div>
                </div>
            </div>

            <article
                className={`prose prose-lg dark:prose-invert max-w-none ${isAr ? "text-right" : "text-left"} prose-headings:${isAr ? "text-right" : "text-left"} prose-p:${isAr ? "text-right" : "text-left"} prose-li:${isAr ? "text-right" : "text-left"}`}
                dir={dir}
                dangerouslySetInnerHTML={{ __html: post.content }}
            />

            <div className="mt-16 pt-8 border-t flex justify-center">
                <Link href="/">
                    <Button size="lg" className="rounded-full px-8">
                        Start Designing Now 🚀
                    </Button>
                </Link>
            </div>
        </div>
    );
}
