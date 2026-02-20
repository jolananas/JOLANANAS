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

  // --- JSON-LD STRUCTURED DATA (Google Rich Snippets + GEO) ---
  const videoMedia = product.media?.edges.find(
    (e: any) => e.node.mediaContentType === "VIDEO",
  )?.node;

  // Build per-variant offers for AggregateOffer
  const variantOffers = (product.variants || []).map((variant: any) => {
    const offer: any = {
      "@type": "Offer",
      url: `${baseUrl}/products/${handle}`,
      priceCurrency: product.currency || "EUR",
      price: variant.price,
      availability: variant.availableForSale
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      seller: {
        "@id": `${baseUrl}/#organization`,
      },
    };
    if (variant.sku) offer.sku = variant.sku;
    if (variant.barcode) offer.gtin13 = variant.barcode;
    if (variant.title && variant.title) {
      offer.name = variant.title;
    }
    return offer;
  });

  // Compute price range for AggregateOffer
  const prices = (product.variants || []).map((v: any) => Number(v.price)).filter((p: number) => !isNaN(p) && p > 0);
  const lowPrice = prices.length > 0 ? Math.min(...prices) : product.priceRange?.minVariantPrice?.amount;
  const highPrice = prices.length > 0 ? Math.max(...prices) : product.priceRange?.maxVariantPrice?.amount;

  // Extract material from metafield if available
  const materialField = product.material?.reference?.fields?.find((f: any) => f.key === "name" || f.key === "title");
  const materialName = materialField?.value;

  const jsonLd: any = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "@id": `${baseUrl}/products/${handle}#product`,
    name: product.title,
    url: `${baseUrl}/products/${handle}`,
    image: product.images?.map((img: any) => img.url) || product.images?.edges?.map((edge: any) => edge.node.url) || [],
    description: product.description,
    brand: {
      "@id": `${baseUrl}/#organization`,
    },
    manufacturer: {
      "@id": `${baseUrl}/#organization`,
    },
    ...(product.productType && { category: product.productType }),
    ...(materialName && { material: materialName }),
    ...(product.tags && product.tags.length > 0 && { keywords: product.tags.join(", ") }),
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "Fabrication",
        value: "Fait main",
      },
      {
        "@type": "PropertyValue",
        name: "Originalité",
        value: "Pièce unique ou petite série",
      },
    ],
    offers: variantOffers.length > 1
      ? {
          "@type": "AggregateOffer",
          lowPrice: lowPrice,
          highPrice: highPrice,
          priceCurrency: product.currency || "EUR",
          offerCount: variantOffers.length,
          offers: variantOffers,
          availability: product.availableForSale
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
        }
      : variantOffers.length === 1
        ? variantOffers[0]
        : {
            "@type": "Offer",
            url: `${baseUrl}/products/${handle}`,
            priceCurrency: product.priceRange?.minVariantPrice?.currencyCode || "EUR",
            price: product.priceRange?.minVariantPrice?.amount,
            availability: product.availableForSale
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
            priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
            itemCondition: "https://schema.org/NewCondition",
            seller: { "@id": `${baseUrl}/#organization` },
          },
    shippingDetails: {
      "@type": "OfferShippingDetails",
      shippingRate: {
        "@type": "MonetaryAmount",
        value: "0",
        currency: "EUR",
      },
      shippingDestination: {
        "@type": "DefinedRegion",
        addressCountry: "FR",
      },
      deliveryTime: {
        "@type": "ShippingDeliveryTime",
        handlingTime: {
          "@type": "QuantitativeValue",
          minValue: 1,
          maxValue: 3,
          unitCode: "DAY",
        },
        transitTime: {
          "@type": "QuantitativeValue",
          minValue: 2,
          maxValue: 5,
          unitCode: "DAY",
        },
      },
    },
    hasMerchantReturnPolicy: {
      "@type": "MerchantReturnPolicy",
      applicableCountry: "FR",
      returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
      merchantReturnDays: 14,
      returnMethod: "https://schema.org/ReturnByMail",
      returnFees: "https://schema.org/FreeReturn",
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

  // 3. Fetch Recommendations & Shop Info
  const [recommendations, shopInfo] = await Promise.all([
    getProductRecommendations(product.id),
    getShopInfo(),
  ]);

  // Breadcrumb JSON-LD
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
