/**
 * Patterns d'erreurs Shopify à détecter et transformer
 */
const ERROR_PATTERNS = {
  INVALID_PRODUCT_ID: /Invalid id: gid:\/\/shopify\/Product\//i,
  INVALID_VARIANT_ID: /Invalid id: gid:\/\/shopify\/ProductVariant\//i,
  PRODUCT_NOT_FOUND: /Product.*not found/i,
  VARIANT_NOT_FOUND: /Variant.*not found/i,
  CART_ERROR: /Cart.*error/i,
  CART_NOT_FOUND: /Cart.*not found/i,
  INVALID_MERCHANDISE: /Invalid.*merchandise/i,
  QUANTITY_INVALID: /Quantity.*invalid/i,
  OUT_OF_STOCK: /out of stock|not available|épuisé/i,
} as const;

/**
 * Messages utilisateur-friendly pour chaque type d'erreur
 */
const USER_FRIENDLY_MESSAGES = {
  INVALID_PRODUCT_ID: 'Le produit sélectionné n\'est plus disponible. Veuillez rafraîchir la page et réessayer.',
  INVALID_VARIANT_ID: 'La variante sélectionnée n\'est plus disponible. Veuillez choisir une autre option.',
  PRODUCT_NOT_FOUND: 'Le produit demandé n\'existe pas ou a été supprimé.',
  VARIANT_NOT_FOUND: 'La variante demandée n\'existe pas ou a été supprimée.',
  CART_ERROR: 'Une erreur est survenue avec votre panier. Veuillez réessayer.',
  CART_NOT_FOUND: 'Votre panier n\'a pas été trouvé. Veuillez rafraîchir la page.',
  INVALID_MERCHANDISE: 'Le produit sélectionné n\'est plus disponible. Veuillez choisir un autre produit.',
  QUANTITY_INVALID: 'La quantité sélectionnée n\'est pas valide. Veuillez vérifier votre saisie.',
  OUT_OF_STOCK: 'Ce produit est actuellement épuisé. Veuillez réessayer plus tard.',
  DEFAULT: 'Une erreur est survenue. Veuillez réessayer dans quelques instants.',
} as const;

/**
 * Transforme une erreur technique Shopify en message utilisateur-friendly
 * 
 * @param error - L'erreur à transformer (string ou Error)
 * @param context - Contexte optionnel pour le logging (ex: "addToCart", "checkout")
 * @returns Message utilisateur-friendly
 */
