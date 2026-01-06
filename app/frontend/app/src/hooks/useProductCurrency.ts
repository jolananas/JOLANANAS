/**
 * 🍍 JOLANANAS - Hook useProductCurrency
 * =======================================
 * Hook spécialisé pour extraire automatiquement le currencyCode depuis les produits Shopify
 * et utiliser le système de devises centralisé
 */

'use client';

import { useCurrency } from './useCurrency';
import { extractCurrencyFromShopifyResponse } from '@/lib/currency/currencyExtractor';
import type { ShopifyProduct, ShopifyVariant } from '@/lib/shopify/types';
import type { Product } from '@/lib/shopify/types';

/**
 * Extrait le currencyCode depuis différents types de produits
 */
function extractCurrencyFromProduct(
  product: Product | ShopifyProduct | ShopifyVariant | null | undefined
): string | undefined {
  if (!product) {
    return undefined;
  }

  // Cas 1: Product simplifié avec propriété currency
  if ('currency' in product && typeof product.currency === 'string') {
    return product.currency;
  }

  // Cas 2: ShopifyProduct avec priceRange
  if ('priceRange' in product && product.priceRange) {
    return product.priceRange.minVariantPrice?.currencyCode || 
           product.priceRange.maxVariantPrice?.currencyCode;
  }

  // Cas 3: ShopifyVariant avec price
  if ('price' in product && product.price && typeof product.price === 'object' && 'currencyCode' in product.price) {
    return (product.price as { currencyCode?: string }).currencyCode;
  }

  // Cas 4: Utiliser la fonction d'extraction du service
  return extractCurrencyFromShopifyResponse(product as any);
}

/**
 * Hook pour utiliser le service de devises avec extraction automatique depuis un produit Shopify
 * 
 * @param product - Produit Shopify (Product, ShopifyProduct, ou ShopifyVariant)
 * @returns État et méthodes pour gérer les devises avec le currencyCode du produit
 * 
 * @example
 * ```tsx
 * const { currency, formatPrice, isLoading } = useProductCurrency(product);
 * 
 * return (
 *   <div>
 *     <p>Prix: {formatPrice(product.price)}</p>
 *     <p>Devise: {currency}</p>
 *   </div>
 * );
 * ```
 */
export function useProductCurrency(
  product: Product | ShopifyProduct | ShopifyVariant | null | undefined
) {
  // Extraire le currencyCode depuis le produit
  const shopifyCurrencyCode = extractCurrencyFromProduct(product);

  // Utiliser le hook useCurrency avec le currencyCode extrait
  return useCurrency(shopifyCurrencyCode);
}







