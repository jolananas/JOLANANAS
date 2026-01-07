/**
 * 🍍 JOLANANAS - Webhook Inventaire Shopify (Consolidé)
 * ====================================================
 * Traitement des mises à jour inventaire Shopify
 * Plus de stockage DB - utilise uniquement les logs serveur
 */

import { NextRequest, NextResponse } from 'next/server';
import { ENV } from '@/app/src/lib/env';
import { getShopifyAdminClient } from '@/lib/ShopifyAdminClient';
import { validateWebhookHMAC } from '@/app/src/lib/utils/formatters.server';
import { normalizeDataForAPI } from '@/app/src/lib/utils/formatters';
import { revalidateTag } from 'next/cache';
import { TAGS } from '@/app/src/lib/constants';

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
    console.log('📦 Inventaire mis à jour Shopify:', {
      inventory_item_id: inventoryData.inventory_item_id,
      location_id: inventoryData.location_id,
      available: inventoryData.available,
      timestamp: new Date().toISOString(),
    });

    // Invalider le cache Next.js ISR pour les produits affectés
    // Note: On invalide le tag 'products' pour forcer la régénération
    try {
      revalidateTag(TAGS.PRODUCTS);
      console.log('✅ Cache produits invalidé via ISR');
    } catch (cacheError) {
      console.warn('⚠️ Erreur invalidation cache ISR:', cacheError);
    }

    await updateInventory(inventoryData);

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
    // Note: Le stock est déjà mis à jour dans Shopify
    // Cette fonction peut être utilisée pour des actions supplémentaires (notifications, etc.)
  } catch (error: unknown) {
    console.error('❌ Erreur mise à jour inventaire:', error);
    throw error;
  }
}
