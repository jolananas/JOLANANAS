import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { verifyWebhookSignature } from '@/app/src/lib/shopify/verify-webhook';
import { TAGS } from '@/app/src/lib/constants';
import { db } from '@/app/src/lib/db';

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  let webhookEventId: string | null = null;
  
  try {
    const { isValid, topic, error, payload } = await verifyWebhookSignature(req);

    if (!isValid) {
      console.error(`❌ Webhook revalidate: ${error}`);
      return NextResponse.json({ message: error }, { status: 401 });
    }

    // Logique de revalidation basée sur le Topic Shopify
    if (!topic) {
      console.warn('⚠️ Webhook revalidate: Topic manquant');
      return NextResponse.json({ status: 200, message: 'Topic manquant' });
    }

    // Extraire l'ID Shopify du payload pour l'enregistrement
    const shopifyId = payload?.id?.toString() || 
                     payload?.admin_graphql_api_id?.split('/').pop() || 
                     `test-${Date.now()}`;

    // Enregistrer l'événement webhook dans la base de données
    try {
      const webhookEvent = await db.webhookEvent.create({
        data: {
          topic,
          shopifyId,
          payload: JSON.stringify(payload || {}),
          status: 'PROCESSING',
        },
      });
      webhookEventId = webhookEvent.id;
      console.log(`📝 Webhook enregistré dans la DB: ${webhookEventId} (${topic})`);
    } catch (dbError) {
      console.warn('⚠️ Impossible d\'enregistrer le webhook dans la DB:', dbError);
      // Continuer même si l'enregistrement DB échoue
    }

    console.log(`⚡ Webhook reçu: ${topic} (ID: ${shopifyId}). Revalidation en cours...`);

    let revalidatedTag: string | null = null;

    switch (topic) {
      case 'products/create':
      case 'products/update':
      case 'products/delete':
        revalidateTag(TAGS.products);
        revalidatedTag = TAGS.products;
        console.log(`✅ Tag "${TAGS.products}" revalidé pour ${topic}`);
        break;
      case 'collections/create':
      case 'collections/update':
      case 'collections/delete':
        revalidateTag(TAGS.collections);
        revalidatedTag = TAGS.collections;
        console.log(`✅ Tag "${TAGS.collections}" revalidé pour ${topic}`);
        break;
      default:
        console.log(`⚠️ Topic non géré: ${topic}`);
        break;
    }

    // Marquer l'événement comme traité
    if (webhookEventId) {
      try {
        await db.webhookEvent.update({
          where: { id: webhookEventId },
          data: {
            status: 'PROCESSED',
            processedAt: new Date(),
          },
        });
      } catch (dbError) {
        console.warn('⚠️ Impossible de mettre à jour le statut du webhook:', dbError);
      }
    }

    const duration = Date.now() - startTime;
    console.log(`✅ Webhook traité avec succès en ${duration}ms`);

    return NextResponse.json({ 
      status: 200, 
      revalidated: true, 
      topic,
      tag: revalidatedTag,
      webhookEventId,
      duration: `${duration}ms`,
      now: Date.now() 
    });

  } catch (error) {
    console.error('❌ Erreur lors du traitement du webhook:', error);
    
    // Marquer l'événement comme échoué si on a un ID
    if (webhookEventId) {
      try {
        await db.webhookEvent.update({
          where: { id: webhookEventId },
          data: {
            status: 'FAILED',
            processedAt: new Date(),
          },
        });
      } catch (dbError) {
        console.warn('⚠️ Impossible de mettre à jour le statut du webhook:', dbError);
      }
    }

    return NextResponse.json(
      { 
        status: 500, 
        error: 'Erreur lors du traitement du webhook',
        message: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

