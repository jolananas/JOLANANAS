/**
 * 🍍 JOLANANAS - Webhook Commandes Shopify (Consolidé)
 * ====================================================
 * Traitement des nouvelles commandes Shopify
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/src/lib/db';
import { ENV } from '@/app/src/lib/env';
import { validateWebhookHMAC } from '@/app/src/lib/utils/formatters.server';
import { normalizeDataForAPI } from '@/app/src/lib/utils/formatters';

/**
 * POST /api/webhooks/orders/create
 * Traite les nouvelles commandes Shopify
 */
export async function POST(request: NextRequest) {
  try {
    // Lire le body comme Buffer pour éviter les problèmes de caractères Unicode
    const bodyBuffer = await request.arrayBuffer();
    const bodyBytes = Buffer.from(bodyBuffer);
    const bodyRaw = bodyBytes.toString('utf8');
    const signature = request.headers.get('x-shopify-hmac-sha256');

    // Vérification de la signature HMAC
    if (!signature || !ENV.SHOPIFY_WEBHOOK_SECRET || !validateWebhookHMAC(bodyBytes, signature, ENV.SHOPIFY_WEBHOOK_SECRET)) {
      console.log('❌ Webhook orders/create: Signature invalide');
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Normaliser le body pour éliminer les caractères Unicode problématiques
    const body = normalizeDataForAPI(bodyRaw);
    const orderData = normalizeDataForAPI(JSON.parse(body));
    console.log('📦 Nouvelle commande Shopify:', orderData.id);

    // Enregistrer l'événement webhook
    await db.webhookEvent.create({
      data: {
        topic: 'orders/create',
        shopifyId: orderData.id.toString(),
        payload: orderData,
        status: 'PROCESSING',
      },
    });

    // Traitement de la commande
    await processNewOrder(orderData);

    // Marquer comme traité
    await db.webhookEvent.updateMany({
      where: {
        shopifyId: orderData.id.toString(),
        topic: 'orders/create',
      },
      data: {
        status: 'PROCESSED',
        processedAt: new Date(),
      },
    });

    console.log('✅ Commande traitée:', orderData.id);

    return NextResponse.json({ success: true });

  } catch (error: unknown) {
    console.error('❌ Erreur webhook orders/create:', error);
    
    return NextResponse.json(
      { error: 'Erreur traitement commande' },
      { status: 500 }
    );
  }
}

/**
 * Traite une nouvelle commande Shopify
 */
async function processNewOrder(orderData: any) {
  try {
    const {
      id: shopifyOrderId,
      email,
      total_price,
      currency,
      created_at,
      line_items,
      customer,
      shipping_address,
      billing_address,
    } = orderData;

    const shopifyCustomerId = customer?.id?.toString() || null;

    // Détecter la devise à utiliser
    const { getCurrency } = await import('@/lib/currency/currencyService');
    const detectedCurrency = currency || await getCurrency();

    // Créer la commande locale
    const order = await db.order.create({
      data: {
        shopifyOrderId: shopifyOrderId.toString(),
        shopifyCustomerId: shopifyCustomerId, 
        status: 'PAID',
        total: parseFloat(total_price),
        currency: detectedCurrency,
        shippingCost: parseFloat(orderData.shipping_lines?.[0]?.price || '0'),
        taxAmount: parseFloat(orderData.total_tax || '0'),
        createdAt: new Date(created_at),
      },
    });

    // Ajouter les articles de la commande
    for (const lineItem of line_items) {
      await db.orderItem.create({
        data: {
          orderId: order.id,
          productId: lineItem.product_id?.toString(),
          variantId: lineItem.variant_id?.toString(),
          quantity: lineItem.quantity,
          price: parseFloat(lineItem.price),
          title: lineItem.title,
          variantTitle: lineItem.variant_title,
          imageUrl: lineItem.image || null,
        },
      });
    }

    // Adresses
    if (shipping_address) {
      await db.address.create({
        data: {
          orderId: order.id,
          type: 'SHIPPING',
          firstName: shipping_address.first_name,
          lastName: shipping_address.last_name,
          company: shipping_address.company || null,
          address1: shipping_address.address1,
          address2: shipping_address.address2 || null,
          city: shipping_address.city,
          province: shipping_address.province || null,
          country: shipping_address.country,
          zip: shipping_address.zip,
          phone: shipping_address.phone || null,
        },
      }).catch((err) => console.warn('⚠️ Erreur creation adresse livraison:', err));
    }

    if (billing_address) {
      await db.address.create({
        data: {
          orderId: order.id,
          type: 'BILLING',
          firstName: billing_address.first_name,
          lastName: billing_address.last_name,
          company: billing_address.company || null,
          address1: billing_address.address1,
          address2: billing_address.address2 || null,
          city: billing_address.city,
          province: billing_address.province || null,
          country: billing_address.country,
          zip: billing_address.zip,
          phone: billing_address.phone || null,
        },
      }).catch((err) => console.warn('⚠️ Erreur creation adresse facturation:', err));
    }

    console.log('✅ Commande locale créée:', order.id);

  } catch (error: unknown) {
    console.error('❌ Erreur traitement commande:', error);
    throw error;
  }
}
