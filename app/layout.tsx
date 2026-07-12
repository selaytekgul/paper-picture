import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Paper Picture — A visual research game",
  description: "Guess the institution behind a computer graphics paper from its figures.",
  openGraph: {
    title: "Paper Picture",
    description: "Can you read a paper by its pictures?",
    images: [{ url: "/og.png", width: 1733, height: 909, alt: "Paper Picture visual research game" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Paper Picture",
    description: "Can you read a paper by its pictures?",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
