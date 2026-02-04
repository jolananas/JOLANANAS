/**
 * 🍍 JOLANANAS - API Produits
 * ===========================
 * Route API pour récupérer la liste des produits
 */

import { NextRequest, NextResponse } from "next/server";
import { getAllProducts } from "@/lib/shopify/index";

export const dynamic = "force-dynamic";

/**
 * GET /api/products
 * Récupère la liste de tous les produits
 */
export async function GET(request: NextRequest) {
  try {
    console.log("🔄 Récupération des produits depuis Shopify...");

    // Récupérer tous les produits depuis Shopify (jusqu'à 250 par défaut)
    const products = await getAllProducts(250);

    console.log(`✅ ${products.length} produits récupérés depuis Shopify`);

    if (products.length === 0) {
      console.warn("⚠️ Aucun produit trouvé depuis Shopify");
    }

    return NextResponse.json(products, {
      headers: {
        "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  } catch (error: unknown) {
    console.error("❌ Erreur serveur produits:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Erreur inconnue";

    return NextResponse.json(
      {
        error:
          "Impossible de récupérer les produits. Veuillez réessayer plus tard.",
        details:
          process.env.NODE_ENV === "development" ? errorMessage : undefined,
      },
      { status: 500 },
    );
  }
}

/**
 * OPTIONS /api/products
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
