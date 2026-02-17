/**
 * 🍍 JOLANANAS - Hook React pour la Gestion des Devises
 * ======================================================
 * Hook React pour accéder à la devise actuelle avec cache et détection automatique
 * Compatible SSR/SSG Next.js
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { CurrencyServiceState, CurrencyInfo } from '@/lib/currency/types';
import { 
  getCurrencySymbol, 
  mapShopifyCurrencyFromApi, 
  getCurrencyFromCountry, 
  getShopifyStyleMoneyForIp,
  type ShopifyMoney,
  type NormalizedMoney
} from '@/lib/currency/utils';

interface UseCurrencyReturn {
  /** Code de la devise actuelle */
  currency: string;
  /** Devise de la boutique Shopify */
  shopCurrency: string | null;
  /** Liste des devises disponibles */
  availableCurrencies: CurrencyInfo[];
  /** Indique si le multi-currency est activé */
  isMultiCurrencyEnabled: boolean;
  /** État de chargement */
  isLoading: boolean;
  /** Erreur éventuelle */
  error: Error | null;
  /** Formate un prix selon la devise actuelle */
  formatPrice: (amount: string | number, currencyCode?: string) => string;
  /** Change la devise de l'utilisateur */
  setCurrency: (currency: string) => Promise<void>;
  /** Recharge les données de devises */
  refresh: () => Promise<void>;
}

/**
 * Hook pour utiliser le service de devises côté client
 * 
 * @param shopifyCurrencyCode - Code de devise depuis réponse Shopify (priorité)
 * @returns État et méthodes pour gérer les devises
 * 
 * @example
 * ```tsx
 * const { currency, formatPrice, isLoading } = useCurrency();
 * 
 * return (
 *   <div>
 *     <p>Prix: {formatPrice(29.99)}</p>
 *     <p>Devise: {currency}</p>
 *   </div>
 * );
 * ```
 */
export function useCurrency(shopifyCurrencyCode?: string): UseCurrencyReturn {
  const [state, setState] = useState<CurrencyServiceState>({
    currentCurrency: 'EUR',
    shopCurrency: null,
    availableCurrencies: [],
    isMultiCurrencyEnabled: false,
    isLoading: true,
    error: null,
  });

  /**
   * Charge les données de devises depuis l'API
   */
  const loadCurrencyData = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      // Construire l'URL avec le currencyCode si fourni
      // Utiliser une URL absolue pour le fetch côté client
      const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost';
      const url = new URL('/api/currency', origin);
      if (shopifyCurrencyCode) {
        url.searchParams.set('shopifyCurrencyCode', shopifyCurrencyCode);
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept-Language': typeof window !== 'undefined' ? navigator.language : 'fr-FR',
        },
        cache: 'default',
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();

      setState({
        currentCurrency: data.currency || 'EUR',
        shopCurrency: data.shopCurrency || null,
        availableCurrencies: data.availableCurrencies || [],
        isMultiCurrencyEnabled: data.isMultiCurrencyEnabled || false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('❌ Erreur lors du chargement des devises:', error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error : new Error('Erreur inconnue'),
        // Garder les valeurs précédentes en cas d'erreur
        currentCurrency: prev.currentCurrency || 'EUR',
      }));
    }
  }, [shopifyCurrencyCode]);

  /**
   * Charge les données au montage et quand shopifyCurrencyCode change
   */
  useEffect(() => {
    loadCurrencyData();
  }, [loadCurrencyData]);

  /**
   * Formate un prix selon la devise actuelle
   */
  const formatPrice = useCallback(
    (amount: string | number, currencyCode?: string): string => {
      const currency = currencyCode || state.currentCurrency;
      const value = typeof amount === 'string' ? parseFloat(amount) : amount;
      const locale = typeof window !== 'undefined' ? navigator.language : 'fr-FR';

      try {
        return new Intl.NumberFormat(locale, {
          style: 'currency',
          currency: currency,
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(value);
      } catch (error) {
        // Fallback simple
        const symbol = getCurrencySymbol(currency);
        const formattedValue = value.toLocaleString(locale, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
        return `${formattedValue} ${symbol}`;
      }
    },
    [state.currentCurrency]
  );

  /**
   * Change la devise de l'utilisateur
   */
  const setCurrency = useCallback(
    async (currency: string): Promise<void> => {
      try {
        const response = await fetch('/api/currency', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ currency }),
        });

        if (!response.ok) {
          throw new Error(`Erreur lors de la sauvegarde: ${response.status}`);
        }

        // Mettre à jour l'état local
        setState((prev) => ({
          ...prev,
          currentCurrency: currency,
        }));

        // Recharger les données pour s'assurer de la cohérence
        await loadCurrencyData();
      } catch (error) {
        console.error('❌ Erreur lors du changement de devise:', error);
        throw error;
      }
    },
    [loadCurrencyData]
  );

  /**
   * Recharge les données de devises
   */
  const refresh = useCallback(async () => {
    await loadCurrencyData();
  }, [loadCurrencyData]);

  return {
    currency: state.currentCurrency,
    shopCurrency: state.shopCurrency,
    availableCurrencies: state.availableCurrencies,
    isMultiCurrencyEnabled: state.isMultiCurrencyEnabled,
    isLoading: state.isLoading,
    error: state.error,
    formatPrice,
    setCurrency,
    refresh,
  };
}

/**
 * Récupère le symbole d'une devise (style Shopify)
 * Source d'inspiration : mapping ISO 4217 + conventions Shopify (CA$, A$, kr, etc.)
 */
export { getCurrencySymbol };

/**
 * Exemple de "traduction" de données venant de l'API Shopify.
 * Tu peux adapter selon ce que tu utilises (Storefront API, Admin API, etc.).
 */
export type { ShopifyMoney, NormalizedMoney };
export { mapShopifyCurrencyFromApi, getCurrencyFromCountry, getShopifyStyleMoneyForIp };









