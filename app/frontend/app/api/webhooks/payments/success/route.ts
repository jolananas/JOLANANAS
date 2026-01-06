/**
 * 🍍 JOLANANAS - Webhook Paiement Réussi (Consolidé)
 * ==================================================
 * Traite les notifications de paiement réussi depuis Shopify
 * Convertit le draft order en commande finale
 */

import { NextRequest, NextResponse } from 'next/server';
import { getShopifyAdminClient } from '@/lib/ShopifyAdminClient';
import { ENV } from '@/app/src/lib/env';
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
    const bodyBuffer = await request.arrayBuffer();
    const bodyBytes = Buffer.from(bodyBuffer);
    const body = bodyBytes.toString('utf8');
    const signature = request.headers.get('x-shopify-hmac-sha256');

    if (!signature || !ENV.SHOPIFY_WEBHOOK_SECRET || !validateWebhookHMAC(bodyBytes, signature, ENV.SHOPIFY_WEBHOOK_SECRET)) {
      console.log('❌ Webhook payments/success: Signature invalide');
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const paymentData = JSON.parse(body);
    console.log('💳 Notification paiement reçue:', paymentData);

    await db.webhookEvent.create({
      data: {
        topic: 'payments/success',
        shopifyId: paymentData.id?.toString() || paymentData.draft_order_id?.toString() || 'unknown',
        payload: paymentData,
        status: 'PROCESSING',
      },
    });

    const draftOrderId = paymentData.draft_order_id || paymentData.draft_order?.id;
    
    if (!draftOrderId) {
      console.error('❌ Draft order ID manquant dans la notification');
      return NextResponse.json({ error: 'Draft order ID manquant' }, { status: 400 });
    }

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
      return NextResponse.json({ success: true, message: 'Paiement non réussi, ignoré', status: paymentStatus });
    }

    const adminClient = getShopifyAdminClient();
    const draftOrderResponse = await adminClient.getDraftOrder(draftOrderId.toString());

    if (draftOrderResponse.errors || !draftOrderResponse.data?.draft_order) {
      console.error('❌ Draft order non trouvé:', draftOrderResponse.errors);
      return NextResponse.json({ error: 'Draft order non trouvé' }, { status: 404 });
    }

    const completeResponse = await adminClient.completeDraftOrder(draftOrderId.toString(), {
      payment_gateway: paymentData.gateway || paymentData.payment_gateway,
      payment_status: paymentStatus,
    });

    if (completeResponse.errors) {
      console.error('❌ Erreur finalisation draft order:', completeResponse.errors);
      await db.webhookEvent.updateMany({
        where: { shopifyId: draftOrderId.toString(), topic: 'payments/success' },
        data: { status: 'PROCESSED', processedAt: new Date() },
      });
      return NextResponse.json({ error: 'Erreur lors de la finalisation de la commande' }, { status: 500 });
    }

    await db.webhookEvent.updateMany({
      where: { shopifyId: draftOrderId.toString(), topic: 'payments/success' },
      data: { status: 'PROCESSED', processedAt: new Date() },
    });

    console.log('✅ Paiement traité avec succès:', {
      draftOrderId,
      orderId: completeResponse.data?.draft_order?.order_id,
      paymentStatus,
    });

    return NextResponse.json({
      success: true,
      orderId: completeResponse.data?.draft_order?.order_id,
      paymentStatus,
    });

  } catch (error: unknown) {
    console.error('❌ Erreur webhook payments/success:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
