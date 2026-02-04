/**
 * 🍍 JOLANANAS - Hook MVP Data (Ultra Simple)
 * ============================================
 * Hook simplifié pour charger les données produits/collections
 */

'use client';

import { useState, useEffect } from 'react';

export interface MVPProduct {
  id: string;
  title: string;
  handle: string;
  description?: string;
  images?: {
    edges: Array<{
      node: {
        url: string;
        altText?: string;
      };
    }>;
  };
  variants?: {
    edges: Array<{
      node: {
        id: string;
        price: {
          amount: string;
          currencyCode: string;
        };
        availableForSale: boolean;
      };
    }>;
  };
}

export interface MVPCollection {
  id: string;
  title: string;
  handle: string;
  description?: string;
  image?: {
    url: string;
    altText?: string;
  };
}

/**
 * 🎯 Hook ultra-simple pour charger les produits
 */
export function useProducts(limit: number = 12) {
  const [products, setProducts] = useState<MVPProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [limit]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/products?first=${limit}`);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.products?.edges) {
        throw new Error('Format de données invalide');
      }
      
      const productsList = data.products.edges.map((edge: any) => edge.node);
      setProducts(productsList);
      
    } catch (err) {
      console.error('❌ Erreur chargement produits:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchProducts();
  };

  return {
    products,
    loading,
    error,
    refetch
  };
}

/**
 * 🎯 Hook ultra-simple pour charger les collections
 */
export function useCollections(limit: number = 6) {
  const [collections, setCollections] = useState<MVPCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCollections();
  }, [limit]);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/collections?first=${limit}`);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.collections?.edges) {
        throw new Error('Format de données invalide');
      }
      
      const collectionsList = data.collections.edges.map((edge: any) => edge.node);
      setCollections(collectionsList);
      
    } catch (err) {
      console.error('❌ Erreur chargement collections:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchCollections();
  };

  return {
    collections,
    loading,
    error,
    refetch
  };
}

/**
 * 🎯 Hook combiné pour charger tout en parallèle
 */
export function useMVPData(productsLimit: number = 12, collectionsLimit: number = 6) {
  const productsHook = useProducts(productsLimit);
  const collectionsHook = useCollections(collectionsLimit);

  const isLoading = productsHook.loading || collectionsHook.loading;
  const hasError = productsHook.error || collectionsHook.error;
  
  return {
    // Data
    products: productsHook.products,
    collections: collectionsHook.collections,
    
    // États
    loading: isLoading,
    error: collectionsHook.error || productsHook.error,
    
    // Actions
    refetchProducts: productsHook.refetch,
    refetchCollections: collectionsHook.refetch,
    refetchAll: () => {
      productsHook.refetch();
      collectionsHook.refetch();
    }
  };
}
