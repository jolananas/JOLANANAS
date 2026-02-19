
import { getAllProducts } from "@/lib/shopify";
import { getArticles } from "@/lib/shopify/blog";
import { HomePageClient } from "@/components/pages/HomePageClient";
import { JsonLd } from "@/components/SEO/JsonLd";

// Force dynamic to avoid calling Shopify at build time (prevents 401 on Vercel)
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // 1. Récupération réelle des produits et articles
  let products: any[] = [];
  let articles: any[] = [];
  
  try {
    [products, articles] = await Promise.all([
      getAllProducts(),
      getArticles(3)
    ]);
  } catch (error) {
    console.error("HomePage: Failed to fetch data from Shopify:", error);
  }


  // --- JSON-LD STRUCTURED DATA (Organization & WebSite) ---
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${process.env.DOMAIN_URL}/#organization`,
        "name": "JOLANANAS",
        "url": process.env.DOMAIN_URL,
        "logo": {
          "@type": "ImageObject",
          "url": `${process.env.DOMAIN_URL}/images/logo.png`, // Assurez-vous que le logo existe
        },
        "sameAs": [
          "https://www.instagram.com/jolananas",
          "https://www.facebook.com/jolananas"
        ]
      },
      {
        "@type": "WebSite",
        "@id": `${process.env.DOMAIN_URL}/#website`,
        "url": process.env.DOMAIN_URL,
        "name": "JOLANANAS",
        "publisher": {
          "@id": `${process.env.DOMAIN_URL}/#organization`
        }
      }
    ]
  };

  // 2. On passe les données au Client Component avec le JSON-LD
  return (
    <>
      <JsonLd data={jsonLd} />
      <HomePageClient products={products} articles={articles} />
    </>
  );
}
