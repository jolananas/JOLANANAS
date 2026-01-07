import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { verifyWebhookSignature } from '@/app/src/lib/shopify/verify-webhook';
import { TAGS } from '@/app/src/lib/constants';

export async function POST(req: NextRequest) {
  const { isValid, topic, error } = await verifyWebhookSignature(req);

  if (!isValid) {
    return NextResponse.json({ message: error }, { status: 401 });
  }

  // Logique de revalidation basée sur le Topic Shopify
  if (!topic) return NextResponse.json({ status: 200 });

  console.log(`⚡ Webhook reçu: ${topic}. Revalidation en cours...`);

  switch (topic) {
    case 'products/create':
    case 'products/update':
    case 'products/delete':
      revalidateTag(TAGS.products);
      console.log(`✅ Tag "${TAGS.products}" revalidé`);
      break;
    case 'collections/create':
    case 'collections/update':
    case 'collections/delete':
      revalidateTag(TAGS.collections);
      console.log(`✅ Tag "${TAGS.collections}" revalidé`);
      break;
    default:
      // Optionnel : ne rien faire ou revalider globalement
      console.log(`⚠️ Topic non géré: ${topic}`);
      break;
  }

  return NextResponse.json({ status: 200, revalidated: true, now: Date.now() });
}

