
export default function AboutPage() {
    return (
        <div className="max-w-4xl mx-auto py-16 px-6">
            <h1 className="text-4xl font-bold mb-8 text-primary">About Osera Design</h1>
            <div className="prose dark:prose-invert max-w-none text-muted-foreground">
                <p className="text-lg leading-relaxed mb-6">
                    Osera Design is an AI-powered design assistant dedicated to simplifying the mobile app design process.
                    Our mission is to empower developers, entrepreneurs, and dreamers to visualize their ideas instantly,
                    bridging the gap between concept and code.
                </p>
                <p className="mb-6">
                    Founded in Cairo, Egypt, Osera Design leverages cutting-edge Generative AI to create beautiful,
                    editable user interfaces. Whether you're building a startup MVP or exploring new design directions,
                    our tool is built to save you time and inspire creativity.
                </p>
                <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Our Vision</h2>
                <p>
                    We believe that design should not be a barrier to innovation. By automating the visual layout process,
                    we allow you to focus on logic, functionality, and user experience.
                </p>
            </div>
        </div>
    );
}
