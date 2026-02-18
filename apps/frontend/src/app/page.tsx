import { getAllProducts } from "@/lib/shopify";
import { HomePageClient } from "@/components/pages/HomePageClient";
import dynamic from "next/dynamic";

// Enable ISR (Incremental Static Regeneration)
export const revalidate = 3600;

export default async function HomePage() {
  // 1. Récupération réelle des produits
  const products = await getAllProducts();

  // --- JSON-LD STRUCTURED DATA (Organization & WebSite) ---
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${process.env.DOMAIN_URL || "https://jolananas.com"}/#organization`,
        "name": "JOLANANAS",
        "url": process.env.DOMAIN_URL || "https://jolananas.com",
        "logo": {
          "@type": "ImageObject",
          "url": `${process.env.DOMAIN_URL || "https://jolananas.com"}/images/logo.png`, // Assurez-vous que le logo existe
        },
        "sameAs": [
          "https://www.instagram.com/jolananas",
          "https://www.facebook.com/jolananas"
        ]
      },
      {
        "@type": "WebSite",
        "@id": `${process.env.DOMAIN_URL || "https://jolananas.com"}/#website`,
        "url": process.env.DOMAIN_URL || "https://jolananas.com",
        "name": "JOLANANAS",
        "publisher": {
          "@id": `${process.env.DOMAIN_URL || "https://jolananas.com"}/#organization`
        }
      }
    ]
  };

  // 2. On passe les données au Client Component avec le JSON-LD
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomePageClient products={products} />
    </>
  );
}
