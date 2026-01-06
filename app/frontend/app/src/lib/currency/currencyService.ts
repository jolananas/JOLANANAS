/**
 * 🍍 JOLANANAS - Service de Gestion Prédictive des Devises
 * =========================================================
 * Service centralisé pour la détection et l'utilisation des devises
 * basé sur l'API Shopify et la détection automatique
 * 
 * ⚠️ SERVER-ONLY : Ce fichier utilise ShopifyAdminClient et ne peut être utilisé que côté serveur
 */

import 'server-only';

import { getShopInfo, type ShopInfo } from '../shopify/index';
import { ShopifyAdminClient } from '../ShopifyAdminClient';
import type {
  CurrencyInfo,
  CurrencyServiceConfig,
  CurrencyDetectionResult,
  ShopifyCurrencyResponse,
  CurrencyServiceState,
} from './types';
import type { ShopifyProduct, ShopifyVariant, ShopifyCart } from '../shopify/types';

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
      const currencyCode = data.priceRange.minVariantPrice?.currencyCode || 
                          data.priceRange.maxVariantPrice?.currencyCode;
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
      const shopInfo: ShopInfo | null = await getShopInfo();
      
      if (shopInfo?.currencyCode) {
        cache.shopCurrency = shopInfo.currencyCode;
        cache.shopCurrencyTimestamp = now;
        this.log('info', 'Devise boutique récupérée depuis Shopify', { currencyCode: shopInfo.currencyCode });
        return shopInfo.currencyCode;
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
    
    // Vérifier le cache
    if (
      cache.availableCurrencies.length > 0 &&
      now - cache.availableCurrenciesTimestamp < this.config.cacheDuration
    ) {
      this.log('info', 'Devises disponibles récupérées depuis le cache', { 
        count: cache.availableCurrencies.length 
      });
      return cache.availableCurrencies;
    }

    try {
      const response = await this.adminClient.request<ShopifyCurrencyResponse>(
        '/currencies.json'
      );

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
      // Ne pas bloquer, retourner un tableau vide
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
    acceptLanguage?: string
  ): Promise<CurrencyDetectionResult> {
    // 1. Priorité : currencyCode depuis réponse Shopify
    if (shopifyCurrencyCode) {
      // Valider la devise avant de l'utiliser
      const isValid = await this.validateCurrency(shopifyCurrencyCode);
      
      if (isValid) {
        this.log('info', 'Devise détectée depuis réponse Shopify', { currencyCode: shopifyCurrencyCode });
        return {
          currency: shopifyCurrencyCode.toUpperCase().trim(),
          source: 'shopify-response',
          confidence: 1.0,
          metadata: {
            reason: 'Devise fournie par l\'API Shopify',
          },
        };
      } else {
        this.log('warn', 'Devise Shopify non valide, passage au fallback', { currencyCode: shopifyCurrencyCode });
      }
    }

    // 2. Vérifier préférence utilisateur sauvegardée (sessionStorage/localStorage)
    if (typeof window !== 'undefined') {
      try {
        const savedCurrency = sessionStorage.getItem('user_currency') || 
                             localStorage.getItem('user_currency');
        if (savedCurrency) {
          const isValid = await this.validateCurrency(savedCurrency);
          
          if (isValid) {
            this.log('info', 'Devise détectée depuis préférence utilisateur', { currencyCode: savedCurrency });
            return {
              currency: savedCurrency.toUpperCase().trim(),
              source: 'user-preference',
              confidence: 0.9,
              metadata: {
                reason: 'Préférence utilisateur sauvegardée',
              },
            };
          } else {
            this.log('warn', 'Préférence utilisateur non valide, passage au fallback', { currencyCode: savedCurrency });
          }
        }
      } catch (error) {
        this.log('warn', 'Erreur lors de la lecture des préférences utilisateur', { error });
      }
    }

    // 3. Détection via géolocalisation (si disponible)
    if (this.config.enableAutoDetection && typeof window !== 'undefined') {
      try {
        const geoCurrency = await this.detectCurrencyFromGeolocation(acceptLanguage);
        if (geoCurrency) {
          this.log('info', 'Devise détectée via géolocalisation', { currencyCode: geoCurrency.currency });
          return geoCurrency;
        }
      } catch (error) {
        this.log('warn', 'Erreur lors de la détection géolocalisée', { error });
      }
    }

    // 4. Détection via navigateur (Intl API)
    if (this.config.enableAutoDetection && typeof window !== 'undefined') {
      try {
        const browserCurrency = this.detectCurrencyFromBrowser(acceptLanguage);
        if (browserCurrency) {
          this.log('info', 'Devise détectée via navigateur', { currencyCode: browserCurrency.currency });
          return browserCurrency;
        }
      } catch (error) {
        this.log('warn', 'Erreur lors de la détection navigateur', { error });
      }
    }

    // 5. Fallback : Devise de la boutique
    const shopCurrency = await this.getShopCurrency();
    this.log('info', 'Utilisation de la devise de la boutique comme fallback', { currencyCode: shopCurrency });
    return {
      currency: shopCurrency,
      source: 'shop-default',
      confidence: 0.7,
      metadata: {
        reason: 'Devise par défaut de la boutique Shopify',
      },
    };
  }

  /**
   * Détecte la devise via géolocalisation
   */
  private async detectCurrencyFromGeolocation(
    acceptLanguage?: string
  ): Promise<CurrencyDetectionResult | null> {
    // Mapping pays -> devise (principaux pays)
    const countryToCurrency: Record<string, string> = {
      FR: 'EUR', BE: 'EUR', DE: 'EUR', IT: 'EUR', ES: 'EUR', NL: 'EUR',
      PT: 'EUR', AT: 'EUR', IE: 'EUR', FI: 'EUR', GR: 'EUR', LU: 'EUR',
      US: 'USD', CA: 'CAD', GB: 'GBP', AU: 'AUD', NZ: 'NZD',
      CH: 'CHF', NO: 'NOK', SE: 'SEK', DK: 'DKK', PL: 'PLN',
      JP: 'JPY', CN: 'CNY', KR: 'KRW', IN: 'INR', BR: 'BRL',
    };

    try {
      // Utiliser l'API Intl pour détecter la locale
      const locale = acceptLanguage || 
                    (typeof navigator !== 'undefined' ? navigator.language : 'fr-FR');
      
      // Extraire le code pays de la locale (ex: 'fr-FR' -> 'FR')
      const countryCode = locale.split('-')[1]?.toUpperCase() || 
                         locale.split('_')[1]?.toUpperCase();
      
      if (countryCode && countryToCurrency[countryCode]) {
        const currency = countryToCurrency[countryCode];
        const availableCurrencies = await this.getAvailableCurrencies();
        
        // Vérifier si la devise est disponible
        if (availableCurrencies.length === 0 || 
            availableCurrencies.some(c => c.code === currency)) {
          return {
            currency,
            source: 'geolocation',
            confidence: 0.8,
            metadata: {
              locale,
              country: countryCode,
              reason: `Détection basée sur la locale: ${locale}`,
            },
          };
        }
      }
    } catch (error) {
      // Ignorer les erreurs
    }

    return null;
  }

  /**
   * Détecte la devise via l'API Intl du navigateur
   */
  private detectCurrencyFromBrowser(
    acceptLanguage?: string
  ): CurrencyDetectionResult | null {
    if (typeof window === 'undefined' || typeof Intl === 'undefined') {
      return null;
    }

    try {
      const locale = acceptLanguage || navigator.language || 'fr-FR';
      
      // Utiliser Intl.NumberFormat pour détecter la devise
      const formatter = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'EUR', // Devise par défaut pour la détection
      });

      // Essayer de détecter via resolvedOptions
      const options = formatter.resolvedOptions();
      
      // Mapping des locales communes vers devises
      const localeToCurrency: Record<string, string> = {
        'fr': 'EUR', 'fr-FR': 'EUR', 'fr-BE': 'EUR', 'fr-CH': 'CHF',
        'en': 'USD', 'en-US': 'USD', 'en-GB': 'GBP', 'en-CA': 'CAD',
        'en-AU': 'AUD', 'en-NZ': 'NZD', 'de': 'EUR', 'de-DE': 'EUR',
        'it': 'EUR', 'it-IT': 'EUR', 'es': 'EUR', 'es-ES': 'EUR',
        'pt': 'EUR', 'pt-PT': 'EUR', 'nl': 'EUR', 'nl-NL': 'EUR',
        'pl': 'PLN', 'pl-PL': 'PLN', 'ja': 'JPY', 'ja-JP': 'JPY',
        'zh': 'CNY', 'zh-CN': 'CNY', 'ko': 'KRW', 'ko-KR': 'KRW',
      };

      const baseLocale = locale.split('-')[0].toLowerCase();
      const currency = localeToCurrency[locale] || localeToCurrency[baseLocale];

      if (currency) {
        return {
          currency,
          source: 'browser',
          confidence: 0.75,
          metadata: {
            locale,
            reason: `Détection basée sur la locale du navigateur: ${locale}`,
          },
        };
      }
    } catch (error) {
      this.log('warn', 'Erreur lors de la détection navigateur', { error });
    }

    return null;
  }

  /**
   * Récupère la devise à utiliser (méthode principale)
   * Combine toutes les méthodes de détection
   */
  async getCurrency(
    shopifyCurrencyCode?: string,
    acceptLanguage?: string
  ): Promise<string> {
    const result = await this.detectUserCurrency(shopifyCurrencyCode, acceptLanguage);
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
      return `${value.toFixed(2)} ${symbol}`;
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
  acceptLanguage?: string
): Promise<string> {
  return currencyService.getCurrency(shopifyCurrencyCode, acceptLanguage);
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
  acceptLanguage?: string
): Promise<CurrencyDetectionResult> {
  return currencyService.detectUserCurrency(shopifyCurrencyCode, acceptLanguage);
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

