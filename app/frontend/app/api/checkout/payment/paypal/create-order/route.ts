/**
 * 🍍 JOLANANAS - API Création Ordre PayPal
 * ==========================================
 * Crée un ordre PayPal côté serveur
 */

import { NextRequest, NextResponse } from 'next/server';
import { getShopifyAdminClient } from '@/lib/ShopifyAdminClient';
import { ENV } from '@/app/src/lib/env';
import { normalizeDataForAPI } from '@/app/src/lib/utils/formatters';
import { getCurrency } from '@/lib/currency/currencyService';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface CreatePayPalOrderData {
  checkoutId: string;
  amount: number;
  currency?: string;
}

interface PayPalAccessTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface PayPalOrderResponse {
  id: string;
  status: string;
}

async function getPayPalAccessToken(): Promise<string> {
  const paypalClientId = process.env.PAYPAL_CLIENT_ID;
  const paypalSecret = process.env.PAYPAL_SECRET;

  if (!paypalClientId || !paypalSecret) {
    throw new Error('PAYPAL_CLIENT_ID et PAYPAL_SECRET doivent être configurés');
  }

  const isProduction = ENV.NODE_ENV === 'production';
  const baseUrl = isProduction ? 'https://api.paypal.com' : 'https://api.sandbox.paypal.com';
  const authUrl = `${baseUrl}/v1/oauth2/token`;
  const credentials = Buffer.from(`${paypalClientId}:${paypalSecret}`).toString('base64');

  const response = await fetch(authUrl, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Accept-Language': 'en_US',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${credentials}`,
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    throw new Error(`Erreur authentification PayPal: ${response.status}`);
  }

  const data: PayPalAccessTokenResponse = await response.json();
  return data.access_token;
}

async function createPayPalOrder(
  accessToken: string,
  amount: number,
  currency: string,
  checkoutId: string
): Promise<string> {
  const isProduction = ENV.NODE_ENV === 'production';
  const baseUrl = isProduction ? 'https://api.paypal.com' : 'https://api.sandbox.paypal.com';
  const ordersUrl = `${baseUrl}/v2/checkout/orders`;

  const orderData = {
    intent: 'CAPTURE',
    purchase_units: [
      {
        reference_id: checkoutId,
        description: `Commande JOLANANAS - ${checkoutId}`,
        custom_id: checkoutId,
        amount: {
          currency_code: currency,
          value: amount.toFixed(2),
        },
      },
    ],
    application_context: {
      brand_name: 'JOLANANAS',
      landing_page: 'BILLING',
      user_action: 'PAY_NOW',
      return_url: `${process.env.DOMAIN_URL || process.env.NEXTAUTH_URL || 'http://localhost:4647'}/checkout/success`,
      cancel_url: `${process.env.DOMAIN_URL || process.env.NEXTAUTH_URL || 'http://localhost:4647'}/checkout?canceled=true`,
    },
  };

  const response = await fetch(ordersUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
      'PayPal-Request-Id': `jolananas-${checkoutId}-${Date.now()}`,
    },
    body: JSON.stringify(orderData),
  });

  if (!response.ok) {
    throw new Error(`Erreur création ordre PayPal: ${response.status}`);
  }

  const data: PayPalOrderResponse = await response.json();
  if (!data.id) throw new Error('Aucun ID retourné par PayPal');
  return data.id;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { checkoutId, amount, currency: providedCurrency }: CreatePayPalOrderData = body;
    const currency = providedCurrency || await getCurrency();

    if (!checkoutId) return NextResponse.json({ error: 'checkoutId est requis' }, { status: 400 });
    if (!amount || amount <= 0) return NextResponse.json({ error: 'amount est requis' }, { status: 400 });

    const normalizedCheckoutId = normalizeDataForAPI(checkoutId);
    if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_SECRET) {
      return NextResponse.json({ error: 'Configuration PayPal manquante' }, { status: 500 });
    }

    const adminClient = getShopifyAdminClient();
    const draftOrderResponse = await adminClient.getDraftOrder(normalizedCheckoutId);

    if (draftOrderResponse.errors || !draftOrderResponse.data?.draft_order) {
      return NextResponse.json({ error: 'Draft order non trouvé' }, { status: 404 });
    }

    const draftOrder = draftOrderResponse.data.draft_order;
    const expectedAmount = parseFloat(draftOrder.total_price || '0');

    if (Math.abs(expectedAmount - amount) > 0.01) {
      return NextResponse.json({ error: `Le montant ne correspond pas à la commande` }, { status: 400 });
    }

    const accessToken = await getPayPalAccessToken();
    const paypalOrderId = await createPayPalOrder(accessToken, amount, currency, normalizedCheckoutId);

    return NextResponse.json({
      orderID: paypalOrderId,
      checkoutId: normalizedCheckoutId,
      amount,
      currency,
    });
  } catch (error: unknown) {
    console.error('❌ Erreur création ordre PayPal:', error);
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
