import type { Metadata } from "next";
import { Jost } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/context/query-provider";

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
    default: "Osara AI - AI Mobile App Design Generator",
    template: "%s | Osara AI",
  },
  description:
    "Turn text into editable mobile app designs in seconds with Osara AI. The #1 AI UI Generator for developers and startups. Based in Cairo, serving the world.",
  keywords: [
    "AI Design",
    "Mobile App Design",
    "UI Generator",
    "Text to Design",
    "Osara AI",
    "Osera Design",
    "Tailwind CSS",
    "React Code Generator",
    "Cairo",
    "Egypt",
  ],
  authors: [{ name: "Osera Design", url: "https://www.osara-ai.com" }],
  creator: "Osera Design",
  publisher: "Osera Design",
  metadataBase: new URL("https://www.osara-ai.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Osara AI - Generate Mobile Apps with AI",
    description: "Describe your app idea, get a fully editable UI in seconds. The fastest way to prototype mobile apps.",
    url: "https://www.osara-ai.com",
    siteName: "Osara AI",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Osara AI - AI Mobile App Design Agent",
    description: "Generate editable mobile app UI designs in seconds.",
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
    "name": "Osara AI",
    "applicationCategory": "DesignApplication",
    "operatingSystem": "Web",
    "description": "AI-powered mobile app design generator. Turn prompts into code.",
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
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Cairo",
        "addressCountry": "EG",
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
              <Toaster richColors position="bottom-center" />
            </ThemeProvider>
          </QueryProvider>
        </CSPostHogProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html >
  );
}
