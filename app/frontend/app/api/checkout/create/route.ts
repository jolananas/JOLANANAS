/**
 * 🍍 JOLANANAS - API Création Checkout Personnalisé
 * ==================================================
 * Crée un panier Shopify et un draft order pour paiement sécurisé
 * Retourne les informations nécessaires pour l'intégration des paiements
 */

import { NextRequest, NextResponse } from 'next/server';
import { getShopifyClient, CartLineInput } from '@/lib/ShopifyStorefrontClient';
import { getShopifyAdminClient } from '@/lib/ShopifyAdminClient';
import { getShippingInfo } from '@/app/src/lib/shopify';
import { ENV } from '@/app/src/lib/env';
import { transformShopifyError, extractAndTransformUserErrors } from '@/app/src/lib/utils/shopify-error-handler';
import { normalizeDataForAPI, sanitizeStringForByteString } from '@/app/src/lib/utils/formatters';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Interface pour les informations de livraison
 */
interface ShippingInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address: string;
  address2?: string;
  city: string;
  postalCode: string;
  department?: string;
  region?: string;
  country: string;
}

/**
 * Interface pour les informations de méthode de livraison
 */
interface ShippingMethod {
  type: 'standard' | 'express';
}

/**
 * Extraire l'ID numérique depuis un GID Shopify
 * Exemple: gid://shopify/ProductVariant/123456789 → 123456789
 */
function extractNumericId(gid: string): string {
  if (gid.startsWith('gid://shopify/')) {
    const parts = gid.split('/');
    return parts[parts.length - 1];
  }
  return gid;
}

/**
 * Calculer les frais de livraison
 */
async function calculateShippingCost(
  shippingMethod: 'standard' | 'express',
  subtotal: number,
  shippingInfo: ShippingInfo
): Promise<number> {
  const result = await getShippingInfo();
  if (!result.success) {
    return 0;
  }
  const defaultShippingInfo = result.data;

  // Livraison gratuite si seuil atteint
  if (subtotal >= defaultShippingInfo.freeShippingThreshold) {
    return 0;
  }

  return shippingMethod === 'express' 
    ? defaultShippingInfo.expressShippingCost 
    : defaultShippingInfo.standardShippingCost;
}

