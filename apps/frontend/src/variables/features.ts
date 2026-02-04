/**
 * 🍍 JOLANANAS - Configuration Features
 * ======================================
 * Configuration des fonctionnalités activables/désactivables
 */

export const features = {
  // Fonctionnalités de base
  CUSTOMER_ACCOUNTS: process.env.FEATURE_CUSTOMER_ACCOUNTS === 'true',
  MULTI_LOCATION: process.env.FEATURE_MULTI_LOCATION === 'true',
  WEBHOOKS: process.env.FEATURE_WEBHOOKS === 'true',
  
  // Fonctionnalités avancées
  ADVANCED_SEARCH: process.env.FEATURE_ADVANCED_SEARCH === 'true',
  DARK_MODE: process.env.FEATURE_DARK_MODE === 'true',
  PWA_SUPPORT: process.env.FEATURE_PWA_SUPPORT === 'true',
  
  // Fonctionnalités analytics
  ANALYTICS: process.env.FEATURE_ANALYTICS === 'true',
  HOTJAR: process.env.FEATURE_HOTJAR === 'true',
  FACEBOOK_PIXEL: process.env.FEATURE_FACEBOOK_PIXEL === 'true',
  
  // Cache et performance
  CACHE_ENABLED: process.env.CACHE_ENABLED !== 'false',
  SWR_ENABLED: process.env.SWR_ENABLED !== 'false',
  
  // Debug et développement
  DEBUG_MODE: process.env.DEBUG_MODE === 'true',
  VERBOSE_LOGGING: process.env.VERBOSE_LOGGING === 'true',
} as const;

// Types TypeScript pour les features
export type FeatureKey = keyof typeof features;
export type FeatureToggle = typeof features[FeatureKey];

// Fonction utilitaire pour vérifier les features
export function isFeatureEnabled(feature: FeatureKey): boolean {
  return features[feature];
}

// Fonction pour obtenir toutes les features activées
export function getActiveFeatures(): Partial<typeof features> {
  return Object.entries(features)
    .filter(([, enabled]) => enabled)
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
}

// Configuration des limites par features
export const featureLimits = {
  PRODUCT_SEARCH_MAX_RESULTS: isFeatureEnabled('ADVANCED_SEARCH') ? 100 : 20,
  CART_MAX_ITEMS: 50,
  WISHLIST_MAX_ITEMS: 100,
  RECENTLY_VIEWED_MAX: 20,
} as const;
