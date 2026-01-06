/**
 * 🍍 JOLANANAS - Types pour le Service de Gestion des Devises
 * ============================================================
 * Types TypeScript pour le système de gestion prédictive des devises Shopify
 */

/**
 * Informations complètes sur une devise
 */
export interface CurrencyInfo {
  /** Code ISO de la devise (ex: 'EUR', 'USD', 'GBP') */
  code: string;
  /** Nom de la devise (ex: 'Euro', 'US Dollar') */
  name?: string;
  /** Symbole de la devise (ex: '€', '$', '£') */
  symbol?: string;
  /** Taux de change par rapport à la devise de base (si multi-currency) */
  rate?: number;
  /** Date de dernière mise à jour du taux de change */
  rateUpdatedAt?: Date;
}

/**
 * Configuration du service de devises
 */
export interface CurrencyServiceConfig {
  /** Devise par défaut si détection échoue */
  defaultCurrency?: string;
  /** Durée du cache en millisecondes (défaut: 1 heure) */
  cacheDuration?: number;
  /** Activer la détection automatique */
  enableAutoDetection?: boolean;
  /** Activer le support multi-currency */
  enableMultiCurrency?: boolean;
}

/**
 * Résultat de la détection de devise
 */
export interface CurrencyDetectionResult {
  /** Code de la devise détectée */
  currency: string;
  /** Source de la détection */
  source: 'shopify-response' | 'user-preference' | 'geolocation' | 'browser' | 'shop-default' | 'fallback';
  /** Confiance dans la détection (0-1) */
  confidence: number;
  /** Informations supplémentaires */
  metadata?: {
    /** Locale détectée */
    locale?: string;
    /** Pays détecté */
    country?: string;
    /** Raison de la sélection */
    reason?: string;
  };
}

/**
 * Réponse de l'API Shopify pour les devises activées
 */
export interface ShopifyCurrencyResponse {
  currencies: Array<{
    currency: string;
    rate_updated_at: string;
  }>;
}

/**
 * État du service de devises
 */
export interface CurrencyServiceState {
  /** Devise actuellement utilisée */
  currentCurrency: string;
  /** Devise de la boutique Shopify */
  shopCurrency: string | null;
  /** Liste des devises disponibles */
  availableCurrencies: CurrencyInfo[];
  /** Indique si le multi-currency est activé */
  isMultiCurrencyEnabled: boolean;
  /** État de chargement */
  isLoading: boolean;
  /** Erreur éventuelle */
  error: Error | null;
}







