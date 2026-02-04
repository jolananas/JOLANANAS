/**
 * 🍍 JOLANANAS - Hook useProducts
 * ================================
 * Hook SWR custom pour récupérer les produits avec cache intelligent
 */

'use client';

import useSWR from 'swr';
import { CACHE_DURATIONS } from '../lib/cache/swr';
import type { Product } from '../lib/shopify/types';

interface UseProductsOptions {
  first?: number;
  after?: string;
  enabled?: boolean;
}

interface ProductsResponse {
  products: {
    edges: Array<{
      node: Product;
      cursor: string;
    }>;
    pageInfo: {
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor: string | null;
      endCursor: string | null;
    };
  };
}

export function useProducts(options: UseProductsOptions = {}) {
  const { first = 20, after, enabled = true } = options;
  
  const params = new URLSearchParams({
    first: first.toString(),
    ...(after && { after }),
  });
  
  const { data, error, isLoading, mutate } = useSWR<ProductsResponse>(
    enabled ? `/api/products?${params.toString()}` : null,
    {
      revalidateIfStale: true,
      revalidateOnFocus: false,
      dedupingInterval: CACHE_DURATIONS.PRODUCTS * 1000,
    }
  );

  return {
    products: data?.products?.edges?.map(edge => edge.node) || [],
    pageInfo: data?.products?.pageInfo,
    isLoading,
    isError: error,
    error,
    mutate, // Pour invalider le cache manuellement
  };
}




