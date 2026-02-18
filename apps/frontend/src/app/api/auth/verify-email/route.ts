import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getCustomerFromToken } from "@/lib/shopify/customer-accounts";

export const runtime = "nodejs";

/**
 * POST /api/auth/verify-email
 * Vérifie le statut de vérification de l'email via Shopify
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.shopifyAccessToken) {
      return NextResponse.json(
        { success: false, error: "Non authentifié" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { action } = body;

    // Action: check (vérifier le statut de l'email)
    if (action === "check") {
      // Récupérer les informations du client depuis Shopify
      const customerResult = await getCustomerFromToken(
        session.user.shopifyAccessToken,
      );

      if (customerResult.errors && customerResult.errors.length > 0) {
        return NextResponse.json(
          {
            success: false,
            error: customerResult.errors[0].message,
          },
          { status: 400 },
        );
      }

      const customer = customerResult.customer;

      if (!customer) {
        return NextResponse.json(
          { success: false, error: "Client Shopify non trouvé" },
          { status: 404 },
        );
      }

      // Shopify gère automatiquement la vérification d'email
      // L'email est vérifié si le client a un compte actif
      const isEmailVerified = customer.emailVerified || false;

      return NextResponse.json({
        success: true,
        verified: isEmailVerified,
        message: isEmailVerified
          ? "Email déjà vérifié"
          : "Email non vérifié. Shopify gère automatiquement la vérification lors de l'inscription.",
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error:
            'Action invalide. Utilisez action: "check" pour vérifier le statut.',
        },
        { status: 400 },
      );
    }
  } catch (error: unknown) {
    console.error("❌ Erreur verify-email:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          error: "Une erreur est survenue",
          details: error.message,
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Une erreur est survenue",
      },
      { status: 500 },
    );
  }
}
