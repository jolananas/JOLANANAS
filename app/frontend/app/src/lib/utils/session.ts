/**
 * 🍍 JOLANANAS - Utilitaires de synchronisation de session
 * =========================================================
 * Fonctions pour garantir la synchronisation de session NextAuth
 */

import { Session } from 'next-auth';

export interface EnsureSessionOptions {
  /**
   * Nombre maximum de tentatives de vérification
   * @default 10
   */
  maxAttempts?: number;
  
  /**
   * Délai entre chaque tentative en millisecondes
   * @default 200
   */
  interval?: number;
  
  /**
   * Timeout total en millisecondes
   * @default 5000
   */
  timeout?: number;
}

/**
 * Vérifie et force la synchronisation de session avec polling
 * 
 * @param checkSession Fonction qui retourne le statut de session actuel
 * @param updateSession Fonction pour forcer la mise à jour de session
 * @param options Options de configuration
 * @returns Promise qui se résout à true si la session est authentifiée, false sinon
 */
export async function ensureAuthenticatedSession(
  checkSession: () => { status: 'loading' | 'authenticated' | 'unauthenticated'; data: Session | null },
  updateSession: () => Promise<Session | null>,
  options: EnsureSessionOptions = {}
): Promise<boolean> {
  const {
    maxAttempts = 10,
    interval = 200,
    timeout = 5000,
  } = options;

  const startTime = Date.now();
  let attempts = 0;

  // Vérification initiale
  let { status, data } = checkSession();
  
  if (status === 'authenticated' && data) {
    return true;
  }

  // Forcer une mise à jour de session
  try {
    await updateSession();
  } catch (error) {
    console.warn('Erreur lors de la mise à jour de session:', error);
  }

  // Polling avec timeout
  while (attempts < maxAttempts && (Date.now() - startTime) < timeout) {
    await new Promise(resolve => setTimeout(resolve, interval));
    
    const check = checkSession();
    status = check.status;
    data = check.data;

    if (status === 'authenticated' && data) {
      return true;
    }

    // Forcer une nouvelle mise à jour toutes les 3 tentatives
    if (attempts % 3 === 0 && attempts > 0) {
      try {
        await updateSession();
      } catch (error) {
        console.warn('Erreur lors de la mise à jour de session (retry):', error);
      }
    }

    attempts++;
  }

  // Dernière vérification
  const finalCheck = checkSession();
  return finalCheck.status === 'authenticated' && finalCheck.data !== null;
}

/**
 * Attendre que la session soit authentifiée avec un timeout
 * 
 * @param checkSession Fonction qui retourne le statut de session actuel
 * @param timeout Timeout en millisecondes
 * @returns Promise qui se résout à true si authentifié, false si timeout
 */
export async function waitForAuthenticatedSession(
  checkSession: () => { status: 'loading' | 'authenticated' | 'unauthenticated'; data: Session | null },
  timeout: number = 3000
): Promise<boolean> {
  const startTime = Date.now();
  const interval = 100;

  return new Promise((resolve) => {
    const check = () => {
      const { status, data } = checkSession();
      
      if (status === 'authenticated' && data) {
        resolve(true);
        return;
      }

      if (Date.now() - startTime >= timeout) {
        resolve(false);
        return;
      }

      setTimeout(check, interval);
    };

    check();
  });
}