export function transformShopifyError(
  error: string | Error | unknown,
  context?: string
): string {
  // Extraire le message de l'erreur
  let errorMessage = '';
  
  if (typeof error === 'string') {
    errorMessage = error;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else if (error && typeof error === 'object' && 'message' in error) {
    errorMessage = String(error.message);
  } else {
    errorMessage = String(error);
  }

  // Si l'erreur est vide ou générique, retourner le message par défaut
  if (!errorMessage || errorMessage.trim().length === 0) {
    return USER_FRIENDLY_MESSAGES.DEFAULT;
  }

  const normalizedError = errorMessage.trim();

  // Vérifier si l'erreur est déjà un message utilisateur-friendly (déjà transformée)
  // Si c'est le cas, on ne la re-transforme pas
  const isAlreadyTransformed = Object.values(USER_FRIENDLY_MESSAGES).some(
    (msg) => normalizedError === msg || normalizedError.includes(msg.substring(0, 20))
  );
  
  if (isAlreadyTransformed) {
    // L'erreur est déjà transformée, on la retourne telle quelle
    return normalizedError;
  }

  // Logger l'erreur technique originale pour le debugging
  const logContext = context ? `[${context}]` : '';
  console.error(`❌ Erreur Shopify technique ${logContext}:`, errorMessage);

  // Vérifier chaque pattern d'erreur
  if (ERROR_PATTERNS.INVALID_PRODUCT_ID.test(normalizedError)) {
    return USER_FRIENDLY_MESSAGES.INVALID_PRODUCT_ID;
  }

  if (ERROR_PATTERNS.INVALID_VARIANT_ID.test(normalizedError)) {
    return USER_FRIENDLY_MESSAGES.INVALID_VARIANT_ID;
  }

  if (ERROR_PATTERNS.PRODUCT_NOT_FOUND.test(normalizedError)) {
    return USER_FRIENDLY_MESSAGES.PRODUCT_NOT_FOUND;
  }

  if (ERROR_PATTERNS.VARIANT_NOT_FOUND.test(normalizedError)) {
    return USER_FRIENDLY_MESSAGES.VARIANT_NOT_FOUND;
  }

  if (ERROR_PATTERNS.CART_NOT_FOUND.test(normalizedError)) {
    return USER_FRIENDLY_MESSAGES.CART_NOT_FOUND;
  }

  if (ERROR_PATTERNS.CART_ERROR.test(normalizedError)) {
    return USER_FRIENDLY_MESSAGES.CART_ERROR;
  }

  if (ERROR_PATTERNS.INVALID_MERCHANDISE.test(normalizedError)) {
    return USER_FRIENDLY_MESSAGES.INVALID_MERCHANDISE;
  }

  if (ERROR_PATTERNS.QUANTITY_INVALID.test(normalizedError)) {
    return USER_FRIENDLY_MESSAGES.QUANTITY_INVALID;
  }

  if (ERROR_PATTERNS.OUT_OF_STOCK.test(normalizedError)) {
    return USER_FRIENDLY_MESSAGES.OUT_OF_STOCK;
  }

  // Si aucun pattern ne correspond, retourner le message par défaut
  // mais logger quand même l'erreur originale pour investigation
  if (process.env.NODE_ENV === 'development') {
    console.warn('⚠️ Erreur Shopify non reconnue, utilisation du message par défaut:', normalizedError);
  }

  return USER_FRIENDLY_MESSAGES.DEFAULT;
}

/**
 * Transforme un tableau d'erreurs Shopify en un seul message utilisateur-friendly
 * 
 * @param errors - Tableau d'erreurs à transformer
 * @param context - Contexte optionnel pour le logging
 * @returns Message utilisateur-friendly combiné
 */
export function transformShopifyErrors(
  errors: Array<string | Error | { message?: string }>,
  context?: string
): string {
  if (!errors || errors.length === 0) {
    return USER_FRIENDLY_MESSAGES.DEFAULT;
  }

  // Transformer chaque erreur
  const transformedErrors = errors.map((error) => {
    if (error && typeof error === 'object' && 'message' in error) {
      return transformShopifyError(error.message || error, context);
    }
    return transformShopifyError(error, context);
  });

  // Retourner la première erreur transformée (ou combiner si nécessaire)
  return transformedErrors[0] || USER_FRIENDLY_MESSAGES.DEFAULT;
}

/**
 * Extrait et transforme les userErrors d'une réponse Shopify
 * 
 * @param response - Réponse Shopify avec userErrors
 * @param context - Contexte optionnel pour le logging
 * @returns Message utilisateur-friendly ou null si pas d'erreur
 */
export function extractAndTransformUserErrors(
  response: {
    userErrors?: Array<{ message?: string; field?: string }>;
    errors?: Array<{ message?: string }>;
  },
  context?: string
): string | null {
  // Vérifier les userErrors d'abord (erreurs utilisateur)
  if (response.userErrors && response.userErrors.length > 0) {
    const messages = response.userErrors
      .map((err) => err.message)
      .filter((msg): msg is string => !!msg);
    
    if (messages.length > 0) {
      return transformShopifyErrors(messages, context);
    }
  }

  // Vérifier les errors GraphQL
  if (response.errors && response.errors.length > 0) {
    const messages = response.errors
      .map((err) => err.message)
      .filter((msg): msg is string => !!msg);
    
    if (messages.length > 0) {
      return transformShopifyErrors(messages, context);
    }
  }

  return null;
}

