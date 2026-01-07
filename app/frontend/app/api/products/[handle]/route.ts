/**
 * 🍍 JOLANANAS - API Produit par Handle
 * =====================================
 * Route API pour récupérer un produit spécifique par son handle
 */

import { NextRequest, NextResponse } from 'next/server';
import { getProductByHandle, getAllProducts } from '@/app/src/lib/shopify/index';

export const dynamic = 'force-dynamic';

/**
 * GET /api/products/[handle]
 * Récupère un produit spécifique par son handle
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  try {
    const { handle } = await params;
    
    // Décoder explicitement le handle pour gérer les emojis et caractères spéciaux
    // Next.js décode déjà les paramètres, mais on s'assure que c'est bien décodé
    const decodedHandle = decodeURIComponent(handle);
    
    console.log(`🔄 Récupération du produit "${decodedHandle}" depuis Shopify...`);
    console.log(`📝 Handle original (encodé): "${handle}"`);
    console.log(`📝 Handle décodé: "${decodedHandle}"`);
    
    // Récupérer le produit depuis Shopify avec le handle décodé
    let product = await getProductByHandle(decodedHandle);
    
    // Si le produit n'est pas trouvé avec le handle décodé, essayer avec le handle encodé
    // (au cas où Shopify le stocke différemment)
    if (!product && handle !== decodedHandle) {
      console.log(`🔄 Tentative avec le handle encodé: "${handle}"`);
      product = await getProductByHandle(handle);
      if (product) {
        console.log(`✅ Produit trouvé avec le handle encodé`);
      }
    }
    
    if (!product) {
      console.warn(`⚠️ Produit "${decodedHandle}" non trouvé dans Shopify`);
      return NextResponse.json(
        { 
          error: 'Produit non trouvé',
          message: `Le produit avec le handle "${decodedHandle}" n'existe pas.`
        },
        { status: 404 }
      );
    }
    
    // Récupérer les produits associés
    const allProducts = await getAllProducts();
    const relatedProducts = allProducts
      .filter(
        (p) =>
          p.id !== product.id &&
          (p.tags.some((tag) => product.tags.includes(tag)) ||
            p.collections.some((col) => product.collections.includes(col))),
      )
      .slice(0, 4);
    
    console.log(`✅ Produit "${handle}" récupéré avec succès`);
    
    return NextResponse.json(
      {
        product,
        relatedProducts,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );

  } catch (error: unknown) {
    console.error('❌ Erreur serveur produit:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    
    return NextResponse.json(
      { 
        error: 'Impossible de récupérer le produit. Veuillez réessayer plus tard.',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS /api/products/[handle]
 * Gestion des requêtes CORS preflight
 */
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
