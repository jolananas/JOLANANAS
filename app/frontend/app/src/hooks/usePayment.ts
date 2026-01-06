/**
 * 🍍 JOLANANAS - Hook usePayment
 * ===============================
 * Hook personnalisé pour gérer les paiements (Shop Pay, PayPal)
 * Note: Shop Pay et PayPal sont maintenant gérés directement par leurs composants respectifs
 */

import { useState, useCallback } from 'react';
import { safeFetchJSON } from '@/lib/utils/safe-fetch';
import { normalizeDataForAPI } from '@/lib/utils/formatters';

export type PaymentMethod = 'shop_pay' | 'paypal';
export type PaymentStatus = 'idle' | 'processing' | 'success' | 'error';

export interface PaymentState {
  status: PaymentStatus;
  error: string | null;
  checkoutId: string | null;
}

export interface UsePaymentReturn {
  state: PaymentState;
  handleShopPay: (checkoutData: CheckoutData) => Promise<void>;
  handlePayPal: (checkoutData: CheckoutData) => Promise<void>;
  reset: () => void;
}

export interface CheckoutData {
  checkoutId: string;
  paymentUrl?: string;
  cartId?: string;
  variantIds?: string[]; // Variant IDs pour Shop Pay (IDs numériques)
}

/**
 * Hook pour gérer les paiements
 */
export function usePayment(): UsePaymentReturn {
  const [state, setState] = useState<PaymentState>({
    status: 'idle',
    error: null,
    checkoutId: null,
  });

  /**
   * Créer le checkout et initialiser le paiement
   */
  const createCheckout = useCallback(async (
    items: Array<{ variantId: string; quantity: number }>,
    shippingInfo: any,
    shippingMethod: 'standard' | 'express'
  ): Promise<CheckoutData> => {
    // Normaliser toutes les données avant l'envoi
    const normalizedItems = normalizeDataForAPI(items);
    const normalizedShippingInfo = normalizeDataForAPI(shippingInfo);
    const normalizedShippingMethod = normalizeDataForAPI({ type: shippingMethod });
    
    const response = await safeFetchJSON('/api/checkout/create', {
      items: normalizedItems,
      shippingInfo: normalizedShippingInfo,
      shippingMethod: normalizedShippingMethod,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Erreur lors de la création du checkout sécurisé');
    }

    const data = await response.json();
    return {
      checkoutId: data.checkoutId,
      paymentUrl: data.paymentUrl,
      cartId: data.cartId,
    };
  }, []);

  /**
   * Gérer le paiement Shop Pay
   * 
   * Note: Cette méthode est maintenant gérée directement par le composant ShopPayButton
   * qui utilise le Shop Pay Component API. Cette méthode est maintenue pour compatibilité.
   */
  const handleShopPay = useCallback(async (checkoutData: CheckoutData) => {
    try {
      setState({
        status: 'processing',
        error: null,
        checkoutId: checkoutData.checkoutId,
      });

      // Shop Pay est maintenant géré directement par le composant ShopPayButton
      // qui utilise le Shop Pay Component API pour une intégration complète
      console.log('✅ Shop Pay sera géré par le composant ShopPayButton');
      
      setState({
        status: 'idle',
        error: null,
        checkoutId: checkoutData.checkoutId,
      });
    } catch (error) {
      console.error('❌ Erreur handleShopPay:', error);
      setState({
        status: 'error',
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        checkoutId: checkoutData.checkoutId,
      });
    }
  }, []);

  /**
   * Gérer le paiement PayPal
   * 
   * Note: Cette méthode est maintenant gérée directement par le composant PayPalButton
   * qui utilise le PayPal SDK. Cette méthode est maintenue pour compatibilité.
   */
  const handlePayPal = useCallback(async (checkoutData: CheckoutData) => {
    try {
      setState({
        status: 'processing',
        error: null,
        checkoutId: checkoutData.checkoutId,
      });

      // PayPal est maintenant géré directement par le composant PayPalButton
      // qui utilise le PayPal SDK pour une intégration complète
      console.log('✅ PayPal sera géré par le composant PayPalButton');
      
      setState({
        status: 'idle',
        error: null,
        checkoutId: checkoutData.checkoutId,
      });
    } catch (error) {
      console.error('❌ Erreur handlePayPal:', error);
      setState({
        status: 'error',
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        checkoutId: checkoutData.checkoutId,
      });
    }
  }, []);

  /**
   * Réinitialiser l'état
   */
  const reset = useCallback(() => {
    setState({
      status: 'idle',
      error: null,
      checkoutId: null,
    });
  }, []);

  return {
    state,
    handleShopPay,
    handlePayPal,
    reset,
  };
}

