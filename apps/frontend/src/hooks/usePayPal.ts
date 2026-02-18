import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { safeFetchJSON } from '@/lib/utils/safe-fetch';
import { normalizeDataForAPI } from '@/lib/utils/formatters';

/**
 * Récupère la devise par défaut depuis l'API
 * Utilise le cache si disponible
 */
async function getDefaultCurrency(): Promise<string> {
  try {
    // Essayer de récupérer depuis le cache (sessionStorage)
    if (typeof window !== 'undefined') {
      const cached = sessionStorage.getItem('user_currency') || 
                    localStorage.getItem('user_currency');
      if (cached) {
        return cached;
      }
    }

    // Récupérer depuis l'API
    const response = await fetch('/api/currency', {
      method: 'GET',
      cache: 'default',
    });

    if (response.ok) {
      const data = await response.json();
      return data.currency || 'EUR';
    }
  } catch (error) {
    console.warn('⚠️ Impossible de récupérer la devise, utilisation de EUR par défaut:', error);
  }

  return 'EUR';
}

declare global {
  interface Window {
    paypal?: {
      Buttons: (config: PayPalButtonConfig) => PayPalButtonInstance;
    };
  }
}

export interface PayPalButtonConfig {
  createOrder: (data: any, actions: any) => Promise<string>;
  onApprove: (data: any, actions: any) => Promise<void>;
  onError?: (err: any) => void;
  onCancel?: (data: any) => void;
  style?: {
    layout?: 'vertical' | 'horizontal';
    color?: 'gold' | 'blue' | 'silver' | 'white' | 'black';
    shape?: 'rect' | 'pill';
    label?: 'paypal' | 'checkout' | 'buynow' | 'pay';
    height?: number;
  };
}

export interface PayPalButtonInstance {
  render: (container: string | HTMLElement) => Promise<void>;
}

export type PayPalStatus = 'idle' | 'loading' | 'processing' | 'success' | 'error';

export interface PayPalState {
  status: PayPalStatus;
  error: string | null;
  orderId: string | null;
  transactionId: string | null;
}

export interface UsePayPalReturn {
  state: PayPalState;
  isSDKLoaded: boolean;
  createPayPalButton: (config: {
    checkoutId: string;
    amount: number;
    currency?: string;
    onSuccess?: (orderId: string, transactionId: string) => void;
    onError?: (error: string) => void;
  }) => PayPalButtonInstance | null;
  reset: () => void;
}

/**
 * Récupérer le client ID PayPal depuis l'API
 */
async function getPayPalClientId(): Promise<string | null> {
  try {
    const response = await fetch('/api/config/paypal', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Ne pas mettre en cache pour avoir la config à jour
    });

    if (!response.ok) {
      console.warn('⚠️ Impossible de récupérer la config PayPal depuis l\'API');
      return null;
    }

    const data = await response.json();
    
    if (data.configured && data.clientId) {
      console.log('✅ PayPal Client ID récupéré depuis l\'API');
      return data.clientId;
    }

    console.warn('⚠️ PayPal Client ID non configuré dans l\'API');
    return null;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération du client ID PayPal:', error);
    return null;
  }
}

/**
 * Charger le SDK PayPal dynamiquement
 */
