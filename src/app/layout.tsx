import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Unbiased Hindustani - Your Source for Balanced Political News",
  description: "Get balanced and unbiased coverage of Indian politics and current affairs. AI-powered news analysis across politics, technology, sports, entertainment, and more.",
  keywords: ["Indian news", "unbiased news", "political news India", "AI news", "trending topics India"],
  openGraph: {
    title: "Unbiased Hindustani.ai",
    description: "Know what India knows — instantly. AI-powered balanced political coverage.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
