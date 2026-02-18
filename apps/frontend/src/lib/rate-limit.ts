import { RateLimiterMemory, RateLimiterRes } from 'rate-limiter-flexible';

// Instance globale de rate limiter en mémoire
// Peut être remplacé par RateLimiterRedis en production pour support multi-instances
const rateLimiter = new RateLimiterMemory({
  points: 5, // Nombre de points (tentatives)
  duration: 15 * 60, // Durée en secondes (15 minutes)
  blockDuration: 15 * 60, // Blocage pendant 15 minutes si limite dépassée
});

/**
 * Vérifie et incrémente le compteur de tentatives
 * @param identifier Identifiant unique (email, IP, etc.)
 * @param maxAttempts Nombre maximum de tentatives (optionnel, par défaut 5)
 * @param windowMs Fenêtre de temps en millisecondes (optionnel, par défaut 15 min)
 * @returns Objet avec allowed, remaining et resetAt
 */
export async function checkRateLimit(
  identifier: string,
  maxAttempts: number = 5,
  windowMs: number = 15 * 60 * 1000 // 15 minutes par défaut
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const key = identifier.toLowerCase();
  const durationSeconds = Math.floor(windowMs / 1000);

  // Créer un rate limiter temporaire avec les paramètres personnalisés si différents
  let limiter = rateLimiter;
  if (maxAttempts !== 5 || durationSeconds !== 15 * 60) {
    limiter = new RateLimiterMemory({
      points: maxAttempts,
      duration: durationSeconds,
      blockDuration: durationSeconds,
    });
  }

  try {
    const res: RateLimiterRes = await limiter.consume(key);
    
    return {
      allowed: true,
      remaining: res.remainingPoints,
      resetAt: Date.now() + res.msBeforeNext,
    };
  } catch (rejRes) {
    // Limite dépassée
    const res = rejRes as RateLimiterRes;
    
    return {
      allowed: false,
      remaining: 0,
      resetAt: Date.now() + res.msBeforeNext,
    };
  }
}

/**
 * Réinitialise le compteur pour un identifiant (en cas de succès)
 */
export async function resetRateLimit(identifier: string): Promise<void> {
  const key = identifier.toLowerCase();
  await rateLimiter.delete(key);
}

/**
 * Obtient les informations de rate limit sans incrémenter
 */
export async function getRateLimitInfo(
  identifier: string,
  maxAttempts: number = 5,
  windowMs: number = 15 * 60 * 1000
): Promise<{ remaining: number; resetAt: number }> {
  const key = identifier.toLowerCase();
  const durationSeconds = Math.floor(windowMs / 1000);

  let limiter = rateLimiter;
  if (maxAttempts !== 5 || durationSeconds !== 15 * 60) {
    limiter = new RateLimiterMemory({
      points: maxAttempts,
      duration: durationSeconds,
      blockDuration: durationSeconds,
    });
  }

  try {
    const res: RateLimiterRes = await limiter.get(key);
    
    if (res === null) {
      // Pas de limite active
      return {
        remaining: maxAttempts,
        resetAt: Date.now() + windowMs,
      };
    }

    return {
      remaining: res.remainingPoints,
      resetAt: Date.now() + res.msBeforeNext,
    };
  } catch {
    return {
      remaining: maxAttempts,
      resetAt: Date.now() + windowMs,
    };
  }
}

