/**
 * 🍍 JOLANANAS - Hook useShopPay
 * ===============================
 * Hook personnalisé pour gérer Shop Pay avec intégration complète
 * Utilise l'API Shopify et le Shop Pay Component pour paiement direct
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { safeFetchJSON } from '@/lib/utils/safe-fetch';
import { useCurrency } from './useCurrency';

/**
 * Récupère la devise par défaut depuis l'API
 * Utilise le service de devises centralisé via l'API
 * 
 * @deprecated Utiliser useCurrency() hook dans les composants React pour une meilleure intégration
 */
async function getDefaultCurrency(shopifyCurrencyCode?: string): Promise<string> {
  try {
    // Utiliser l'API currency qui utilise le service centralisé
    const url = new URL('/api/currency', window.location.origin);
    if (shopifyCurrencyCode) {
      url.searchParams.set('shopifyCurrencyCode', shopifyCurrencyCode);
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept-Language': navigator.language || 'fr-FR',
      },
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

export interface ShopPayButtonConfig {
  checkoutId: string;
  variantIds: string[]; // Variant IDs numériques pour Shop Pay
  amount: number;
  currency?: string;
  lineItems?: Array<{
    label: string;
    quantity: number;
    finalItemPrice: { amount: number; currencyCode: string };
    finalLinePrice: { amount: number; currencyCode: string };
  }>;
  subtotal?: { amount: number; currencyCode: string };
  total?: { amount: number; currencyCode: string };
  invoiceUrl?: string; // Invoice URL pour fallback redirection (déprécié - ne plus utiliser)
  onSuccess?: (orderId: string, transactionId: string) => void;
  onError?: (error: string) => void;
}

export interface ShopPayState {
  status: 'idle' | 'loading' | 'processing' | 'success' | 'error';
  error: string | null;
  orderId: string | null;
  transactionId: string | null;
}

export interface UseShopPayReturn {
  state: ShopPayState;
  isComponentLoaded: boolean;
  createPaymentSession: (config: ShopPayButtonConfig) => ShopPayPaymentSession | null;
  processPayment: (checkoutId: string, paymentToken: string) => Promise<void>;
  reset: () => void;
}

export interface ShopPayPaymentSession {
  request: () => Promise<void>;
  destroy: () => void;
}

// Interface legacy pour compatibilité (déprécié)
export interface ShopPayButtonInstance {
  render: (container: string | HTMLElement) => Promise<void>;
  destroy: () => void;
}

/**
 * Charger le Shop Pay Payment Request API depuis Shopify
 * 
 * NOTE: L'API Payment Request nécessite une configuration spécifique (shop ID, client ID)
 * et n'est pas disponible via un simple script CDN. 
 * 
 * Pour une intégration simple et fiable, nous utilisons l'invoice URL du draft order
 * qui contient déjà Shop Pay intégré si activé dans la boutique.
 * 
 * Cette fonction tente de charger l'API, mais si elle échoue, le fallback avec invoice URL
 * sera utilisé automatiquement.
 */
async function loadShopPayAPI(): Promise<boolean> {
  return new Promise((resolve) => {
    // Vérifier si l'API JavaScript est déjà disponible
    if (typeof window !== 'undefined') {
      const ShopPay = (window as any).ShopPay;
      const ShopifyPay = (window as any).Shopify?.pay;
      if (ShopPay?.PaymentRequest || ShopifyPay?.PaymentRequest) {
        console.log('✅ Shop Pay Payment Request API déjà disponible');
        resolve(true);
        return;
      }
    }

    // NOTE: Les URLs suivantes peuvent ne pas fonctionner car l'API Payment Request
    // nécessite une configuration spécifique avec shop ID et client ID.
    // Si toutes les URLs échouent, le fallback avec invoice URL sera utilisé.
    
    // Essayer de charger l'API Commerce Components (si disponible)
    // Documentation: https://shopify.dev/docs/api/commerce-components/pay
    const possibleUrls = [
      // Commerce Components (nécessite configuration shop ID + client ID)
      'https://cdn.shopify.com/shopifycloud/commerce-components/v1.0.0/commerce-components.js',
      'https://cdn.shopify.com/shopifycloud/commerce-components/latest/commerce-components.js',
      // Ancien script shop-pay-button (peut ne plus être disponible)
      'https://cdn.shopify.com/shopifycloud/shop-pay-button/v1.0.0/shop-pay-button.js',
    ];

    let urlIndex = 0;

    const tryLoadScript = (index: number) => {
      if (index >= possibleUrls.length) {
        // Toutes les URLs ont échoué - ce n'est pas une erreur bloquante
        // Le fallback avec invoice URL sera utilisé
        console.warn('⚠️ Impossible de charger l\'API Shop Pay Payment Request');
        console.log('💡 Utilisation du fallback avec invoice URL (Shop Pay intégré dans le checkout Shopify)');
        resolve(false);
        return;
      }

      const script = document.createElement('script');
      script.src = possibleUrls[index];
      script.type = 'module';
      script.async = true;
      script.crossOrigin = 'anonymous';
      
      script.onload = () => {
        console.log(`✅ Script chargé depuis: ${possibleUrls[index]}`);
        
        // Attendre que l'API Payment Request soit disponible
        let attempts = 0;
        const maxAttempts = 30; // 3 secondes max
        
        const checkInterval = setInterval(() => {
          attempts++;
          
          const ShopPay = (window as any).ShopPay;
          const ShopifyPay = (window as any).Shopify?.pay;
          
          if (ShopPay?.PaymentRequest || ShopifyPay?.PaymentRequest) {
            clearInterval(checkInterval);
            console.log('✅ Shop Pay Payment Request API disponible');
            resolve(true);
            return;
          }
          
          if (attempts >= maxAttempts) {
            clearInterval(checkInterval);
            console.warn('⚠️ API Payment Request non disponible, essai URL suivante...');
            tryLoadScript(index + 1);
          }
        }, 100);
      };
      
      script.onerror = () => {
        console.warn(`⚠️ Échec chargement depuis: ${possibleUrls[index]}, essai URL suivante...`);
        tryLoadScript(index + 1);
      };
      
      document.head.appendChild(script);
    };

    // Commencer avec la première URL
    tryLoadScript(0);
  });
}

/**
 * Créer une session de paiement Shop Pay avec l'API Payment Request
 * Retourne une session qui peut être utilisée pour déclencher le paiement personnalisé
 */
function createShopPayPaymentSession(
  config: ShopPayButtonConfig,
  onPaymentToken: (token: string) => void,
  onError: (error: string) => void
): ShopPayPaymentSession | null {
  if (typeof window === 'undefined') {
    return null;
  }

  // Vérifier si l'API JavaScript est disponible
  const ShopPay = (window as any).ShopPay;
  const ShopifyPay = (window as any).Shopify?.pay;
  const PaymentRequestAPI = ShopPay?.PaymentRequest || ShopifyPay?.PaymentRequest;

  if (!PaymentRequestAPI) {
    // L'API Payment Request n'est pas disponible
    // Utiliser le fallback avec invoice URL
    console.warn('⚠️ Shop Pay Payment Request API non disponible, utilisation du fallback avec invoice URL');
    return null; // Le fallback sera géré par createShopPayButtonInstance
  }

  try {
    // Récupérer la devise
    const currency = config.currency || 'EUR';
    
    // Construire les line items
    const lineItems = config.lineItems || [{
      label: 'Commande',
      quantity: 1,
      finalItemPrice: {
        amount: config.amount,
        currencyCode: currency,
      },
      finalLinePrice: {
        amount: config.amount,
        currencyCode: currency,
      },
    }];

    // Construire le Payment Request
    const paymentRequest = PaymentRequestAPI.build({
      lineItems: lineItems,
      subtotal: config.subtotal || {
        amount: config.amount,
        currencyCode: currency,
      },
      total: config.total || {
        amount: config.amount,
        currencyCode: currency,
      },
      presentmentCurrency: currency,
      locale: 'fr',
    });

    // Créer la session
    const session = PaymentRequestAPI.createSession({
      paymentRequest: paymentRequest,
    });

    // Écouter l'événement paymentcomplete
    session.addEventListener('paymentcomplete', (event: any) => {
      const token = event.detail?.token || event.detail?.paymentToken;
      if (token) {
        console.log('✅ Shop Pay token reçu:', token);
        onPaymentToken(token);
      } else {
        console.warn('⚠️ Événement paymentcomplete sans token');
        onError('Token de paiement non reçu');
      }
    });

    // Écouter les erreurs
    session.addEventListener('error', (event: any) => {
      const error = event.detail?.error || event.detail?.message || 'Erreur lors du paiement Shop Pay';
      console.error('❌ Erreur Shop Pay:', error);
      onError(error);
    });

    return {
      request: async () => {
        try {
          // Déclencher la demande de paiement
          // Note: L'API Payment Request affichera son propre UI natif pour l'authentification Shop Pay
          // mais le reste de l'interface (récapitulatif, etc.) sera personnalisé
          await session.request();
        } catch (error) {
          console.error('❌ Erreur lors de la demande de paiement:', error);
          onError(error instanceof Error ? error.message : 'Erreur lors de la demande de paiement');
        }
      },
      destroy: () => {
        try {
          if (session.destroy) {
            session.destroy();
          }
        } catch (error) {
          console.warn('⚠️ Erreur lors de la destruction de la session:', error);
        }
      },
    };
  } catch (error) {
    console.error('❌ Erreur création session Shop Pay:', error);
    onError(error instanceof Error ? error.message : 'Erreur lors de la création de la session de paiement');
    return null;
  }
}

/**
 * Créer une instance de bouton Shop Pay (LEGACY - déprécié)
 * Utilisé pour compatibilité avec l'ancien code
 */
function createShopPayButtonInstance(
  config: ShopPayButtonConfig,
  onPaymentToken: (token: string) => void
): ShopPayButtonInstance | null {
  if (typeof window === 'undefined') {
    return null;
  }

  // Vérifier si le web component est disponible
  const isWebComponentAvailable = customElements.get('shop-pay-button');
  
  // Vérifier si l'API JavaScript est disponible
  const ShopPay = (window as any).ShopPay;
  const ShopifyPay = (window as any).Shopify?.pay;

  // Utiliser le web component si disponible (méthode legacy)
  if (isWebComponentAvailable) {
    return {
      render: async (container: string | HTMLElement) => {
        const element = typeof container === 'string' 
          ? document.getElementById(container)
          : container;
        
        if (!element) {
          throw new Error('Conteneur Shop Pay non trouvé');
        }

        // Nettoyer le conteneur
        element.innerHTML = '';
        
        // Récupérer le store domain depuis l'API
        let storeDomain = '';
        try {
          const response = await fetch('/api/config/shopify');
          if (response.ok) {
            const data = await response.json();
            storeDomain = data.storeDomain;
          }
        } catch (error) {
          console.error('❌ Erreur récupération store domain:', error);
        }
        
        if (!storeDomain) {
          throw new Error('Store domain non disponible');
        }
        
        // Créer le web component Shop Pay Button
        const shopPayButton = document.createElement('shop-pay-button');
        
        // Attribut store-url requis (format: https://votre-boutique.myshopify.com)
        shopPayButton.setAttribute('store-url', `https://${storeDomain}`);
        
        // Utiliser les variant IDs fournis
        // Le web component shop-pay-button accepte les variant IDs au format GID Shopify
        if (config.variantIds && config.variantIds.length > 0) {
          // Convertir les IDs numériques en GIDs Shopify (format requis par le web component)
          const variantGids = config.variantIds.map(id => `gid://shopify/ProductVariant/${id}`);
          shopPayButton.setAttribute('variant-ids', variantGids.join(','));
        } else {
          console.warn('⚠️ Aucun variant ID fourni pour Shop Pay');
          if (config.onError) {
            config.onError('Aucun variant ID disponible pour Shop Pay');
          }
          return;
        }
        
        // Configurer la devise (utiliser celle fournie ou détecter via le service)
        // Note: Si currency n'est pas fournie, le composant Shop Pay utilisera la devise de la boutique
        let currency = config.currency;
        if (!currency) {
          // Essayer d'extraire depuis les lineItems si disponibles
          const currencyFromLineItems = config.lineItems?.[0]?.finalItemPrice?.currencyCode ||
                                        config.lineItems?.[0]?.finalLinePrice?.currencyCode ||
                                        config.subtotal?.currencyCode ||
                                        config.total?.currencyCode;
          
          if (currencyFromLineItems) {
            currency = currencyFromLineItems;
          } else {
            try {
              currency = await getDefaultCurrency();
            } catch (error) {
              console.warn('⚠️ Impossible de récupérer la devise, utilisation de EUR par défaut:', error);
              currency = 'EUR';
            }
          }
        }
        shopPayButton.setAttribute('currency', currency);
        
        // Écouter les événements du web component
        shopPayButton.addEventListener('payment-complete', (event: any) => {
          const token = event.detail?.token || event.detail?.paymentToken;
          if (token) {
            console.log('✅ Shop Pay token reçu:', token);
            onPaymentToken(token);
          } else {
            console.warn('⚠️ Événement payment-complete sans token');
            if (config.onError) {
              config.onError('Token de paiement non reçu');
            }
          }
        });

        shopPayButton.addEventListener('payment-error', (event: any) => {
          const error = event.detail?.error || event.detail?.message || 'Erreur lors du paiement Shop Pay';
          console.error('❌ Erreur Shop Pay:', error);
          if (config.onError) {
            config.onError(error);
          }
        });

        element.appendChild(shopPayButton);
      },
      destroy: () => {
        // Le web component se nettoie automatiquement
      },
    };
  }

  // Fallback: Utiliser l'API JavaScript si disponible
  if (ShopPay?.PaymentRequest) {
    try {
      // Récupérer la devise de manière asynchrone dans render()
      // Pour l'instant, utiliser la devise fournie ou EUR en fallback
      const currency = config.currency || 'EUR';
      
      // Utiliser l'API Shop Pay PaymentRequest
      const paymentRequest = ShopPay.PaymentRequest.build({
        lineItems: [{
          label: 'Commande',
          finalItemPrice: {
            amount: config.amount,
            currencyCode: currency,
          },
          quantity: 1,
          finalLinePrice: {
            amount: config.amount,
            currencyCode: currency,
          },
        }],
        subtotal: {
          amount: config.amount,
          currencyCode: currency,
        },
        total: {
          amount: config.amount,
          currencyCode: currency,
        },
        presentmentCurrency: currency,
        locale: 'fr',
      });

      const session = ShopPay.PaymentRequest.createSession({
        paymentRequest: paymentRequest,
      });

      session.addEventListener('paymentcomplete', (event: any) => {
        const token = event.detail?.token || event.detail?.paymentToken;
        if (token) {
          console.log('✅ Shop Pay token reçu:', token);
          onPaymentToken(token);
        }
      });

      return {
        render: async (container: string | HTMLElement) => {
          const element = typeof container === 'string' 
            ? document.getElementById(container)
            : container;
          
          if (!element) {
            throw new Error('Conteneur Shop Pay non trouvé');
          }

          // Si currency n'était pas fournie, essayer de la récupérer maintenant
          let finalCurrency = config.currency;
          if (!finalCurrency) {
            // Essayer d'extraire depuis les lineItems si disponibles
            const currencyFromLineItems = config.lineItems?.[0]?.finalItemPrice?.currencyCode ||
                                          config.lineItems?.[0]?.finalLinePrice?.currencyCode ||
                                          config.subtotal?.currencyCode ||
                                          config.total?.currencyCode;
            
            if (currencyFromLineItems) {
              finalCurrency = currencyFromLineItems;
            } else {
              try {
                finalCurrency = await getDefaultCurrency();
                // Note: Le paymentRequest est déjà créé avec EUR, mais Shop Pay utilisera
                // la devise de la boutique si présentmentCurrency ne correspond pas
              } catch (error) {
                console.warn('⚠️ Impossible de récupérer la devise, utilisation de EUR:', error);
                finalCurrency = 'EUR';
              }
            }
          }

          element.innerHTML = '';
          // L'API PaymentRequest crée son propre UI
          const button = document.createElement('button');
          button.textContent = 'Payer avec Shop Pay';
          button.className = 'shop-pay-button';
          button.style.cssText = 'width: 100%; height: 50px; background: #5A31F4; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600;';
          button.onclick = () => {
            session.request();
          };
          element.appendChild(button);
        },
        destroy: () => {
          session.destroy?.();
        },
      };
    } catch (error) {
      console.error('❌ Erreur création bouton Shop Pay avec API:', error);
    }
  }

  // Dernier fallback: utiliser un bouton personnalisé avec redirection vers l'invoice URL
  // L'invoice URL du draft order contient déjà Shop Pay intégré
  console.warn('⚠️ Shop Pay Component non disponible, utilisation d\'un bouton personnalisé avec redirection');
  return {
    render: async (container: string | HTMLElement) => {
      const element = typeof container === 'string' 
        ? document.getElementById(container)
        : container;
      
      if (!element) {
        throw new Error('Conteneur Shop Pay non trouvé');
      }

      element.innerHTML = '';
      
      // Récupérer l'invoice URL depuis l'API checkout/create
      // Pour l'instant, on crée un bouton qui redirige vers Shop Pay via l'invoice URL
      const button = document.createElement('button');
      button.innerHTML = '<span style="font-weight: 700; font-size: 18px; margin-right: 8px;">shop</span><span style="font-weight: 400;">Pay</span>';
      button.className = 'shop-pay-button';
      button.style.cssText = 'width: 100%; height: 50px; background: #5A31F4; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600; display: flex; align-items: center; justify-content: center; transition: background-color 0.2s;';
      button.onmouseover = () => {
        button.style.backgroundColor = '#4A2AE4';
      };
      button.onmouseout = () => {
        button.style.backgroundColor = '#5A31F4';
      };
      button.onclick = async () => {
        try {
          // Utiliser l'invoice URL directement si disponible, sinon la récupérer
          let invoiceUrl = config.invoiceUrl;
          
          if (!invoiceUrl) {
            // Récupérer l'invoice URL depuis le checkout
            const response = await fetch(`/api/checkout/${config.checkoutId}/invoice-url`);
            if (response.ok) {
              const data = await response.json();
              invoiceUrl = data.invoiceUrl;
            } else {
              throw new Error('Erreur lors de la récupération de l\'invoice URL');
            }
          }
          
          if (invoiceUrl) {
            // Rediriger vers l'invoice URL qui contient Shop Pay intégré
            console.log('🔄 Redirection vers Shop Pay via invoice URL:', invoiceUrl);
            window.location.href = invoiceUrl;
          } else {
            throw new Error('Invoice URL non disponible');
          }
        } catch (error) {
          console.error('❌ Erreur redirection Shop Pay:', error);
          if (config.onError) {
            config.onError('Erreur lors de la redirection vers Shop Pay. Veuillez réessayer.');
          }
        }
      };
      element.appendChild(button);
    },
    destroy: () => {
      // Le bouton se nettoie automatiquement
    },
  };
}

/**
 * Hook pour gérer Shop Pay
 */
export function useShopPay(): UseShopPayReturn {
  const [state, setState] = useState<ShopPayState>({
    status: 'idle',
    error: null,
    orderId: null,
    transactionId: null,
  });

  const [isComponentLoaded, setIsComponentLoaded] = useState(false);
  const componentLoadAttempted = useRef(false);

  // Charger le Shop Pay Component au montage
  useEffect(() => {
    if (componentLoadAttempted.current) {
      return;
    }

    componentLoadAttempted.current = true;
    setState((prev) => ({ ...prev, status: 'loading' }));

    loadShopPayAPI()
      .then((loaded) => {
        setIsComponentLoaded(loaded);
        setState((prev) => ({ 
          ...prev, 
          status: loaded ? 'idle' : 'idle',
          error: loaded ? null : 'Shop Pay API non disponible'
        }));
      })
      .catch((error) => {
        console.error('❌ Erreur chargement Shop Pay API:', error);
        setIsComponentLoaded(false);
        setState((prev) => ({ 
          ...prev, 
          status: 'idle',
          error: 'Erreur lors du chargement de Shop Pay API'
        }));
      });
  }, []);

  /**
   * Traiter le paiement Shop Pay
   */
  const processPayment = useCallback(async (
    checkoutId: string, 
    paymentToken: string,
    onSuccessCallback?: (orderId: string, transactionId: string) => void
  ) => {
    try {
      setState((prev) => ({ ...prev, status: 'processing', error: null }));

      // Appeler l'API pour compléter le paiement
      const response = await safeFetchJSON('/api/checkout/payment/shop-pay/complete', {
        checkoutId,
        paymentToken,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erreur lors du traitement du paiement Shop Pay');
      }

      const data = await response.json();
      
      setState({
        status: 'success',
        error: null,
        orderId: data.orderId,
        transactionId: data.transactionId,
      });

      // Appeler le callback onSuccess si fourni
      if (onSuccessCallback && data.orderId && data.transactionId) {
        onSuccessCallback(data.orderId, data.transactionId);
      }

      // Rediriger vers la page de confirmation
      if (data.orderUrl) {
        window.location.href = data.orderUrl;
      }
    } catch (error) {
      console.error('❌ Erreur traitement paiement Shop Pay:', error);
      setState((prev) => ({
        ...prev,
        status: 'error',
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      }));
    }
  }, []);

  /**
   * Créer une session de paiement Shop Pay
   */
  const createPaymentSession = useCallback((config: ShopPayButtonConfig): ShopPayPaymentSession | null => {
    if (!config.variantIds || config.variantIds.length === 0) {
      console.warn('⚠️ Aucun variant ID fourni pour Shop Pay');
      if (config.onError) {
        config.onError('Aucun variant ID disponible pour Shop Pay');
      }
      return null;
    }

    // Essayer d'abord de créer une session avec l'API Payment Request
    const paymentSession = createShopPayPaymentSession(
      config,
      async (token: string) => {
        // Traiter le paiement avec le token et appeler le callback onSuccess
        await processPayment(config.checkoutId, token, config.onSuccess);
      },
      (error: string) => {
        if (config.onError) {
          config.onError(error);
        }
      }
    );

    // Si l'API Payment Request n'est pas disponible, retourner null
    // Le composant utilisera alors le fallback avec invoice URL
    if (!paymentSession) {
      console.log('💡 API Payment Request non disponible, le composant utilisera l\'invoice URL');
    }

    return paymentSession;
  }, [processPayment]);

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
    isComponentLoaded,
    createPaymentSession,
    processPayment,
    reset,
  };
}

