import 'server-only';

import { getShopInfo } from '../shopify/index';
import type { 
  ShopifyProduct, 
  ShopifyVariant, 
  ShopifyCart, 
  Product, 
  Variant,
  ShopInfo 
} from '../shopify/types';
import { ShopifyAdminClient } from '../ShopifyAdminClient';
import type {
  CurrencyInfo,
  CurrencyServiceConfig,
  CurrencyDetectionResult,
  ShopifyCurrencyResponse,
  CurrencyServiceState,
} from './types';
import { getCurrencyFromCountry } from './utils';

/**
 * Configuration par défaut
 */
const DEFAULT_CONFIG: Required<CurrencyServiceConfig> = {
  defaultCurrency: 'EUR',
  cacheDuration: 3600000, // 1 heure
  enableAutoDetection: true,
  enableMultiCurrency: true,
};

/**
 * Cache pour les données de devises
 */
interface CurrencyCache {
  shopCurrency: string | null;
  shopCurrencyTimestamp: number;
  availableCurrencies: CurrencyInfo[];
  availableCurrenciesTimestamp: number;
  userCurrency: string | null;
  userCurrencyTimestamp: number;
}

let cache: CurrencyCache = {
  shopCurrency: null,
  shopCurrencyTimestamp: 0,
  availableCurrencies: [],
  availableCurrenciesTimestamp: 0,
  userCurrency: null,
  userCurrencyTimestamp: 0,
};

/**
 * Service de gestion des devises
 */
class CurrencyService {
  private config: Required<CurrencyServiceConfig>;
  private adminClient: ShopifyAdminClient | null = null;
  private enableDebugLogging: boolean;

  constructor(config: CurrencyServiceConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.enableDebugLogging = process.env.NODE_ENV === 'development';
    
    // Initialiser l'Admin Client si disponible
    try {
      this.adminClient = new ShopifyAdminClient();
    } catch (error) {
      this.log('warn', 'Shopify Admin Client non disponible, certaines fonctionnalités seront limitées', { error });
    }
  }

  /**
   * Logging structuré pour le débogage
   */
  private log(level: 'info' | 'warn' | 'error', message: string, data?: any): void {
    if (!this.enableDebugLogging && level !== 'error') {
      return;
    }

    const logData = {
      timestamp: new Date().toISOString(),
      service: 'CurrencyService',
      level,
      message,
      ...(data && { data }),
    };

    switch (level) {
      case 'info':
        console.log('ℹ️', JSON.stringify(logData, null, 2));
        break;
      case 'warn':
        console.warn('⚠️', JSON.stringify(logData, null, 2));
        break;
      case 'error':
        console.error('❌', JSON.stringify(logData, null, 2));
        break;
    }
  }

  /**
   * Extrait le currencyCode depuis différents types de réponses Shopify
   * Supporte : Product, Variant, Cart, PriceRange, Money
   */
  extractCurrencyFromShopifyResponse(
    data: 
      | ShopifyProduct 
      | ShopifyVariant 
      | Product
      | Variant
      | ShopifyCart 
      | { priceRange?: { minVariantPrice?: { currencyCode?: string } } }
      | { price?: { currencyCode?: string } }
      | { currencyCode?: string }
      | { cost?: { totalAmount?: { currencyCode?: string } } }
      | null
      | undefined
  ): string | undefined {
    if (!data) {
      this.log('info', 'Aucune donnée fournie pour extraction de currencyCode');
      return undefined;
    }

    // Cas 1: Objet avec currencyCode direct
    if (typeof data === 'object' && 'currencyCode' in data && typeof data.currencyCode === 'string') {
      this.log('info', 'currencyCode extrait directement', { currencyCode: data.currencyCode });
      return data.currencyCode;
    }

    // Cas 2: ShopifyProduct - extraire depuis priceRange
    if ('priceRange' in data && data.priceRange) {
      const currencyCode = (data.priceRange as any).minVariantPrice?.currencyCode || 
                          (data.priceRange as any).maxVariantPrice?.currencyCode;
      if (currencyCode) {
        this.log('info', 'currencyCode extrait depuis priceRange', { currencyCode });
        return currencyCode;
      }
    }

    // Cas 3: ShopifyVariant - extraire depuis price
    if ('price' in data && data.price && typeof data.price === 'object' && 'currencyCode' in data.price) {
      const currencyCode = (data.price as { currencyCode?: string }).currencyCode;
      if (currencyCode) {
        this.log('info', 'currencyCode extrait depuis variant.price', { currencyCode });
        return currencyCode;
      }
    }

    // Cas 4: ShopifyCart - extraire depuis cost.totalAmount
    if ('cost' in data && data.cost && typeof data.cost === 'object') {
      const cost = data.cost as { totalAmount?: { currencyCode?: string } };
      const currencyCode = cost.totalAmount?.currencyCode;
      if (currencyCode) {
        this.log('info', 'currencyCode extrait depuis cart.cost', { currencyCode });
        return currencyCode;
      }
    }

    // Cas 5: Variant avec compareAtPrice
    if ('compareAtPrice' in data && data.compareAtPrice && typeof data.compareAtPrice === 'object' && 'currencyCode' in data.compareAtPrice) {
      const currencyCode = (data.compareAtPrice as { currencyCode?: string }).currencyCode;
      if (currencyCode) {
        this.log('info', 'currencyCode extrait depuis compareAtPrice', { currencyCode });
        return currencyCode;
      }
    }

    this.log('warn', 'Aucun currencyCode trouvé dans la réponse Shopify', { dataType: typeof data });
    return undefined;
  }

