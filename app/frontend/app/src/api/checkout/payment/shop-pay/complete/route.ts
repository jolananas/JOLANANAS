/**
 * 🍍 JOLANANAS - API Complétion Paiement Shop Pay
 * ================================================
 * Complète le paiement Shop Pay et crée la commande dans Shopify
 */

import { NextRequest, NextResponse } from 'next/server';
import { getShopifyAdminClient } from '@/lib/ShopifyAdminClient';
import { ENV } from '@/lib/env';
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
      return NextResponse.json(
        { error: 'checkoutId est requis' },
        { status: 400 }
      );
    }

    if (!paymentToken) {
      return NextResponse.json(
        { error: 'paymentToken est requis' },
        { status: 400 }
      );
    }

    console.log('🔄 Complétion paiement Shop Pay:', { checkoutId });

    // Vérifier que SHOPIFY_ADMIN_TOKEN est configuré
    if (!ENV.SHOPIFY_ADMIN_TOKEN) {
      return NextResponse.json(
        { error: 'SHOPIFY_ADMIN_TOKEN n\'est pas configuré. Le paiement Shop Pay nécessite l\'Admin API.' },
        { status: 500 }
      );
    }

    const adminClient = getShopifyAdminClient();

    // Extraire l'ID numérique du checkoutId (GID)
    const extractNumericId = (gid: string): string => {
      if (gid.startsWith('gid://shopify/')) {
        const parts = gid.split('/');
        return parts[parts.length - 1];
      }
      return gid;
    };

    const draftOrderId = extractNumericId(checkoutId);

    // Compléter le paiement Shop Pay via l'API Admin REST
    // Note: Shop Pay traite le paiement automatiquement via le web component
    // On doit juste marquer le draft order comme payé et le convertir en commande
    
    // 1. Récupérer le draft order pour vérifier qu'il existe
    const draftOrderResponse = await adminClient.getDraftOrder(draftOrderId);

    if (draftOrderResponse.errors || !draftOrderResponse.data?.draft_order) {
      console.error('❌ Erreur récupération draft order:', draftOrderResponse.errors);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération de la commande' },
        { status: 500 }
      );
    }

    const draftOrder = draftOrderResponse.data.draft_order;

    // 2. Compléter le paiement avec le token Shop Pay
    // Shop Pay a déjà traité le paiement via le web component, on doit juste compléter le draft order
    const completePaymentResponse = await adminClient.completeDraftOrder(draftOrderId, {
      payment_gateway: 'shop_pay',
      payment_status: 'paid', // Shop Pay a déjà traité le paiement
      transaction_id: paymentToken, // Le token Shop Pay sert de transaction ID
    });

    if (completePaymentResponse.errors) {
      console.error('❌ Erreur complétion paiement Shop Pay:', completePaymentResponse.errors);
      
      const errorMessage = completePaymentResponse.errors[0]?.message || 'Erreur lors de la complétion du paiement';
      return NextResponse.json(
        { error: transformShopifyError(errorMessage, 'ShopPayComplete') },
        { status: 500 }
      );
    }

    // Récupérer la commande finale créée
    const completedOrder = completePaymentResponse.data?.draft_order;
    
    if (!completedOrder || !completedOrder.order_id) {
      return NextResponse.json(
        { error: 'Erreur lors de la création de la commande' },
        { status: 500 }
      );
    }

    // Récupérer les détails de la commande finale
    const orderId = completedOrder.order_id.toString();
    const orderName = completedOrder.name || `#${orderId}`;
    
    // Construire l'URL de confirmation
    const orderUrl = `/orders/${orderId}`;

    console.log('✅ Paiement Shop Pay complété avec succès:', { orderId, orderName });

    console.log('✅ Paiement Shop Pay complété avec succès:', { orderId, orderName });

    // Retourner les informations de la commande
    return NextResponse.json({
      success: true,
      orderId: orderId,
      orderName: orderName,
      transactionId: paymentToken, // Le token Shop Pay sert de transaction ID
      orderUrl: orderUrl,
    });

  } catch (error) {
    console.error('❌ Erreur API complétion Shop Pay:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    const transformedError = errorMessage.includes('gid://shopify/')
      ? transformShopifyError(errorMessage, 'ShopPayComplete')
      : errorMessage;

    return NextResponse.json(
      { error: transformedError },
      { status: 500 }
    );
  }
}

