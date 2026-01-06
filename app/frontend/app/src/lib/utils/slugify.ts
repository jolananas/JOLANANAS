/**
 * 🍍 JOLANANAS - Slugify utility
 * ===============================
 * Fonction de slugification réutilisable
 * Peut être utilisée côté client et serveur
 */

import slugifyLib from 'slugify';

/**
 * Générer un slug à partir d'un titre
 * Utilise le package slugify (open source) pour une meilleure gestion des caractères spéciaux et accents
 */
export function slugify(text: string, options?: { lower?: boolean; strict?: boolean }): string {
  return slugifyLib(text, {
    lower: true,
    strict: true,
    locale: 'fr',
    ...options,
  });
}