  /**
   * Valide qu'une devise est disponible dans la liste des devises activées
   * Retourne true si multi-currency désactivé (toutes devises acceptées)
   */
  async validateCurrency(currencyCode: string): Promise<boolean> {
    if (!currencyCode || typeof currencyCode !== 'string') {
      this.log('warn', 'Validation échouée: currencyCode invalide', { currencyCode });
      return false;
    }

    // Normaliser le code (majuscules)
    const normalized = currencyCode.toUpperCase().trim();
    
    if (normalized.length !== 3) {
      this.log('warn', 'Validation échouée: currencyCode doit faire 3 caractères', { currencyCode: normalized });
      return false;
    }

    // Si multi-currency est désactivé, accepter toutes les devises valides
    if (!this.config.enableMultiCurrency) {
      this.log('info', 'Multi-currency désactivé, devise acceptée', { currencyCode: normalized });
      return true;
    }

    // Vérifier dans la liste des devises disponibles
    const availableCurrencies = await this.getAvailableCurrencies();
    
    // Si aucune devise disponible (Admin API non accessible), accepter quand même
    if (availableCurrencies.length === 0) {
      this.log('info', 'Aucune devise disponible via Admin API, devise acceptée par défaut', { currencyCode: normalized });
      return true;
    }

    // Vérifier si la devise est dans la liste
    const isAvailable = availableCurrencies.some(c => c.code.toUpperCase() === normalized);
    
    if (isAvailable) {
      this.log('info', 'Devise validée et disponible', { currencyCode: normalized });
    } else {
      this.log('warn', 'Devise non disponible dans la liste des devises activées', { 
        currencyCode: normalized,
        availableCurrencies: availableCurrencies.map(c => c.code)
      });
    }

    return isAvailable;
  }

  /**
   * Récupère la devise de la boutique Shopify
   * Utilise le cache si disponible et valide
   */
  async getShopCurrency(): Promise<string> {
    const now = Date.now();
    
    // Vérifier le cache
    if (
      cache.shopCurrency &&
      now - cache.shopCurrencyTimestamp < this.config.cacheDuration
    ) {
      this.log('info', 'Devise boutique récupérée depuis le cache', { currencyCode: cache.shopCurrency });
      return cache.shopCurrency;
    }

    try {
      const shopInfo: any = await getShopInfo();
      const currencyCode = shopInfo?.paymentSettings?.currencyCode || shopInfo?.currencyCode;
      
      if (currencyCode) {
        cache.shopCurrency = currencyCode;
        cache.shopCurrencyTimestamp = now;
        this.log('info', 'Devise boutique récupérée depuis Shopify', { currencyCode });
        return currencyCode;
      }
    } catch (error) {
      this.log('error', 'Erreur lors de la récupération de la devise de la boutique', { error });
    }

    // Fallback vers le cache même expiré, ou devise par défaut
    if (cache.shopCurrency) {
      this.log('info', 'Utilisation du cache expiré comme fallback', { currencyCode: cache.shopCurrency });
      return cache.shopCurrency;
    }

    this.log('info', 'Utilisation de la devise par défaut', { currencyCode: this.config.defaultCurrency });
    return this.config.defaultCurrency;
  }

