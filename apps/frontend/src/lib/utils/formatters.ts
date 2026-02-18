import { slugify } from './slugify';

/**
 * Détecte si on est en mode développement
 */
function isDevelopment(): boolean {
  if (typeof window !== 'undefined') {
    return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  }
  return typeof process !== 'undefined' && process.env?.NODE_ENV === 'development';
}

/**
 * Mapping complet des caractères Unicode courants vers leurs équivalents ASCII
 * Utilisé par sanitizeStringForByteString pour garantir la compatibilité ByteString
 */
const UNICODE_TO_ASCII_MAP: Record<number, string> = {
  // Tirets
  8211: '-', // – (tiret demi-cadratin)
  8212: '-', // — (tiret cadratin)
  8208: '-', // ‐ (tiret insécable)
  8209: '-', // ‑ (tiret conditionnel)
  
  // Guillemets simples
  8216: "'", // ' (guillemet simple gauche)
  8217: "'", // ' (guillemet simple droit)
  8218: "'", // ‚ (guillemet simple bas)
  8219: "'", // ‛ (guillemet simple haut)
  
  // Guillemets doubles
  8220: '"', // " (guillemet double gauche)
  8221: '"', // " (guillemet double droit)
  8222: '"', // „ (guillemet double bas)
  8223: '"', // ‟ (guillemet double haut)
  
  // Espaces Unicode (8192-8207)
  8192: ' ', // (espace cadratin)
  8193: ' ', // (espace cadratin)
  8194: ' ', // (espace demi-cadratin)
  8195: ' ', // (espace cadratin)
  8196: ' ', // (espace ponctuation)
  8197: ' ', // (espace fine)
  8198: ' ', // (espace fine)
  8199: ' ', // (espace fine)
  8200: ' ', // (espace fine)
  8201: ' ', // (espace fine)
  8202: ' ', // (espace fine)
  8203: ' ', // (espace insécable)
  8204: ' ', // (espace insécable)
  8205: ' ', // (espace insécable)
  8206: ' ', // (espace insécable)
  8207: ' ', // (espace insécable)
  
  // Séparateurs de ligne Unicode
  8232: ' ', // (séparateur de ligne)
  8233: ' ', // (séparateur de paragraphe)
  
  // Points de suspension Unicode (8230) - Source fréquente d'erreur ByteString
  // Peut provenir de copier-coller depuis Word/PDF ou de noms de dossiers
  // https://github.com/nextauthjs/next-auth/discussions/8457
  8230: '...', // … (points de suspension Unicode) → ... (trois points ASCII)
  
  // Autres caractères courants
  160: ' ',  // (espace insécable)
  173: '-',  // (trait d'union conditionnel)
};

/**
 * Sanitise une chaîne de caractères pour garantir qu'elle ne contient que des caractères ASCII (0-255)
 * Remplace tous les caractères Unicode > 255 par leurs équivalents ASCII
 * 
 * Cette fonction est la base de toutes les normalisations pour éviter l'erreur ByteString
 * 
 * @param str Chaîne à sanitizer
 * @returns Chaîne avec uniquement des caractères ASCII (0-255)
 * 
 * @example
 * ```ts
 * sanitizeStringForByteString('Jean–Pierre') // 'Jean-Pierre'
 * sanitizeStringForByteString('"Hello"') // '"Hello"'
 * ```
 */
