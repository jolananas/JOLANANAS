import { normalizeDataForAPI, normalizeHeaderValue } from './formatters';

/**
 * Options étendues pour safeFetch
 */
export interface SafeFetchOptions extends RequestInit {
  /**
   * Si true, normalise automatiquement le body JSON
   * @default true
   */
  normalizeBody?: boolean;
  
  /**
   * Si true, normalise automatiquement les headers
   * @default true
   */
  normalizeHeaders?: boolean;
}

/**
 * Wrapper sécurisé pour fetch() qui normalise automatiquement les données
 * pour éviter l'erreur ByteString avec les caractères Unicode
 * 
 * @param url URL de la requête
 * @param options Options de la requête (compatible avec RequestInit)
 * @returns Promise<Response>
 * 
 * @example
 * ```ts
 * const response = await safeFetch('/api/checkout/create', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({ name: 'Jean–Pierre' }) // Le tiret cadratin sera normalisé
 * });
 * ```
 */
export async function safeFetch(
  url: string | URL,
  options: SafeFetchOptions = {}
): Promise<Response> {
  const {
    normalizeBody = true,
    normalizeHeaders = true,
    headers = {},
    body,
    ...restOptions
  } = options;

  // Normaliser les headers
  let normalizedHeaders: HeadersInit = headers;
  if (normalizeHeaders && headers) {
    if (headers instanceof Headers) {
      // Si c'est un objet Headers, créer un nouvel objet Headers
      const newHeaders = new Headers();
      headers.forEach((value, key) => {
        newHeaders.set(key, normalizeHeaderValue(value));
      });
      normalizedHeaders = newHeaders;
    } else if (Array.isArray(headers)) {
      // Si c'est un tableau de tuples [key, value]
      normalizedHeaders = headers.map(([key, value]) => [
        key,
        normalizeHeaderValue(value as string)
      ] as [string, string]);
    } else {
      // Si c'est un objet Record<string, string>
      const normalizedObj: Record<string, string> = {};
      Object.entries(headers).forEach(([key, value]) => {
        normalizedObj[key] = normalizeHeaderValue(value as string);
      });
      normalizedHeaders = normalizedObj;
    }
  }

  // Normaliser le body si c'est une string JSON
  let normalizedBody: BodyInit | undefined = body || undefined;
  if (normalizeBody && body) {
    if (typeof body === 'string') {
      try {
        // Essayer de parser le JSON pour le normaliser
        const parsed = JSON.parse(body);
        const normalized = normalizeDataForAPI(parsed);
        normalizedBody = JSON.stringify(normalized);
      } catch {
        // Si ce n'est pas du JSON, normaliser la string directement
        normalizedBody = normalizeDataForAPI(body);
      }
    } else if (body instanceof FormData) {
      // Pour FormData, normaliser les valeurs string
      const normalizedFormData = new FormData();
      body.forEach((value, key) => {
        if (typeof value === 'string') {
          normalizedFormData.append(key, normalizeDataForAPI(value));
        } else {
          normalizedFormData.append(key, value);
        }
      });
      normalizedBody = normalizedFormData;
    } else if (body instanceof URLSearchParams) {
      // Pour URLSearchParams, normaliser les valeurs
      const normalizedParams = new URLSearchParams();
      body.forEach((value, key) => {
        normalizedParams.append(key, normalizeDataForAPI(value));
      });
      normalizedBody = normalizedParams;
    }
  }

  // Normaliser l'URL si nécessaire (pour les caractères Unicode dans les query params)
  let normalizedUrl: string | URL = url;
  if (typeof url === 'string' && url.includes('?')) {
    try {
      const urlObj = new URL(url, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
      // Normaliser les query params
      urlObj.searchParams.forEach((value, key) => {
        urlObj.searchParams.set(key, normalizeDataForAPI(value));
      });
      normalizedUrl = urlObj.toString();
    } catch {
      // Si l'URL est invalide, la normaliser directement
      normalizedUrl = normalizeDataForAPI(url);
    }
  }

  // Appeler fetch avec les données normalisées
  return fetch(normalizedUrl, {
    ...restOptions,
    headers: normalizedHeaders,
    body: normalizedBody,
  });
}

/**
 * Helper pour créer une requête POST avec body JSON normalisé
 * 
 * @param url URL de la requête
 * @param data Données à envoyer (seront normalisées automatiquement)
 * @param options Options supplémentaires pour fetch
 * @returns Promise<Response>
 * 
 * @example
 * ```ts
 * const response = await safeFetchJSON('/api/checkout/create', {
 *   items: [...],
 *   shippingInfo: { name: 'Jean–Pierre' }
 * });
 * ```
 */
export async function safeFetchJSON<T = any>(
  url: string | URL,
  data: T,
  options: Omit<SafeFetchOptions, 'body' | 'method'> = {}
): Promise<Response> {
  // Normaliser les données avant JSON.stringify()
  const normalizedData = normalizeDataForAPI(data);
  
  return safeFetch(url, {
    ...options,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: JSON.stringify(normalizedData),
  });
}

