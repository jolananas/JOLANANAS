/**
 * 🍍 JOLANANAS - API Finalisation Paiement
 * =========================================
 * Finalise un paiement et convertit le draft order en commande finale
 */

import { NextRequest, NextResponse } from 'next/server';
import { getShopifyAdminClient } from '@/lib/ShopifyAdminClient';
import { ENV } from '@/app/src/lib/env';
import { normalizeDataForAPI } from '@/app/src/lib/utils/formatters';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface PaymentCompleteData {
  draftOrderId: string;
  paymentStatus?: 'paid' | 'pending' | 'refunded';
  paymentGateway?: string;
  transactionId?: string;
  paypalOrderID?: string;
  paypalPayerID?: string;
  paypalAmount?: {
    value: string;
    currency_code: string;
  };
}

function validatePayPalData(data: PaymentCompleteData): { valid: boolean; error?: string } {
  if (data.paymentGateway === 'paypal') {
    if (!data.transactionId && !data.paypalOrderID) {
      return {
        valid: false,
        error: 'transactionId ou paypalOrderID requis pour PayPal',
      };
    }
  }
  return { valid: true };
}

/**
 * POST /api/checkout/payment/complete
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      draftOrderId,
      paymentStatus = 'paid',
      paymentGateway,
      transactionId,
      paypalOrderID,
      paypalPayerID,
      paypalAmount,
    }: PaymentCompleteData = body;

    const normalizedDraftOrderId = normalizeDataForAPI(draftOrderId);

    if (!normalizedDraftOrderId || typeof normalizedDraftOrderId !== 'string' || normalizedDraftOrderId.trim() === '') {
      return NextResponse.json({ error: 'draftOrderId est requis' }, { status: 400 });
    }

    const validation = validatePayPalData({
      draftOrderId: normalizedDraftOrderId,
      paymentStatus,
      paymentGateway,
      transactionId,
      paypalOrderID,
      paypalPayerID,
      paypalAmount,
    });

    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    if (!ENV.SHOPIFY_ADMIN_TOKEN) {
      return NextResponse.json({ error: 'SHOPIFY_ADMIN_TOKEN n\'est pas configuré' }, { status: 500 });
    }

    const normalizedPaymentGateway = paymentGateway ? normalizeDataForAPI(paymentGateway) : undefined;
    const normalizedTransactionId = transactionId 
      ? normalizeDataForAPI(transactionId) 
      : (paypalOrderID ? normalizeDataForAPI(paypalOrderID) : undefined);

    console.log('🔄 Finalisation paiement:', { 
      draftOrderId: normalizedDraftOrderId, 
      paymentStatus,
      paymentGateway: normalizedPaymentGateway,
      transactionId: normalizedTransactionId,
    });

    const adminClient = getShopifyAdminClient();
    const draftOrderResponse = await adminClient.getDraftOrder(normalizedDraftOrderId);

    if (draftOrderResponse.errors || !draftOrderResponse.data?.draft_order) {
      console.error('❌ Draft order non trouvé:', draftOrderResponse.errors);
      return NextResponse.json({ error: 'Draft order non trouvé' }, { status: 404 });
    }

    const draftOrder = draftOrderResponse.data.draft_order;

    if (paymentGateway === 'paypal' && paypalAmount) {
      const expectedAmount = parseFloat(draftOrder.total_price || '0');
      const receivedAmount = parseFloat(paypalAmount.value || '0');
      if (Math.abs(expectedAmount - receivedAmount) > 0.01) {
        return NextResponse.json({ error: 'Le montant du paiement PayPal ne correspond pas' }, { status: 400 });
      }
    }

    const completeResponse = await adminClient.completeDraftOrder(normalizedDraftOrderId, {
      payment_gateway: normalizedPaymentGateway,
      payment_status: paymentStatus,
      transaction_id: normalizedTransactionId,
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
      status: paymentStatus,
      total: finalOrder?.total_price || draftOrder.total_price,
      currency: finalOrder?.currency || draftOrder.currency,
      paymentGateway: normalizedPaymentGateway,
      transactionId: normalizedTransactionId,
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });

  } catch (error: unknown) {
    console.error('❌ Erreur serveur finalisation paiement:', error);
    const message = error instanceof Error ? error.message : 'Erreur serveur';
    return NextResponse.json({ error: message, traceId: `payment-complete-${Date.now()}` }, { status: 500 });
  }
}
