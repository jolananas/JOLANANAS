/**
 * 🍍 JOLANANAS - File Path Mapper
 * ================================
 * Mapping entre noms de fichiers avec Unicode et versions normalisées
 * Permet la résolution automatique des chemins avec caractères spéciaux
 * 
 * ⚠️ SERVEUR-ONLY : Ce module utilise fs/promises et ne peut pas être utilisé côté client
 */

import 'server-only';

/**
 * Mapping des fichiers Markdown connus avec leurs équivalents normalisés
 * Format: [nom avec Unicode] → [nom normalisé]
 */
export const FILE_PATH_MAP: Record<string, string> = {
  // Fichiers Markdown avec tirets cadratins
  'CGU — JOLANANAS.md': 'CGU - JOLANANAS.md',
  'CGV — JOLANANAS.md': 'CGV - JOLANANAS.md',
  'Confidentialité — JOLANANAS.md': 'Confidentialite - JOLANANAS.md',
  'Cookies — JOLANANAS.md': 'Cookies - JOLANANAS.md',
  'Livraison — JOLANANAS.md': 'Livraison - JOLANANAS.md',
  'Mentions Légales — JOLANANAS.md': 'Mentions Legales - JOLANANAS.md',
  'Retours et Remboursements — JOLANANAS.md': 'Retours et Remboursements - JOLANANAS.md',
};

/**
 * Résout un nom de fichier en utilisant le mapping
 * @param fileName Nom du fichier avec potentiellement des caractères Unicode
 * @returns Nom de fichier normalisé si trouvé dans le mapping, sinon le nom original
 */
export function resolveFileNameFromMap(fileName: string): string {
  return FILE_PATH_MAP[fileName] || fileName;
}

import { dirname, basename, join } from 'path';

/**
 * Résout un chemin complet en utilisant le mapping
 * @param filePath Chemin complet du fichier
 * @returns Chemin avec nom de fichier normalisé si trouvé dans le mapping
 */
export function resolveFilePathFromMap(filePath: string): string {
  const dir = dirname(filePath);
  const base = basename(filePath);
  const normalizedBase = resolveFileNameFromMap(base);
  
  if (normalizedBase !== base) {
    return join(dir, normalizedBase);
  }
  
  return filePath;
}

/**
 * Génère automatiquement le mapping pour tous les fichiers dans un répertoire
 * @param directory Répertoire à scanner
 * @returns Mapping généré automatiquement
 */
export async function generateFilePathMap(directory: string): Promise<Record<string, string>> {
  const { readdir } = await import('fs/promises');
  const { join } = await import('path');
  // Import dynamique pour éviter l'import au niveau du module
  const { normalizeFileName } = await import('./path-resolver');
  
  const files = await readdir(directory);
  const map: Record<string, string> = {};
  
  for (const file of files) {
    const normalized = normalizeFileName(file);
    if (normalized !== file) {
      map[file] = normalized;
    }
  }
  
  return map;
}

