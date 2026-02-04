/**
 * 🍍 JOLANANAS - Hook useCollections
 * ===================================
 * Hook SWR custom pour récupérer les collections avec cache
 */

'use client';

import useSWR from 'swr';
import { CACHE_DURATIONS } from '../lib/cache/swr';

interface Collection {
  id: string;
  title: string;
  handle: string;
  description?: string;
  image?: {
    url: string;
    altText?: string;
  };
}

interface CollectionsResponse {
  collections: {
    edges: Array<{
      node: Collection;
    }>;
  };
}

export function useCollections(options: { first?: number; enabled?: boolean } = {}) {
  const { first = 10, enabled = true } = options;
  
  const params = new URLSearchParams({
    first: first.toString(),
  });
  
  const { data, error, isLoading, mutate } = useSWR<CollectionsResponse>(
    enabled ? `/api/collections?${params.toString()}` : null,
    {
      revalidateIfStale: true,
      revalidateOnFocus: false,
      dedupingInterval: CACHE_DURATIONS.COLLECTIONS * 1000,
    }
  );

  return {
    collections: data?.collections?.edges?.map(edge => edge.node) || [],
    isLoading,
    isError: error,
    error,
    mutate,
  };
}




