import Link from "next/link";
import { format } from "date-fns";
import { prismadb } from "@/lib/prismadb";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, ArrowRight } from "lucide-react";
import { BlogPost } from "@prisma/client";

export const metadata = {
    title: "Blog - Osara AI",
    description: "Learn how to design mobile apps with AI. Tips, tutorials, and insights for developers.",
};

export const revalidate = 0;

interface BlogPageProps {
    searchParams: Promise<{
        category?: string;
    }>;
}

export default async function BlogPage(props: BlogPageProps) {
    const searchParams = await props.searchParams;
    const selectedCategory = searchParams.category;

    const whereClause: any = { published: true };
    if (selectedCategory && selectedCategory !== "All") {
        whereClause.category = selectedCategory;
    }

    const posts = await prismadb.blogPost.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
    });

    const categories = ["All", "Engineering", "Design", "Business", "Updates"];
    // Arabic Mapping
    const categoryLabels: Record<string, string> = {
        "All": "الكل / All",
        "Engineering": "هندسة / Engineering",
        "Design": "تصميم / Design",
        "Business": "أعمال / Business",
        "Updates": "أخبار / Updates"
    };

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Hero Section */}
            <div className="relative isolate pt-14 dark:bg-zinc-900/20">
                <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
                    <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style={{ clipPath: "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)" }}></div>
                </div>
                <div className="py-24 sm:py-32">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="mx-auto max-w-2xl text-center">
                            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-orange-500 pb-2">
                                Osara Blog
                            </h1>
                            <p className="mt-6 text-lg leading-8 text-muted-foreground">
                                Master the art of AI mobile design. Tutorials, news, and strategies for modern developers.
                                <br />
                                <span className="opacity-70 text-sm mt-2 block ">تعلم فن تصميم التطبيقات بالذكاء الاصطناعي. شروحات وأخبار واستراتيجيات للمطورين.</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="sticky top-0 z-30 bg-background/80 backdrop-blur border-b mb-12">
                <div className="max-w-7xl mx-auto px-6 overflow-x-auto no-scrollbar">
                    <div className="flex items-center gap-2 py-4 whitespace-nowrap md:justify-center">
                        {categories.map((cat) => (
                            <Link
                                key={cat}
                                href={cat === "All" ? "/blog" : `/blog?category=${cat}`}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${(selectedCategory === cat || (!selectedCategory && cat === "All"))
                                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25"
                                    : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted hover:text-foreground"
                                    }`}
                            >
                                {categoryLabels[cat] || cat}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="max-w-7xl mx-auto px-6">
                {posts.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-xl font-medium">No articles found in this category.</h3>
                        <Link href="/blog" className="text-primary hover:underline mt-2 inline-block">View all posts</Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {posts.map((post: BlogPost) => (
                            <Link
                                href={`/blog/${post.slug}`}
                                key={post.id}
                                className="group flex flex-col bg-card border rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-2 h-full"
                            >
                                <div className="relative w-full h-56 overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 opacity-60 group-hover:opacity-40 transition-opacity" />
                                    {post.image ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={post.image}
                                            alt={post.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-muted flex items-center justify-center">
                                            <span className="text-4xl text-muted-foreground">📰</span>
                                        </div>
                                    )}
                                    <Badge className="absolute top-4 left-4 z-20 bg-background/90 text-foreground backdrop-blur hover:bg-background border-none shadow-sm">
                                        {post.category}
                                    </Badge>
                                </div>

                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                                        <span className="uppercase tracking-wider font-semibold text-primary/80">
                                            {post.language === 'ar' ? 'العربية' : 'English'}
                                        </span>
                                        <div className="flex items-center gap-1">
                                            <CalendarIcon className="w-3 h-3" />
                                            {format(new Date(post.createdAt), "MMM d, yyyy")}
                                        </div>
                                    </div>

                                    <h3 className={`text-xl font-bold mb-3 group-hover:text-primary transition-colors leading-snug ${post.language === 'ar' ? 'text-right font-cairo' : ''}`} dir={post.language === 'ar' ? 'rtl' : 'ltr'}>
                                        {post.title}
                                    </h3>

                                    <p className={`text-muted-foreground text-sm line-clamp-3 mb-6 flex-1 ${post.language === 'ar' ? 'text-right' : ''}`} dir={post.language === 'ar' ? 'rtl' : 'ltr'}>
                                        {post.excerpt}
                                    </p>

                                    <div className={`flex items-center text-sm font-medium text-primary mt-auto group/btn ${post.language === 'ar' ? 'flex-row-reverse' : ''}`}>
                                        {post.language === 'ar' ? 'اقرأ المقال' : 'Read Article'}
                                        <ArrowRight className={`ml-2 w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1 ${post.language === 'ar' ? 'rotate-180 mr-2 ml-0 group-hover/btn:-translate-x-1' : ''}`} />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
