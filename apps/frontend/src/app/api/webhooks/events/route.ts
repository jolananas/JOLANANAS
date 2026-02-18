import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/webhooks/events
 * Retourne un message indiquant que les webhooks ne sont plus stockés en DB
 * Les logs sont disponibles dans les logs serveur (Vercel, etc.)
 */
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      message: 'Les événements webhooks ne sont plus stockés en base de données locale.',
      info: {
        reason: 'Migration vers architecture sans DB - utilisation de Shopify APIs uniquement',
        logs: 'Les événements webhooks sont loggés dans les logs serveur (Vercel Logs)',
        webhookIdempotency: 'Shopify garantit l\'idempotence des webhooks via shopifyId',
      },
      howToViewLogs: {
        vercel: 'Accédez à Vercel Dashboard → Votre projet → Logs',
        local: 'Consultez les logs de votre terminal ou fichier de logs',
        production: 'Utilisez les outils de monitoring de votre plateforme (Vercel Analytics, etc.)',
      },
      events: [],
      total: 0,
      limit: 0,
      offset: 0,
      hasMore: false,
    });

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des webhooks:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des webhooks' },
      { status: 500 }
    );
  }
}
