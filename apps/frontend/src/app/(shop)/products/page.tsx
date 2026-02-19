import { ProductsPageClient } from "@/components/ecommerce/products/ProductsPageClient";
import { JsonLd } from "@/components/SEO/JsonLd";
import { baseUrl } from "@/app/shared-metadata";

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
    alternates: {
      canonical: `${baseUrl}/products`,
    },
  };
}

export default function ProductsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Toutes nos créations - JOLANANAS",
    description: "Découvrez notre collection complète de créations artisanales girly et utiles.",
    url: `${baseUrl}/products`,
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Accueil",
        item: baseUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Produits",
        item: `${baseUrl}/products`,
      },
    ],
  };

  return (
    <>
      <JsonLd data={jsonLd} id="products-list-schema" />
      <JsonLd data={breadcrumbJsonLd} id="breadcrumb-schema" />
      <ProductsPageClient />
    </>
  );
}
