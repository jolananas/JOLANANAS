import { NextRequest, NextResponse } from "next/server";
import { ENV } from "@/lib/env";

export const dynamic = "force-dynamic";

/**
 * GET /api/config/shopify
 */
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(
      {
        storeDomain: ENV.SHOPIFY_STORE_DOMAIN,
        configured: true,
      },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      },
    );
  } catch (error: unknown) {
    console.error("❌ Erreur serveur récupération config Shopify:", error);
    const message = error instanceof Error ? error.message : "Erreur serveur";
    return NextResponse.json(
      {
        error: message,
        storeDomain: null,
        configured: false,
        traceId: `shopify-config-${Date.now()}`,
      },
      { status: 500 },
    );
  }
}