export function sanitizeStringForByteString(str: string): string {
  if (!str || typeof str !== 'string') {
    return '';
  }

  // AMÉLIORATION CRITIQUE : Détection et remplacement IMMÉDIAT des En dashes (8211)
  // Avant même la première passe regex, scanner et remplacer tous les caractères > 255
  // Cela garantit qu'aucun En dash ne passe à travers, même dans les cas edge
  let immediateCleaned = '';
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if (code === 8211 || code === 8212) {
      // Remplacer immédiatement les tirets Unicode par un tiret simple
      immediateCleaned += '-';
    } else if (code > 255) {
      // Pour les autres caractères > 255, utiliser le mapping ou remplacer par un espace
      const replacement = UNICODE_TO_ASCII_MAP[code] || ' ';
      immediateCleaned += replacement;
    } else {
      immediateCleaned += str[i];
    }
  }
  
  // Utiliser la chaîne immédiatement nettoyée pour la suite
  str = immediateCleaned;

  // Vérification initiale : scanner la chaîne originale pour détecter les caractères problématiques
  const initialProblematic: Array<{ char: string; code: number; index: number; context: string }> = [];
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if (code > 255) {
      const context = str.substring(Math.max(0, i - 10), Math.min(str.length, i + 10));
      initialProblematic.push({ char: str[i], code, index: i, context });
    }
  }
  
  if (initialProblematic.length > 0 && isDevelopment()) {
    console.warn('⚠️ Caractères Unicode détectés AVANT nettoyage dans sanitizeStringForByteString:');
    initialProblematic.forEach(({ char, code, index, context }) => {
      console.warn(`   - Index ${index}: "${char}" (code: ${code}, U+${code.toString(16).toUpperCase().padStart(4, '0')})`);
      console.warn(`     Contexte: "${context}"`);
    });
  }

  // Première passe : remplacements regex pour les caractères Unicode courants (plus rapide)
  // CRITIQUE : Le caractère 8211 (tiret demi-cadratin) doit être remplacé ici
  // CRITIQUE : Le caractère 8230 (points de suspension Unicode) doit être remplacé ici
  // https://github.com/nextauthjs/next-auth/discussions/8457
  let cleaned = str
    .replace(/–/g, '-')  // Tiret demi-cadratin (U+2013, 8211) - CRITIQUE
    .replace(/—/g, '-')  // Tiret cadratin (U+2014, 8212)
    .replace(/…/g, '...')  // Points de suspension Unicode (U+2026, 8230) - CRITIQUE
    .replace(/['']/g, "'")  // Guillemets simples typographiques
    .replace(/[""]/g, '"')  // Guillemets doubles typographiques
    .replace(/[\u2000-\u206F]/g, ' ')  // Espaces et ponctuations Unicode
    .replace(/[\u2028-\u2029]/g, ' ')  // Séparateurs de ligne Unicode
    .replace(/\u00A0/g, ' ')  // Espace insécable
    .replace(/\u00AD/g, '-')  // Trait d'union conditionnel
    .replace(/\u200B/g, '')   // Espace de largeur zéro (supprimer)
    .replace(/\u200C/g, '')   // Espace de largeur zéro (supprimer)
    .replace(/\u200D/g, '')   // Espace de largeur zéro (supprimer)
    .replace(/\uFEFF/g, '');  // BOM UTF-8 (supprimer)

  // Deuxième passe : scan caractère par caractère pour garantir qu'aucun caractère > 255 ne reste
  // Cette passe est critique car elle garantit qu'aucun caractère Unicode ne passe
  const chars: string[] = [];
  const problematicChars: Array<{ char: string; code: number; index: number; context: string }> = [];
  
  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i];
    const code = char.charCodeAt(0);
    
    if (code > 255) {
      // Utiliser le mapping si disponible (le mapping 8211 → '-' est défini ligne 28)
      const replacement = UNICODE_TO_ASCII_MAP[code];
      if (replacement) {
        chars.push(replacement);
        if (isDevelopment() && (code === 8211 || code === 8230)) {
          const charName = code === 8211 ? 'tiret demi-cadratin' : 'points de suspension Unicode';
          console.warn(`⚠️ Caractère ${code} (${charName}) détecté et remplacé à l'index ${i} dans sanitizeStringForByteString`);
        }
      } else {
        // Caractère non mappé : remplacer par un tiret simple pour les tirets, sinon un espace
        const context = cleaned.substring(Math.max(0, i - 10), Math.min(cleaned.length, i + 10));
        if (code === 8211 || code === 8212) {
          chars.push('-'); // Forcer le remplacement des tirets Unicode
        } else {
          chars.push(' ');
        }
        if (isDevelopment()) {
          problematicChars.push({ char, code, index: i, context });
        }
      }
    } else {
      chars.push(char);
    }
  }

  // Logger les caractères problématiques en développement
  if (problematicChars.length > 0 && isDevelopment()) {
    console.warn('⚠️ Caractères Unicode non mappés détectés dans sanitizeStringForByteString:');
    problematicChars.forEach(({ char, code, index, context }) => {
      console.warn(`   - Index ${index}: "${char}" (code: ${code}, U+${code.toString(16).toUpperCase().padStart(4, '0')})`);
      console.warn(`     Contexte: "${context}"`);
    });
  }

  let result = chars.join('');

  // Vérification finale STRICTE : s'assurer qu'il n'y a plus aucun caractère > 255
  // Cette vérification est critique pour garantir la sécurité
  // NOUVEAU : Boucle de remplacement FORCÉ jusqu'à ce qu'il n'y ait plus aucun caractère > 255
  let maxIterations = 10; // Limite de sécurité pour éviter les boucles infinies
  let iteration = 0;
  
  while (iteration < maxIterations) {
    let foundProblematic = false;
    const newChars: string[] = [];
    
    for (let i = 0; i < result.length; i++) {
      const code = result.charCodeAt(i);
      if (code > 255) {
        foundProblematic = true;
        const context = result.substring(Math.max(0, i - 20), Math.min(result.length, i + 20));
        const errorMsg = `❌ ERREUR CRITIQUE dans sanitizeStringForByteString (itération ${iteration + 1}): Caractère > 255 toujours présent à l'index ${i}: "${result[i]}" (code: ${code})`;
        console.error(errorMsg);
        console.error(`   Contexte: "${context}"`);
        console.error(`   Chaîne originale (premiers 100 caractères): "${str.substring(0, 100)}"`);
        
        // Remplacer FORCEMENT par un tiret simple si c'est un tiret Unicode, sinon un espace
        const replacement = (code === 8211 || code === 8212) ? '-' : ' ';
        newChars.push(replacement);
      } else {
        newChars.push(result[i]);
      }
    }
    
    result = newChars.join('');
    
    if (!foundProblematic) {
      break; // Aucun caractère problématique trouvé, sortir de la boucle
    }
    
    iteration++;
  }
  
  if (iteration >= maxIterations) {
    console.error(`❌ ERREUR CRITIQUE: Impossible de nettoyer complètement la chaîne après ${maxIterations} itérations`);
    // Dernière tentative : remplacer TOUS les caractères > 255 par des espaces
    result = result.split('').map(char => {
      const code = char.charCodeAt(0);
      return code > 255 ? ' ' : char;
    }).join('');
  }

  // Vérification finale absolue : s'assurer qu'il n'y a vraiment plus aucun caractère > 255
  for (let i = 0; i < result.length; i++) {
    const code = result.charCodeAt(i);
    if (code > 255) {
      console.error(`❌ ERREUR ABSOLUE: Caractère > 255 toujours présent après toutes les tentatives à l'index ${i}: "${result[i]}" (code: ${code})`);
      // Remplacer par un espace en dernier recours
      result = result.substring(0, i) + ' ' + result.substring(i + 1);
    }
  }

  return result;
}

