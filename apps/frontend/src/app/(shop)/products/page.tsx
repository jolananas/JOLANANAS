import { ProductsPageClient } from "@/components/ecommerce/products/ProductsPageClient";

// Generate metadata for SEO
export async function generateMetadata() {
  return {
    title: "Toutes nos créations - JOLANANAS",
    description:
      "Découvrez notre collection complète de créations artisanales girly et utiles. Bijoux, accessoires, porte-clés et bien plus encore.",
    openGraph: {
      title: "Toutes nos créations - JOLANANAS",
      description:
        "Découvrez notre collection complète de créations artisanales.",
    },
  };
}

export default function ProductsPage() {
  return <ProductsPageClient />;
}
