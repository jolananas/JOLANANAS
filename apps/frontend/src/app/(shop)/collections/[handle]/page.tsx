import { getCollectionByHandle } from "@/lib/shopify";
import { CollectionPageClient } from "@/components/pages/CollectionPageClient";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/SEO/JsonLd";
import { baseUrl } from "@/app/shared-metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  let collection = await getCollectionByHandle(handle);

  if (!collection) {
    const { getProgrammaticCollection } = await import(
      "@/lib/programmatic-seo"
    );
    collection = await getProgrammaticCollection(handle);
  }

  if (!collection) return { title: "Collection introuvable" };

  return {
    title: collection.title,
    description: collection.description,
    alternates: {
      canonical: `${baseUrl}/collections/${handle}`,
    },
  };
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  let collection = await getCollectionByHandle(handle);

  // Fallback: Programmatic SEO
  if (!collection) {
    const { getProgrammaticCollection } = await import(
      "@/lib/programmatic-seo"
    );
    collection = await getProgrammaticCollection(handle);
  }

  if (!collection) {
    return notFound();
  }

  // --- JSON-LD ---
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: collection.title,
    description: collection.description,
    url: `${baseUrl}/collections/${handle}`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: collection.products?.map((product: any, index: number) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${baseUrl}/products/${product.handle}`,
      })),
    },
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
        name: "Collections",
        item: `${baseUrl}/collections`, // Assuming there is a collections list page
      },
      {
        "@type": "ListItem",
        position: 3,
        name: collection.title,
        item: `${baseUrl}/collections/${handle}`,
      },
    ],
  };

  return (
    <>
      <JsonLd data={jsonLd} id="collection-schema" />
      <JsonLd data={breadcrumbJsonLd} id="breadcrumb-schema" />
      <CollectionPageClient collection={collection} />
    </>
  );
}
