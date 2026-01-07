/**
 * 🍍 JOLANANAS - API Collection par Handle
 * =========================================
 * Route API pour récupérer une collection spécifique par son handle avec ses produits
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCollectionByHandle, getAllProducts } from '@/app/src/lib/shopify/index';

export const dynamic = 'force-dynamic';

/**
 * Formate un handle en titre générique (fallback)
 */
function formatHandleAsTitle(handle: string): string {
  return handle
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * GET /api/collections/[handle]
 * Récupère une collection spécifique par son handle avec ses produits
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  try {
    const { handle } = await params;
    const acceptHeader = request.headers.get('accept');
    const isBrowserRequest = acceptHeader.includes('text/html') && !acceptHeader.includes('application/json');
    
    console.log(`🔄 Récupération de la collection "${handle}" depuis Shopify...`);
    
    const shopifyCollection = await getCollectionByHandle(handle);
    
    if (!shopifyCollection) {
      console.warn(`⚠️ Collection "${handle}" non trouvée dans Shopify`);
      
      if (isBrowserRequest) {
        return NextResponse.redirect(
          new URL(`/collections/${handle}`, request.url),
          { status: 307 }
        );
      }
      return new NextResponse(null, { status: 404 });
    }
    
    const allProducts = await getAllProducts();
    const collectionProducts = allProducts.filter(product => 
      product.collections.includes(handle)
    );
    
    const collection = {
      handle,
      title: shopifyCollection.title || formatHandleAsTitle(handle),
      description: shopifyCollection.description || `Découvrez notre collection ${formatHandleAsTitle(handle)}`,
      image: shopifyCollection.image?.url || null,
      productCount: collectionProducts.length,
      products: collectionProducts,
    };
    
    console.log(`✅ Collection "${handle}" récupérée avec ${collectionProducts.length} produits`);
    
    return NextResponse.json(collection, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });

  } catch (error: unknown) {
    console.error('❌ Erreur serveur collection:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json(
      { 
        error: 'Impossible de récupérer la collection. Veuillez réessayer plus tard.',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS /api/collections/[handle]
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
