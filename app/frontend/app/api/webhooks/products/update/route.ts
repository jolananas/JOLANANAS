/**
 * 🍍 JOLANANAS - Webhook Produits Shopify
 * ==================================================
 * Traitement des mises à jour produits Shopify
 * Utilise uniquement Next.js ISR pour le cache - plus de base de données locale
 */

import { NextRequest, NextResponse } from 'next/server';
import { ENV } from '@/app/src/lib/env';
import { validateWebhookHMAC } from '@/app/src/lib/utils/formatters.server';
import { normalizeDataForAPI } from '@/app/src/lib/utils/formatters';
import { revalidateTag } from 'next/cache';

/**
 * POST /api/webhooks/products/update
 * Traite les mises à jour produits Shopify
 * 
 * Note: Les produits sont déjà dans Shopify.
 * Ce webhook sert uniquement à invalider le cache Next.js ISR.
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
    
    const productId = productData.id;
    const productHandle = productData.handle;
    const productTitle = productData.title;
    
    console.log('📦 Produit mis à jour Shopify:', {
      id: productId,
      handle: productHandle,
      title: productTitle,
    });

    // Invalider le cache Next.js ISR pour ce produit et la liste des produits
    try {
      // Invalider le tag 'products' pour la liste des produits
      revalidateTag('products');
      
      // Invalider le tag spécifique du produit si disponible
      if (productHandle) {
        revalidateTag(`product-${productHandle}`);
      }
      
      // Invalider aussi par ID si nécessaire
      if (productId) {
        revalidateTag(`product-${productId}`);
      }
      
      console.log('✅ Cache ISR invalidé pour le produit:', productHandle || productId);
    } catch (revalidateError) {
      console.warn('⚠️ Erreur lors de la revalidation ISR (non bloquant):', revalidateError);
      // Ne pas bloquer le webhook si la revalidation échoue
    }

    // Logger l'événement pour analytics
    console.log('📊 Produit mis à jour:', {
      shopifyId: productId?.toString(),
      handle: productHandle,
      title: productTitle,
      updatedAt: productData.updated_at || new Date().toISOString(),
    });

    // TODO: Actions optionnelles à implémenter selon les besoins :
    // - Envoyer une notification si le produit est en rupture de stock
    // - Mettre à jour des métriques analytics
    // - Synchroniser avec des systèmes externes (inventaire, marketing, etc.)

    console.log('✅ Produit traité:', productId);
    return NextResponse.json({ 
      success: true,
      message: 'Webhook traité avec succès',
      productId: productId?.toString(),
    });

  } catch (error: unknown) {
    console.error('❌ Erreur webhook products/update:', error);
    return NextResponse.json(
      { 
        error: 'Erreur traitement produit',
        message: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}
