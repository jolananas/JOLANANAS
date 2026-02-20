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

  // --- JSON-LD (Enriched for Google Rich Results + GEO) ---
  const collectionImage = collection.image?.url || null;

  const jsonLd: any = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${baseUrl}/collections/${handle}#collection`,
    name: collection.title,
    description: collection.description,
    url: `${baseUrl}/collections/${handle}`,
    ...(collectionImage && { image: collectionImage }),
    isPartOf: {
      "@id": `${baseUrl}/#website`,
    },
    publisher: {
      "@id": `${baseUrl}/#organization`,
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: collection.products?.length || 0,
      itemListElement: collection.products?.map((product: any, index: number) => {
        const productPrice = product.price || product.priceRange?.minVariantPrice?.amount;
        const productCurrency = product.currency || product.priceRange?.minVariantPrice?.currencyCode || "EUR";
        const productImage = product.featuredImage || product.images?.[0]?.url || product.images?.edges?.[0]?.node?.url;

        return {
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "Product",
            name: product.title,
            url: `${baseUrl}/products/${product.handle}`,
            ...(productImage && { image: productImage }),
            ...(product.description && { description: product.description.substring(0, 200) }),
            brand: {
              "@id": `${baseUrl}/#organization`,
            },
            offers: {
              "@type": "Offer",
              url: `${baseUrl}/products/${product.handle}`,
              priceCurrency: productCurrency,
              price: productPrice,
              availability: product.availableForSale
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
              itemCondition: "https://schema.org/NewCondition",
              seller: {
                "@id": `${baseUrl}/#organization`,
              },
            },
          },
        };
      }) || [],
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
        item: `${baseUrl}/collections`,
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
