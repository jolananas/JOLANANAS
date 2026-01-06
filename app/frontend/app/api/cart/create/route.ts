/**
 * 🍍 JOLANANAS - API Création Panier avec Informations Client
 * =====================================
 * API route pour créer un nouveau panier Shopify et créer/mettre à jour le client
 */

import { NextRequest, NextResponse } from 'next/server';
import { getShopifyClient, CartLineInput } from '@/lib/ShopifyStorefrontClient';
import { getShopifyAdminClient } from '@/lib/ShopifyAdminClient';
import { ENV } from '@/app/src/lib/env';
import { transformShopifyError, extractAndTransformUserErrors } from '@/app/src/lib/utils/shopify-error-handler';
import { normalizeDataForAPI } from '@/app/src/lib/utils/formatters';

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
  country: string;
}

/**
 * Type guards pour les réponses API Shopify
 */
interface CustomersResponse {
  customers?: Array<{ id: number | string; email?: string; phone?: string }>;
}

interface CustomerResponse {
  customer?: { id: number | string };
}

interface CartCreateResponse {
  cartCreate?: {
    cart?: any;
    userErrors?: Array<{ field: string[]; message: string }>;
  };
}

/**
 * POST /api/cart/create
 * Crée un nouveau panier Shopify avec les lignes spécifiées
 * Crée ou met à jour le client dans Shopify avec les informations de livraison
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lines, shippingInfo }: { 
      lines?: CartLineInput[];
      shippingInfo?: ShippingInfo;
    } = body;

    // Validation des données
    if (lines && !Array.isArray(lines)) {
      return NextResponse.json(
        { error: 'Lines doit être un tableau' },
        { status: 400 }
      );
    }

    if (lines) {
      const isValidLineItem = lines.every(line => 
        line.merchandiseId && 
        typeof line.quantity === 'number' && 
        line.quantity > 0
      );
      
      if (!isValidLineItem) {
        return NextResponse.json(
          { error: 'Format de ligne invalide' },
          { status: 400 }
        );
      }
    }

    // Validation des informations de livraison si fournies
    if (shippingInfo) {
      if (!shippingInfo.email || !shippingInfo.firstName || !shippingInfo.lastName) {
        return NextResponse.json(
          { error: 'Email, prénom et nom sont requis' },
          { status: 400 }
        );
      }
    }

    console.log('🔄 Création panier:', { lines, hasShippingInfo: !!shippingInfo });

    // Créer ou mettre à jour le client dans Shopify si les informations sont fournies
    let customerId: string | null = null;
    if (shippingInfo && ENV.SHOPIFY_ADMIN_TOKEN) {
      try {
        const adminClient = getShopifyAdminClient();
        
        // Rechercher un client existant par email
        const customersResponse = await adminClient.getCustomers(250);
        const customersData = customersResponse.data as CustomersResponse;
        const existingCustomer = customersData?.customers?.find(
          (c) => c.email?.toLowerCase() === shippingInfo.email.toLowerCase()
        );

        if (existingCustomer) {
          // Mettre à jour le client existant
          const updatedCustomer = await adminClient.updateCustomer(existingCustomer.id.toString(), {
            first_name: shippingInfo.firstName,
            last_name: shippingInfo.lastName,
            phone: shippingInfo.phone || existingCustomer.phone,
            addresses: [
              {
                first_name: shippingInfo.firstName,
                last_name: shippingInfo.lastName,
                address1: shippingInfo.address,
                address2: shippingInfo.address2,
                city: shippingInfo.city,
                zip: shippingInfo.postalCode,
                country: shippingInfo.country || 'France',
                phone: shippingInfo.phone,
              },
            ],
          });

          const updatedCustomerData = updatedCustomer.data as CustomerResponse;
          if (updatedCustomerData?.customer) {
            customerId = updatedCustomerData.customer.id.toString();
            console.log('✅ Client mis à jour:', customerId);
          } else if (updatedCustomer.errors) {
            console.error('⚠️ Erreur mise à jour client:', updatedCustomer.errors);
          }
        } else {
          // Créer un nouveau client
          const newCustomer = await adminClient.createCustomer({
            email: shippingInfo.email,
            first_name: shippingInfo.firstName,
            last_name: shippingInfo.lastName,
            phone: shippingInfo.phone,
            addresses: [
              {
                first_name: shippingInfo.firstName,
                last_name: shippingInfo.lastName,
                address1: shippingInfo.address,
                address2: shippingInfo.address2,
                city: shippingInfo.city,
                zip: shippingInfo.postalCode,
                country: shippingInfo.country || 'France',
                phone: shippingInfo.phone,
              },
            ],
          });

          const newCustomerData = newCustomer.data as CustomerResponse;
          if (newCustomerData?.customer) {
            customerId = newCustomerData.customer.id.toString();
            console.log('✅ Nouveau client créé:', customerId);
          } else if (newCustomer.errors) {
            console.error('⚠️ Erreur création client:', newCustomer.errors);
          }
        }
      } catch (error) {
        console.error('⚠️ Erreur lors de la création/mise à jour du client:', error);
      }
    } else if (shippingInfo && !ENV.SHOPIFY_ADMIN_TOKEN) {
      console.warn('⚠️ SHOPIFY_ADMIN_TOKEN non configuré - le client ne sera pas créé dans Shopify');
    }

    // Créer le panier via Shopify Storefront API
    const shopify = getShopifyClient();
    const cartData = await shopify.createCart(lines);

    // Vérifier les erreurs GraphQL
    if (cartData.errors) {
      console.error('❌ Erreur création panier Shopify:', cartData.errors);
      const userFriendlyError = transformShopifyError(
        cartData.errors[0]?.message || 'Erreur inconnue',
        'cart/create'
      );
      return NextResponse.json(
        { error: userFriendlyError },
        { status: 400 }
      );
    }

    const cartResponse = cartData.data as CartCreateResponse;

    if (cartResponse?.cartCreate) {
      const userError = extractAndTransformUserErrors({
        userErrors: cartResponse.cartCreate.userErrors?.map(err => ({
          message: err.message,
          field: Array.isArray(err.field) ? err.field.join('.') : err.field?.[0]
        }))
      }, 'cart/create');
      if (userError) {
        console.error('❌ UserError création panier Shopify:', cartResponse.cartCreate.userErrors);
        return NextResponse.json(
          { error: userError },
          { status: 400 }
        );
      }
    }

    if (!cartResponse?.cartCreate?.cart) {
      console.error('❌ Réponse panier invalide:', cartData);
      return NextResponse.json(
        { error: 'Réponse panier invalide' },
        { status: 500 }
      );
    }

    const cart = cartResponse.cartCreate.cart;

    let checkoutUrl = cart.checkoutUrl;
    if (shippingInfo) {
      try {
        const url = new URL(checkoutUrl);
        const normalizeForURL = (value: string | undefined): string => {
          if (!value) return '';
          const normalized = normalizeDataForAPI(value);
          const cleaned = typeof normalized === 'string' 
            ? normalized.split('').map(char => {
                const code = char.charCodeAt(0);
                return code > 255 ? '-' : char;
              }).join('')
            : String(normalized);
          return cleaned.trim();
        };
        
        url.searchParams.set('checkout[email]', shippingInfo.email);
        url.searchParams.set('checkout[shipping_address][first_name]', normalizeForURL(shippingInfo.firstName));
        url.searchParams.set('checkout[shipping_address][last_name]', normalizeForURL(shippingInfo.lastName));
        url.searchParams.set('checkout[shipping_address][address1]', normalizeForURL(shippingInfo.address));
        if (shippingInfo.address2) {
          url.searchParams.set('checkout[shipping_address][address2]', normalizeForURL(shippingInfo.address2));
        }
        url.searchParams.set('checkout[shipping_address][city]', normalizeForURL(shippingInfo.city));
        url.searchParams.set('checkout[shipping_address][zip]', shippingInfo.postalCode);
        url.searchParams.set('checkout[shipping_address][country]', normalizeForURL(shippingInfo.country || 'France'));
        if (shippingInfo.phone) {
          url.searchParams.set('checkout[shipping_address][phone]', shippingInfo.phone);
        }
        checkoutUrl = url.toString();
      } catch (error) {
        console.error('⚠️ Erreur lors de la construction de l\'URL de checkout:', error);
      }
    }

    const formattedCart = {
      id: cart.id,
      checkoutUrl,
      customerId,
      totalQuantity: cart.totalQuantity,
      currencyCode: cart.cost.totalAmount.currencyCode,
      totalPrice: cart.cost.totalAmount.amount,
      subtotalPrice: cart.cost.subtotalAmount.amount,
      lines: cart.lines.edges.map((edge: any) => ({
        id: edge.node.id,
        quantity: edge.node.quantity,
        merchandise: edge.node.merchandise,
        cost: edge.node.cost,
      })),
    };

    return NextResponse.json(formattedCart, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });

  } catch (error: unknown) {
    console.error('❌ Erreur serveur création panier:', error);
    const message = error instanceof Error ? error.message : 'Erreur serveur';
    return NextResponse.json(
      { error: message, traceId: `cart-create-${Date.now()}` },
      { status: 500 }
    );
  }
}
