/**
 * 🍍 JOLANANAS - Cart Context Provider
 * ====================================
 * Provider pour le contexte panier
 */

'use client';

import React, { createContext, useContext, ReactNode } from 'react';

interface CartContextType {
  // Cart context peut être étendu selon les besoins
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const value: CartContextType = {
    // Valeurs par défaut
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCartContext() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCartContext must be used within a CartProvider');
  }
  return context;
}
