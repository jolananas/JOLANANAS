/**
 * 🍍 JOLANANAS - Webhook Inventaire Shopify
 * ==========================================
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
    // Lire le body comme Buffer pour éviter les problèmes de caractères Unicode
    const bodyBuffer = await request.arrayBuffer();
    const bodyBytes = Buffer.from(bodyBuffer);
    const bodyRaw = bodyBytes.toString('utf8');
    const signature = request.headers.get('x-shopify-hmac-sha256');

    // Vérification de la signature HMAC (utiliser directement le Buffer pour éviter les erreurs Unicode)
    if (!signature || !ENV.SHOPIFY_WEBHOOK_SECRET || !validateWebhookHMAC(bodyBytes, signature, ENV.SHOPIFY_WEBHOOK_SECRET)) {
      console.log('❌ Webhook inventory-levels/update: Signature invalide');
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Normaliser le body pour éliminer les caractères Unicode problématiques (tirets cadratins, etc.)
    const body = normalizeDataForAPI(bodyRaw);
    const inventoryData = normalizeDataForAPI(JSON.parse(body));
    console.log('📦 Inventaire mis à jour Shopify:', inventoryData.inventory_item_id);

    // Enregistrer l'événement webhook (utiliser inventoryData déjà normalisé)
    await db.webhookEvent.create({
      data: {
        topic: 'inventory_levels/update',
        shopifyId: inventoryData.inventory_item_id.toString(),
        payload: inventoryData,
        status: 'PROCESSING',
      },
    });

    // Traitement de la mise à jour inventaire
    await updateInventory(inventoryData);

    // Marquer comme traité
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
    
    return NextResponse.json(
      { error: 'Erreur traitement inventaire' },
      { status: 500 }
    );
  }
}

/**
 * Met à jour l'inventaire
 */
async function updateInventory(inventoryData: any) {
  try {
    const { inventory_item_id, location_id, available } = inventoryData;

    // Récupérer les informations du produit via Admin API
    const adminClient = getShopifyAdminClient();
    
    if (!ENV.SHOPIFY_ADMIN_TOKEN) {
      throw new Error('Token Admin Shopify non configuré');
    }

    // Note: Les webhooks Shopify ne fournissent que l'inventory_item_id
    // Pour mettre à jour le cache, il faudrait faire un appel admin pour récupérer les variants
    // Pour l'instant, on log juste l'événement
    
    console.log(`📦 Stock mis à jour - Location: ${location_id}, Available: ${available}`);

    // Si on avait l'ID du produit, on pourrait mettre à jour le cache ainsi :
    /*
    await db.productCache.update({
      where: { shopifyId: productId },
      data: {
        variants: {
          // Mettre à jour la quantité des variants concernés
          // Cette logique dépendrait de la structure des données
        }
      }
    });
    */

  } catch (error: unknown) {
    console.error('❌ Erreur mise à jour inventaire:', error);
    throw error;
  }
}

