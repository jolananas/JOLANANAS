/**
 * 🍍 JOLANANAS - Hook useCart
 * =============================
 * Hook pour la gestion du panier avec Zustand + SWR
 * Combine optimistic updates (Zustand) avec source de vérité API (SWR)
 */

'use client';

import { useEffect } from 'react';
import useSWR from 'swr';
import { useCartStore } from '@/app/src/lib/stores/cartStore';
import { CACHE_DURATIONS } from '../lib/cache/swr';
import { apiGet, apiPost, apiPut, apiDelete } from '../lib/api-client';

interface CartResponse {
  success: boolean;
  data?: {
    id: string;
    items: Array<{
      id: string;
      productId: string;
      variantId: string;
      quantity: number;
      price: number;
      title: string;
      imageUrl?: string;
      variantTitle: string;
    }>;
  };
  error?: string;
}

export function useCart() {
  const {
    cartId,
    lines,
    totalQuantity,
    totalPrice,
    subtotalPrice,
    isLoading,
    error,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    setCartId,
    setLoading,
    setError,
    syncWithAPI,
    loadFromAPI,
  } = useCartStore();

  // Charger le panier depuis l'API avec SWR
  const { data, error: swrError, mutate: mutateCart } = useSWR<CartResponse>(
    '/api/cart',
    {
      revalidateOnFocus: false,
      dedupingInterval: CACHE_DURATIONS.CART * 1000,
      onSuccess: (data) => {
        if (data?.success && data.data) {
          // Synchroniser le store avec les données API
          const items = data.data.items.map((item) => ({
            id: `${item.productId}-${item.variantId}`,
            quantity: item.quantity,
            price: item.price,
            title: item.title,
            image: item.imageUrl,
            variant: {
              id: item.variantId,
              title: item.variantTitle,
            },
          }));
          
          // Mettre à jour le store
          const store = useCartStore.getState();
          const currentItems = store.items;
          const itemsChanged = JSON.stringify(currentItems) !== JSON.stringify(items);
          
          if (itemsChanged) {
            store.setCartId(data.data.id);
            // Remplacer les items
            useCartStore.setState({ items });
            // Recalculer les totaux
            setTimeout(() => {
              useCartStore.getState().recalculateTotals();
            }, 0);
          }
        }
      },
    }
  );

  // Synchroniser les changements locaux avec l'API
  const syncItem = async (item: { id: string; quantity: number; price: number; title: string; image?: string; variant: { id: string; title: string } }) => {
    const productId = item.id.split('-')[0];
    const variantId = item.variant.id;
    
    try {
      if (!cartId) {
        // Créer un nouveau panier
        const response = await apiPost<CartResponse>('/api/cart', {
          productId,
          variantId,
          quantity: item.quantity,
        });
        
        if (response.success && response.data?.id) {
          setCartId(response.data.id);
        }
      } else {
        // Mettre à jour le panier existant
        await apiPost<CartResponse>('/api/cart', {
          productId,
          variantId,
          quantity: item.quantity,
        });
      }
      
      // Invalider le cache SWR pour recharger
      await mutateCart();
    } catch (err) {
      console.error('Erreur sync panier:', err);
    }
  };

  // Wrapper pour addItem avec sync API
  const addLineItem = async (item: Parameters<typeof addItem>[0]) => {
    // Optimistic update
    addItem(item);
    
    // Sync avec API en arrière-plan
    syncItem(item).catch(console.error);
  };

  // Wrapper pour updateQuantity avec sync API
  const updateLineItem = async (id: string, quantity: number) => {
    // Optimistic update
    updateQuantity(id, quantity);
    
    // Trouver l'item pour sync
    const item = lines.find(l => l.id === id);
    if (item) {
      syncItem({ ...item, quantity }).catch(console.error);
    }
  };

  // Wrapper pour removeLineItem avec sync API
  const removeLineItem = async (id: string) => {
    // Optimistic update
    removeItem(id);
    
    // Sync avec API
    if (cartId) {
      try {
        await apiDelete(`/api/cart?cartItemId=${id}`);
        await mutateCart();
      } catch (err) {
        console.error('Erreur suppression panier:', err);
      }
    }
  };

  // Charger le panier au montage
  useEffect(() => {
    if (!cartId && !isLoading) {
      loadFromAPI();
    }
  }, [cartId, isLoading]);

  return {
    cartId,
    lines,
    totalQuantity,
    totalPrice,
    subtotalPrice,
    isLoading: isLoading || !data,
    error: error || (swrError ? String(swrError) : null),
    addLineItem,
    updateLineItem,
    removeLineItem,
    clearCart: async () => {
      clearCart();
      if (cartId) {
        // Supprimer tous les items via API
        for (const item of lines) {
          try {
            await apiDelete(`/api/cart?cartItemId=${item.id}`);
          } catch (err) {
            console.error('Erreur suppression item:', err);
          }
        }
        await mutateCart();
      }
    },
    setLoading,
    setError,
    isEmpty: lines.length === 0,
    mutate: mutateCart, // Pour invalider le cache manuellement
  };
}
