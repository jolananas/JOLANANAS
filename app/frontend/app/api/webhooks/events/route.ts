import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/src/lib/db';

/**
 * GET /api/webhooks/events
 * Récupère la liste des événements webhooks enregistrés
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const topic = searchParams.get('topic');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Construire les filtres
    const where: any = {};
    if (topic) {
      where.topic = topic;
    }
    if (status) {
      where.status = status;
    }

    // Récupérer les événements
    const [events, total] = await Promise.all([
      db.webhookEvent.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      db.webhookEvent.count({ where }),
    ]);

    // Parser les payloads JSON
    const eventsWithParsedPayload = events.map(event => ({
      ...event,
      payload: typeof event.payload === 'string' 
        ? JSON.parse(event.payload) 
        : event.payload,
    }));

    return NextResponse.json({
      events: eventsWithParsedPayload,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    });

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des webhooks:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des webhooks' },
      { status: 500 }
    );
  }
}

