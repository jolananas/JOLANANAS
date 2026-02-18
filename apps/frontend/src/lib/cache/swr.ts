import { SWRConfiguration } from 'swr';
import { apiGet } from '../api-client';

/**
 * Durées de cache par type de ressource (en secondes)
 */
export const CACHE_DURATIONS = {
  PRODUCTS: 300,        // 5 minutes
  PRODUCT: 600,         // 10 minutes
  COLLECTIONS: 1800,    // 30 minutes
  CART: 60,             // 1 minute
  SEARCH: 300,          // 5 minutes
  USER_DATA: 120,       // 2 minutes
} as const;

/**
 * Configuration SWR globale
 */
export const swrConfig: SWRConfiguration = {
  // Revalidation automatique
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  refreshInterval: 0, // Pas de refresh automatique par défaut
  
  // Durées de cache
  dedupingInterval: 2000, // 2 secondes pour déduplication
  
  // Configuration erreur avec logging structuré
  onError: (error, key) => {
    console.error('SWR Error:', {
      key,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    });
  },
  
  // Fetcher par défaut utilisant api-client (ky)
  fetcher: async (url: string) => {
    if (typeof url !== 'string') {
      throw new Error('SWR fetcher: URL must be a string');
    }
    return apiGet(url);
  },
  
  // Gestion des erreurs
  shouldRetryOnError: true,
  errorRetryCount: 3,
  errorRetryInterval: 5000,
  
  // Keep previous data pendant le rechargement
  keepPreviousData: true,
};

/**
 * Middleware SWR pour logging (optionnel)
 */
export const swrMiddleware = (useSWRNext: any) => {
  return (key: string, fetcher: any, config: any) => {
    const swr = useSWRNext(key, fetcher, config);
    
    // Log en développement
    if (process.env.NODE_ENV === 'development' && swr.data) {
      console.log(`[SWR] Cache hit: ${key}`);
    }
    
    return swr;
  };
};
