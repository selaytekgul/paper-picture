import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://paperpicture.net"),
  applicationName: "Paper Picture",
  title: "Paper Picture — Guess research papers from their figures",
  description: "A visual game built from real computer graphics and digital geometry papers. Guess the author, institution, country, venue, year, or topic from progressively revealed figures.",
  keywords: ["computer graphics", "digital geometry", "research papers", "geometry processing", "visual research game"],
  alternates: { canonical: "/" },
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
    title: "Paper Picture — Guess research papers from their figures",
    description: "Can you read a computer graphics paper by its pictures? Play with real, rights-reviewed research figures.",
    url: "/",
    siteName: "Paper Picture",
    type: "website",
    images: [{ url: "/og.png", width: 1733, height: 909, alt: "Paper Picture visual research game" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Paper Picture — A visual research game",
    description: "Guess computer graphics papers from real research figures.",
    images: ["/og.png"],
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
      <body>{children}</body>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
    </html>
  );
}
