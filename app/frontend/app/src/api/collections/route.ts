/**
 * 🍍 JOLANANAS - API Collections
 * ==============================
 * Route API pour récupérer la liste des collections
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAllProducts, getAllCollections } from '@/app/src/lib/shopify/index';

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
 * GET /api/collections
 * Récupère la liste de toutes les collections
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Récupération des collections...');
    
    // Récupérer les collections réelles depuis Shopify
    const shopifyCollections = await getAllCollections();
    
    // Récupérer tous les produits pour compter les produits par collection
    const products = await getAllProducts();
    
    // Créer un Map pour accéder rapidement aux collections Shopify par handle
    const collectionsMap = new Map(
      shopifyCollections.map(collection => [collection.handle, collection])
    );
    
    // Extraire toutes les collections uniques depuis les produits
    const collectionsSet = new Set<string>();
    products.forEach(product => {
      product.collections.forEach(collection => {
        collectionsSet.add(collection);
      });
    });

    // Créer la liste des collections avec métadonnées réelles
    const collections = Array.from(collectionsSet).map(handle => {
      const collectionProducts = products.filter(p => p.collections.includes(handle));
      const shopifyCollection = collectionsMap.get(handle);
      
      return {
        handle,
        title: shopifyCollection?.title || formatHandleAsTitle(handle),
        description: shopifyCollection?.description || `Découvrez notre collection ${formatHandleAsTitle(handle)}`,
        productCount: collectionProducts.length,
        image: collectionProducts[0]?.images[0] || shopifyCollection?.image?.url || '/app/src/public/assets/images/collections/placeholder.svg'
      };
    });
    
    console.log(`✅ ${collections.length} collections récupérées`);

    return NextResponse.json(collections, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });

  } catch (error: unknown) {
    console.error('❌ Erreur serveur collections:', error);
    
    // En cas d'erreur, retourner un tableau vide (pas de données mockées)
    return NextResponse.json([], {
      status: 500,
      headers: {
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }
}

/**
 * OPTIONS /api/collections
 * Gestion des requêtes CORS preflight
 */
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
