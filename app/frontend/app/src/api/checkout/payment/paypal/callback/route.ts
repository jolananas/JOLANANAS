/**
 * 🍍 JOLANANAS - API Callback PayPal
 * ===================================
 * Gère les callbacks PayPal pour validation des transactions
 * Utilisé pour valider les paiements PayPal avant de compléter le draft order
 */

import { NextRequest, NextResponse } from 'next/server';
import { getShopifyAdminClient } from '@/lib/ShopifyAdminClient';
import { ENV } from '@/lib/env';
import { normalizeDataForAPI } from '@/lib/utils/formatters';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Interface pour les données PayPal
 */
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
 * Valide un callback PayPal et complète le draft order
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      orderID,
      payerID,
      paymentID,
      transactionID,
      draftOrderId,
      amount,
      status = 'COMPLETED',
    }: PayPalCallbackData = body;

    // Validation
    if (!orderID || !draftOrderId) {
      return NextResponse.json(
        { error: 'orderID et draftOrderId sont requis' },
        { status: 400 }
      );
    }

    if (!ENV.SHOPIFY_ADMIN_TOKEN) {
      return NextResponse.json(
        { error: 'SHOPIFY_ADMIN_TOKEN n\'est pas configuré' },
        { status: 500 }
      );
    }

    console.log('🔄 Validation callback PayPal:', {
      orderID,
      draftOrderId,
      status,
    });

    // Vérifier que le statut est COMPLETED
    if (status !== 'COMPLETED') {
      console.warn('⚠️ Paiement PayPal non complété:', status);
      return NextResponse.json(
        {
          success: false,
          status,
          message: `Paiement PayPal en statut: ${status}`,
        },
        { status: 200 }
      );
    }

    // Récupérer le draft order pour vérifier qu'il existe
    const adminClient = getShopifyAdminClient();
    const draftOrderResponse = await adminClient.getDraftOrder(draftOrderId);

    if (draftOrderResponse.errors || !draftOrderResponse.data?.draft_order) {
      console.error('❌ Draft order non trouvé:', draftOrderResponse.errors);
      return NextResponse.json(
        { error: 'Draft order non trouvé' },
        { status: 404 }
      );
    }

    const draftOrder = draftOrderResponse.data.draft_order;

    // Vérifier que le montant correspond
    if (amount) {
      const expectedAmount = parseFloat(draftOrder.total_price || '0');
      const receivedAmount = parseFloat(amount.value || '0');
      
      // Tolérance de 0.01 pour les arrondis
      if (Math.abs(expectedAmount - receivedAmount) > 0.01) {
        console.error('❌ Montant PayPal ne correspond pas:', {
          expected: expectedAmount,
          received: receivedAmount,
        });
        return NextResponse.json(
          { error: 'Le montant du paiement ne correspond pas à la commande' },
          { status: 400 }
        );
      }
    }

    // Convertir le draft order en commande finale
    const completeResponse = await adminClient.completeDraftOrder(draftOrderId, {
      payment_gateway: 'paypal',
      payment_status: 'paid',
      transaction_id: transactionID || orderID,
    });

    if (completeResponse.errors) {
      console.error('❌ Erreur finalisation draft order:', completeResponse.errors);
      return NextResponse.json(
        { error: 'Erreur lors de la finalisation de la commande' },
        { status: 500 }
      );
    }

    if (!completeResponse.data?.draft_order) {
      console.error('❌ Réponse finalisation invalide:', completeResponse);
      return NextResponse.json(
        { error: 'Réponse finalisation invalide' },
        { status: 500 }
      );
    }

    const completedOrder = completeResponse.data.draft_order;

    // Récupérer la commande finale créée
    let finalOrder = null;
    if (completedOrder.order_id) {
      const orderResponse = await adminClient.getOrder(completedOrder.order_id.toString());
      if (orderResponse.data?.order) {
        finalOrder = orderResponse.data.order;
      }
    }

    console.log('✅ Callback PayPal validé avec succès:', {
      orderID,
      draftOrderId,
      orderId: finalOrder?.id || completedOrder.order_id,
    });

    // Retourner les informations de la commande
    return NextResponse.json({
      success: true,
      orderId: finalOrder?.id || completedOrder.order_id,
      orderNumber: finalOrder?.order_number || completedOrder.name,
      status: 'paid',
      total: finalOrder?.total_price || draftOrder.total_price,
      currency: finalOrder?.currency || draftOrder.currency,
      transactionId: transactionID || orderID,
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });

  } catch (error: unknown) {
    console.error('❌ Erreur serveur callback PayPal:', error);
    
    const message = error instanceof Error ? error.message : 'Erreur serveur';
    
    return NextResponse.json(
      { 
        error: message,
        traceId: `paypal-callback-${Date.now()}`
      },
      { status: 500 }
    );
  }
}

