/**
 * 🍍 JOLANANAS - Path Resolver avec support Unicode
 * =================================================
 * Résolution robuste des chemins de fichiers avec caractères Unicode
 * Utilise plusieurs méthodes en cascade pour garantir la compatibilité
 * 
 * ⚠️ SERVEUR-ONLY : Ce module utilise fs et ne peut pas être utilisé côté client
 */

import 'server-only';

import { normalize, resolve, dirname, basename, join } from 'path';
import { existsSync, realpathSync } from 'fs';
import normalizePathLib from 'normalize-path';
import { slugify } from './slugify';

/**
 * Normalise un nom de fichier en remplaçant les caractères Unicode problématiques
 * Utilise slugify pour une normalisation cohérente
 */
export function normalizeFileName(fileName: string): string {
  // Extraire l'extension
  const lastDot = fileName.lastIndexOf('.');
  const name = lastDot > 0 ? fileName.substring(0, lastDot) : fileName;
  const ext = lastDot > 0 ? fileName.substring(lastDot) : '';

  // Normaliser le nom avec slugify (gère les accents, caractères spéciaux)
  const normalizedName = slugify(name, { strict: true, lower: false });

  return normalizedName + ext;
}

/**
 * Remplace les caractères Unicode problématiques par des équivalents ASCII
 */
