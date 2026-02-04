/**
 * 🍍 JOLANANAS - Shop Pay Integration
 * =======================================
 * Intégration Shop Pay via redirection vers checkout Shopify
 * 
 * Note: Shop Pay n'a pas de SDK JavaScript externe.
 * Il est intégré automatiquement dans le checkout Shopify.
 * On redirige simplement vers l'URL de checkout ou l'invoice URL du draft order.
 */

export interface ShopPayCheckoutOptions {
  checkoutId: string;
  invoiceUrl?: string;
  onComplete?: (order: any) => void;
  onError?: (error: any) => void;
}

/**
 * Vérifier si Shop Pay est disponible
 * Shop Pay est disponible si la boutique Shopify l'a activé
 */
export function isShopPayAvailable(): boolean {
  // Shop Pay est toujours disponible si la boutique l'a activé
  // On ne peut pas le vérifier côté client sans appeler l'API
  // On retourne true par défaut et on gère les erreurs côté serveur
  return typeof window !== 'undefined';
}

/**
 * Rediriger vers le checkout Shop Pay
 * 
 * Shop Pay est intégré dans le checkout Shopify.
 * On redirige vers l'invoice URL du draft order qui inclut Shop Pay si activé.
 */
export function redirectToShopPayCheckout(
  checkoutId: string,
  options?: {
    invoiceUrl?: string;
    onComplete?: (order: any) => void;
    onError?: (error: any) => void;
  }
): void {
  try {
    // L'invoice URL doit être fournie via options.invoiceUrl
    // Elle est normalement disponible dans checkoutData.paymentUrl
    if (!options?.invoiceUrl) {
      const error = new Error('URL de checkout non disponible. L\'invoice URL doit être fournie.');
      console.error('❌ Erreur redirection Shop Pay:', error);
      if (options?.onError) {
        options.onError(error);
      }
      return;
    }

    console.log('✅ Redirection vers Shop Pay via invoice URL');
    // Rediriger vers l'invoice URL qui inclut Shop Pay si activé dans la boutique
    window.location.href = options.invoiceUrl;
  } catch (error) {
    console.error('❌ Erreur redirection Shop Pay:', error);
    if (options?.onError) {
      options.onError(error);
    }
  }
}

/**
 * Initialiser Shop Pay automatiquement au chargement
 * 
 * Note: Cette fonction est maintenue pour compatibilité mais ne fait rien
 * car Shop Pay n'a pas besoin d'initialisation côté client.
 */
export async function setupShopPay(): Promise<boolean> {
  // Shop Pay n'a pas besoin d'initialisation côté client
  // Il est intégré dans le checkout Shopify
  console.log('✅ Shop Pay disponible (intégré dans checkout Shopify)');
  return true;
}

/**
 * Charger le SDK Shop Pay (déprécié)
 * 
 * @deprecated Shop Pay n'a pas de SDK JavaScript externe.
 * Utilisez redirectToShopPayCheckout() à la place.
 */
export async function loadShopPaySDK(): Promise<boolean> {
  console.warn('⚠️ loadShopPaySDK() est déprécié. Shop Pay n\'a pas de SDK externe.');
  return Promise.resolve(true);
}

/**
 * Initialiser Shop Pay avec la configuration (déprécié)
 * 
 * @deprecated Shop Pay n'a pas besoin d'initialisation côté client.
 * Utilisez redirectToShopPayCheckout() à la place.
 */
export function initShopPay(): void {
  console.warn('⚠️ initShopPay() est déprécié. Shop Pay n\'a pas besoin d\'initialisation.');
}
