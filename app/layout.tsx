import type { Metadata } from "next";
import { Jost } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/context/query-provider";
import { Analytics } from "@vercel/analytics/next";


const jostSans = Jost({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-jost",
});

import { Cairo } from "next/font/google";
import { CSPostHogProvider } from "@/app/providers/posthog-provider";

const cairoSans = Cairo({
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["arabic"],
  variable: "--font-cairo",
});

export const metadata: Metadata = {
  title: {
    default: "Osera Design AI - AI Powered Mobile & Web Design Agent",
    template: "%s | Osera Design AI",
  },
  description:
    "Turn text into editable mobile app and web designs in seconds with Osera Design AI. The professional AI UI Generator for developers and startups serving the world.",
  keywords: [
    "AI Design",
    "Mobile App Design",
    "Web Design Generator",
    "UI Generator",
    "Text to Design",
    "Osara AI",
    "Osera Design",
    "Tailwind CSS",
    "React Code Generator",
    "Cairo",
    "Egypt",
    "RTL UI Design",
    "Arabic App Design",
  ],
  authors: [{ name: "Osera Design", url: "https://www.osara-ai.com" }],
  creator: "Osera Design",
  publisher: "Osera Design",
  metadataBase: new URL("https://www.osara-ai.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Osera Design AI - Generate Professional Mobile & Web Apps with AI",
    description: "Describe your app or website idea, get a fully editable UI in seconds. The fastest way to prototype professionally.",
    url: "https://www.osara-ai.com",
    siteName: "Osera Design AI",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Osera Design AI - AI Mobile & Web Design Agent",
    description: "Generate editable mobile app and web UI designs in seconds.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Osera Design AI",
    "applicationCategory": "DesignApplication",
    "operatingSystem": "Web",
    "description": "AI-powered mobile and web app design generator. Turn prompts into code in seconds.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
    },
    "author": {
      "@type": "Organization",
      "name": "Osera Design",
      "url": "https://www.osara-ai.com",
      "logo": "https://www.osara-ai.com/logo.png",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+201066906132",
        "contactType": "customer service",
        "email": "oserasoft@gmail.com",
        "areaServed": "Global",
        "availableLanguage": ["English", "Arabic"],
      },
      "sameAs": [
        "https://www.linkedin.com/company/osera-design", // Hypothetical
      ],
    },
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${jostSans.className} ${cairoSans.variable} antialiased`}>
        <CSPostHogProvider>
          <QueryProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
              <Analytics />
              <Toaster richColors position="bottom-center" />
            </ThemeProvider>
          </QueryProvider>
        </CSPostHogProvider>
        {/* JSON-LD for SEO, injected safely */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html >
  );
}
