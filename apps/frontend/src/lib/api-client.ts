import ky, { type KyInstance, type Options as KyOptions, HTTPError } from 'ky';

interface FetchOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  onRetry?: (attempt: number) => void;
}

interface ApiError extends Error {
  status?: number;
  statusText?: string;
  data?: unknown;
}

/**
 * Crée une erreur API standardisée compatible avec l'ancienne interface
 */
function createApiError(
  message: string,
  status?: number,
  statusText?: string,
  data?: unknown
): ApiError {
  const error = new Error(message) as ApiError;
  error.status = status;
  error.statusText = statusText;
  error.data = data;
  return error;
}

/**
 * Convertit une HTTPError de ky en ApiError
 */
function convertKyError(error: unknown): ApiError {
  if (error instanceof HTTPError) {
    const status = error.response.status;
    
    // Gérer le cas du status 0 (requête interrompue, souvent lié aux redirections)
    if (status === 0) {
      return createApiError(
        'Ressource non trouvée',
        404,
        'Request interrupted (likely redirect)'
      );
    }
    
    return createApiError(
      error.message,
      status,
      error.response.statusText,
      error.response
    );
  }
  
  if (error instanceof Error) {
    // Détecter les erreurs de réseau ou de redirection dans le message
    if (error.message.includes('status code 0') || error.message.includes('Failed to fetch')) {
      return createApiError(
        'Ressource non trouvée',
        404,
        'Request failed (likely redirect or network issue)'
      );
    }
    return createApiError(error.message);
  }
  
  return createApiError('Erreur inconnue');
}

/**
 * Instance ky configurée avec retry et timeout par défaut
 */
const kyInstance: KyInstance = ky.create({
  timeout: 10000, // 10 secondes par défaut
  retry: {
    limit: 3, // 3 tentatives par défaut
    methods: ['get', 'put', 'head', 'delete', 'options', 'trace'],
    statusCodes: [408, 413, 429, 500, 502, 503, 504], // Codes à retry
    backoffLimit: 10000, // Max 10s entre retries
  },
  hooks: {
    beforeError: [
      async (error) => {
        // Ne pas retry pour les erreurs 401, 403, 404
        if (error instanceof HTTPError) {
          const status = error.response.status;
          if (status === 401) {
            throw createApiError(
              'Session expirée. Veuillez vous reconnecter.',
              status,
              error.response.statusText
            );
          }
          if (status === 403) {
            throw createApiError(
              'Accès non autorisé',
              status,
              error.response.statusText
            );
          }
          if (status === 404) {
            throw createApiError(
              'Ressource non trouvée',
              status,
              error.response.statusText
            );
          }
        }
        return error;
      },
    ],
    afterResponse: [
      async (request, options, response) => {
        // Gérer les erreurs réseau
        if (!response.ok && response.status >= 500) {
          const errorData = await response.json().catch(() => ({}));
          throw createApiError(
            (errorData as { error?: string })?.error || response.statusText || 'Erreur API',
            response.status,
            response.statusText,
            errorData
          );
        }
      },
    ],
  },
});

/**
 * Client API avec retry automatique et timeout
 * Interface compatible avec l'ancienne implémentation
 */
export async function apiFetch<T = unknown>(
  url: string,
  options: FetchOptions = {}
): Promise<{ data: T; response: Response }> {
  const {
    timeout = 10000,
    retries = 3,
    retryDelay = 1000,
    onRetry,
    ...fetchOptions
  } = options;

  try {
    // Configurer ky avec les options personnalisées
    const kyOptions: KyOptions = {
      timeout,
      retry: {
        limit: retries,
        backoffLimit: retryDelay * 10, // Max delay
      },
      ...fetchOptions,
    };

    // Ne pas ajouter Content-Type pour FormData
    const isFormData = fetchOptions.body instanceof FormData;
    if (!isFormData && !fetchOptions.headers?.['Content-Type']) {
      kyOptions.headers = {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      };
    }

    // Effectuer la requête avec ky
    const response = await kyInstance(url, kyOptions);
    
    // Extraire les données JSON
    let data: T;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json() as T;
    } else {
      data = {} as T;
    }

    return { data, response: response as unknown as Response };

  } catch (error) {
    // Convertir les erreurs ky en ApiError
    throw convertKyError(error);
  }
}

/**
 * Helper pour les requêtes GET
 * Utilise ky directement pour de meilleures performances
 */
