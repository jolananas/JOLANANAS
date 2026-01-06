/**
 * 🍍 JOLANANAS - Webhook Produits Shopify
 * =======================================
 * Traitement des mises à jour produits Shopify
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/src/lib/db';
import { ENV } from '@/app/src/lib/env';
import { validateWebhookHMAC } from '@/app/src/lib/utils/formatters.server';
import { normalizeDataForAPI } from '@/app/src/lib/utils/formatters';

/**
 * POST /api/webhooks/products/update
 * Traite les mises à jour produits Shopify
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
      console.log('❌ Webhook products/update: Signature invalide');
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Normaliser le body pour éliminer les caractères Unicode problématiques (tirets cadratins, etc.)
    const body = normalizeDataForAPI(bodyRaw);
    const productData = normalizeDataForAPI(JSON.parse(body));
    console.log('📦 Produit mis à jour Shopify:', productData.id);

    // Enregistrer l'événement webhook (utiliser productData déjà normalisé)
    await db.webhookEvent.create({
      data: {
        topic: 'products/update',
        shopifyId: productData.id.toString(),
        payload: productData,
        status: 'PROCESSING',
      },
    });

    // Traitement de la mise à jour produit
    await updateProductCache(productData);

    // Marquer comme traité
    await db.webhookEvent.updateMany({
      where: {
        shopifyId: productData.id.toString(),
        topic: 'products/update',
      },
      data: {
        status: 'PROCESSED',
        processedAt: new Date(),
      },
    });

    console.log('✅ Produit mis à jour:', productData.id);

    return NextResponse.json({ success: true });

  } catch (error: unknown) {
    console.error('❌ Erreur webhook products/update:', error);
    
    return NextResponse.json(
      { error: 'Erreur traitement produit' },
      { status: 500 }
    );
  }
}

/**
 * Met à jour le cache du produit
 */
async function updateProductCache(productData: any) {
  try {
    const {
      id: shopifyId,
      handle,
      title,
      body_html: description,
      vendor,
      product_type: productType,
      tags,
      images,
      variants,
      created_at: createdAt,
      updated_at: updatedAt,
    } = productData;

    // Préparer les données des images
    const imageUrls = images?.map((img: any) => ({
      id: img.id?.toString(),
      url: img.src,
      alt: img.alt || title,
      width: img.width,
      height: img.height,
    })) || [];

    // Préparer les données des variants
    const variantsData = variants?.map((variant: any) => ({
      id: variant.id?.toString(),
      title: variant.title,
      price: variant.price,
      compareAtPrice: variant.compare_at_price,
      inventoryQuantity: variant.inventory_quantity,
      available: variant.inventory_quantity > 0,
      selectedOptions: variant.selected_options || [],
    })) || [];

    // Préparer la fourchette de prix
    const priceMin = variantsData.length > 0 
      ? Math.min(...variantsData.map(v => parseFloat(v.price || '0')))
      : 0;
    const priceMax = variantsData.length > 0 
      ? Math.max(...variantsData.map(v => parseFloat(v.price || '0')))
      : 0;

    const priceRange = priceMin === priceMax 
      ? { min: priceMin, max: priceMax }
      : { min: priceMin, max: priceMax };

    // Mettre à jour ou créer le cache produit
    await db.productCache.upsert({
      where: { shopifyId: shopifyId.toString() },
      create: {
        shopifyId: shopifyId.toString(),
        handle,
        title,
        description: description,
        vendor: vendor,
        productType: productType,
        tags: tags,
        images: imageUrls,
        variants: variantsData,
        priceRange,
        createdAt: new Date(createdAt),
      },
      update: {
        handle,
        title,
        description: description,
        vendor: vendor,
        productType: productType,
        tags: tags,
        images: imageUrls,
        variants: variantsData,
        priceRange,
        updatedAt: new Date(updatedAt),
      },
    });

    console.log(`✅ Cache produit mis à jour: ${title} (${shopifyId})`);

  } catch (error: unknown) {
    console.error('❌ Erreur mise à jour cache produit:', error);
    throw error;
  }
}

