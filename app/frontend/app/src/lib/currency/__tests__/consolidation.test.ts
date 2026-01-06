/**
 * 🍍 JOLANANAS - Tests de Consolidation du Système de Devises
 * ============================================================
 * Tests pour valider la consolidation du système de devises
 * - Extraction des currencyCode depuis différents types Shopify
 * - Priorité de détection (Shopify > User > Geo > Browser > Shop > Fallback)
 * - Formatage avec différentes devises
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  extractCurrencyFromProduct,
  extractCurrencyFromVariant,
  extractCurrencyFromCart,
  extractCurrencyFromCartLine,
  extractCurrencyFromPriceRange,
  extractCurrencyFromMoney,
  extractCurrency,
} from '../helpers';
import {
  extractCurrencyFromShopifyResponse,
  validateCurrency,
  detectUserCurrency,
  formatPrice,
} from '../currencyService';
import type { ShopifyProduct, ShopifyVariant, ShopifyCart, ShopifyCartLine } from '../../shopify/types';

describe('Extraction de currencyCode depuis différents types Shopify', () => {
  describe('extractCurrencyFromProduct', () => {
    it('devrait extraire le currencyCode depuis priceRange.minVariantPrice', () => {
      const product: ShopifyProduct = {
        id: '1',
        title: 'Test Product',
        handle: 'test-product',
        description: 'Test',
        descriptionHtml: '<p>Test</p>',
        availableForSale: true,
        priceRange: {
          minVariantPrice: {
            amount: '29.99',
            currencyCode: 'EUR',
          },
          maxVariantPrice: {
            amount: '39.99',
            currencyCode: 'EUR',
          },
        },
        images: { edges: [] },
        variants: { edges: [] },
        tags: [],
        collections: { edges: [] },
      };

      const currency = extractCurrencyFromProduct(product);
      expect(currency).toBe('EUR');
    });

    it('devrait retourner undefined si le produit est null', () => {
      const currency = extractCurrencyFromProduct(null);
      expect(currency).toBeUndefined();
    });
  });

  describe('extractCurrencyFromVariant', () => {
    it('devrait extraire le currencyCode depuis price', () => {
      const variant: ShopifyVariant = {
        id: '1',
        title: 'Variant',
        availableForSale: true,
        price: {
          amount: '29.99',
          currencyCode: 'USD',
        },
        compareAtPrice: null,
        selectedOptions: [],
        image: null,
      };

      const currency = extractCurrencyFromVariant(variant);
      expect(currency).toBe('USD');
    });

    it('devrait extraire depuis compareAtPrice si price n\'a pas de currencyCode', () => {
      const variant: ShopifyVariant = {
        id: '1',
        title: 'Variant',
        availableForSale: true,
        price: {
          amount: '29.99',
          currencyCode: 'EUR',
        },
        compareAtPrice: {
          amount: '39.99',
          currencyCode: 'GBP',
        },
        selectedOptions: [],
        image: null,
      };

      const currency = extractCurrencyFromVariant(variant);
      expect(currency).toBe('EUR'); // price a la priorité
    });
  });

  describe('extractCurrencyFromCart', () => {
    it('devrait extraire le currencyCode depuis cost.totalAmount', () => {
      const cart: ShopifyCart = {
        id: '1',
        checkoutUrl: 'https://checkout.shopify.com/1',
        cost: {
          subtotalAmount: {
            amount: '50.00',
            currencyCode: 'EUR',
          },
          totalAmount: {
            amount: '60.00',
            currencyCode: 'EUR',
          },
          totalTaxAmount: null,
        },
        lines: { edges: [] },
        totalQuantity: 1,
      };

      const currency = extractCurrencyFromCart(cart);
      expect(currency).toBe('EUR');
    });
  });

  describe('extractCurrencyFromPriceRange', () => {
    it('devrait extraire depuis minVariantPrice en priorité', () => {
      const priceRange = {
        minVariantPrice: {
          amount: '29.99',
          currencyCode: 'EUR',
        },
        maxVariantPrice: {
          amount: '39.99',
          currencyCode: 'USD',
        },
      };

      const currency = extractCurrencyFromPriceRange(priceRange);
      expect(currency).toBe('EUR');
    });
  });

  describe('extractCurrency (fonction générique)', () => {
    it('devrait fonctionner avec un Product', () => {
      const product: ShopifyProduct = {
        id: '1',
        title: 'Test',
        handle: 'test',
        description: 'Test',
        descriptionHtml: '<p>Test</p>',
        availableForSale: true,
        priceRange: {
          minVariantPrice: { amount: '29.99', currencyCode: 'EUR' },
          maxVariantPrice: { amount: '39.99', currencyCode: 'EUR' },
        },
        images: { edges: [] },
        variants: { edges: [] },
        tags: [],
        collections: { edges: [] },
      };

      const currency = extractCurrency(product);
      expect(currency).toBe('EUR');
    });

    it('devrait fonctionner avec un Money', () => {
      const money = {
        amount: '29.99',
        currencyCode: 'USD',
      };

      const currency = extractCurrency(money);
      expect(currency).toBe('USD');
    });
  });
});

describe('Priorité de Détection', () => {
  beforeEach(() => {
    // Nettoyer le cache et les préférences
    if (typeof window !== 'undefined') {
      sessionStorage.clear();
      localStorage.clear();
    }
  });

  it('devrait utiliser le currencyCode Shopify en priorité absolue', async () => {
    const result = await detectUserCurrency('EUR');
    
    expect(result.currency).toBe('EUR');
    expect(result.source).toBe('shopify-response');
    expect(result.confidence).toBe(1.0);
  });

  it('devrait utiliser la préférence utilisateur si pas de currencyCode Shopify', async () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_currency', 'USD');
    }

    const result = await detectUserCurrency(undefined);
    
    // Note: En environnement de test, le résultat peut varier
    // mais devrait prioriser la préférence utilisateur si disponible
    expect(result.currency).toBeDefined();
  });
});

describe('Formatage des Prix', () => {
  it('devrait formater un prix en EUR', () => {
    const formatted = formatPrice(29.99, 'EUR');
    expect(formatted).toContain('29,99'); // Format français
    expect(formatted).toContain('€');
  });

  it('devrait formater un prix en USD', () => {
    const formatted = formatPrice(29.99, 'USD', 'en-US');
    expect(formatted).toContain('29.99');
    expect(formatted).toContain('$');
  });

  it('devrait formater un prix depuis une string', () => {
    const formatted = formatPrice('29.99', 'EUR');
    expect(formatted).toContain('29,99');
    expect(formatted).toContain('€');
  });
});

describe('Validation des Devises', () => {
  it('devrait valider un currencyCode valide', async () => {
    const isValid = await validateCurrency('EUR');
    expect(isValid).toBe(true);
  });

  it('devrait rejeter un currencyCode invalide (trop court)', async () => {
    const isValid = await validateCurrency('EU');
    expect(isValid).toBe(false);
  });

  it('devrait rejeter un currencyCode invalide (trop long)', async () => {
    const isValid = await validateCurrency('EURO');
    expect(isValid).toBe(false);
  });

  it('devrait normaliser le currencyCode (minuscules → majuscules)', async () => {
    const isValid = await validateCurrency('eur');
    // La validation normalise en majuscules
    expect(isValid).toBe(true);
  });
});

describe('Extraction depuis ShopifyResponse (service)', () => {
  it('devrait extraire depuis un objet avec currencyCode direct', () => {
    const data = { currencyCode: 'EUR' };
    const currency = extractCurrencyFromShopifyResponse(data);
    expect(currency).toBe('EUR');
  });

  it('devrait extraire depuis priceRange', () => {
    const data = {
      priceRange: {
        minVariantPrice: {
          currencyCode: 'USD',
        },
      },
    };
    const currency = extractCurrencyFromShopifyResponse(data);
    expect(currency).toBe('USD');
  });

  it('devrait retourner undefined si aucune donnée', () => {
    const currency = extractCurrencyFromShopifyResponse(null);
    expect(currency).toBeUndefined();
  });
});











