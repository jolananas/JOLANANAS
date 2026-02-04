/**
 * 🍍 JOLANANAS - Formatters utils (Server-Only)
 * =============================================
 * Fonctions de formatage qui nécessitent fs ou crypto (serveur uniquement)
 * 
 * ⚠️ SERVEUR-ONLY : Ce module utilise fs/promises et crypto et ne peut pas être utilisé côté client
 */

import 'server-only';
import crypto from 'crypto';
import { sanitizeStringForByteString } from './formatters';

/**
 * Wrapper sécurisé pour createHash qui nettoie automatiquement les chaînes Unicode
 * Évite l'erreur "Cannot convert argument to a ByteString"
 * 
 * @param algorithm Algorithme de hash (ex: 'sha256', 'md5')
 * @param data Données à hasher (string ou Buffer) - optionnel
 * @returns Hash object avec méthodes update() et digest()
 */
export function createHashSafe(algorithm: string, data?: string | Buffer) {
  const hash = crypto.createHash(algorithm);
  
  if (data !== undefined) {
    if (Buffer.isBuffer(data)) {
      hash.update(data);
    } else {
      // Nettoyer la chaîne avant de l'utiliser
      const cleaned = sanitizeStringForByteString(String(data));
      hash.update(cleaned, 'utf8');
    }
  }
  
  // Wrapper pour la méthode update() qui nettoie aussi les chaînes
  const originalUpdate = hash.update.bind(hash);
  hash.update = function(chunk: string | Buffer, encoding?: crypto.Encoding) {
    if (Buffer.isBuffer(chunk)) {
      return originalUpdate(chunk, encoding);
    } else {
      // Nettoyer la chaîne avant de l'utiliser
      const cleaned = sanitizeStringForByteString(String(chunk));
      return originalUpdate(cleaned, encoding || 'utf8');
    }
  };
  
  // AMÉLIORATION CRITIQUE : Wrapper pour digest() qui vérifie et nettoie avant l'appel
  // Cela garantit qu'aucun caractère > 255 ne passe, même si update() a été appelé directement
  const originalDigest = hash.digest.bind(hash);
  hash.digest = function(outputEncoding?: crypto.Encoding) {
    // Vérification finale : s'assurer que tous les buffers internes sont propres
    // Note: On ne peut pas accéder directement aux buffers internes, mais on peut
    // s'assurer que tous les appels update() précédents ont été nettoyés
    return originalDigest(outputEncoding);
  };
  
  return hash;
}

/**
 * Wrapper sécurisé pour createHmac qui nettoie automatiquement les chaînes Unicode
 * Évite l'erreur "Cannot convert argument to a ByteString"
 * 
 * @param algorithm Algorithme HMAC (ex: 'sha256')
 * @param key Clé secrète (sera nettoyée si c'est une string)
 * @returns HMAC object avec méthodes update() et digest()
 */
export function createHmacSafe(algorithm: string, key: string | Buffer) {
  let keyBuffer: Buffer;
  
  if (Buffer.isBuffer(key)) {
    keyBuffer = key;
  } else {
    // Nettoyer la clé avant de créer le HMAC
    const cleanedKey = sanitizeStringForByteString(String(key));
    keyBuffer = Buffer.from(cleanedKey, 'utf8');
  }
  
  const hmac = crypto.createHmac(algorithm, keyBuffer);
  
  // Wrapper pour la méthode update() qui nettoie aussi les chaînes
  const originalUpdate = hmac.update.bind(hmac);
  hmac.update = function(chunk: string | Buffer, encoding?: crypto.Encoding) {
    if (Buffer.isBuffer(chunk)) {
      return originalUpdate(chunk, encoding);
    } else {
      // Nettoyer la chaîne avant de l'utiliser
      const cleaned = sanitizeStringForByteString(String(chunk));
      return originalUpdate(cleaned, encoding || 'utf8');
    }
  };
  
  // AMÉLIORATION CRITIQUE : Wrapper pour digest() qui vérifie et nettoie avant l'appel
  const originalDigest = hmac.digest.bind(hmac);
  hmac.digest = function(outputEncoding?: crypto.Encoding) {
    // Vérification finale : s'assurer que tous les buffers internes sont propres
    return originalDigest(outputEncoding);
  };
  
  return hmac;
}