async function loadPayPalSDK(clientId?: string): Promise<boolean> {
  return new Promise(async (resolve, reject) => {
    // Vérifier si le SDK est déjà chargé
    if (window.paypal?.Buttons) {
      resolve(true);
      return;
    }

    // Récupérer le client ID depuis le paramètre ou l'API
    let paypalClientId: string | undefined = clientId;
    
    if (!paypalClientId) {
      const apiClientId = await getPayPalClientId();
      paypalClientId = apiClientId || undefined;
    }

    if (!paypalClientId) {
      console.warn('⚠️ PayPal Client ID non configuré. Utilisation du mode sandbox par défaut.');
    }

    // Déterminer l'environnement (sandbox ou production)
    // Utiliser sandbox par défaut si pas de client ID
    const isProduction = paypalClientId && process.env.NODE_ENV === 'production';
    const scriptUrl = isProduction
      ? 'https://www.paypal.com/sdk/js'
      : 'https://www.sandbox.paypal.com/sdk/js';

    // Créer le script
    const script = document.createElement('script');
    // Récupérer la devise par défaut
    const defaultCurrency = await getDefaultCurrency();
    
    const params = new URLSearchParams({
      'client-id': paypalClientId || 'sb', // 'sb' = sandbox par défaut
      currency: defaultCurrency,
      intent: 'capture',
      components: 'buttons', // Charger uniquement les boutons
    });
    
    script.src = `${scriptUrl}?${params.toString()}`;
    script.async = true;
    script.setAttribute('data-sdk-integration-source', 'button-factory');
    
    script.onload = () => {
      // Attendre un peu pour que le SDK s'initialise complètement
      setTimeout(() => {
        if (window.paypal?.Buttons) {
          console.log('✅ PayPal SDK chargé et initialisé');
          resolve(true);
        } else {
          console.warn('⚠️ PayPal SDK chargé mais Buttons non disponible');
          // Réessayer après un court délai
          setTimeout(() => {
            if (window.paypal?.Buttons) {
              console.log('✅ PayPal SDK Buttons disponible après délai');
              resolve(true);
            } else {
              console.error('❌ PayPal SDK Buttons toujours non disponible');
              reject(new Error('PayPal SDK Buttons non disponible après chargement'));
            }
          }, 500);
        }
      }, 100);
    };
    
    script.onerror = () => {
      console.error('❌ Erreur chargement PayPal SDK');
      reject(new Error('Impossible de charger le SDK PayPal'));
    };
    
    document.head.appendChild(script);
  });
}

/**
 * Hook pour gérer les paiements PayPal
 */
