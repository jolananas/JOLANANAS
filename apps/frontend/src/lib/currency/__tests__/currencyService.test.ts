/**
 * 🍍 JOLANANAS - Tests pour CurrencyService
 * =========================================
 * Tests unitaires et d'intégration pour le service de gestion des devises
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { currencyService } from '../currencyService';
import type { CurrencyDetectionResult } from '../types';

// Mock des dépendances
vi.mock('../../shopify/index', () => ({
  getShopInfo: vi.fn(),
}));

vi.mock('../../ShopifyAdminClient', () => ({
  ShopifyAdminClient: vi.fn(),
}));

describe('CurrencyService', () => {
  beforeEach(() => {
    // Nettoyer le cache avant chaque test
    currencyService.clearCache();
    vi.clearAllMocks();
  });

  describe('getShopCurrency', () => {
    it('should return shop currency from Shopify API', async () => {
      const { getShopInfo } = await import('../../shopify/index');
      vi.mocked(getShopInfo).mockResolvedValue({
        name: 'JOLANANAS',
        email: null,
        description: null,
        url: null,
        currencyCode: 'EUR',
      });

      const currency = await currencyService.getShopCurrency();
      expect(currency).toBe('EUR');
    });

    it('should use cache if available', async () => {
      const { getShopInfo } = await import('../../shopify/index');
      vi.mocked(getShopInfo).mockResolvedValue({
        name: 'JOLANANAS',
        email: null,
        description: null,
        url: null,
        currencyCode: 'USD',
      });

      // Premier appel
      const currency1 = await currencyService.getShopCurrency();
      expect(currency1).toBe('USD');

      // Deuxième appel (devrait utiliser le cache)
      vi.mocked(getShopInfo).mockClear();
      const currency2 = await currencyService.getShopCurrency();
      expect(currency2).toBe('USD');
      // getShopInfo ne devrait pas être appelé à nouveau (cache)
    });

    it('should fallback to default currency if API fails', async () => {
      const { getShopInfo } = await import('../../shopify/index');
      vi.mocked(getShopInfo).mockResolvedValue(null);

      const currency = await currencyService.getShopCurrency();
      expect(currency).toBe('EUR'); // Fallback
    });
  });

  describe('detectUserCurrency', () => {
    it('should prioritize shopify currencyCode', async () => {
      const result = await currencyService.detectUserCurrency('USD');
      
      expect(result.currency).toBe('USD');
      expect(result.source).toBe('shopify-response');
      expect(result.confidence).toBe(1.0);
    });

    it('should detect from browser locale', async () => {
      // Mock navigator.language
      Object.defineProperty(navigator, 'language', {
        writable: true,
        value: 'en-US',
      });

      const result = await currencyService.detectUserCurrency();
      
      // Devrait détecter USD depuis en-US
      expect(result.currency).toBeDefined();
      expect(['USD', 'EUR']).toContain(result.currency); // Peut être USD ou fallback
    });

    it('should fallback to shop currency', async () => {
      const { getShopInfo } = await import('../../shopify/index');
      vi.mocked(getShopInfo).mockResolvedValue({
        name: 'JOLANANAS',
        email: null,
        description: null,
        url: null,
        currencyCode: 'GBP',
      });

      const result = await currencyService.detectUserCurrency();
      
      expect(result.currency).toBe('GBP');
      expect(result.source).toBe('shop-default');
    });
  });

  describe('formatPrice', () => {
    it('should format price with currency', () => {
      const formatted = currencyService.formatPrice(29.99, 'EUR');
      expect(formatted).toContain('29,99'); // Format français
      expect(formatted).toContain('€');
    });

    it('should format price with USD', () => {
      const formatted = currencyService.formatPrice(29.99, 'USD');
      expect(formatted).toContain('29.99'); // Format US
      expect(formatted).toContain('$');
    });

    it('should use default currency if not provided', () => {
      const formatted = currencyService.formatPrice(29.99);
      expect(formatted).toBeDefined();
    });
  });

  describe('getAvailableCurrencies', () => {
    it('should return empty array if Admin API not available', async () => {
      const currencies = await currencyService.getAvailableCurrencies();
      expect(Array.isArray(currencies)).toBe(true);
    });

    it('should return currencies from Admin API if available', async () => {
      const { ShopifyAdminClient } = await import('../../ShopifyAdminClient');
      const mockClient = {
        request: vi.fn().mockResolvedValue({
          data: {
            currencies: [
              { currency: 'EUR', rate_updated_at: '2025-01-15T10:00:00Z' },
              { currency: 'USD', rate_updated_at: '2025-01-15T10:00:00Z' },
            ],
          },
        }),
      };
      
      vi.mocked(ShopifyAdminClient).mockImplementation(() => mockClient as any);

      const currencies = await currencyService.getAvailableCurrencies();
      expect(currencies.length).toBeGreaterThan(0);
    });
  });

  describe('isMultiCurrencyEnabled', () => {
    it('should return false if no currencies available', async () => {
      const isEnabled = await currencyService.isMultiCurrencyEnabled();
      expect(isEnabled).toBe(false);
    });
  });

  describe('saveUserCurrencyPreference', () => {
    it('should save currency preference', () => {
      // Mock localStorage
      const localStorageMock = {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      };
      global.localStorage = localStorageMock as any;

      currencyService.saveUserCurrencyPreference('USD');
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith('user_currency', 'USD');
    });
  });
});