/**
 * Normalise les données pour l'envoi à l'API
 * Remplace les caractères Unicode problématiques par leurs équivalents ASCII
 * Évite l'erreur "Cannot convert argument to a ByteString" dans Next.js
 * 
 * Cette fonction parcourt récursivement les structures de données (objets, arrays)
 * et normalise toutes les chaînes de caractères qu'elle trouve, y compris les clés des objets.
 * 
 * @param data Données à normaliser (string, array, ou objet)
 * @returns Données normalisées avec caractères ASCII uniquement
 * 
 * @example
 * ```ts
 * normalizeDataForAPI({ name: 'Jean–Pierre', address: '123 Rue—Example' })
 * // { name: 'Jean-Pierre', address: '123 Rue-Example' }
 * ```
 */
export function normalizeDataForAPI<T>(data: T): T {
  // Gérer null et undefined
  if (data === null || data === undefined) {
    return data;
  }

  // Gérer les primitives non-string
  if (typeof data === 'number' || typeof data === 'boolean' || typeof data === 'bigint') {
    return data;
  }

  // Gérer les strings : utiliser sanitizeStringForByteString
  if (typeof data === 'string') {
    return sanitizeStringForByteString(data) as T;
  }

  // Gérer les arrays : normaliser récursivement chaque élément
  if (Array.isArray(data)) {
    return data.map(item => normalizeDataForAPI(item)) as T;
  }

  // Gérer les objets
  if (data && typeof data === 'object') {
    // Gérer les objets spéciaux (Date, RegExp, etc.) - ne pas les normaliser
    if (data instanceof Date || data instanceof RegExp || data instanceof Error) {
      return data;
    }

    // Gérer les objets null (objets créés avec Object.create(null))
    if (data.constructor !== Object && data.constructor !== Array) {
      // Pour les objets complexes, essayer de normaliser si possible
      // Sinon, retourner tel quel
      try {
        const stringified = JSON.stringify(data);
        const parsed = JSON.parse(stringified);
        return normalizeDataForAPI(parsed) as T;
      } catch {
        return data;
      }
    }

    // Gérer les objets simples : normaliser récursivement toutes les valeurs ET les clés
    // NOUVEAU : Normaliser aussi les clés des objets pour éviter les caractères Unicode dans les noms de propriétés
    const normalized: any = {};
    for (const key of Object.keys(data)) {
      // Normaliser la clé elle-même
      const normalizedKey = sanitizeStringForByteString(key);
      const value = (data as any)[key];
      // Normaliser même les valeurs null (mais pas undefined)
      if (value !== undefined) {
        normalized[normalizedKey] = normalizeDataForAPI(value);
      }
    }
    return normalized as T;
  }

  // Pour tout autre type, retourner tel quel
  return data;
}

