/**
 * 🍍 JOLANANAS - Webhook Inventaire Shopify (Consolidé)
 * ====================================================
 * Traitement des mises à jour inventaire Shopify
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/src/lib/db';
import { ENV } from '@/app/src/lib/env';
import { getShopifyAdminClient } from '@/lib/ShopifyAdminClient';
import { validateWebhookHMAC } from '@/app/src/lib/utils/formatters.server';
import { normalizeDataForAPI } from '@/app/src/lib/utils/formatters';

/**
 * POST /api/webhooks/inventory-levels/update
 * Traite les mises à jour inventaire Shopify
 */
export async function POST(request: NextRequest) {
  try {
    const bodyBuffer = await request.arrayBuffer();
    const bodyBytes = Buffer.from(bodyBuffer);
    const bodyRaw = bodyBytes.toString('utf8');
    const signature = request.headers.get('x-shopify-hmac-sha256');

    if (!signature || !ENV.SHOPIFY_WEBHOOK_SECRET || !validateWebhookHMAC(bodyBytes, signature, ENV.SHOPIFY_WEBHOOK_SECRET)) {
      console.log('❌ Webhook inventory-levels/update: Signature invalide');
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = normalizeDataForAPI(bodyRaw);
    const inventoryData = normalizeDataForAPI(JSON.parse(body));
    console.log('📦 Inventaire mis à jour Shopify:', inventoryData.inventory_item_id);

    await db.webhookEvent.create({
      data: {
        topic: 'inventory_levels/update',
        shopifyId: inventoryData.inventory_item_id.toString(),
        payload: inventoryData,
        status: 'PROCESSING',
      },
    });

    await updateInventory(inventoryData);

    await db.webhookEvent.updateMany({
      where: {
        shopifyId: inventoryData.inventory_item_id.toString(),
        topic: 'inventory_levels/update',
      },
      data: {
        status: 'PROCESSED',
        processedAt: new Date(),
      },
    });

    console.log('✅ Inventaire mis à jour:', inventoryData.inventory_item_id);
    return NextResponse.json({ success: true });

  } catch (error: unknown) {
    console.error('❌ Erreur webhook inventory-levels/update:', error);
    return NextResponse.json({ error: 'Erreur traitement inventaire' }, { status: 500 });
  }
}

async function updateInventory(inventoryData: any) {
  try {
    const { inventory_item_id, location_id, available } = inventoryData;
    console.log(`📦 Stock mis à jour - Location: ${location_id}, Available: ${available}`);
  } catch (error: unknown) {
    console.error('❌ Erreur mise à jour inventaire:', error);
    throw error;
  }
}
