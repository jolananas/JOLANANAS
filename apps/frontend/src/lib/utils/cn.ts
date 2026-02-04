/**
 * 🍍 JOLANANAS - Utilitaire cn (className helper)
 * =============================================
 * Helper pour la concaténation conditionnelle des classes CSS
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combine les classes CSS avec Tailwind Merge pour éviter les conflits
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
