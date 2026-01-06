/**
 * 🍍 JOLANANAS - API Finalisation Paiement
 * =========================================
 * Finalise un paiement et convertit le draft order en commande finale
 */

import { NextRequest, NextResponse } from 'next/server';
import { getShopifyAdminClient } from '@/lib/ShopifyAdminClient';
import { ENV } from '@/lib/env';
import { normalizeDataForAPI } from '@/lib/utils/formatters';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Interface pour les données de paiement
 */
interface PaymentCompleteData {
  draftOrderId: string;
  paymentStatus?: 'paid' | 'pending' | 'refunded';
  paymentGateway?: string;
  transactionId?: string;
  // Données PayPal spécifiques
  paypalOrderID?: string;
  paypalPayerID?: string;
  paypalAmount?: {
    value: string;
    currency_code: string;
  };
}

/**
 * Valider les données PayPal
 */
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
 * Finalise un paiement et crée la commande finale dans Shopify
 * Supporte PayPal, Shop Pay et autres méthodes de paiement
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

    // Normaliser le draftOrderId
    const normalizedDraftOrderId = normalizeDataForAPI(draftOrderId);

    // Validation
    if (!normalizedDraftOrderId || typeof normalizedDraftOrderId !== 'string' || normalizedDraftOrderId.trim() === '') {
      return NextResponse.json(
        { error: 'draftOrderId est requis et doit être une chaîne valide' },
        { status: 400 }
      );
    }

    // Valider les données PayPal si applicable
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
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    if (!ENV.SHOPIFY_ADMIN_TOKEN) {
      return NextResponse.json(
        { error: 'SHOPIFY_ADMIN_TOKEN n\'est pas configuré' },
        { status: 500 }
      );
    }

    console.log('🔄 Finalisation paiement:', { 
      draftOrderId: normalizedDraftOrderId, 
      paymentStatus,
      paymentGateway: normalizedPaymentGateway,
      transactionId: normalizedTransactionId,
    });

    // 1. Récupérer le draft order pour vérifier qu'il existe
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

    // 2. Valider le montant PayPal si applicable
    if (paymentGateway === 'paypal' && paypalAmount) {
      const expectedAmount = parseFloat(draftOrder.total_price || '0');
      const receivedAmount = parseFloat(paypalAmount.value || '0');
      
      // Tolérance de 0.01 pour les arrondis
      if (Math.abs(expectedAmount - receivedAmount) > 0.01) {
        console.error('❌ Montant PayPal ne correspond pas:', {
          expected: expectedAmount,
          received: receivedAmount,
          draftOrderId: normalizedDraftOrderId,
        });
        return NextResponse.json(
          { error: 'Le montant du paiement PayPal ne correspond pas à la commande' },
          { status: 400 }
        );
      }
    }

    // 3. Normaliser les données avant l'envoi
    const normalizedPaymentGateway = paymentGateway ? normalizeDataForAPI(paymentGateway) : undefined;
    const normalizedTransactionId = transactionId 
      ? normalizeDataForAPI(transactionId) 
      : (paypalOrderID ? normalizeDataForAPI(paypalOrderID) : undefined);

    // 4. Convertir le draft order en commande finale
    const completeResponse = await adminClient.completeDraftOrder(normalizedDraftOrderId, {
      payment_gateway: normalizedPaymentGateway,
      payment_status: paymentStatus,
      transaction_id: normalizedTransactionId,
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

    // 3. Récupérer la commande finale créée
    // Shopify crée automatiquement une commande lors du complete
    // On peut la récupérer via l'ID de la commande dans le draft order
    let finalOrder = null;
    if (completedOrder.order_id) {
      const orderResponse = await adminClient.getOrder(completedOrder.order_id.toString());
      if (orderResponse.data?.order) {
        finalOrder = orderResponse.data.order;
      }
    }

    console.log('✅ Paiement finalisé avec succès:', {
      draftOrderId: normalizedDraftOrderId,
      orderId: finalOrder?.id || completedOrder.order_id,
      paymentStatus,
      paymentGateway: normalizedPaymentGateway,
      transactionId: normalizedTransactionId,
    });

    // 5. Retourner les informations de la commande
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
    
    return NextResponse.json(
      { 
        error: message,
        traceId: `payment-complete-${Date.now()}`
      },
      { status: 500 }
    );
  }
}

