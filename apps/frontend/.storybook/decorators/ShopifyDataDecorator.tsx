/**
 * 🍍 JOLANANAS - Shopify Data Decorator for Storybook
 * ===================================================
 * Décorateur Storybook qui charge les vraies données Shopify
 * AUCUNE donnée mockée - uniquement les vraies données de production
 */

import React, { useEffect, useState, createContext, useContext } from 'react';
import type { Decorator } from '@storybook/react';

// Types Shopify
interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  description?: string;
  descriptionHtml?: string;
  availableForSale: boolean;
  featuredImage?: {
    url: string;
    altText?: string;
  };
  images?: {
    edges: Array<{
      node: {
        url: string;
        altText?: string;
        width?: number;
        height?: number;
      };
    }>;
  };
  variants?: {
    edges: Array<{
      node: {
        id: string;
        title: string;
        price: {
          amount: string;
          currencyCode: string;
        };
        compareAtPrice?: {
          amount: string;
          currencyCode: string;
        };
        availableForSale: boolean;
      };
    }>;
  };
  priceRange?: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
    maxVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  tags?: string[];
  collections?: {
    edges: Array<{
      node: {
        id: string;
        title: string;
        handle: string;
      };
    }>;
  };
}

interface RealShopifyData {
  hasProducts: boolean;
  productsCount: number;
  lastUpdated: string;
}

interface ShopifyContextType {
  products: ShopifyProduct[];
  loading: boolean;
  error: string | null;
  fetchProduct: (handle: string) => Promise<ShopifyProduct | null>;
  realShopifyData: RealShopifyData;
}

const ShopifyContext = createContext<ShopifyContextType | null>(null);

export const useShopifyContext = () => {
  const shopifyContext = useContext(ShopifyContext);
  if (!shopifyContext) {
    throw new Error('useShopifyContext must be used within ShopifyDataDecorator');
  }
  return shopifyContext;
};

/**
 * Charge les produits depuis l'API Shopify réelle
 */
async function fetchRealShopifyProducts(limit: number = 8): Promise<ShopifyProduct[]> {
  try {
    // Utiliser l'API Next.js pour charger les produits
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : 'http://localhost:3000';
    
    const response = await fetch(`${baseUrl}/api/products?first=${limit}`, {
      cache: 'no-store', // Pas de cache en Storybook pour avoir les dernières données
    });

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.products || !data.products.edges) {
      throw new Error('Format de réponse API invalide');
    }

    // Transformer les données Shopify en format attendu par les composants
    return data.products.edges.map((edge: { node: any }) => {
      const product = edge.node;
      return {
        id: product.id,
        title: product.title,
        handle: product.handle,
        description: product.description,
        descriptionHtml: product.descriptionHtml,
        availableForSale: product.availableForSale,
        featuredImage: product.featuredImage || product.images?.edges?.[0]?.node,
        images: product.images,
        variants: product.variants,
        priceRange: product.priceRange,
        tags: product.tags || [],
        collections: product.collections,
      };
    });
  } catch (error) {
    console.error('Erreur lors du chargement des produits Shopify:', error);
    throw error;
  }
}

/**
 * Charge un produit spécifique par son handle
 */
async function fetchProductByHandle(handle: string): Promise<ShopifyProduct | null> {
  try {
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : 'http://localhost:3000';
    
    const response = await fetch(`${baseUrl}/api/products/${handle}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.product) {
      return null;
    }

    const product = data.product;
    return {
      id: product.id,
      title: product.title,
      handle: product.handle,
      description: product.description,
      descriptionHtml: product.descriptionHtml,
      availableForSale: product.availableForSale,
      featuredImage: product.featuredImage || product.images?.edges?.[0]?.node,
      images: product.images,
      variants: product.variants,
      priceRange: product.priceRange,
      tags: product.tags || [],
      collections: product.collections,
    };
  } catch (error) {
    console.error(`Erreur lors du chargement du produit ${handle}:`, error);
    return null;
  }
}

/**
 * Décorateur Storybook pour fournir les vraies données Shopify
 */
export const withShopifyData: Decorator = (Story, context) => {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        setError(null);
        const fetchedProducts = await fetchRealShopifyProducts(8);
        setProducts(fetchedProducts);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
        setError(errorMessage);
        console.error('Impossible de charger les produits Shopify:', errorMessage);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  const contextValue: ShopifyContextType = {
    products,
    loading,
    error,
    fetchProduct: fetchProductByHandle,
    realShopifyData: {
      hasProducts: products.length > 0,
      productsCount: products.length,
      lastUpdated: new Date().toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    },
  };

  // Si erreur, afficher un message au lieu de cacher l'erreur
  if (error) {
    return (
      <div className="p-8 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-lg font-semibold text-red-800 mb-2">
          ⚠️ Erreur de chargement des données Shopify
        </h3>
        <p className="text-red-600 mb-4">{error}</p>
        <p className="text-sm text-red-500">
          Vérifiez que :
        </p>
        <ul className="text-sm text-red-500 list-disc list-inside mt-2">
          <li>Le serveur Next.js est démarré (port 3000)</li>
          <li>Les variables d'environnement Shopify sont configurées</li>
          <li>L'API /api/products est accessible</li>
        </ul>
        <div className="mt-4 p-4 bg-white rounded border border-red-300">
          <Story />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-jolananas-pink-medium"></div>
        <p className="mt-4 text-gray-600">Chargement des données Shopify...</p>
      </div>
    );
  }

  return (
    <ShopifyContext.Provider value={contextValue}>
      <div className="p-4">
        <Story />
      </div>
    </ShopifyContext.Provider>
  );
};

/**
 * Helper pour obtenir le premier produit chargé
 * Utile dans les stories pour avoir un produit par défaut
 */
export function useFirstProduct(): ShopifyProduct | null {
  const { products } = useShopifyContext();
  return products.length > 0 ? products[0] : null;
}

/**
 * Helper pour obtenir un produit aléatoire
 */
export function useRandomProduct(): ShopifyProduct | null {
  const { products } = useShopifyContext();
  if (products.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * products.length);
  return products[randomIndex];
}

