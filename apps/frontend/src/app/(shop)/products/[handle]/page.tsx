import { getProductByHandle, getAllProducts, getProductRecommendations, getShopInfo } from "@/lib/shopify";
import { ProductPageClient } from "@/components/pages/ProductPageClient";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/SEO/JsonLd";
import { baseUrl } from "@/app/shared-metadata";

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
    title: product.title,
    description: product.description.substring(0, 160),
    keywords: product.tags || [],
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
      canonical: `${baseUrl}/products/${handle}`,
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
      url: `${baseUrl}/products/${handle}`,
      priceCurrency: product.priceRange?.minVariantPrice?.currencyCode || "EUR",
      price: product.priceRange?.minVariantPrice?.amount,
      availability: product.availableForSale
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
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
        name: "Produits",
        item: `${baseUrl}/products`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.title,
        item: `${baseUrl}/products/${handle}`,
      },
    ],
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

  // 3. Fetch Recommendations & Shop Info
  const [recommendations, shopInfo] = await Promise.all([
    getProductRecommendations(product.id),
    getShopInfo(),
  ]);

  // 4. On passe le produit complet au client
  return (
    <>
      <JsonLd data={jsonLd} id="product-schema" />
      <JsonLd data={breadcrumbJsonLd} id="breadcrumb-schema" />
      <ProductPageClient
        product={product}
        recommendations={recommendations}
        shopInfo={shopInfo}
      />
    </>
  );
}
