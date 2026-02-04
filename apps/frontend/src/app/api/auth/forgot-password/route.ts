/**
 * 🍍 JOLANANAS - API Mot de Passe Oublié
 * ======================================
 * Endpoint pour demander une réinitialisation de mot de passe
 * Utilise Shopify Admin API pour envoyer une invitation de réinitialisation
 * Plus de base de données locale - utilise uniquement Shopify APIs
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rate-limit";
import { getShopifyAdminClient } from "@/lib/ShopifyAdminClient";

export const runtime = "nodejs";

const ForgotPasswordSchema = z.object({
  email: z.string().email("Email invalide"),
});

/**
 * POST /api/auth/forgot-password
 * Envoie un email de réinitialisation de mot de passe
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validation des données
    const validation = ForgotPasswordSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Données invalides",
          details: validation.error.errors,
        },
        { status: 400 },
      );
    }

    const { email } = validation.data;
    const emailLower = email.toLowerCase();

    // Rate limiting : max 3 demandes par email toutes les heures
    const rateLimit = await checkRateLimit(
      `forgot-password:${emailLower}`,
      3,
      60 * 60 * 1000,
    );

    if (!rateLimit.allowed) {
      const resetMinutes = Math.ceil(
        (rateLimit.resetAt - Date.now()) / (60 * 1000),
      );
      return NextResponse.json(
        {
          success: false,
          error: `Trop de demandes. Réessayez dans ${resetMinutes} minutes.`,
        },
        { status: 429 },
      );
    }

    // Rechercher le client dans Shopify via Admin API
    const adminClient = getShopifyAdminClient();
    const customerResult = await adminClient.findCustomerByEmail(emailLower);

    // Ne pas révéler si le client existe ou non (sécurité)
    // Toujours retourner un succès pour éviter l'énumération d'emails
    if (!customerResult || !customerResult.customer) {
      // Attendre un peu pour simuler le traitement (timing attack protection)
      await new Promise((resolve) => setTimeout(resolve, 500));

      return NextResponse.json({
        success: true,
        message:
          "Si cet email existe, un lien de réinitialisation a été envoyé.",
      });
    }

    const customerId = customerResult.customer.id.toString();

    // Envoyer l'invitation de réinitialisation via Shopify Admin API
    try {
      const inviteResult =
        await adminClient.sendCustomerPasswordResetInvite(customerId);

      if (inviteResult.errors && inviteResult.errors.length > 0) {
        console.error(
          "❌ Erreur envoi invitation Shopify:",
          inviteResult.errors,
        );
        // Ne pas révéler l'erreur à l'utilisateur (sécurité)
        // Attendre un peu pour simuler le traitement
        await new Promise((resolve) => setTimeout(resolve, 500));

        return NextResponse.json({
          success: true,
          message:
            "Si cet email existe, un lien de réinitialisation a été envoyé.",
        });
      }

      console.log(
        `✅ Invitation de réinitialisation envoyée à ${emailLower} (Customer ID: ${customerId})`,
      );

      return NextResponse.json({
        success: true,
        message:
          "Si cet email existe, un lien de réinitialisation a été envoyé.",
      });
    } catch (error) {
      console.error("❌ Erreur envoi invitation Shopify:", error);
      // Ne pas révéler l'erreur à l'utilisateur (sécurité)
      // Attendre un peu pour simuler le traitement
      await new Promise((resolve) => setTimeout(resolve, 500));

      return NextResponse.json({
        success: true,
        message:
          "Si cet email existe, un lien de réinitialisation a été envoyé.",
      });
    }
  } catch (error: unknown) {
    console.error("❌ Erreur forgot-password:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Une erreur est survenue lors de la demande de réinitialisation",
          details: error.message,
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Une erreur est survenue lors de la demande de réinitialisation",
      },
      { status: 500 },
    );
  }
}
