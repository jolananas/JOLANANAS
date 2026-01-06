/**
 * 🍍 JOLANANAS - Webhook Paiement Réussi
 * =======================================
 * Traite les notifications de paiement réussi depuis Shopify
 * Convertit le draft order en commande finale
 */

import { NextRequest, NextResponse } from 'next/server';
import { getShopifyAdminClient } from '@/lib/ShopifyAdminClient';
import { ENV } from '@/lib/env';
import { validateWebhookHMAC } from '@/lib/utils/formatters.server';
import { db } from '@/app/src/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/webhooks/payments/success
 * Traite les notifications de paiement réussi
 */
export async function POST(request: NextRequest) {
  try {
    // Lire le body comme Buffer pour éviter les problèmes de caractères Unicode
    const bodyBuffer = await request.arrayBuffer();
    const bodyBytes = Buffer.from(bodyBuffer);
    const body = bodyBytes.toString('utf8');
    const signature = request.headers.get('x-shopify-hmac-sha256');

    // Vérification de la signature HMAC
    if (!signature || !ENV.SHOPIFY_WEBHOOK_SECRET || !validateWebhookHMAC(bodyBytes, signature, ENV.SHOPIFY_WEBHOOK_SECRET)) {
      console.log('❌ Webhook payments/success: Signature invalide');
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const paymentData = JSON.parse(body);
    console.log('💳 Notification paiement reçue:', paymentData);

    // Enregistrer l'événement webhook
    await db.webhookEvent.create({
      data: {
        topic: 'payments/success',
        shopifyId: paymentData.id?.toString() || paymentData.draft_order_id?.toString() || 'unknown',
        payload: paymentData,
        status: 'PROCESSING',
      },
    });

    // Extraire l'ID du draft order
    const draftOrderId = paymentData.draft_order_id || paymentData.draft_order?.id;
    
    if (!draftOrderId) {
      console.error('❌ Draft order ID manquant dans la notification');
      return NextResponse.json(
        { error: 'Draft order ID manquant' },
        { status: 400 }
      );
    }

    // Vérifier le statut du paiement
    const paymentStatus = paymentData.status || paymentData.financial_status || 'paid';
    
    if (paymentStatus !== 'paid' && paymentStatus !== 'pending') {
      console.log('⚠️ Paiement non réussi:', paymentStatus);
      await db.webhookEvent.updateMany({
        where: {
          shopifyId: paymentData.id?.toString() || draftOrderId.toString(),
          topic: 'payments/success',
        },
        data: {
          status: 'PROCESSED',
          processedAt: new Date(),
        },
      });
      return NextResponse.json({ 
        success: true, 
        message: 'Paiement non réussi, ignoré',
        status: paymentStatus 
      });
    }

    // Récupérer le draft order
    const adminClient = getShopifyAdminClient();
    const draftOrderResponse = await adminClient.getDraftOrder(draftOrderId.toString());

    if (draftOrderResponse.errors || !draftOrderResponse.data?.draft_order) {
      console.error('❌ Draft order non trouvé:', draftOrderResponse.errors);
      return NextResponse.json(
        { error: 'Draft order non trouvé' },
        { status: 404 }
      );
    }

    const draftOrder = draftOrderResponse.data.draft_order;

    // Convertir le draft order en commande finale
    const completeResponse = await adminClient.completeDraftOrder(draftOrderId.toString(), {
      payment_gateway: paymentData.gateway || paymentData.payment_gateway,
      payment_status: paymentStatus,
    });

    if (completeResponse.errors) {
      console.error('❌ Erreur finalisation draft order:', completeResponse.errors);
      
      // Marquer comme traité avec erreur
      await db.webhookEvent.updateMany({
        where: {
          shopifyId: draftOrderId.toString(),
          topic: 'payments/success',
        },
        data: {
          status: 'PROCESSED',
          processedAt: new Date(),
        },
      });

      return NextResponse.json(
        { error: 'Erreur lors de la finalisation de la commande' },
        { status: 500 }
      );
    }

    // Récupérer la commande finale créée
    let finalOrder = null;
    if (completeResponse.data?.draft_order?.order_id) {
      const orderResponse = await adminClient.getOrder(completeResponse.data.draft_order.order_id.toString());
      if (orderResponse.data?.order) {
        finalOrder = orderResponse.data.order;
      }
    }

    // Le webhook orders/create existant va traiter la création de la commande en base
    // On marque juste cet événement comme traité
    await db.webhookEvent.updateMany({
      where: {
        shopifyId: draftOrderId.toString(),
        topic: 'payments/success',
      },
      data: {
        status: 'PROCESSED',
        processedAt: new Date(),
      },
    });

    console.log('✅ Paiement traité avec succès:', {
      draftOrderId,
      orderId: finalOrder?.id || completeResponse.data?.draft_order?.order_id,
      paymentStatus,
    });

    return NextResponse.json({
      success: true,
      orderId: finalOrder?.id || completeResponse.data?.draft_order?.order_id,
      paymentStatus,
    });

  } catch (error: unknown) {
    console.error('❌ Erreur webhook payments/success:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Erreur serveur',
        traceId: `payments-success-${Date.now()}`
      },
      { status: 500 }
    );
  }
}

