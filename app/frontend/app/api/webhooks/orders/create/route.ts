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
    // Order creation logic using payload directly
    const orderId = payload.id;
    const email = payload.email;
    console.log(`[Webhook] New order received: ${orderId} from ${email}`);

    // TODO: Sync with database, send emails etc.

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Webhook] Processing error:', err);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
};
