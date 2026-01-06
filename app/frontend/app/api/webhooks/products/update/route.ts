import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/shopify/verify-webhook';

export const POST = async (req: NextRequest) => {
  const { isValid, topic, domain, payload, error } = await verifyWebhookSignature(req);

  if (!isValid) {
    console.error(`[Webhook] Access denied: ${error}`);
    return NextResponse.json({ message: 'Forbidden' }, { status: 401 });
  }

  console.log(`[Webhook] Received: ${topic} from ${domain}`);

  try {
    // Product update logic
    const productId = payload.id;
    const title = payload.title;
    console.log(`[Webhook] Product updated: ${productId} (${title})`);

    // TODO: Update local product cache/DB

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Webhook] Processing error:', err);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
};
