import { getAllProducts } from "@/lib/shopify";
import { HomePageClient } from "@/components/pages/HomePageClient";
import dynamic from "next/dynamic";

// Enable ISR (Incremental Static Regeneration)
export const revalidate = 3600;

export default async function HomePage() {
  // 1. Récupération réelle des produits
  const products = await getAllProducts();

  // 2. On passe les données au Client Component
  return <HomePageClient products={products} />;
}
