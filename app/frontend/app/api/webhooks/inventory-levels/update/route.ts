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
    // Inventory update logic using payload directly
    const inventoryItemId = payload.inventory_item_id;
    const available = payload.available;
    console.log(`[Webhook] Inventory update for item ${inventoryItemId}: ${available}`);

    // TODO: Sync with database

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Webhook] Processing error:', err);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
};
