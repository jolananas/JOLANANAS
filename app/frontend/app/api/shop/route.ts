/**
 * 🍍 JOLANANAS - Shop Info API Route
 * ===================================
 * Route API pour récupérer les informations de la boutique Shopify
 */

import { NextRequest, NextResponse } from 'next/server';
import { getShopInfo } from '@/app/src/lib/shopify/index';

export const dynamic = 'force-dynamic';

/**
 * GET /api/shop
 * Récupère les informations de la boutique Shopify
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Récupération des informations de la boutique...');
    
    const shopInfo = await getShopInfo();
    
    if (!shopInfo) {
      console.warn('⚠️ Informations de la boutique non disponibles depuis Shopify');
      return NextResponse.json(
        { 
          name: 'JOLANANAS',
          email: null,
          phone: null,
          description: null,
          url: null,
          currencyCode: 'EUR'
        },
        { status: 200 }
      );
    }

    console.log(`✅ Informations de la boutique récupérées: ${shopInfo.name}`);

    return NextResponse.json({
      name: shopInfo.name,
      email: shopInfo.email,
      phone: null, // Le téléphone n'est pas disponible via Storefront API
      description: shopInfo.description,
      url: shopInfo.url,
      currencyCode: shopInfo.currencyCode,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
      },
    });

  } catch (error: unknown) {
    console.error('❌ Erreur serveur shop info:', error);
    
    return NextResponse.json(
      { 
        name: 'JOLANANAS',
        email: null,
        phone: null,
        description: null,
        url: null,
        currencyCode: 'EUR'
      },
      { status: 200 }
    );
  }
}

