import { getAllProducts } from "@/lib/shopify";
import { HomePageClient } from "@/components/pages/HomePageClient";

// Force dynamic rendering because we are using 'no-store' fetch in getProducts
export const dynamic = "force-dynamic";

export default async function HomePage() {
  // 1. Récupération réelle des produits
  const products = await getAllProducts();

  // 2. On passe les données au Client Component
  return <HomePageClient products={products} />;
}
