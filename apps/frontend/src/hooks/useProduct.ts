/**
 * 🍍 JOLANANAS - Hook useProduct
 * ===============================
 * Hook SWR custom pour récupérer un produit spécifique avec cache
 */

'use client';

import useSWR from 'swr';
import { CACHE_DURATIONS } from '../lib/cache/swr';
import type { Product } from '../lib/shopify/types';

interface UseProductOptions {
  enabled?: boolean;
}

interface ProductApiResponse {
  product: Product;
  relatedProducts?: Product[];
}

export function useProduct(handle: string | null, options: UseProductOptions = {}) {
  const { enabled = true } = options;
  
  const { data, error, isLoading, mutate } = useSWR<ProductApiResponse>(
    enabled && handle ? `/api/products/${handle}` : null,
    {
      revalidateIfStale: true,
      revalidateOnFocus: false,
      dedupingInterval: CACHE_DURATIONS.PRODUCT * 1000,
    }
  );

  return {
    product: data?.product || null,
    relatedProducts: data?.relatedProducts || [],
    isLoading,
    isError: error,
    error,
    mutate,
  };
}




