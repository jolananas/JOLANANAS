
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


  // 2. On passe les données au Client Component avec le JSON-LD
  // Note: JSON-LD (Organization, Person, WebSite) est déjà géré de façon globale via app/layout.tsx
  return (
    <>
      <HomePageClient products={products} articles={articles} />
    </>
  );
}
