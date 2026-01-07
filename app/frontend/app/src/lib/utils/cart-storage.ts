/**
 * 🍍 JOLANANAS - Gestion du Stockage du Cart ID
 * =============================================
 * Utilitaires pour stocker et récupérer le cartId Shopify depuis les cookies/session
 * Remplace le stockage en base de données
 */

import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const CART_ID_COOKIE_NAME = 'shopify-cart-id';
const CART_ID_COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 jours

/**
 * Récupère le cartId depuis les cookies de la requête
 */
export function getCartIdFromRequest(request: NextRequest): string | null {
  const cartId = request.cookies.get(CART_ID_COOKIE_NAME)?.value;
  return cartId || null;
}

/**
 * Récupère le cartId depuis les cookies Next.js (server-side)
 */
export async function getCartIdFromCookies(): Promise<string | null> {
  const cookieStore = await cookies();
  const cartId = cookieStore.get(CART_ID_COOKIE_NAME)?.value;
  return cartId || null;
}

/**
 * Crée un cookie pour stocker le cartId
 */
export function createCartIdCookie(cartId: string): string {
  return `${CART_ID_COOKIE_NAME}=${cartId}; Path=/; Max-Age=${CART_ID_COOKIE_MAX_AGE}; SameSite=Lax; Secure`;
}

/**
 * Supprime le cookie du cartId
 */
export function deleteCartIdCookie(): string {
  return `${CART_ID_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax; Secure`;
}

/**
 * Définit le cartId dans les cookies de la réponse
 */
export function setCartIdInResponse(cartId: string): { 'Set-Cookie': string } {
  return {
    'Set-Cookie': createCartIdCookie(cartId),
  };
}

/**
 * Supprime le cartId des cookies de la réponse
 */
export function removeCartIdFromResponse(): { 'Set-Cookie': string } {
  return {
    'Set-Cookie': deleteCartIdCookie(),
  };
}

