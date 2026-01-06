/**
 * 🍍 JOLANANAS - API Route pour la Gestion des Devises
 * =====================================================
 * Endpoint API pour récupérer les informations de devises
 * Support des headers Accept-Language pour détection automatique
 */

import { NextRequest, NextResponse } from 'next/server';
import { currencyService } from '@/lib/currency/currencyService';
import type { CurrencyServiceState } from '@/lib/currency/types';

export const dynamic = 'force-dynamic';

/**
 * GET /api/currency
 * Récupère les informations de devises avec détection automatique
 * 
 * Headers supportés:
 * - Accept-Language: Pour détection de la locale (ex: "fr-FR,fr;q=0.9,en;q=0.8")
 * 
 * Query params:
 * - shopifyCurrencyCode: Code de devise depuis réponse Shopify (priorité)
 */
export async function GET(request: NextRequest) {
  try {
    // Extraire le header Accept-Language
    const acceptLanguage = request.headers.get('accept-language') || undefined;
    
    // Extraire le currencyCode depuis les query params si fourni
    const { searchParams } = new URL(request.url);
    const shopifyCurrencyCode = searchParams.get('shopifyCurrencyCode') || undefined;

    // Récupérer l'état complet du service
    const state: CurrencyServiceState = await currencyService.getState();

    // Détecter la devise à utiliser
    const detectedCurrency = await currencyService.getCurrency(
      shopifyCurrencyCode,
      acceptLanguage
    );

    // Récupérer les devises disponibles
    const availableCurrencies = await currencyService.getAvailableCurrencies();

    return NextResponse.json(
      {
        currency: detectedCurrency,
        shopCurrency: state.shopCurrency,
        availableCurrencies: availableCurrencies.map((c) => ({
          code: c.code,
          name: c.name,
          symbol: c.symbol,
          rate: c.rate,
          rateUpdatedAt: c.rateUpdatedAt?.toISOString(),
        })),
        isMultiCurrencyEnabled: state.isMultiCurrencyEnabled,
        detectedFrom: shopifyCurrencyCode ? 'shopify-response' : 
                     acceptLanguage ? 'browser' : 'shop-default',
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
        },
      }
    );
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des devises:', error);
    
    // Fallback vers devise par défaut
    const shopCurrency = await currencyService.getShopCurrency();
    
    return NextResponse.json(
      {
        currency: shopCurrency,
        shopCurrency: shopCurrency,
        availableCurrencies: [],
        isMultiCurrencyEnabled: false,
        detectedFrom: 'fallback',
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 200 } // Retourner 200 même en cas d'erreur pour ne pas bloquer l'UI
    );
  }
}

/**
 * POST /api/currency
 * Sauvegarde la préférence de devise de l'utilisateur
 * 
 * Body: { currency: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { currency } = body;

    if (!currency || typeof currency !== 'string') {
      return NextResponse.json(
        { error: 'Le champ "currency" est requis et doit être une chaîne' },
        { status: 400 }
      );
    }

    // Sauvegarder la préférence
    currencyService.saveUserCurrencyPreference(currency);

    return NextResponse.json({
      success: true,
      currency,
      message: 'Préférence de devise sauvegardée',
    });
  } catch (error) {
    console.error('❌ Erreur lors de la sauvegarde de la préférence de devise:', error);
    
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Erreur lors de la sauvegarde',
      },
      { status: 500 }
    );
  }
}







