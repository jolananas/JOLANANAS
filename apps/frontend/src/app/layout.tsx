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
  metadataBase: new URL(process.env.DOMAIN_URL || "https://jolananas.com"),
  title: {
    default: "JOLANANAS - L'Artisanat au cœur | Bijoux Fantaisie & Pièces Uniques",
    template: "%s | JOLANANAS"
  },
  description: "Des créations artisanales uniques, faites main avec passion, pour apporter une touche personnelle et originale à votre style.",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "JOLANANAS",
    images: [
      {
        url: "/images/og-default.jpg", // Assurez-vous d'avoir cette image ou une similaire
        width: 1200,
        height: 630,
        alt: "JOLANANAS - Bijoux et Accessoires Artisanaux",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@jolananas", // Ajuster si le compte existe
    creator: "@jolananas",
  },
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
