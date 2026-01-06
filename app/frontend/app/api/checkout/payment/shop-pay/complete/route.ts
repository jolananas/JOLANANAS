/**
 * 🍍 JOLANANAS - API Complétion Paiement Shop Pay
 * ================================================
 * Complète le paiement Shop Pay et crée la commande dans Shopify
 */

import { NextRequest, NextResponse } from 'next/server';
import { getShopifyAdminClient } from '@/lib/ShopifyAdminClient';
import { ENV } from '@/app/src/lib/env';
import { transformShopifyError } from '@/app/src/lib/utils/shopify-error-handler';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/checkout/payment/shop-pay/complete
 * Complète le paiement Shop Pay avec le token reçu
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { checkoutId, paymentToken } = body;

    if (!checkoutId) {
      return NextResponse.json({ error: 'checkoutId est requis' }, { status: 400 });
    }

    if (!paymentToken) {
      return NextResponse.json({ error: 'paymentToken est requis' }, { status: 400 });
    }

    console.log('🔄 Complétion paiement Shop Pay:', { checkoutId });

    if (!ENV.SHOPIFY_ADMIN_TOKEN) {
      return NextResponse.json({ error: 'SHOPIFY_ADMIN_TOKEN n\'est pas configuré' }, { status: 500 });
    }

    const adminClient = getShopifyAdminClient();

    const extractNumericId = (gid: string): string => {
      if (gid?.startsWith('gid://shopify/')) {
        const parts = gid.split('/');
        return parts[parts.length - 1];
      }
      return gid;
    };

    const draftOrderId = extractNumericId(checkoutId);
    const draftOrderResponse = await adminClient.getDraftOrder(draftOrderId);

    if (draftOrderResponse.errors || !draftOrderResponse.data?.draft_order) {
      console.error('❌ Erreur récupération draft order:', draftOrderResponse.errors);
      return NextResponse.json({ error: 'Erreur lors de la récupération de la commande' }, { status: 500 });
    }

    const completePaymentResponse = await adminClient.completeDraftOrder(draftOrderId, {
      payment_gateway: 'shop_pay',
      payment_status: 'paid',
      transaction_id: paymentToken,
    });

    if (completePaymentResponse.errors) {
      console.error('❌ Erreur complétion paiement Shop Pay:', completePaymentResponse.errors);
      const errorMessage = completePaymentResponse.errors[0]?.message || 'Erreur lors de la complétion du paiement';
      return NextResponse.json({ error: transformShopifyError(errorMessage, 'ShopPayComplete') }, { status: 500 });
    }

    const completedOrder = completePaymentResponse.data?.draft_order;
    
    if (!completedOrder || !completedOrder.order_id) {
      return NextResponse.json({ error: 'Erreur lors de la création de la commande' }, { status: 500 });
    }

    const orderId = completedOrder.order_id.toString();
    const orderName = completedOrder.name || `#${orderId}`;
    
    console.log('✅ Paiement Shop Pay complété avec succès:', { orderId, orderName });

    return NextResponse.json({
      success: true,
      orderId: orderId,
      orderName: orderName,
      transactionId: paymentToken,
      orderUrl: `/orders/${orderId}`,
    });

  } catch (error) {
    console.error('❌ Erreur API complétion Shop Pay:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json({ error: transformShopifyError(errorMessage, 'ShopPayComplete') }, { status: 500 });
  }
}
