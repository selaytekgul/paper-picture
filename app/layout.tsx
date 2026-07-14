import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://paperpicture.net"),
  applicationName: "Paper Picture",
  title: "Paper Picture — Computer Graphics Research Paper Guessing Game",
  description: "Guess real computer graphics and digital geometry research papers from their figures, then discover the authors, institutions, venues, and sources.",
  keywords: ["computer graphics", "digital geometry", "research papers", "geometry processing", "visual research game"],
  alternates: { canonical: "/" },
  verification: {
    google: "78qGk-ze1JLFwz5RwmTtF18NIdzJspt3G1guOlfjQYg",
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-48.png", type: "image/png", sizes: "48x48" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/apple-touch-icon.png", type: "image/png", sizes: "180x180" }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  openGraph: {
    title: "Paper Picture — Computer Graphics Research Paper Guessing Game",
    description: "Explore real computer-graphics research through its pictures in six quick rounds.",
    url: "/",
    siteName: "Paper Picture",
    type: "website",
    images: [{ url: "/og-simple.png", width: 1733, height: 908, alt: "Paper Picture — Computer Graphics Research Paper Guessing Game" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Paper Picture — Computer Graphics Research Paper Guessing Game",
    description: "Explore real computer-graphics research through its pictures in six quick rounds.",
    images: ["/og-simple.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Paper Picture",
    alternateName: "PaperPicture",
    url: "https://paperpicture.net/",
    description: "A visual game for identifying computer graphics and digital geometry papers from their figures.",
    inLanguage: "en",
    sameAs: ["https://github.com/selaytekgul/paper-picture"],
  };

  return (
    <html lang="en">
      <body>
        {children}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      </body>
    </html>
  );
}
