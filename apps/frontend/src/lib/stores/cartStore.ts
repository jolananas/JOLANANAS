/**
 * � JOLANANAS - Cart Store
 * =====================================
 * Store Zustand pour la gestion du panier
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  quantity: number;
  price: number;
  title: string;
  image?: string;
  variant: {
    id: string;
    title: string;
  };
}

interface CartState {
  items: CartItem[];
  lines: any[]; // Alias pour items
  cartId: string | null;
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  setCartId: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addLineItem: (item: any) => void;
  updateLineItem: (id: string, quantity: number) => void;
  removeLineItem: (id: string) => void;
  
  // Computed
  totalItems: number;
  totalQuantity: number; // Alias pour totalItems
  totalPrice: number;
  subtotalPrice: number; // Alias pour totalPrice
  
  // Méthode pour recalculer les totaux
  recalculateTotals: () => void;
  
  // Synchronisation avec API
  syncWithAPI: () => Promise<void>;
  loadFromAPI: () => Promise<void>;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      get lines() { return get().items; },
      cartId: null,
      isOpen: false,
      isLoading: false,
      error: null,
      
      addItem: (item: CartItem) => {
        set((state) => {
          const existingItem = state.items.find(cartItem => cartItem.id === item.id);
          
          if (existingItem) {
            return {
              items: state.items.map(cartItem =>
                cartItem.id === item.id
                  ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
                  : cartItem
              ),
            };
          }
          
          return {
            items: [...state.items, item],
          };
        });
      },
      
      removeItem: (id: string) => {
        set((state) => ({
          items: state.items.filter(item => item.id !== id),
        }));
      },
      
      updateQuantity: (id: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        
        set((state) => ({
          items: state.items.map(item =>
            item.id === id ? { ...item, quantity } : item
          ),
        }));
      },
      
      clearCart: () => {
        set({ items: [] });
      },
      
      openCart: () => {
        set({ isOpen: true });
      },
      
      closeCart: () => {
        set({ isOpen: false });
      },
      
      toggleCart: () => {
        set((state) => ({ isOpen: !state.isOpen }));
      },
      
      setCartId: (id: string) => {
        set({ cartId: id });
      },
      
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
      
      setError: (error: string | null) => {
        set({ error });
      },
      
      addLineItem: (item: any) => {
        // Alias pour addItem
        get().addItem(item);
      },
      
      updateLineItem: (id: string, quantity: number) => {
        // Alias pour updateQuantity
        get().updateQuantity(id, quantity);
      },
      
      removeLineItem: (id: string) => {
        // Alias pour removeItem
        get().removeItem(id);
      },
      
      // Méthode pour recalculer les totaux
      recalculateTotals: () => {
        const items = get().items;
        const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        set({
          totalItems,
          totalQuantity: totalItems,
          totalPrice,
          subtotalPrice: totalPrice,
        });
      },
      
      // Synchroniser le panier local avec l'API
      syncWithAPI: async () => {
        const state = get();
        if (state.items.length === 0) return;
        
        try {
          set({ isLoading: true, error: null });
          
          // Pour chaque item, synchroniser avec l'API
          for (const item of state.items) {
            const productId = item.id.split('-')[0];
            const variantId = item.variant.id;
            
            const response = await fetch('/api/cart', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                productId,
                variantId,
                quantity: item.quantity,
              }),
            });
            
            if (!response.ok) {
              throw new Error('Erreur synchronisation panier');
            }
            
            const data = await response.json();
            if (data.success && data.data?.id) {
              set({ cartId: data.data.id });
            }
          }
          
          set({ isLoading: false });
          get().recalculateTotals();
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Erreur synchronisation' 
          });
        }
      },
      
      // Charger le panier depuis l'API
      loadFromAPI: async () => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await fetch('/api/cart');
          if (!response.ok) {
            throw new Error('Erreur chargement panier');
          }
          
          const data = await response.json();
          
          if (data.success && data.data?.items) {
            const items = data.data.items.map((item: any) => ({
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
            
            set({ 
              items, 
              cartId: data.data.id, 
              isLoading: false 
            });
            get().recalculateTotals();
          } else {
            set({ isLoading: false });
          }
        } catch (error) {
          set({ 
            isLoading: false,
            error: error instanceof Error ? error.message : 'Erreur chargement panier'
          });
        }
      },
      
      // Computed properties (mises à jour par recalculateTotals)
      totalItems: 0,
      totalQuantity: 0,
      totalPrice: 0,
      subtotalPrice: 0,
    }),
    {
      name: 'jolananas-cart-storage',
      partialize: (state) => ({ items: state.items }),
    }
  )
);