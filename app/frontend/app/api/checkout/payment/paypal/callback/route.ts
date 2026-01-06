/**
 * 🍍 JOLANANAS - API Callback PayPal
 * ===================================
 * Gère les callbacks PayPal pour validation des transactions
 */

import { NextRequest, NextResponse } from 'next/server';
import { getShopifyAdminClient } from '@/lib/ShopifyAdminClient';
import { ENV } from '@/app/src/lib/env';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface PayPalCallbackData {
  orderID: string;
  payerID?: string;
  paymentID?: string;
  transactionID?: string;
  draftOrderId: string;
  amount?: {
    value: string;
    currency_code: string;
  };
  status?: 'COMPLETED' | 'PENDING' | 'FAILED' | 'CANCELLED';
}

/**
 * POST /api/checkout/payment/paypal/callback
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      orderID,
      transactionID,
      draftOrderId,
      amount,
      status = 'COMPLETED',
    }: PayPalCallbackData = body;

    if (!orderID || !draftOrderId) {
      return NextResponse.json({ error: 'orderID et draftOrderId sont requis' }, { status: 400 });
    }

    if (!ENV.SHOPIFY_ADMIN_TOKEN) {
      return NextResponse.json({ error: 'SHOPIFY_ADMIN_TOKEN n\'est pas configuré' }, { status: 500 });
    }

    if (status !== 'COMPLETED') {
      return NextResponse.json({ success: false, status, message: `Paiement PayPal en statut: ${status}` });
    }

    const adminClient = getShopifyAdminClient();
    const draftOrderResponse = await adminClient.getDraftOrder(draftOrderId);

    if (draftOrderResponse.errors || !draftOrderResponse.data?.draft_order) {
      return NextResponse.json({ error: 'Draft order non trouvé' }, { status: 404 });
    }

    const draftOrder = draftOrderResponse.data.draft_order;

    if (amount) {
      const expectedAmount = parseFloat(draftOrder.total_price || '0');
      const receivedAmount = parseFloat(amount.value || '0');
      if (Math.abs(expectedAmount - receivedAmount) > 0.01) {
        return NextResponse.json({ error: 'Le montant du paiement ne correspond pas' }, { status: 400 });
      }
    }

    const completeResponse = await adminClient.completeDraftOrder(draftOrderId, {
      payment_gateway: 'paypal',
      payment_status: 'paid',
      transaction_id: transactionID || orderID,
    });

    if (completeResponse.errors || !completeResponse.data?.draft_order) {
      console.error('❌ Erreur finalisation draft order:', completeResponse.errors);
      return NextResponse.json({ error: 'Erreur lors de la finalisation de la commande' }, { status: 500 });
    }

    const completedOrder = completeResponse.data.draft_order;
    let finalOrder = null;
    if (completedOrder.order_id) {
      const orderResponse = await adminClient.getOrder(completedOrder.order_id.toString());
      if (orderResponse.data?.order) {
        finalOrder = orderResponse.data.order;
      }
    }

    return NextResponse.json({
      success: true,
      orderId: finalOrder?.id || completedOrder.order_id,
      orderNumber: finalOrder?.order_number || completedOrder.name,
      status: 'paid',
      total: finalOrder?.total_price || draftOrder.total_price,
      currency: finalOrder?.currency || draftOrder.currency,
      transactionId: transactionID || orderID,
    });

  } catch (error: unknown) {
    console.error('❌ Erreur serveur callback PayPal:', error);
    const message = error instanceof Error ? error.message : 'Erreur serveur';
    return NextResponse.json({ error: message, traceId: `paypal-callback-${Date.now()}` }, { status: 500 });
  }
}