export async function apiGet<T = unknown>(
  url: string,
  options?: Omit<FetchOptions, 'method' | 'body'>
): Promise<T> {
  try {
    const response = await kyInstance.get(url, {
      ...options,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      // Permettre les redirections mais détecter le HTML dans la réponse finale
      redirect: 'follow',
    });
    
    // Vérifier si c'est une redirection (peut arriver même avec redirect: 'follow')
    if (response.status >= 300 && response.status < 400) {
      // Si c'est une redirection, considérer comme 404 pour les requêtes API
      throw createApiError(
        'Ressource non trouvée',
        404,
        'Redirected to HTML page'
      );
    }
    
    // Cloner la réponse pour pouvoir la lire plusieurs fois si nécessaire
    const clonedResponse = response.clone();
    
    // Lire le texte d'abord pour vérifier s'il s'agit de HTML
    const text = await clonedResponse.text();
    
    // Si c'est du HTML (redirection suivie ou réponse HTML), considérer comme 404
    if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
      throw createApiError(
        'Ressource non trouvée',
        404,
        'HTML response received (likely redirect)'
      );
    }
    
    // Vérifier le Content-Type
    const contentType = response.headers.get('content-type');
    if (!contentType.includes('application/json')) {
      // Si ce n'est pas du JSON et que ce n'est pas du HTML (déjà vérifié), considérer comme 404
      throw createApiError(
        'Ressource non trouvée',
        404,
        'Non-JSON response received'
      );
    }
    
    // Parser le JSON depuis le texte déjà lu
    try {
      return JSON.parse(text) as T;
    } catch (parseError) {
      // Si le parsing échoue, c'est une erreur de format JSON
      throw createApiError(
        'Ressource non trouvée',
        404,
        'Invalid JSON response'
      );
    }
  } catch (error) {
    // Détecter les erreurs avec status 0 (requête interrompue, souvent lié aux redirections)
    if (error instanceof HTTPError && error.response.status === 0) {
      throw createApiError(
        'Ressource non trouvée',
        404,
        'Request interrupted (likely redirect)'
      );
    }
    
    // Détecter les erreurs de parsing JSON (quand on reçoit du HTML au lieu de JSON)
    if (error instanceof SyntaxError && error.message.includes('Unexpected token')) {
      // Si on essaie de parser du HTML comme JSON, considérer comme 404
      throw createApiError(
        'Ressource non trouvée',
        404,
        'Non-JSON response received (likely HTML redirect)'
      );
    }
    
    // Pour les erreurs 404, créer une erreur propre sans exposer le JSON brut
    if (error instanceof HTTPError && error.response.status === 404) {
      const apiError = createApiError(
        'Ressource non trouvée',
        404,
        error.response.statusText
      );
      throw apiError;
    }
    
    // Si l'erreur est déjà une ApiError avec status 404, la relancer
    if (error instanceof Error && 'status' in error && (error as ApiError).status === 404) {
      throw error;
    }
    
    throw convertKyError(error);
  }
}

/**
 * Helper pour les requêtes POST
 * Utilise ky directement pour de meilleures performances
 */
export async function apiPost<T = unknown>(
  url: string,
  body?: unknown,
  options?: Omit<FetchOptions, 'method' | 'body'>
): Promise<T> {
  try {
    return await kyInstance.post(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      json: body,
    }).json<T>();
  } catch (error) {
    throw convertKyError(error);
  }
}

/**
 * Helper pour les requêtes PUT
 * Utilise ky directement pour de meilleures performances
 */
export async function apiPut<T = unknown>(
  url: string,
  body?: unknown,
  options?: Omit<FetchOptions, 'method' | 'body'>
): Promise<T> {
  try {
    return await kyInstance.put(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      json: body,
    }).json<T>();
  } catch (error) {
    throw convertKyError(error);
  }
}

/**
 * Helper pour les requêtes DELETE
 * Utilise ky directement pour de meilleures performances
 */
export async function apiDelete<T = unknown>(
  url: string,
  options?: Omit<FetchOptions, 'method' | 'body'>
): Promise<T> {
  try {
    return await kyInstance.delete(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    }).json<T>();
  } catch (error) {
    throw convertKyError(error);
  }
}

/**
 * Parse JSON de manière sécurisée en vérifiant le Content-Type
 * Évite l'erreur "Unexpected token '<', "<!DOCTYPE "... is not valid JSON"
 * qui se produit quand une route API retourne du HTML au lieu de JSON
 */
export async function safeJsonParse<T = unknown>(
  response: Response
): Promise<T> {
  // Cloner la réponse dès le début pour pouvoir lire le body plusieurs fois si nécessaire
  const clonedResponse = response.clone();
  const contentType = response.headers.get('content-type');
  
  // Vérifier que le Content-Type est JSON
  if (!contentType || !contentType.includes('application/json')) {
    // Si ce n'est pas du JSON, lire le texte pour voir ce qui a été retourné
    const text = await clonedResponse.text();
    
    // Si c'est du HTML (erreur 404/500 de Next.js), extraire un message d'erreur
    if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
      throw new Error(
        `La route API a retourné du HTML au lieu de JSON. ` +
        `Cela indique probablement que la route n'existe pas ou qu'une erreur serveur s'est produite. ` +
        `Status: ${response.status} ${response.statusText}`
      );
    }
    
    // Autre type de contenu
    throw new Error(
      `Réponse non-JSON reçue (Content-Type: ${contentType || 'unknown'}). ` +
      `Status: ${response.status} ${response.statusText}`
    );
  }
  
  try {
    return await response.json() as T;
  } catch (error) {
    // Si le parsing JSON échoue, lire le texte pour voir ce qui a été retourné
    const text = await clonedResponse.text();
    console.error('❌ Erreur parsing JSON. Contenu reçu:', text.substring(0, 200));
    
    throw new Error(
      `Impossible de parser la réponse JSON. ` +
      `Status: ${response.status} ${response.statusText}. ` +
      `Contenu: ${text.substring(0, 100)}...`
    );
  }
}

/**
 * Export de l'instance ky pour usage avancé
 */
export { kyInstance };

