import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { LayoutWrapper } from "@/components/layout/LayoutWrapper";
import { SiteGatekeeper } from "@/components/layout/SiteGatekeeper";
import { SessionProviderWrapper } from "@/components/providers/SessionProviderWrapper";
import { CartProvider } from "@/components/providers/CartProvider";

// Configuration des polices
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "JOLANANAS - L'Artisanat au cœur | Bijoux Fantaisie & Pièces Uniques",
    template: "%s | JOLANANAS"
  },
  description: "Des créations artisanales uniques, faites main avec passion, pour apporter une touche personnelle et originale à votre style.",
  alternates: {
    languages: {
      "fr-FR": "/fr",
      "en-US": "/en",
    },
  },
};

import { Suspense } from "react";

// ... imports

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${poppins.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased min-h-screen flex flex-col bg-background text-primary selection:bg-primary/20">
        <Suspense fallback={null}>
          <SiteGatekeeper />
        </Suspense>
        <SessionProviderWrapper>
          <CartProvider>
            <LayoutWrapper>{children}</LayoutWrapper>
          </CartProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