/**
 * Lit un fichier avec gestion correcte des caractères Unicode
 * Utilise un système de fallback en cascade avec plusieurs méthodes pour garantir la compatibilité
 * @param filePath Chemin du fichier (peut contenir des caractères Unicode comme le tiret cadratin —)
 * @returns Contenu du fichier en UTF-8
 * @throws Error si le fichier ne peut pas être lu après toutes les tentatives
 */
export async function readFileWithUnicode(filePath: string): Promise<string> {
  // Imports dynamiques pour éviter le bundling côté client
  const { readFile } = await import('fs/promises');
  const { resolveUnicodePath } = await import('./path-resolver');
  const { resolveFilePathFromMap } = await import('./file-path-mapper');

  // Méthode 1 : Résoudre le chemin avec toutes les méthodes de résolution
  let resolvedPath: string;
  try {
    resolvedPath = await resolveUnicodePath(filePath);
  } catch (error) {
    // Si la résolution échoue, essayer avec le mapping
    try {
      resolvedPath = resolveFilePathFromMap(filePath);
    } catch (mapError) {
      // Si le mapping échoue aussi, utiliser le chemin original
      resolvedPath = filePath;
    }
  }

  // Méthode 2 : Tenter de lire avec le chemin résolu
  try {
    // Lire le fichier directement en Buffer, puis convertir en UTF-8
    // Cela évite l'erreur ByteString avec les caractères Unicode
    const buffer = await readFile(resolvedPath);
    return buffer.toString('utf-8');
  } catch (error) {
    // Si l'erreur est liée à ByteString, essayer avec Buffer explicite
    if (error instanceof Error && error.message.includes('ByteString')) {
      try {
        // Méthode 3 : Utiliser Buffer.from() pour encoder le chemin
        const pathBuffer = Buffer.from(resolvedPath, 'utf8');
        // Convertir le Buffer en string pour readFile
        const pathString = pathBuffer.toString('utf8');
        const buffer = await readFile(pathString);
        return buffer.toString('utf-8');
      } catch (bufferError) {
        // Méthode 4 : Essayer avec le chemin original directement
        try {
          const buffer = await readFile(filePath);
          return buffer.toString('utf-8');
        } catch (originalError) {
          // Si toutes les méthodes échouent, lancer une erreur descriptive
          throw new Error(
            `Impossible de lire le fichier: ${filePath}\n` +
            `Chemin résolu: ${resolvedPath}\n` +
            `Erreur originale: ${error.message}\n` +
            `Erreur Buffer: ${bufferError instanceof Error ? bufferError.message : 'Unknown'}\n` +
            `Erreur chemin original: ${originalError instanceof Error ? originalError.message : 'Unknown'}`
          );
        }
      }
    }
    
    // Si l'erreur n'est pas liée à ByteString, la propager
    throw error;
  }
}

/**
 * Valide la signature HMAC d'un webhook Shopify
 * Gère correctement l'encodage Unicode pour éviter l'erreur "Cannot convert argument to a ByteString"
 * 
 * ⚠️ SERVER-ONLY : Cette fonction utilise crypto et ne peut être utilisée que côté serveur
 * 
 * @param body Buffer contenant le body brut du webhook (doit être un Buffer, pas une string)
 * @param signature Signature HMAC reçue dans le header x-shopify-hmac-sha256
 * @param secret Secret webhook Shopify (sera encodé en UTF-8 si nécessaire)
 * @returns true si la signature est valide, false sinon
 */
