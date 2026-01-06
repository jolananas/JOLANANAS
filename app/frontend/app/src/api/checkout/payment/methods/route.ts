/**
 * 🍍 JOLANANAS - API Méthodes de Paiement Disponibles
 * ====================================================
 * Retourne les méthodes de paiement disponibles (Shop Pay, PayPal, etc.)
 */

import { NextRequest, NextResponse } from 'next/server';
import { ENV } from '@/lib/env';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/checkout/payment/methods
 * Retourne les méthodes de paiement disponibles
 */
export async function GET(request: NextRequest) {
  try {
    // Pour l'instant, retourner les méthodes par défaut
    // Dans une implémentation complète, on pourrait vérifier la configuration Shopify
    // via l'Admin API pour voir quels payment gateways sont activés
    
    const paymentMethods = [
      {
        id: 'shop_pay',
        name: 'Shop Pay',
        description: 'Paiement rapide et sécurisé avec Shop Pay',
        available: true,
        icon: 'shop-pay',
      },
      {
        id: 'paypal',
        name: 'PayPal',
        description: 'Payer avec votre compte PayPal',
        available: true,
        icon: 'paypal',
      },
    ];

    return NextResponse.json({
      methods: paymentMethods,
      storefrontToken: ENV.SHOPIFY_STOREFRONT_TOKEN ? 'configured' : 'not_configured',
      storeDomain: ENV.SHOPIFY_STORE_DOMAIN,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });

  } catch (error: unknown) {
    console.error('❌ Erreur serveur récupération méthodes de paiement:', error);
    
    const message = error instanceof Error ? error.message : 'Erreur serveur';
    
    return NextResponse.json(
      { 
        error: message,
        traceId: `payment-methods-${Date.now()}`
      },
      { status: 500 }
    );
  }
}

