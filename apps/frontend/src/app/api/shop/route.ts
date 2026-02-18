import { NextRequest, NextResponse } from "next/server";
import { getShopInfo } from "@/lib/shopify/index";
import { getShopCurrency } from "@/lib/currency/currencyService";

export const dynamic = "force-dynamic";

/**
 * GET /api/shop
 */
export async function GET(request: NextRequest) {
  try {
    const shopInfo = await getShopInfo();
    const shopCurrency = await getShopCurrency();

    if (!shopInfo) {
      return NextResponse.json(
        {
          name: "JOLANANAS",
          email: null,
          phone: null,
          description: null,
          url: null,
          currencyCode: shopCurrency,
        },
        { status: 200 },
      );
    }

    return NextResponse.json(
      {
        name: shopInfo.name,
        email: shopInfo.email,
        phone: null,
        description: shopInfo.description,
        url: shopInfo.url,
        currencyCode: shopInfo.currencyCode || shopCurrency,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
        },
      },
    );
  } catch (error: unknown) {
    console.error("❌ Erreur serveur shop info:", error);
    const shopCurrency = await getShopCurrency().catch(() => "EUR");
    return NextResponse.json(
      {
        name: "JOLANANAS",
        email: null,
        phone: null,
        description: null,
        url: null,
        currencyCode: shopCurrency,
      },
      { status: 200 },
    );
  }
}
