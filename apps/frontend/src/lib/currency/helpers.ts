/**
 * 🍍 JOLANANAS - Helpers d'Extraction de CurrencyCode
 * ====================================================
 * Fonctions utilitaires pour extraire le currencyCode depuis différents types de réponses Shopify
 */

import { extractCurrencyFromShopifyResponse } from './currencyExtractor';
import type { ShopifyProduct, ShopifyVariant, ShopifyCart, ShopifyCartLine, PriceRange, Price } from '../shopify/types';

/**
 * Type pour les objets Money de Shopify
 */
type Money = Price;

/**
 * Extrait le currencyCode depuis un produit Shopify
 * 
 * @param product - Produit Shopify
 * @returns Code de devise ou undefined si non trouvé
 * 
 * @example
 * ```ts
 * const currency = extractCurrencyFromProduct(shopifyProduct);
 * // Retourne 'EUR', 'USD', etc.
 * ```
 */
export function extractCurrencyFromProduct(
  product: ShopifyProduct | null | undefined
): string | undefined {
  if (!product) {
    return undefined;
  }

  // Extraire depuis priceRange (priorité)
  if (product.priceRange?.minVariantPrice?.currencyCode) {
    return product.priceRange.minVariantPrice.currencyCode;
  }

  if (product.priceRange?.maxVariantPrice?.currencyCode) {
    return product.priceRange.maxVariantPrice.currencyCode;
  }

  // Utiliser la fonction générique du service
  return extractCurrencyFromShopifyResponse(product);
}

/**
 * Extrait le currencyCode depuis une variante Shopify
 * 
 * @param variant - Variante Shopify
 * @returns Code de devise ou undefined si non trouvé
 * 
 * @example
 * ```ts
 * const currency = extractCurrencyFromVariant(shopifyVariant);
 * // Retourne 'EUR', 'USD', etc.
 * ```
 */
export function extractCurrencyFromVariant(
  variant: ShopifyVariant | null | undefined
): string | undefined {
  if (!variant) {
    return undefined;
  }

  // Extraire depuis price (priorité)
  if (variant.price?.currencyCode) {
    return variant.price.currencyCode;
  }

  // Essayer compareAtPrice
  if (variant.compareAtPrice?.currencyCode) {
    return variant.compareAtPrice.currencyCode;
  }

  // Utiliser la fonction générique du service
  return extractCurrencyFromShopifyResponse(variant);
}

/**
 * Extrait le currencyCode depuis un panier Shopify
 * 
 * @param cart - Panier Shopify
 * @returns Code de devise ou undefined si non trouvé
 * 
 * @example
 * ```ts
 * const currency = extractCurrencyFromCart(shopifyCart);
 * // Retourne 'EUR', 'USD', etc.
 * ```
 */
export function extractCurrencyFromCart(
  cart: ShopifyCart | null | undefined
): string | undefined {
  if (!cart) {
    return undefined;
  }

  // Extraire depuis cost.totalAmount (priorité)
  if (cart.cost?.totalAmount?.currencyCode) {
    return cart.cost.totalAmount.currencyCode;
  }

  // Essayer subtotalAmount
  if (cart.cost?.subtotalAmount?.currencyCode) {
    return cart.cost.subtotalAmount.currencyCode;
  }

  // Essayer depuis les lignes du panier
  if (cart.lines?.edges?.[0]?.node?.cost?.totalAmount?.currencyCode) {
    return cart.lines.edges[0].node.cost.totalAmount.currencyCode;
  }

  // Utiliser la fonction générique du service
  return extractCurrencyFromShopifyResponse(cart);
}

/**
 * Extrait le currencyCode depuis une ligne de panier Shopify
 * 
 * @param cartLine - Ligne de panier Shopify
 * @returns Code de devise ou undefined si non trouvé
 * 
 * @example
 * ```ts
 * const currency = extractCurrencyFromCartLine(cartLine);
 * // Retourne 'EUR', 'USD', etc.
 * ```
 */
export function extractCurrencyFromCartLine(
  cartLine: ShopifyCartLine | null | undefined
): string | undefined {
  if (!cartLine) {
    return undefined;
  }

  // Extraire depuis cost.totalAmount (priorité)
  if (cartLine.cost?.totalAmount?.currencyCode) {
    return cartLine.cost.totalAmount.currencyCode;
  }

  // Essayer depuis merchandise (variant)
  if (cartLine.merchandise) {
    return extractCurrencyFromVariant(cartLine.merchandise);
  }

  return undefined;
}

/**
 * Extrait le currencyCode depuis un PriceRange
 * 
 * @param priceRange - PriceRange Shopify
 * @returns Code de devise ou undefined si non trouvé
 * 
 * @example
 * ```ts
 * const currency = extractCurrencyFromPriceRange(product.priceRange);
 * // Retourne 'EUR', 'USD', etc.
 * ```
 */
export function extractCurrencyFromPriceRange(
  priceRange: PriceRange | null | undefined
): string | undefined {
  if (!priceRange) {
    return undefined;
  }

  // Priorité à minVariantPrice
  if (priceRange.minVariantPrice?.currencyCode) {
    return priceRange.minVariantPrice.currencyCode;
  }

  // Fallback vers maxVariantPrice
  if (priceRange.maxVariantPrice?.currencyCode) {
    return priceRange.maxVariantPrice.currencyCode;
  }

  return undefined;
}

/**
 * Extrait le currencyCode depuis un objet Money
 * 
 * @param money - Objet Money Shopify
 * @returns Code de devise ou undefined si non trouvé
 * 
 * @example
 * ```ts
 * const currency = extractCurrencyFromMoney(variant.price);
 * // Retourne 'EUR', 'USD', etc.
 * ```
 */
export function extractCurrencyFromMoney(
  money: Price | null | undefined
): string | undefined {
  if (!money) {
    return undefined;
  }

  return money.currencyCode;
}

/**
 * Extrait le currencyCode depuis différents types de données Shopify
 * Fonction générique qui essaie toutes les méthodes d'extraction
 * 
 * @param data - Données Shopify (Product, Variant, Cart, PriceRange, Money, etc.)
 * @returns Code de devise ou undefined si non trouvé
 * 
 * @example
 * ```ts
 * const currency = extractCurrency(data);
 * // Fonctionne avec n'importe quel type Shopify
 * ```
 */
export function extractCurrency(
  data: 
    | ShopifyProduct 
    | ShopifyVariant 
    | ShopifyCart 
    | ShopifyCartLine
    | PriceRange
    | Price
    | null 
    | undefined
): string | undefined {
  if (!data) {
    return undefined;
  }

  // Essayer les fonctions spécialisées selon le type
  if ('priceRange' in data) {
    return extractCurrencyFromProduct(data as ShopifyProduct);
  }

  if ('price' in data && 'id' in data) {
    return extractCurrencyFromVariant(data as ShopifyVariant);
  }

  if ('cost' in data && 'id' in data) {
    return extractCurrencyFromCart(data as ShopifyCart);
  }

  if ('merchandise' in data) {
    return extractCurrencyFromCartLine(data as ShopifyCartLine);
  }

  if ('minVariantPrice' in data || 'maxVariantPrice' in data) {
    return extractCurrencyFromPriceRange(data as PriceRange);
  }

  if ('currencyCode' in data && 'amount' in data) {
    return extractCurrencyFromMoney(data as Price);
  }

  // Fallback vers la fonction générique du service
  return extractCurrencyFromShopifyResponse(data as any);
}