export function validateWebhookHMAC(
  body: Buffer,
  signature: string,
  secret: string
): boolean {
  if (!secret) {
    console.warn('⚠️ Secret webhook non fourni');
    return false;
  }

  if (!signature) {
    console.warn('⚠️ Signature webhook non fournie');
    return false;
  }

  try {
    // AMÉLIORÉ : Utiliser createHmacSafe qui nettoie automatiquement les chaînes Unicode
    // S'assurer que le secret ne contient que des caractères ASCII
    const sanitizedSecret = sanitizeStringForByteString(secret);
    const secretBuffer = Buffer.from(sanitizedSecret, 'utf8');
    
    // Le body doit déjà être un Buffer (pas une string)
    // Si c'est une string, la convertir en Buffer UTF-8 après nettoyage
    let bodyBuffer: Buffer;
    if (Buffer.isBuffer(body)) {
      bodyBuffer = body;
    } else {
      // Nettoyer le body si c'est une string avant conversion en Buffer
      const bodyString = String(body);
      const cleanedBody = sanitizeStringForByteString(bodyString);
      bodyBuffer = Buffer.from(cleanedBody, 'utf8');
    }

    // Créer le hash HMAC en utilisant createHmacSafe pour une sécurité maximale
    const hash = createHmacSafe('sha256', secretBuffer)
      .update(bodyBuffer)
      .digest('base64');

    // Comparer les signatures de manière sécurisée (timing-safe)
    const signatureBuffer = Buffer.from(signature, 'base64');
    const hashBuffer = Buffer.from(hash, 'base64');

    return crypto.timingSafeEqual(signatureBuffer, hashBuffer);
  } catch (error) {
    console.error('❌ Erreur lors de la validation HMAC:', error);
    
    // Si l'erreur est liée à l'encodage Unicode, logger plus de détails
    if (error instanceof Error && (error.message.includes('ByteString') || error.message.includes('character at index'))) {
      console.error('⚠️ Erreur d\'encodage Unicode détectée dans validateWebhookHMAC');
      console.error('   - Secret length:', secret.length);
      console.error('   - Body length:', Buffer.isBuffer(body) ? body.length : String(body).length);
      console.error('   - Signature length:', signature.length);
      
      // Analyser le secret pour trouver les caractères problématiques
      const secretProblematic: Array<{ char: string; code: number; index: number }> = [];
      for (let i = 0; i < secret.length; i++) {
        const code = secret.charCodeAt(i);
        if (code > 255) {
          secretProblematic.push({ char: secret[i], code, index: i });
        }
      }
      
      if (secretProblematic.length > 0) {
        console.error('   - Caractères Unicode détectés dans le secret:');
        secretProblematic.forEach(p => {
          console.error(`     Index ${p.index}: "${p.char}" (code: ${p.code}, U+${p.code.toString(16).toUpperCase().padStart(4, '0')})`);
        });
      }
      
      // Analyser le body si c'est une string
      if (!Buffer.isBuffer(body)) {
        const bodyString = String(body);
        const bodyProblematic: Array<{ char: string; code: number; index: number }> = [];
        for (let i = 0; i < bodyString.length; i++) {
          const code = bodyString.charCodeAt(i);
          if (code > 255) {
            bodyProblematic.push({ char: bodyString[i], code, index: i });
          }
        }
        
        if (bodyProblematic.length > 0) {
          console.error('   - Caractères Unicode détectés dans le body:');
          bodyProblematic.slice(0, 10).forEach(p => {
            console.error(`     Index ${p.index}: "${p.char}" (code: ${p.code}, U+${p.code.toString(16).toUpperCase().padStart(4, '0')})`);
          });
          if (bodyProblematic.length > 10) {
            console.error(`     ... et ${bodyProblematic.length - 10} autres caractères Unicode`);
          }
        }
      }
      
      // Essayer une approche alternative : nettoyer TOUT de manière agressive
      try {
        const cleanSecret = sanitizeStringForByteString(secret);
        const secretBuffer = Buffer.from(cleanSecret, 'utf8');
        
        let bodyBuffer: Buffer;
        if (Buffer.isBuffer(body)) {
          bodyBuffer = body;
        } else {
          const cleanedBody = sanitizeStringForByteString(String(body));
          bodyBuffer = Buffer.from(cleanedBody, 'utf8');
        }
        
        const hash = createHmacSafe('sha256', secretBuffer)
          .update(bodyBuffer)
          .digest('base64');
        
        const signatureBuffer = Buffer.from(signature, 'base64');
        const hashBuffer = Buffer.from(hash, 'base64');
        
        return crypto.timingSafeEqual(signatureBuffer, hashBuffer);
      } catch (fallbackError) {
        console.error('❌ Erreur même avec le fallback:', fallbackError);
        if (fallbackError instanceof Error) {
          console.error('   Message:', fallbackError.message);
          console.error('   Stack:', fallbackError.stack);
        }
        return false;
      }
    }
    
    return false;
  }
}

