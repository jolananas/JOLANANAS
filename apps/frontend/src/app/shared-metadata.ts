import { Metadata } from "next";

export const baseUrl = process.env.DOMAIN_URL
  ? process.env.DOMAIN_URL
  : "https://jolananas.com";

export const defaultMetadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    template: "%s | JOLANANAS",
    default: "JOLANANAS — L'Artisanat au Cœur",
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
    title: "JOLANANAS — L'Artisanat au Cœur",
    description: "Des créations artisanales uniques, faites main avec passion.",
    images: [
      {
        url: "/assets/images/preview/Jolananas_preview.png",
        width: 1200,
        height: 630,
        alt: "JOLANANAS — L'Artisanat au Cœur",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JOLANANAS — L'Artisanat au Cœur",
    description: "Des créations artisanales uniques, faites main avec passion.",
    images: ["/assets/images/preview/Jolananas_preview.png"],
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

export const joannaPersonSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": `${baseUrl}/#artisan`,
  name: "Joanna",
  jobTitle: "Artisan Créatrice",
  description: "Créatrice passionnée derrière JOLANANAS, spécialisée dans la création d'accessoires faits main.",
  knowsAbout: ["Couture", "Artisanat", "Accessoires faits main", "Création textile"],
  url: `${baseUrl}/a-propos`,
  worksFor: {
    "@id": `${baseUrl}/#organization`
  }
};

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${baseUrl}/#organization`,
  name: "JOLANANAS",
  url: baseUrl,
  logo: `${baseUrl}/assets/images/logo/logo-square.png`,
  description: "L'Artisanat au Cœur | Faits Main & Pièces Uniques",
  founder: {
    "@id": `${baseUrl}/#artisan`
  },
  address: {
    "@type": "PostalAddress",
    streetAddress: "9 Impasse Puech Bertrand",
    addressLocality: "Cagnac-les-Mines",
    postalCode: "81130",
    addressCountry: "FR",
  },
  sameAs: [
    "https://www.instagram.com/jolananas.officiel",
    "https://www.facebook.com/jolananas.officiel",
    "https://www.snapchat.com/add/jolananas.off",
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
