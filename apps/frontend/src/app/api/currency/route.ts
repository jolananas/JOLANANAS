/**
 * 🍍 JOLANANAS - API Route pour la Gestion des Devises
 * =====================================================
 * Endpoint API pour récupérer les informations de devises
 */

import { NextRequest, NextResponse } from 'next/server';
import { currencyService } from '@/lib/currency/currencyService';
import type { CurrencyServiceState } from '@/lib/currency/types';

export const dynamic = 'force-dynamic';

/**
 * GET /api/currency
 */
export async function GET(request: NextRequest) {
  try {
    const acceptLanguage = request.headers.get('accept-language') || undefined;
    const cfIpCountry = request.headers.get('CF-IPCountry') || request.headers.get('x-vercel-ip-country') || undefined;
    
    const { searchParams } = new URL(request.url);
    const shopifyCurrencyCode = searchParams.get('shopifyCurrencyCode') || undefined;

    const state: CurrencyServiceState = await currencyService.getState();
    
    // Pass country code to getCurrency (need to update currencyService signature or just use util here?)
    // Using the util directly here for the specific priority if needed, BUT currencyService has detectUserCurrency logic.
    // Let's check currencyService again. It has detectCurrencyFromGeolocation but that uses locale.
    // Better to update currencyService to accept countryCode or pass it as "acceptLanguage" fallback? No.
    // Let's pass it as a separate argument to getCurrency/detectUserCurrency.

    const detectedCurrency = await currencyService.getCurrency(shopifyCurrencyCode, acceptLanguage, cfIpCountry);
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
      { status: 200 }
    );
  }
}

/**
 * POST /api/currency
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { currency } = body;

    if (!currency || typeof currency !== 'string') {
      return NextResponse.json({ error: 'Le champ "currency" est requis' }, { status: 400 });
    }

    currencyService.saveUserCurrencyPreference(currency);

    return NextResponse.json({
      success: true,
      currency,
      message: 'Préférence de devise sauvegardée',
    });
  } catch (error) {
    console.error('❌ Erreur lors de la sauvegarde de la préférence de devise:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Erreur' }, { status: 500 });
  }
}