function replaceUnicodeChars(filePath: string): string {
  return filePath
    .replace(/—/g, '-')  // Em dash (U+2014, 8211) → tiret
    .replace(/–/g, '-')  // En dash (U+2013, 8212) → tiret
    .replace(/"/g, '"')  // Guillemets courbes → guillemets droits
    .replace(/"/g, '"')
    .replace(/'/g, "'")  // Apostrophes courbes → apostrophes droites
    .replace(/'/g, "'")
    .replace(/…/g, '...') // Points de suspension → trois points
    .normalize('NFD')     // Décompose les caractères accentués
    .replace(/[\u0300-\u036f]/g, ''); // Supprime les diacritiques
}

/**
 * Méthode 1 : Chemin original avec Buffer UTF-8
 * Tente de lire le fichier avec le chemin original
 */
async function method1_OriginalPath(filePath: string): Promise<string | null> {
  try {
    if (existsSync(filePath)) {
      return filePath;
    }
  } catch (error: unknown) {
    // Ignorer silencieusement pour passer à la méthode suivante
  }
  return null;
}

/**
 * Méthode 2 : Normalisation avec path.normalize()
 * Normalise les séparateurs de chemin et les références relatives
 */
async function method2_PathNormalize(filePath: string): Promise<string | null> {
  try {
    const normalized = normalize(filePath);
    if (existsSync(normalized) && normalized !== filePath) {
      return normalized;
    }
  } catch (error: unknown) {
    // Ignorer silencieusement
  }
  return null;
}

/**
 * Méthode 3 : Remplacement Unicode → ASCII
 * Remplace les caractères Unicode problématiques par des équivalents ASCII
 */
async function method3_UnicodeReplacement(filePath: string): Promise<string | null> {
  try {
    const dir = dirname(filePath);
    const base = basename(filePath);
    const replaced = replaceUnicodeChars(base);
    const newPath = join(dir, replaced);
    
    if (existsSync(newPath) && newPath !== filePath) {
      return newPath;
    }
  } catch (error: unknown) {
    // Ignorer silencieusement
  }
  return null;
}

/**
 * Méthode 4 : Normalisation avec normalize-path
 * Utilise la bibliothèque normalize-path pour la normalisation cross-platform
 */
async function method4_NormalizePathLib(filePath: string): Promise<string | null> {
  try {
    const normalized = normalizePathLib(filePath);
    if (existsSync(normalized) && normalized !== filePath) {
      return normalized;
    }
  } catch (error: unknown) {
    // Ignorer silencieusement
  }
  return null;
}

/**
 * Méthode 5 : fs.realpath() pour résoudre le chemin réel
 * Résout les liens symboliques et normalise le chemin absolu
 */
async function method5_RealPath(filePath: string): Promise<string | null> {
  try {
    if (existsSync(filePath)) {
      const { realpath } = await import('fs/promises');
      const resolved = await realpath(filePath);
      if (resolved !== filePath) {
        return resolved;
      }
    }
  } catch (error: unknown) {
    // Ignorer silencieusement
  }
  return null;
}

/**
 * Méthode 6 : Normalisation du nom de fichier avec slugify
 * Utilise slugify pour normaliser uniquement le nom de fichier
 */
async function method6_SlugifyFileName(filePath: string): Promise<string | null> {
  try {
    const dir = dirname(filePath);
    const base = basename(filePath);
    const normalized = normalizeFileName(base);
    const newPath = join(dir, normalized);
    
    if (existsSync(newPath) && newPath !== filePath) {
      return newPath;
    }
  } catch (error: unknown) {
    // Ignorer silencieusement
  }
  return null;
}

/**
 * Méthode 7 : Résolution avec path.resolve()
 * Résout le chemin en chemin absolu
 */
async function method7_PathResolve(filePath: string): Promise<string | null> {
  try {
    const resolved = resolve(filePath);
    if (existsSync(resolved) && resolved !== filePath) {
      return resolved;
    }
  } catch (error: unknown) {
    // Ignorer silencieusement
  }
  return null;
}

/**
 * Résout un chemin de fichier avec support Unicode
 * Utilise plusieurs méthodes en cascade jusqu'à trouver un chemin valide
 * 
 * @param filePath Chemin du fichier (peut contenir des caractères Unicode)
 * @returns Chemin résolu et validé, ou le chemin original si aucune méthode ne fonctionne
 * @throws Error si le fichier n'existe pas après toutes les tentatives
 */
export async function resolveUnicodePath(filePath: string): Promise<string> {
  // Liste des méthodes à essayer dans l'ordre
  const methods = [
    method1_OriginalPath,
    method2_PathNormalize,
    method4_NormalizePathLib,
    method7_PathResolve,
    method5_RealPath,
    method3_UnicodeReplacement,
    method6_SlugifyFileName,
  ];

  // Essayer chaque méthode
  for (const method of methods) {
    try {
      const resolved = await method(filePath);
      if (resolved && existsSync(resolved)) {
        return resolved;
      }
    } catch (error) {
      // Continuer avec la méthode suivante
      continue;
    }
  }

  // Si aucune méthode n'a fonctionné, vérifier si le fichier original existe
  if (existsSync(filePath)) {
    return filePath;
  }

  // Si le fichier n'existe toujours pas, lancer une erreur descriptive
  throw new Error(
    `Impossible de résoudre le chemin de fichier: ${filePath}\n` +
    `Toutes les méthodes de résolution ont échoué. Vérifiez que le fichier existe.`
  );
}

/**
 * Résout un chemin de fichier de manière synchrone (pour les cas où async n'est pas possible)
 * Utilise les méthodes synchrones disponibles
 */
export function resolveUnicodePathSync(filePath: string): string {
  // Méthode 1 : Chemin original
  if (existsSync(filePath)) {
    return filePath;
  }

  // Méthode 2 : path.normalize()
  try {
    const normalized = normalize(filePath);
    if (existsSync(normalized) && normalized !== filePath) {
      return normalized;
    }
  } catch (error: unknown) {
    // Ignorer
  }

  // Méthode 3 : Remplacement Unicode
  try {
    const dir = dirname(filePath);
    const base = basename(filePath);
    const replaced = replaceUnicodeChars(base);
    const newPath = join(dir, replaced);
    
    if (existsSync(newPath) && newPath !== filePath) {
      return newPath;
    }
  } catch (error: unknown) {
    // Ignorer
  }

  // Méthode 4 : normalize-path
  try {
    const normalized = normalizePathLib(filePath);
    if (existsSync(normalized) && normalized !== filePath) {
      return normalized;
    }
  } catch (error: unknown) {
    // Ignorer
  }

  // Méthode 5 : realpathSync
  try {
    if (existsSync(filePath)) {
      const resolved = realpathSync(filePath);
      if (resolved !== filePath) {
        return resolved;
      }
    }
  } catch (error: unknown) {
    // Ignorer
  }

  // Méthode 6 : slugify
  try {
    const dir = dirname(filePath);
    const base = basename(filePath);
    const normalized = normalizeFileName(base);
    const newPath = join(dir, normalized);
    
    if (existsSync(newPath) && newPath !== filePath) {
      return newPath;
    }
  } catch (error: unknown) {
    // Ignorer
  }

  // Méthode 7 : path.resolve()
  try {
    const resolved = resolve(filePath);
    if (existsSync(resolved) && resolved !== filePath) {
      return resolved;
    }
  } catch (error: unknown) {
    // Ignorer
  }

  // Si aucune méthode n'a fonctionné, retourner le chemin original
  // ou lancer une erreur si le fichier n'existe pas
  if (!existsSync(filePath)) {
    throw new Error(
      `Impossible de résoudre le chemin de fichier: ${filePath}\n` +
      `Toutes les méthodes de résolution synchrones ont échoué.`
    );
  }

  return filePath;
}

/**
 * Normalise un chemin de fichier pour éviter les erreurs ByteString dans Next.js
 * Remplace les caractères Unicode problématiques par leurs équivalents ASCII
 * @param filePath Chemin du fichier à normaliser
 * @returns Chemin normalisé avec caractères ASCII uniquement
 */
export function normalizePathForNextJS(filePath: string): string {
  return filePath
    .replace(/—/g, '-')  // Tiret cadratin (U+2014, 8212) → tiret simple
    .replace(/–/g, '-')  // Tiret demi-cadratin (U+2013, 8211) → tiret simple
    .replace(/…/g, '...')  // Points de suspension Unicode (U+2026, 8230) → trois points ASCII
    .replace(/"/g, '"')  // Guillemets typographiques
    .replace(/'/g, "'")
    .replace(/"/g, '"')
    .replace(/'/g, "'");
}

/**
 * Normalise une URL de base de données pour Prisma/SQLite
 * Résout le problème ByteString causé par les caractères Unicode dans les chemins
 * 
 * @param databaseUrl URL de la base de données (ex: "file:./dev.db" ou "file:/path/to/db.sqlite")
 * @returns URL normalisée avec chemin ASCII uniquement
 */
export function normalizeDatabaseUrl(databaseUrl: string): string {
  // Si ce n'est pas une URL SQLite file:, retourner tel quel
  if (!databaseUrl.startsWith('file:')) {
    return databaseUrl;
  }

  // Extraire le chemin du fichier de l'URL
  const filePath = databaseUrl.replace(/^file:/, '');
  
  // Normaliser le chemin en remplaçant les caractères Unicode
  const normalized = normalizePathForNextJS(filePath);
  
  // Reconstruire l'URL avec le chemin normalisé
  return `file:${normalized}`;
}

