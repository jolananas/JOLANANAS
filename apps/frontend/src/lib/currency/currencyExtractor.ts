/**
 * 🍍 JOLANANAS - Extracteur de Devise (Client-Safe)
 * ===================================================
 * Fonctions pour extraire le currencyCode depuis les réponses Shopify
 * Version client-safe qui ne dépend pas de modules Node.js
 */

import type {
  ShopifyProduct,
  ShopifyVariant,
  ShopifyCart,
} from '../shopify/types';

/**
 * Extrait le currencyCode depuis différents types de réponses Shopify
 * Supporte : Product, Variant, Cart, PriceRange, Money
 * 
 * ⚠️ CLIENT-SAFE : Cette fonction peut être utilisée côté client
 */
export function extractCurrencyFromShopifyResponse(
  data:
    | ShopifyProduct
    | ShopifyVariant
    | ShopifyCart
    | { priceRange?: { minVariantPrice?: { currencyCode?: string } } }
    | { price?: { currencyCode?: string } }
    | { currencyCode?: string }
    | { cost?: { totalAmount?: { currencyCode?: string } } }
    | null
    | undefined
): string | undefined {
  if (!data) {
    return undefined;
  }

  // Cas 1: Objet avec currencyCode direct
  if (typeof data === 'object' && 'currencyCode' in data && typeof data.currencyCode === 'string') {
    return data.currencyCode;
  }

  // Cas 2: ShopifyProduct - extraire depuis priceRange
  if ('priceRange' in data && data.priceRange) {
    const currencyCode = data.priceRange.minVariantPrice?.currencyCode ||
                        data.priceRange.maxVariantPrice?.currencyCode;
    if (currencyCode) {
      return currencyCode;
    }
  }

  // Cas 3: ShopifyVariant - extraire depuis price
  if ('price' in data && data.price && typeof data.price === 'object' && 'currencyCode' in data.price) {
    const currencyCode = (data.price as { currencyCode?: string }).currencyCode;
    if (currencyCode) {
      return currencyCode;
    }
  }

  // Cas 4: ShopifyCart - extraire depuis cost.totalAmount
  if ('cost' in data && data.cost && typeof data.cost === 'object') {
    const cost = data.cost as { totalAmount?: { currencyCode?: string } };
    const currencyCode = cost.totalAmount?.currencyCode;
    if (currencyCode) {
      return currencyCode;
    }
  }

  // Cas 5: Variant avec compareAtPrice
  if ('compareAtPrice' in data && data.compareAtPrice && typeof data.compareAtPrice === 'object' && 'currencyCode' in data.compareAtPrice) {
    const currencyCode = (data.compareAtPrice as { currencyCode?: string }).currencyCode;
    if (currencyCode) {
      return currencyCode;
    }
  }

  return undefined;
}

