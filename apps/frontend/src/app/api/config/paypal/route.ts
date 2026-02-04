/**
 * 🍍 JOLANANAS - PayPal Configuration API
 * =======================================
 * Route API pour exposer le client ID PayPal de manière sécurisée
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/config/paypal
 */
export async function GET(request: NextRequest) {
  try {
    const paypalClientId = process.env.PAYPAL_CLIENT_ID;

    if (!paypalClientId) {
      return NextResponse.json(
        {
          clientId: null,
          configured: false,
          environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        clientId: paypalClientId,
        configured: true,
        environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    );
  } catch (error: unknown) {
    console.error('❌ Erreur serveur récupération config PayPal:', error);
    const message = error instanceof Error ? error.message : 'Erreur serveur';
    return NextResponse.json({ error: message, clientId: null, configured: false, traceId: `paypal-config-${Date.now()}` }, { status: 500 });
  }
}
