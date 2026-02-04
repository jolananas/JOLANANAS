import { getProductByHandle, getAllProducts } from "@/lib/shopify";
import { ProductPageClient } from "@/components/pages/ProductPageClient";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const product = await getProductByHandle(handle);

  if (!product) {
    return { title: "Produit introuvable" };
  }

  return {
    title: `${product.title} | JOLANANAS`,
    description: product.description.substring(0, 160),
    openGraph: {
      images: product.featuredImage?.url
        ? [{ url: product.featuredImage.url, width: 1200, height: 630 }]
        : product.images?.edges?.[0]?.node?.url
          ? [
              {
                url: product.images.edges[0].node.url,
                width: 1200,
                height: 630,
              },
            ]
          : [],
      type: "website",
    },
    alternates: {
      canonical: `${process.env.DOMAIN_URL || "https://jolananas.com"}/products/${handle}`,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  // 1. Récupération des données côté serveur
  const product = await getProductByHandle(handle);

  // 2. Sécurité : Si pas de produit, 404
  if (!product) {
    return notFound();
  }

  // --- JSON-LD STRUCTURED DATA (Google Rich Snippets) ---
  const videoMedia = product.media?.edges.find(
    (e: any) => e.node.mediaContentType === "VIDEO",
  )?.node;

  const jsonLd: any = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.title,
    image: product.images?.edges?.map((edge: any) => edge.node.url) || [],
    description: product.description,
    brand: {
      "@type": "Brand",
      name: "JOLANANAS",
    },
    offers: {
      "@type": "Offer",
      url: `${process.env.DOMAIN_URL || "https://jolananas.com"}/products/${handle}`,
      priceCurrency: product.priceRange?.minVariantPrice?.currencyCode || "EUR",
      price: product.priceRange?.minVariantPrice?.amount || "0.00",
      availability: product.availableForSale
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  if (videoMedia && videoMedia.sources && videoMedia.sources.length > 0) {
    jsonLd.subjectOf = {
      "@type": "VideoObject",
      name: `Présentation ${product.title}`,
      description: `Découvrez ${product.title} en vidéo.`,
      thumbnailUrl: videoMedia.previewImage?.url || product.featuredImage?.url,
      uploadDate: new Date().toISOString(),
      contentUrl: videoMedia.sources[0].url,
    };
  }

  // 3. On passe le produit complet au client
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductPageClient product={product} />
    </>
  );
}
