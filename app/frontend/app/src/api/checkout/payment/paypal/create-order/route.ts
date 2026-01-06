/**
 * 🍍 JOLANANAS - API Création Ordre PayPal
 * ==========================================
 * Crée un ordre PayPal côté serveur pour une sécurité optimale
 * Utilise l'API REST PayPal v2 avec authentification OAuth2
 */

import { NextRequest, NextResponse } from 'next/server';
import { getShopifyAdminClient } from '@/lib/ShopifyAdminClient';
import { ENV } from '@/lib/env';
import { normalizeDataForAPI } from '@/lib/utils/formatters';
import { getCurrency } from '@/lib/currency/currencyService';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Interface pour les données de création d'ordre
 */
interface CreatePayPalOrderData {
  checkoutId: string;
  amount: number;
  currency?: string;
}

/**
 * Interface pour la réponse PayPal Access Token
 */
interface PayPalAccessTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

/**
 * Interface pour la réponse PayPal Order
 */
interface PayPalOrderResponse {
  id: string;
  status: string;
  links?: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
}

/**
 * Obtenir un access token PayPal via OAuth2
 */
async function getPayPalAccessToken(): Promise<string> {
  const paypalClientId = process.env.PAYPAL_CLIENT_ID;
  const paypalSecret = process.env.PAYPAL_SECRET;

  if (!paypalClientId || !paypalSecret) {
    throw new Error('PAYPAL_CLIENT_ID et PAYPAL_SECRET doivent être configurés');
  }

  // Déterminer l'environnement (sandbox ou production)
  const isProduction = ENV.NODE_ENV === 'production';
  const baseUrl = isProduction
    ? 'https://api.paypal.com'
    : 'https://api.sandbox.paypal.com';

  const authUrl = `${baseUrl}/v1/oauth2/token`;

  // Créer les credentials en base64
  const credentials = Buffer.from(`${paypalClientId}:${paypalSecret}`).toString('base64');

  try {
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
      const errorText = await response.text();
      console.error('❌ Erreur authentification PayPal:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });
      throw new Error(`Erreur authentification PayPal: ${response.status} ${response.statusText}`);
    }

    const data: PayPalAccessTokenResponse = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('❌ Erreur lors de l\'obtention du token PayPal:', error);
    throw error;
  }
}

/**
 * Créer un ordre PayPal via l'API REST
 */
async function createPayPalOrder(
  accessToken: string,
  amount: number,
  currency: string,
  checkoutId: string
): Promise<string> {
  const isProduction = ENV.NODE_ENV === 'production';
  const baseUrl = isProduction
    ? 'https://api.paypal.com'
    : 'https://api.sandbox.paypal.com';

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

  try {
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
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Erreur création ordre PayPal:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });
      throw new Error(
        `Erreur création ordre PayPal: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`
      );
    }

    const data: PayPalOrderResponse = await response.json();
    
    if (!data.id) {
      throw new Error('L\'ordre PayPal a été créé mais aucun ID n\'a été retourné');
    }

    return data.id;
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'ordre PayPal:', error);
    throw error;
  }
}

/**
 * POST /api/checkout/payment/paypal/create-order
 * Crée un ordre PayPal côté serveur pour une sécurité optimale
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { checkoutId, amount, currency: providedCurrency }: CreatePayPalOrderData = body;
    
    // Détecter la devise à utiliser (utiliser celle fournie en priorité, sinon détecter)
    const currency = providedCurrency || await getCurrency();

    // Validation des données
    if (!checkoutId || typeof checkoutId !== 'string' || checkoutId.trim() === '') {
      return NextResponse.json(
        { error: 'checkoutId est requis et doit être une chaîne valide' },
        { status: 400 }
      );
    }

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'amount est requis et doit être un nombre positif' },
        { status: 400 }
      );
    }

    if (!currency || typeof currency !== 'string' || currency.length !== 3) {
      return NextResponse.json(
        { error: 'currency doit être un code de devise valide (3 caractères)' },
        { status: 400 }
      );
    }

    // Normaliser le checkoutId
    const normalizedCheckoutId = normalizeDataForAPI(checkoutId);

    // Vérifier que les credentials PayPal sont configurés
    if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_SECRET) {
      console.error('❌ PayPal credentials non configurés');
      return NextResponse.json(
        { error: 'Configuration PayPal manquante. Veuillez configurer PAYPAL_CLIENT_ID et PAYPAL_SECRET' },
        { status: 500 }
      );
    }

    // Vérifier que le draft order existe dans Shopify
    const adminClient = getShopifyAdminClient();
    const draftOrderResponse = await adminClient.getDraftOrder(normalizedCheckoutId);

    if (draftOrderResponse.errors || !draftOrderResponse.data?.draft_order) {
      console.error('❌ Draft order non trouvé:', draftOrderResponse.errors);
      return NextResponse.json(
        { error: 'Draft order non trouvé' },
        { status: 404 }
      );
    }

    const draftOrder = draftOrderResponse.data.draft_order;
    const expectedAmount = parseFloat(draftOrder.total_price || '0');

    // Valider que le montant correspond (tolérance de 0.01€)
    if (Math.abs(expectedAmount - amount) > 0.01) {
      console.error('❌ Montant ne correspond pas:', {
        expected: expectedAmount,
        received: amount,
        checkoutId: normalizedCheckoutId,
      });
      return NextResponse.json(
        { error: `Le montant (${amount}€) ne correspond pas à la commande (${expectedAmount}€)` },
        { status: 400 }
      );
    }

    console.log('🔄 Création ordre PayPal:', {
      checkoutId: normalizedCheckoutId,
      amount,
      currency,
    });

    // 1. Obtenir un access token PayPal
    const accessToken = await getPayPalAccessToken();

    // 2. Créer l'ordre PayPal
    const paypalOrderId = await createPayPalOrder(
      accessToken,
      amount,
      currency,
      normalizedCheckoutId
    );

    console.log('✅ Ordre PayPal créé avec succès:', {
      checkoutId: normalizedCheckoutId,
      paypalOrderId,
    });

    return NextResponse.json(
      {
        orderID: paypalOrderId,
        checkoutId: normalizedCheckoutId,
        amount,
        currency,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      }
    );
  } catch (error: unknown) {
    console.error('❌ Erreur création ordre PayPal:', error);

    const message = error instanceof Error ? error.message : 'Erreur inconnue lors de la création de l\'ordre PayPal';
    
    return NextResponse.json(
      {
        error: message,
        traceId: `paypal-create-order-${Date.now()}`,
      },
      { status: 500 }
    );
  }
}

