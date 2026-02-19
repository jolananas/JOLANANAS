import { NextRequest, NextResponse } from "next/server";
import { getAllProducts, getAllCollections } from "@/lib/shopify/index";

export const dynamic = "force-dynamic";

/**
 * Formate un handle en titre générique (fallback)
 */
function formatHandleAsTitle(handle: string): string {
  return handle
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * GET /api/collections
 * Récupère la liste de toutes les collections
 */
export async function GET(request: NextRequest) {
  try {
    console.log("🔄 Récupération des collections...");

    // Récupérer les collections réelles depuis Shopify
    const shopifyCollections = await getAllCollections();

    // Récupérer tous les produits pour compter les produits par collection
    const products = await getAllProducts();



    // Construire la liste depuis Shopify directement (source fiable).
    // product.collections peut être undefined si getAllProducts() ne l'inclut pas.
    const collections = shopifyCollections.map((shopifyCollection: any) => {
      const collectionProducts = products.filter((p: any) =>
        (p.collections ?? []).includes(shopifyCollection.handle),
      );

      return {
        handle: shopifyCollection.handle,
        title: shopifyCollection.title || formatHandleAsTitle(shopifyCollection.handle),
        description:
          shopifyCollection.description ||
          `Découvrez notre collection ${formatHandleAsTitle(shopifyCollection.handle)}`,
        productCount: collectionProducts.length,
        image:
          shopifyCollection?.image?.url ||
          collectionProducts[0]?.images?.[0]?.url ||
          "/assets/images/collections/placeholder.svg",
      };
    });

    console.log(`✅ ${collections.length} collections récupérées`);

    return NextResponse.json(collections, {
      headers: {
        "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  } catch (error: unknown) {
    console.error("❌ Erreur serveur collections:", error);

    return NextResponse.json([], {
      status: 500,
      headers: {
        "Cache-Control": "no-cache",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }
}

/**
 * OPTIONS /api/collections
 * Gestion des requêtes CORS preflight
 */
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
