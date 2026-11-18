import type { Metadata } from "next";
import "./globals.css";
import LenisProvider from "@/components/layout/LenisProvider";
import { OrderDrawerProvider } from "@/components/order-drawer/OrderDrawerProvider";
import OrderDrawer from "@/components/order-drawer/OrderDrawer";

export const metadata: Metadata = {
  title: "Fana Cafe — 22 Mazoria, Addis Ababa",
  description:
    "Scroll-driven 3D coffee storytelling, real cafe spaces, visual menu, and QR table ordering experience for Fana Cafe in 22 Mazoria, Addis Ababa.",
  keywords: [
    "Fana Cafe",
    "22 Mazoria",
    "Addis Ababa",
    "Ethiopian Coffee",
    "Macchiato",
    "QR Table Ordering",
  ],
  openGraph: {
    title: "Fana Cafe — 22 Mazoria, Addis Ababa",
    description:
      "Ethiopian coffee ritual, communal oak workspace, fresh juice bar, and QR table ordering.",
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
      <body className="bg-fana-dark text-fana-cream antialiased selection:bg-fana-gold selection:text-fana-dark">
        <LenisProvider>
          <OrderDrawerProvider>
            {children}
            <OrderDrawer />
          </OrderDrawerProvider>
        </LenisProvider>
      </body>
    </html>
  );
}
