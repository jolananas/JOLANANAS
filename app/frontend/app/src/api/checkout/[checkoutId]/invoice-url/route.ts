/**
 * 🍍 JOLANANAS - API Invoice URL pour Checkout
 * =============================================
 * Route API pour récupérer l'invoice URL d'un draft order
 * Utilisé par le fallback Shop Pay pour redirection
 */

import { NextRequest, NextResponse } from 'next/server';
import { getShopifyAdminClient } from '@/lib/ShopifyAdminClient';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/checkout/[checkoutId]/invoice-url
 * Retourne l'invoice URL du draft order pour redirection Shop Pay
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { checkoutId: string } }
) {
  try {
    const { checkoutId } = params;

    if (!checkoutId) {
      return NextResponse.json(
        { error: 'checkoutId est requis' },
        { status: 400 }
      );
    }

    console.log(`🔄 Récupération invoice URL pour checkoutId: ${checkoutId}`);

    const adminClient = getShopifyAdminClient();

    // Récupérer le draft order
    const draftOrderResponse = await adminClient.get(
      `/draft_orders/${checkoutId}.json`
    );

    if (!draftOrderResponse.ok) {
      const errorData = await draftOrderResponse.json();
      throw new Error(errorData.errors || `Erreur lors de la récupération du draft order ${checkoutId}`);
    }

    const draftOrder = draftOrderResponse.data.draft_order;

    if (!draftOrder) {
      throw new Error(`Draft order ${checkoutId} introuvable.`);
    }

    if (!draftOrder.invoice_url) {
      throw new Error(`Invoice URL non disponible pour le draft order ${checkoutId}`);
    }

    return NextResponse.json({
      invoiceUrl: draftOrder.invoice_url,
      checkoutId: checkoutId,
    });

  } catch (error) {
    console.error('❌ Erreur API Invoice URL:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

