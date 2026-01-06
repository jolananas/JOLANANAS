/**
 * 🍍 JOLANANAS - Webhook Produits Shopify (Consolidé)
 * ==================================================
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
    const bodyBuffer = await request.arrayBuffer();
    const bodyBytes = Buffer.from(bodyBuffer);
    const bodyRaw = bodyBytes.toString('utf8');
    const signature = request.headers.get('x-shopify-hmac-sha256');

    if (!signature || !ENV.SHOPIFY_WEBHOOK_SECRET || !validateWebhookHMAC(bodyBytes, signature, ENV.SHOPIFY_WEBHOOK_SECRET)) {
      console.log('❌ Webhook products/update: Signature invalide');
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = normalizeDataForAPI(bodyRaw);
    const productData = normalizeDataForAPI(JSON.parse(body));
    console.log('📦 Produit mis à jour Shopify:', productData.id);

    await db.webhookEvent.create({
      data: {
        topic: 'products/update',
        shopifyId: productData.id.toString(),
        payload: productData,
        status: 'PROCESSING',
      },
    });

    await updateProductCache(productData);

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
    return NextResponse.json({ error: 'Erreur traitement produit' }, { status: 500 });
  }
}

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

    const imageUrls = images?.map((img: any) => ({
      id: img.id?.toString(),
      url: img.src,
      alt: img.alt || title,
      width: img.width,
      height: img.height,
    })) || [];

    const variantsData = variants?.map((variant: any) => ({
      id: variant.id?.toString(),
      title: variant.title,
      price: variant.price,
      compareAtPrice: variant.compare_at_price,
      inventoryQuantity: variant.inventory_quantity,
      available: variant.inventory_quantity > 0,
      selectedOptions: variant.selected_options || [],
    })) || [];

    const prices = variantsData.map((v: any) => parseFloat(v.price || '0'));
    const priceMin = prices.length > 0 ? Math.min(...prices) : 0;
    const priceMax = prices.length > 0 ? Math.max(...prices) : 0;

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
        priceRange: { min: priceMin, max: priceMax },
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
        priceRange: { min: priceMin, max: priceMax },
        updatedAt: new Date(updatedAt),
      },
    });

    console.log(`✅ Cache produit mis à jour: ${title} (${shopifyId})`);
  } catch (error: unknown) {
    console.error('❌ Erreur mise à jour cache produit:', error);
    throw error;
  }
}