export function usePayPal(): UsePayPalReturn {
  const router = useRouter();
  const [state, setState] = useState<PayPalState>({
    status: 'idle',
    error: null,
    orderId: null,
    transactionId: null,
  });
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const sdkLoadAttempted = useRef(false);

  // Charger le SDK PayPal au montage
  useEffect(() => {
    if (!sdkLoadAttempted.current && typeof window !== 'undefined') {
      sdkLoadAttempted.current = true;
      loadPayPalSDK()
        .then(() => {
          setIsSDKLoaded(true);
        })
        .catch((error) => {
          console.error('❌ Erreur chargement PayPal SDK:', error);
          setState((prev) => ({
            ...prev,
            status: 'error',
            error: 'Impossible de charger PayPal. Veuillez réessayer.',
          }));
        });
    }
  }, []);

  /**
   * Finaliser le paiement côté serveur
   */
  const completePayment = useCallback(async (
    draftOrderId: string,
    transactionId: string,
    paymentGateway: string = 'paypal'
  ): Promise<{ success: boolean; orderId?: string; error?: string }> => {
    try {
      const response = await safeFetchJSON('/api/checkout/payment/complete', {
        draftOrderId: normalizeDataForAPI(draftOrderId),
        paymentStatus: 'paid',
        paymentGateway: normalizeDataForAPI(paymentGateway),
        transactionId: normalizeDataForAPI(transactionId),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erreur lors de la finalisation du paiement');
      }

      const data = await response.json();
      return {
        success: true,
        orderId: data.orderId || data.orderNumber,
      };
    } catch (error) {
      console.error('❌ Erreur finalisation paiement:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      };
    }
  }, []);

  /**
   * Créer un bouton PayPal personnalisé
   */
  const createPayPalButton = useCallback((config: {
    checkoutId: string;
    amount: number;
    currency?: string;
    onSuccess?: (orderId: string, transactionId: string) => void;
    onError?: (error: string) => void;
  }): PayPalButtonInstance | null => {
    // Vérifier que le SDK est chargé et que l'API est disponible
    if (!isSDKLoaded) {
      console.error('❌ PayPal SDK non chargé (isSDKLoaded = false)');
      setState((prev) => ({
        ...prev,
        status: 'error',
        error: 'PayPal SDK non disponible',
      }));
      return null;
    }

    // Vérifier que window.paypal existe et que Buttons est une fonction
    if (!window.paypal) {
      console.error('❌ window.paypal n\'existe pas');
      setState((prev) => ({
        ...prev,
        status: 'error',
        error: 'PayPal SDK non disponible',
      }));
      return null;
    }

    if (typeof window.paypal.Buttons !== 'function') {
      console.error('❌ window.paypal.Buttons n\'est pas une fonction:', typeof window.paypal.Buttons);
      setState((prev) => ({
        ...prev,
        status: 'error',
        error: 'PayPal SDK non disponible (API incorrecte)',
      }));
      return null;
    }

    try {
      setState((prev) => ({
        ...prev,
        status: 'processing',
        error: null,
      }));

      const buttonConfig: PayPalButtonConfig = {
        createOrder: async (data, actions) => {
          try {
            // Créer l'ordre PayPal côté serveur pour une sécurité optimale
            const response = await fetch('/api/checkout/payment/paypal/create-order', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                checkoutId: config.checkoutId,
                amount: config.amount,
                currency: config.currency || await getDefaultCurrency(),
              }),
            });

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              const errorMessage = errorData.error || `Erreur HTTP ${response.status}`;
              console.error('❌ Erreur création ordre PayPal côté serveur:', {
                status: response.status,
                error: errorMessage,
              });
              
              setState((prev) => ({
                ...prev,
                status: 'error',
                error: errorMessage,
              }));
              
              throw new Error(errorMessage);
            }

            const result = await response.json();
            
            if (!result.orderID) {
              throw new Error('L\'ordre PayPal a été créé mais aucun orderID n\'a été retourné');
            }

            console.log('✅ Ordre PayPal créé côté serveur:', result.orderID);
            
            // Retourner l'orderID pour le SDK PayPal
            return result.orderID;
          } catch (error) {
            console.error('❌ Erreur création ordre PayPal:', error);
            const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la création de l\'ordre PayPal';
            setState((prev) => ({
              ...prev,
              status: 'error',
              error: errorMessage,
            }));
            throw error;
          }
        },
        onApprove: async (data, actions) => {
          try {
            setState((prev) => ({
              ...prev,
              status: 'processing',
              orderId: data.orderID,
            }));

            // Capturer le paiement
            const details = await actions.order.capture();
            const transactionId = details.id || data.orderID;

            setState((prev) => ({
              ...prev,
              transactionId,
            }));

            // Finaliser le paiement côté serveur
            const result = await completePayment(
              config.checkoutId,
              transactionId,
              'paypal'
            );

            if (result.success) {
              setState((prev) => ({
                ...prev,
                status: 'success',
                error: null,
              }));

              // Callback de succès
              if (config.onSuccess) {
                config.onSuccess(result.orderId || config.checkoutId, transactionId);
              } else {
                // Redirection par défaut
                router.push(`/checkout/success?order=${result.orderId || config.checkoutId}&payment=paypal`);
              }
            } else {
              throw new Error(result.error || 'Erreur lors de la finalisation');
            }
          } catch (error) {
            console.error('❌ Erreur capture PayPal:', error);
            const errorMessage = error instanceof Error ? error.message : 'Erreur lors du paiement PayPal';
            setState((prev) => ({
              ...prev,
              status: 'error',
              error: errorMessage,
            }));

            if (config.onError) {
              config.onError(errorMessage);
            }
          }
        },
        onError: (err) => {
          console.error('❌ Erreur PayPal:', err);
          const errorMessage = err?.message || 'Erreur lors du paiement PayPal';
          setState((prev) => ({
            ...prev,
            status: 'error',
            error: errorMessage,
          }));

          if (config.onError) {
            config.onError(errorMessage);
          }
        },
        onCancel: (data) => {
          console.log('⚠️ Paiement PayPal annulé:', data);
          setState((prev) => ({
            ...prev,
            status: 'idle',
            error: null,
          }));
        },
        style: {
          layout: 'vertical',
          color: 'gold',
          shape: 'rect',
          label: 'paypal',
          height: 50,
        },
      };

      // Créer l'instance du bouton PayPal avec l'API standard
      const buttonInstance = window.paypal.Buttons(buttonConfig);
      
      // Vérifier que l'instance a bien été créée
      if (!buttonInstance || typeof buttonInstance.render !== 'function') {
        throw new Error('L\'instance du bouton PayPal n\'a pas été créée correctement');
      }

      return buttonInstance;
    } catch (error) {
      console.error('❌ Erreur création bouton PayPal:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la création du bouton PayPal';
      console.error('Détails de l\'erreur:', {
        error,
        paypalExists: !!window.paypal,
        buttonsExists: !!window.paypal?.Buttons,
        buttonsType: typeof window.paypal?.Buttons,
      });
      setState((prev) => ({
        ...prev,
        status: 'error',
        error: errorMessage,
      }));
      return null;
    }
  }, [isSDKLoaded, completePayment, router]);

  /**
   * Réinitialiser l'état
   */
  const reset = useCallback(() => {
    setState({
      status: 'idle',
      error: null,
      orderId: null,
      transactionId: null,
    });
  }, []);

  return {
    state,
    isSDKLoaded,
    createPayPalButton,
    reset,
  };
}

