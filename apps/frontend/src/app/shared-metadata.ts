import { Metadata } from "next";

export const baseUrl = process.env.DOMAIN_URL
  ? process.env.DOMAIN_URL
  : "https://jolananas.com";

export const defaultMetadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "JOLANANAS - L'Artisanat au Cœur | Faits Main & Pièces Uniques",
    template: "%s | JOLANANAS",
  },
  description:
    "Des créations artisanales uniques, faites main avec passion, pour apporter une touche personnelle et originale à votre style.",
  keywords: [
    "artisanat",
    "fait main",
    "cadeau unique",
    "créations originales",
    "JOLANANAS",
    "artisanat français",
    "pièces uniques",
    "accessoires faits main",
  ],
  robots: {
    follow: true,
    index: true,
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "JOLANANAS",
    url: baseUrl,
    images: [
      {
        url: "/assets/images/preview/Jolananas_preview.png",
        width: 1200,
        height: 630,
        alt: "JOLANANAS - L'Artisanat au Cœur | Faits Main & Pièces Uniques",
      },
    ],
  },
  alternates: {
    canonical: baseUrl,
    languages: {
      "fr-FR": "/fr",
    },
  },
  icons: {
    icon: [
      { url: "/assets/images/favicon/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/assets/images/favicon/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/assets/images/favicon/favicon-96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: [
      { url: "/assets/images/favicon/favicon-180.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: ["/assets/images/favicon/favicon.png"],
  },
  verification: {
    google: "votre-code-de-verification-google", // À remplacer par le vrai code si disponible
  },
  category: "Artisanat",
};

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "JOLANANAS",
  url: baseUrl,
  logo: `${baseUrl}/assets/images/logo/logo-square.png`,
  description: "L'Artisanat au Cœur | Faits Main & Pièces Uniques",
  address: {
    "@type": "PostalAddress",
    addressCountry: "FR",
  },
  sameAs: [
    "https://www.instagram.com/jolananas",
    "https://www.facebook.com/jolananas",
  ],
};

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "JOLANANAS",
  url: baseUrl,
  potentialAction: {
    "@type": "SearchAction",
    target: `${baseUrl}/search?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};