  /**
   * Récupère la liste des devises activées via Admin API
   * Retourne un tableau vide si Admin API non disponible ou multi-currency désactivé
   */
  async getAvailableCurrencies(): Promise<CurrencyInfo[]> {
    if (!this.config.enableMultiCurrency || !this.adminClient) {
      this.log('info', 'Multi-currency désactivé ou Admin Client non disponible');
      return [];
    }

    const now = Date.now();
    
    // Vérifier le cache (même si vide)
    if (now - cache.availableCurrenciesTimestamp < this.config.cacheDuration) {
      this.log('info', 'Devises disponibles récupérées depuis le cache', { 
        count: cache.availableCurrencies.length 
      });
      return cache.availableCurrencies;
    }

    try {
      if (!this.adminClient) throw new Error('Admin Client non initialisé');
      const response = await this.adminClient.getCurrencies();

      if (response.data?.currencies) {
        const currencies: CurrencyInfo[] = response.data.currencies.map((curr) => ({
          code: curr.currency,
          rateUpdatedAt: new Date(curr.rate_updated_at),
        }));

        cache.availableCurrencies = currencies;
        cache.availableCurrenciesTimestamp = now;
        this.log('info', 'Devises disponibles récupérées depuis Admin API', { 
          count: currencies.length,
          currencies: currencies.map(c => c.code)
        });
        return currencies;
      }
    } catch (error) {
      this.log('warn', 'Impossible de récupérer les devises activées via Admin API', { error });
      
      // Mettre en cache le résultat vide pour éviter le spam d'API en cas d'erreur
      // Utiliser une durée de cache plus courte (ex: 5 minutes) si c'est une erreur ? 
      // Pour l'instant on garde la même durée pour être sûr de stopper le spam.
      cache.availableCurrencies = [];
      cache.availableCurrenciesTimestamp = now;
    }

    return [];
  }

  /**
   * Vérifie si le multi-currency est activé
   */
  async isMultiCurrencyEnabled(): Promise<boolean> {
    if (!this.config.enableMultiCurrency) {
      return false;
    }

    const currencies = await this.getAvailableCurrencies();
    return currencies.length > 1;
  }



  /**
   * Détecte la devise de l'utilisateur via plusieurs méthodes
   */
  async detectUserCurrency(
    shopifyCurrencyCode?: string,
    acceptLanguage?: string,
    countryCode?: string
  ): Promise<CurrencyDetectionResult> {
    // 1. Priorité absolue : currencyCode depuis réponse Shopify
    if (shopifyCurrencyCode) {
      const normalized = shopifyCurrencyCode.toUpperCase().trim();
      const isValid = await this.validateCurrency(normalized);

      if (isValid) {
        this.log('info', 'Devise détectée via réponse Shopify', { currency: normalized });
        return {
          currency: normalized,
          source: 'shopify-response',
          confidence: 1.0,
          metadata: {
            reason: `Devise extraite directement de la réponse Shopify: ${normalized}`,
          },
        };
      }
    }

    // 2. Priorité : Country Code (Cloudflare/GeoIP)
    if (countryCode) {
      const currency = getCurrencyFromCountry(countryCode);
      const isValid = await this.validateCurrency(currency);

      if (isValid) {
        this.log('info', 'Devise détectée via Country Code (Cloudflare)', { currency, countryCode });
        return {
          currency,
          source: 'geolocation',
          confidence: 0.95,
          metadata: {
            country: countryCode,
            reason: `Détection via header Cloudflare: ${countryCode}`,
          },
        };
      }
    }

    // 3. Tentative via Accept-Language header
    if (acceptLanguage) {
      const langMatch = acceptLanguage.match(/^([a-z]{2})-([A-Z]{2})/);
      if (langMatch) {
        const langCountry = langMatch[2];
        const currency = getCurrencyFromCountry(langCountry);
        const isValid = await this.validateCurrency(currency);

        if (isValid) {
          this.log('info', 'Devise détectée via Accept-Language', { currency, lang: acceptLanguage });
          return {
            currency,
            source: 'browser',
            confidence: 0.7,
            metadata: {
              country: langCountry,
              reason: `Détection via Accept-Language: ${acceptLanguage}`,
            },
          };
        }
      }
    }

    // 4. Fallback : devise de la boutique
    const shopCurrency = await this.getShopCurrency();
    this.log('info', 'Fallback vers la devise de la boutique', { currency: shopCurrency });
    return {
      currency: shopCurrency,
      source: 'shop-default',
      confidence: 0.5,
      metadata: {
        reason: `Devise par défaut de la boutique: ${shopCurrency}`,
      },
    };
  }

