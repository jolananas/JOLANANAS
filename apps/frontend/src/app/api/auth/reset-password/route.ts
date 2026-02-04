/**
 * 🍍 JOLANANAS - API Réinitialisation Mot de Passe
 * ================================================
 * NOTE: Cette route est désactivée car la réinitialisation de mot de passe
 * est maintenant gérée par Shopify Customer Accounts via les invitations.
 * Les clients reçoivent un email d'invitation Shopify avec un lien de réinitialisation.
 */

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

/**
 * POST /api/auth/reset-password
 * DÉSACTIVÉ - La réinitialisation est gérée par Shopify
 */
export async function POST(request: NextRequest) {
  return NextResponse.json(
    {
      success: false,
      error: 'La réinitialisation de mot de passe est maintenant gérée par Shopify Customer Accounts.',
      message: 'Veuillez utiliser le lien de réinitialisation reçu par email depuis Shopify.',
      redirectToShopify: true,
    },
    { status: 410 } // 410 Gone - La ressource n'est plus disponible
  );
}