/**
 * Normalise une valeur pour être utilisée dans une URL (paramètres de requête)
 * Garantit qu'aucun caractère Unicode > 255 ne passe dans les paramètres d'URL
 * 
 * @param value Valeur à normaliser pour l'URL
 * @returns Valeur normalisée avec caractères ASCII uniquement
 * 
 * @example
 * ```ts
 * normalizeURLValue('Jean–Pierre') // 'Jean-Pierre'
 * ```
 */
export function normalizeURLValue(value: string): string {
  if (!value || typeof value !== 'string') {
    return '';
  }

  // Utiliser sanitizeStringForByteString pour garantir l'ASCII
  const sanitized = sanitizeStringForByteString(value);

  // Vérification finale
  for (let i = 0; i < sanitized.length; i++) {
    if (sanitized.charCodeAt(i) > 255) {
      console.error(`❌ ERREUR dans normalizeURLValue: Caractère > 255 à l'index ${i}`);
      // Remplacer par un espace
      return sanitized.substring(0, i) + ' ' + sanitized.substring(i + 1);
    }
  }

  return sanitized;
}

/**
 * Normalise une valeur de header HTTP pour éviter l'erreur ByteString
 * Les headers HTTP ne peuvent contenir que des caractères ASCII (0-255)
 * 
 * @param value Valeur du header à normaliser
 * @returns Valeur normalisée avec caractères ASCII uniquement
 * 
 * @example
 * ```ts
 * normalizeHeaderValue('Content-Type: application/json') // Normalisé
 * ```
 */
export function normalizeHeaderValue(value: string | undefined | null): string {
  if (!value) {
    return '';
  }

  if (typeof value !== 'string') {
    return String(value);
  }

  // Utiliser sanitizeStringForByteString pour garantir l'ASCII
  const sanitized = sanitizeStringForByteString(value);

  // Vérification finale
  for (let i = 0; i < sanitized.length; i++) {
    if (sanitized.charCodeAt(i) > 255) {
      console.error(`❌ ERREUR dans normalizeHeaderValue: Caractère > 255 à l'index ${i}`);
      // Remplacer par un espace
      return sanitized.substring(0, i) + ' ' + sanitized.substring(i + 1);
    }
  }

  return sanitized;
}

/**
 * ⚠️ validateWebhookHMAC a été déplacée vers formatters.server.ts
 * Utilisez : import { validateWebhookHMAC } from '@/lib/utils/formatters.server';
 */

/**
 * Formater le prix Shopify pour l'affichage
 * 
 * ⚠️ DÉPRÉCIÉ : Cette fonction est maintenue pour compatibilité mais devrait être remplacée par :
 * - Côté client : `useCurrency().formatPrice()` (hook React)
 * - Côté serveur : `formatPrice()` depuis `@/lib/currency/currencyService`
 * 
 * Cette fonction utilise maintenant uniquement Intl.NumberFormat (client-safe).
 * 
 * @deprecated Utiliser `useCurrency().formatPrice()` côté client ou `formatPrice()` depuis currencyService côté serveur
 */
export function formatPrice(
  amount: string | number,
  currencyCode?: string,
  locale?: string
): string {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount;
  const currency = currencyCode || 'EUR';
  const userLocale = locale || (typeof window !== 'undefined' ? navigator.language : 'fr-FR');
  
  // Utiliser uniquement la version client-safe pour éviter les imports server-only
  // ⚠️ Pour une meilleure expérience côté serveur, utiliser formatPrice() depuis currencyService
  return formatPriceClientSafe(value, currency, userLocale);
}

/**
 * Version client-safe de formatPrice qui n'utilise pas currencyService
 */
function formatPriceClientSafe(
  value: number,
  currency: string,
  locale: string
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
    }).format(value);
  } catch (formatError) {
    // Fallback simple si Intl échoue
    const symbol = getCurrencySymbol(currency);
    return `${value.toFixed(2)} ${symbol}`;
  }
}

/**
 * Récupère le symbole d'une devise
 */
function getCurrencySymbol(currencyCode: string): string {
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
 * Extraire l'ID de variant depuis l'URL ou l'ID Shopify complet
 */
export function extractVariantId(input: string): string {
  // Si c'est déjà un ID simple, on le garde
  if (input.startsWith('gid://shopify/ProductVariant/')) {
    return input.replace('gid://shopify/ProductVariant/', '');
  }
  // Sinon on assume que c'est déjà l'ID simple
  return input;
}

/**
 * Formater les noms de produits pour l'affichage
 */
export function formatProductTitle(title: string, maxLength: number = 50): string {
  if (title.length <= maxLength) return title;
  return title.substring(0, maxLength).trim() + '...';
}

// Réexporter slugify pour la compatibilité
export { slugify };