/**
 * POST /api/checkout/create
 * Crée un panier Shopify et un draft order pour paiement sécurisé
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      items, 
      shippingInfo, 
      shippingMethod = { type: 'standard' as const }
    }: { 
      items?: CartLineInput[];
      shippingInfo?: ShippingInfo;
      shippingMethod?: ShippingMethod;
    } = body;

    // Validation des données
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Le panier est vide' }, { status: 400 });
    }

    if (!shippingInfo) {
      return NextResponse.json({ error: 'Les informations de livraison sont requises' }, { status: 400 });
    }

    if (!shippingInfo.email || !shippingInfo.firstName || !shippingInfo.lastName) {
      return NextResponse.json({ error: 'Email, prénom et nom sont requis' }, { status: 400 });
    }

    if (!shippingInfo.address || !shippingInfo.city || !shippingInfo.postalCode) {
      return NextResponse.json({ error: 'Adresse, ville et code postal sont requis' }, { status: 400 });
    }

    if (!ENV.SHOPIFY_ADMIN_TOKEN) {
      return NextResponse.json(
        { error: 'SHOPIFY_ADMIN_TOKEN n\'est pas configuré. Le paiement sécurisé nécessite l\'Admin API.' },
        { status: 500 }
      );
    }

    // 1. Créer le panier Shopify via Storefront API
    const shopify = getShopifyClient();
    const cartData = await shopify.createCart(items);

    if (cartData.errors) {
      console.error('❌ Erreur création panier Shopify:', cartData.errors);
      const userFriendlyError = transformShopifyError(
        cartData.errors[0]?.message || 'Erreur inconnue',
        'checkout/create'
      );
      return NextResponse.json({ error: userFriendlyError }, { status: 400 });
    }

    const cartResponse = cartData.data as any;

    if (cartResponse?.cartCreate) {
      const userError = extractAndTransformUserErrors({
        userErrors: cartResponse.cartCreate.userErrors?.map((err: any) => ({
          message: err.message,
          field: Array.isArray(err.field) ? err.field.join('.') : err.field?.[0]
        }))
      }, 'checkout/create');
      if (userError) {
        console.error('❌ UserError création panier Shopify:', cartResponse.cartCreate.userErrors);
        return NextResponse.json({ error: userError }, { status: 400 });
      }
    }

    if (!cartResponse?.cartCreate?.cart) {
      console.error('❌ Réponse panier invalide:', cartData);
      return NextResponse.json({ error: 'Réponse panier invalide' }, { status: 500 });
    }

    const cart = cartResponse.cartCreate.cart;
    const subtotal = parseFloat(cart.cost.subtotalAmount.amount);

    // 2. Calculer les frais de livraison
    const shippingCost = await calculateShippingCost(
      shippingMethod.type,
      subtotal,
      shippingInfo
    );

    // 3. Normaliser les données
    const normalizedShippingInfo = normalizeDataForAPI(shippingInfo);

    // 4. Créer ou mettre à jour le client dans Shopify
    const adminClient = getShopifyAdminClient();
    let customerId: string | undefined;

    try {
      const customersResponse = await adminClient.getCustomers(250);
      const customersData = customersResponse.data as any;
      const existingCustomer = customersData?.customers?.find(
        (c: any) => c.email?.toLowerCase() === normalizedShippingInfo.email.toLowerCase()
      );

      if (existingCustomer) {
        customerId = existingCustomer.id.toString();
      } else {
        const newCustomer = await adminClient.createCustomer({
          email: normalizedShippingInfo.email,
          first_name: normalizedShippingInfo.firstName,
          last_name: normalizedShippingInfo.lastName,
          phone: normalizedShippingInfo.phone,
          addresses: [
            {
              first_name: normalizedShippingInfo.firstName,
              last_name: normalizedShippingInfo.lastName,
              address1: normalizedShippingInfo.address,
              address2: normalizedShippingInfo.address2,
              city: normalizedShippingInfo.city,
              zip: normalizedShippingInfo.postalCode,
              country: normalizedShippingInfo.country || 'France',
              phone: normalizedShippingInfo.phone,
            },
          ],
        });
        const customerData = newCustomer.data as any;
        if (customerData?.customer) {
          customerId = customerData.customer.id.toString();
        }
      }
    } catch (error) {
      console.error('⚠️ Erreur lors de la gestion du client:', error);
    }

    // 5. Préparer les line items pour le draft order
    const draftOrderLineItems = items.map(item => ({
      variant_id: extractNumericId(item.merchandiseId),
      quantity: item.quantity,
    }));

    // 6. Créer le draft order
    const draftOrderDataRaw = {
      line_items: draftOrderLineItems,
      customer: customerId ? { id: customerId } : {
        email: normalizeDataForAPI(normalizedShippingInfo.email),
        first_name: normalizeDataForAPI(normalizedShippingInfo.firstName),
        last_name: normalizeDataForAPI(normalizedShippingInfo.lastName),
      },
      shipping_address: {
        first_name: normalizeDataForAPI(normalizedShippingInfo.firstName),
        last_name: normalizeDataForAPI(normalizedShippingInfo.lastName),
        address1: normalizeDataForAPI(normalizedShippingInfo.address),
        address2: normalizedShippingInfo.address2 ? normalizeDataForAPI(normalizedShippingInfo.address2) : undefined,
        city: normalizeDataForAPI(normalizedShippingInfo.city),
        zip: normalizeDataForAPI(normalizedShippingInfo.postalCode),
        country: normalizeDataForAPI(normalizedShippingInfo.country || 'France'),
        phone: normalizedShippingInfo.phone ? normalizeDataForAPI(normalizedShippingInfo.phone) : undefined,
      },
      shipping_line: {
        title: normalizeDataForAPI(shippingMethod.type === 'express' ? 'Livraison express' : 'Livraison standard'),
        price: shippingCost.toFixed(2),
      },
      note: normalizeDataForAPI(`Checkout personnalise - ${shippingMethod.type === 'express' ? 'Express' : 'Standard'}`),
    };

    const finalDraftOrder = normalizeDataForAPI(draftOrderDataRaw);
    const draftOrderResponse = await adminClient.createDraftOrder(finalDraftOrder);

    if (draftOrderResponse.errors) {
      console.error('❌ Erreur création draft order:', JSON.stringify(draftOrderResponse.errors, null, 2));
      return NextResponse.json({ error: draftOrderResponse.errors[0]?.message || 'Erreur lors de la création de la commande' }, { status: 500 });
    }

    const draftOrder = (draftOrderResponse.data as any).draft_order;
    const totalAmount = subtotal + shippingCost;

    return NextResponse.json({
      checkoutId: draftOrder.id.toString(),
      cartId: cart.id,
      customerId: customerId || null,
      total: totalAmount.toFixed(2),
      subtotal: subtotal.toFixed(2),
      shippingCost: shippingCost.toFixed(2),
      currency: cart.cost.totalAmount.currencyCode,
      invoiceUrl: draftOrder.invoice_url,
      paymentUrl: draftOrder.invoice_url,
      variantIds: items.map(item => extractNumericId(item.merchandiseId)),
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });

  } catch (error: unknown) {
    console.error('❌ Erreur serveur création checkout:', error);
    const message = error instanceof Error ? error.message : 'Erreur serveur';
    return NextResponse.json({ error: message, traceId: `checkout-create-${Date.now()}` }, { status: 500 });
  }
}