  /**
   * Récupère la devise à utiliser (méthode principale)
   * Combine toutes les méthodes de détection
   */
  async getCurrency(
    shopifyCurrencyCode?: string,
    acceptLanguage?: string,
    countryCode?: string
  ): Promise<string> {
    const result = await this.detectUserCurrency(shopifyCurrencyCode, acceptLanguage, countryCode);
    return result.currency;
  }

  /**
   * Formate un prix selon la devise
   */
  formatPrice(
    amount: string | number,
    currencyCode?: string,
    locale?: string
  ): string {
    const value = typeof amount === 'string' ? parseFloat(amount) : amount;
    const currency = currencyCode || this.config.defaultCurrency;
    const userLocale = locale || (typeof window !== 'undefined' ? navigator.language : 'fr-FR');

    try {
      return new Intl.NumberFormat(userLocale, {
        style: 'currency',
        currency: currency,
      }).format(value);
    } catch (error) {
      // Fallback simple si Intl échoue
      const symbol = this.getCurrencySymbol(currency);
      const formattedValue = value.toLocaleString(userLocale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      return `${formattedValue} ${symbol}`;
    }
  }

  /**
   * Récupère le symbole d'une devise
   */
  private getCurrencySymbol(currencyCode: string): string {
    const symbols: Record<string, string> = {
      EUR: '€',
      USD: '$',
      GBP: '£',
      JPY: '¥',
      CNY: '¥',
      CAD: 'C$',
      AUD: 'A$',
      CHF: 'CHF',
      SEK: 'kr',
      NOK: 'kr',
      DKK: 'kr',
      PLN: 'zł',
      BRL: 'R$',
      INR: '₹',
      KRW: '₩',
    };

    return symbols[currencyCode] || currencyCode;
  }

  /**
   * Sauvegarde la préférence de devise de l'utilisateur
   */
  saveUserCurrencyPreference(currency: string): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      sessionStorage.setItem('user_currency', currency);
      localStorage.setItem('user_currency', currency);
      cache.userCurrency = currency;
      cache.userCurrencyTimestamp = Date.now();
    } catch (error) {
      console.warn('⚠️ Impossible de sauvegarder la préférence de devise:', error);
    }
  }

  /**
   * Récupère l'état complet du service
   */
  async getState(): Promise<CurrencyServiceState> {
    const shopCurrency = await this.getShopCurrency();
    const availableCurrencies = await this.getAvailableCurrencies();
    const isMultiCurrency = await this.isMultiCurrencyEnabled();
    const currentCurrency = await this.getCurrency();

    return {
      currentCurrency,
      shopCurrency,
      availableCurrencies,
      isMultiCurrencyEnabled: isMultiCurrency,
      isLoading: false,
      error: null,
    };
  }

  /**
   * Invalide le cache
   */
  clearCache(): void {
    cache = {
      shopCurrency: null,
      shopCurrencyTimestamp: 0,
      availableCurrencies: [],
      availableCurrenciesTimestamp: 0,
      userCurrency: null,
      userCurrencyTimestamp: 0,
    };
  }
}

// Instance singleton exportée
export const currencyService = new CurrencyService();

// Export des fonctions utilitaires
export async function getShopCurrency(): Promise<string> {
  return currencyService.getShopCurrency();
}

export async function getAvailableCurrencies(): Promise<CurrencyInfo[]> {
  return currencyService.getAvailableCurrencies();
}

export async function getCurrency(
  shopifyCurrencyCode?: string,
  acceptLanguage?: string,
  countryCode?: string
): Promise<string> {
  return currencyService.getCurrency(shopifyCurrencyCode, acceptLanguage, countryCode);
}

export function formatPrice(
  amount: string | number,
  currencyCode?: string,
  locale?: string
): string {
  return currencyService.formatPrice(amount, currencyCode, locale);
}

export async function detectUserCurrency(
  shopifyCurrencyCode?: string,
  acceptLanguage?: string,
  countryCode?: string
): Promise<CurrencyDetectionResult> {
  return currencyService.detectUserCurrency(shopifyCurrencyCode, acceptLanguage, countryCode);
}

// Export de la nouvelle fonction d'extraction
export function extractCurrencyFromShopifyResponse(
  data: Parameters<CurrencyService['extractCurrencyFromShopifyResponse']>[0]
): string | undefined {
  return currencyService.extractCurrencyFromShopifyResponse(data);
}

// Export de la fonction de validation
export async function validateCurrency(currencyCode: string): Promise<boolean> {
  return currencyService.validateCurrency(currencyCode);
}

