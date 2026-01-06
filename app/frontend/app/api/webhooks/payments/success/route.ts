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
    // Payment success logic
    const orderId = payload.id;
    // Note: ORDERS_PAID payload is an Order resource
    const financialStatus = payload.financial_status; 
    console.log(`[Webhook] Payment success for order ${orderId}, status: ${financialStatus}`);

    // TODO: Update order status in DB

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Webhook] Processing error:', err);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
};
