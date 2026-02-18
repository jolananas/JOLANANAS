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
