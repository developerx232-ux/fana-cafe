/**
 * Fana Cafe — Root Layout
 * Sets up Lenis smooth scroll, font variables, and global metadata.
 */
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import LenisProvider from "@/components/layout/LenisProvider";

const geistSans = Geist({
  variable: "--font-body",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fana Cafe — 22 Mazoria, Addis Ababa",
  description:
    "Experience coffee, community, and culture at Fana Cafe. Order from your table instantly.",
  keywords: ["Fana Cafe", "Addis Ababa", "Ethiopian Coffee", "Macchiato", "Mazoria"],
  openGraph: {
    title: "Fana Cafe",
    description: "Coffee, community & culture in the heart of Addis Ababa.",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-fana-dark text-fana-cream antialiased`}
      >
        <LenisProvider>{children}</LenisProvider>
      </body>
    </html>
  );
}
